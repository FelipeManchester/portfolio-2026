import { addFrame, removeFrame, smooth } from './ticker';

/**
 * Magnetic hover. Elements marked `data-magnetic` drift a few pixels toward
 * the cursor as it approaches, then ease back.
 *
 * One window listener and one frame callback serve every magnet, and the frame
 * callback unsubscribes as soon as everything has settled, so a page sitting
 * idle does no work.
 */

const RADIUS = 90;
const PULL = 8;

type Magnet = {
	el: HTMLElement;
	x: number;
	y: number;
	targetX: number;
	targetY: number;
};

const magnets: Magnet[] = [];
let running = false;

function frame(delta: number): void {
	let settled = true;

	for (const magnet of magnets) {
		magnet.x = smooth(magnet.x, magnet.targetX, delta, 90);
		magnet.y = smooth(magnet.y, magnet.targetY, delta, 90);

		if (Math.abs(magnet.x - magnet.targetX) > 0.05 || Math.abs(magnet.y - magnet.targetY) > 0.05) {
			settled = false;
		}

		magnet.el.style.setProperty('--mx', `${magnet.x.toFixed(2)}px`);
		magnet.el.style.setProperty('--my', `${magnet.y.toFixed(2)}px`);
	}

	if (settled) {
		removeFrame(frame);
		running = false;
	}
}

function wake(): void {
	if (running) return;
	running = true;
	addFrame(frame);
}

export function initMagnetic(): void {
	// No cursor to be magnetic toward, and the pull would fight a tap target.
	if (!window.matchMedia('(pointer: fine)').matches) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const elements = document.querySelectorAll<HTMLElement>('[data-magnetic]');
	if (elements.length === 0) return;

	for (const el of elements) {
		magnets.push({ el, x: 0, y: 0, targetX: 0, targetY: 0 });
	}

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

			for (const magnet of magnets) {
				const rect = magnet.el.getBoundingClientRect();
				const dx = event.clientX - (rect.left + rect.width / 2);
				const dy = event.clientY - (rect.top + rect.height / 2);
				// Measure from the element's edge, not its centre, so wide buttons
				// do not need the cursor to reach the middle before responding.
				const distance = Math.hypot(
					Math.max(0, Math.abs(dx) - rect.width / 2),
					Math.max(0, Math.abs(dy) - rect.height / 2),
				);

				if (distance > RADIUS) {
					magnet.targetX = 0;
					magnet.targetY = 0;
					continue;
				}

				const strength = (1 - distance / RADIUS) * PULL;
				const length = Math.hypot(dx, dy) || 1;
				magnet.targetX = (dx / length) * strength;
				magnet.targetY = (dy / length) * strength;
			}

			wake();
		},
		{ passive: true },
	);
}
