import { pointer } from './pointer';
import { addFrame, removeFrame, smooth, type Frame } from './ticker';

/**
 * Background layer 3 — the drafting grid, with a lens under the cursor.
 *
 * A field of hairline dots that the pointer gathers inward: dots inside the
 * lens are pulled toward the cursor and take the accent, so the sheet the whole
 * page is drawn on becomes the thing that reacts. Nothing in the composition
 * moves — the surface under it does.
 *
 * Canvas 2D rather than another shader: this is thousands of 1.4px squares, and
 * the interesting part is a ~300px region around the cursor. Only that region is
 * redrawn per frame (see `paint`), which is what keeps a fullscreen grid at
 * roughly 200 fills per frame instead of 4000.
 */

/** CSS pixels between dots. */
const GAP = 26;
const DOT = 1.4;
/** Lens reach. Dots outside it sit exactly on the grid. */
const RADIUS = 155;
/** Peak inward displacement, at the lens centre. */
const PULL = 15;
/** Extra margin on the redraw rect so a displaced dot cannot leave a trail. */
const PAD = PULL + DOT * 3;

export function initGrid(canvas: HTMLCanvasElement): void {
	const ctx = canvas.getContext('2d', { alpha: true });
	if (!ctx) return;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fine = window.matchMedia('(pointer: fine)').matches;

	let width = 0;
	let height = 0;
	let line = '#ececec';
	let accent = '#2b4dff';

	const readTheme = (): void => {
		const styles = getComputedStyle(document.documentElement);
		line = styles.getPropertyValue('--line').trim() || line;
		accent = styles.getPropertyValue('--accent').trim() || accent;
	};

	/**
	 * Repaints one rectangle of the field. Every dot is recomputed from the grid
	 * origin rather than blitted from a cached surface, because a dot inside the
	 * lens is displaced and a cached copy would have to be erased first.
	 */
	const paint = (x0: number, y0: number, x1: number, y1: number, lx: number, ly: number, r: number): void => {
		const left = Math.max(0, x0);
		const top = Math.max(0, y0);
		const right = Math.min(width, x1);
		const bottom = Math.min(height, y1);
		if (right <= left || bottom <= top) return;

		ctx.clearRect(left, top, right - left, bottom - top);

		// Clipped, not just cleared. The loop below overscans by PAD so no dot is
		// missed at the seam, and without a clip those overscanned dots would be
		// painted a second time on top of the untouched field around the rect.
		ctx.save();
		ctx.beginPath();
		ctx.rect(left, top, right - left, bottom - top);
		ctx.clip();

		// Walk grid coordinates, not pixels: `first` is the first dot at or after
		// the padded edge, so the lattice stays aligned across partial repaints.
		const first = (edge: number) => Math.floor((edge - PAD - GAP / 2) / GAP) * GAP + GAP / 2;

		for (let gy = first(top); gy < bottom + PAD; gy += GAP) {
			for (let gx = first(left); gx < right + PAD; gx += GAP) {
				let x = gx;
				let y = gy;
				let lit = 0;

				if (r > 0.5) {
					const vx = gx - lx;
					const vy = gy - ly;
					const dist = Math.hypot(vx, vy);
					if (dist < r) {
						// Squared falloff, pulling inward: the field reads as a lens
						// gathering the sheet rather than a force pushing it away.
						const f = (1 - dist / r) ** 2;
						const n = dist || 1;
						x = gx - (vx / n) * f * PULL;
						y = gy - (vy / n) * f * PULL;
						lit = f;
					}
				}

				const size = DOT + lit * 1.7;
				ctx.fillStyle = lit > 0.04 ? accent : line;
				ctx.globalAlpha = 0.55 + lit * 0.45;
				ctx.fillRect(x - size / 2, y - size / 2, size, size);
			}
		}

		ctx.globalAlpha = 1;
		ctx.restore();
	};

	const repaintAll = (lx = -9999, ly = -9999, r = 0): void => {
		paint(0, 0, width, height, lx, ly, r);
	};

	const resize = (): void => {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		// Work in CSS pixels everywhere below.
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};

	// Reduced motion, and any pointer that cannot hover, get the grid itself.
	// It is part of the drawing, not part of the interaction.
	if (reduced || !fine) {
		readTheme();
		resize();
		repaintAll();
		new MutationObserver(() => {
			readTheme();
			repaintAll();
		}).observe(document.documentElement, { attributeFilter: ['data-theme'] });
		window.addEventListener('resize', () => {
			resize();
			repaintAll();
		});
		return;
	}

	let strength = 0;
	let lensX = -9999;
	let lensY = -9999;
	// The rect the previous frame dirtied, so this frame can clean up after it.
	let prev = { x0: 0, y0: 0, x1: 0, y1: 0, live: false };
	let idleFrames = 0;
	let running = false;

	const frame: Frame = (delta) => {
		const target = pointer.engaged ? 1 : 0;
		strength = smooth(strength, target, delta, 200);

		const nextX = pointer.x * width;
		const nextY = pointer.y * height;
		const r = RADIUS * strength;

		const moved = Math.hypot(nextX - lensX, nextY - lensY);
		lensX = nextX;
		lensY = nextY;

		const cur = r > 0.5
			? { x0: lensX - r - PAD, y0: lensY - r - PAD, x1: lensX + r + PAD, y1: lensY + r + PAD, live: true }
			: { x0: 0, y0: 0, x1: 0, y1: 0, live: false };

		if (prev.live || cur.live) {
			// One union rect covers both the region being vacated and the region
			// being entered, so a single clear+redraw pass leaves no residue.
			const x0 = prev.live && cur.live ? Math.min(prev.x0, cur.x0) : cur.live ? cur.x0 : prev.x0;
			const y0 = prev.live && cur.live ? Math.min(prev.y0, cur.y0) : cur.live ? cur.y0 : prev.y0;
			const x1 = prev.live && cur.live ? Math.max(prev.x1, cur.x1) : cur.live ? cur.x1 : prev.x1;
			const y1 = prev.live && cur.live ? Math.max(prev.y1, cur.y1) : cur.live ? cur.y1 : prev.y1;
			paint(x0, y0, x1, y1, lensX, lensY, r);
		}

		prev = cur;

		// Park the loop once the lens has caught up with the cursor; pointermove
		// below restarts it. An idle page costs nothing.
		const settled = moved < 0.15 && Math.abs(target - strength) < 0.004;
		idleFrames = settled ? idleFrames + 1 : 0;
		if (idleFrames > 4) stop();
	};

	function start(): void {
		if (running || document.hidden) return;
		running = true;
		idleFrames = 0;
		addFrame(frame);
	}

	function stop(): void {
		if (!running) return;
		running = false;
		idleFrames = 0;
		removeFrame(frame);
	}

	readTheme();
	resize();
	repaintAll();

	window.addEventListener('pointermove', start, { passive: true });

	new MutationObserver(() => {
		readTheme();
		repaintAll(lensX, lensY, RADIUS * strength);
	}).observe(document.documentElement, { attributeFilter: ['data-theme'] });

	let resizeTimer = 0;
	window.addEventListener('resize', () => {
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(() => {
			resize();
			// The canvas is cleared by the size change, so the lens has to be
			// re-drawn along with the field rather than waiting for a frame.
			const r = RADIUS * strength;
			repaintAll(lensX, lensY, r);
			// `prev` has to describe what is actually on the canvas now, or the
			// next frame will not know to clean the lens it just drew.
			prev = r > 0.5
				? { x0: lensX - r - PAD, y0: lensY - r - PAD, x1: lensX + r + PAD, y1: lensY + r + PAD, live: true }
				: { x0: 0, y0: 0, x1: 0, y1: 0, live: false };
		}, 150);
	});

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) stop();
	});
}
