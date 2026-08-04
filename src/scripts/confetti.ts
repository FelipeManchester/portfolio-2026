/**
 * Click confetti on the hero's accent stop.
 *
 * A short-lived canvas burst — accent-tinted specks with real gravity,
 * falling and fading over about a second. Not part of the shared ticker in
 * ticker.ts: the burst is brief and self-terminating, so its own rAF loop
 * that stops the moment the last particle dies is simpler than threading
 * one-off state through the loop everything else shares.
 */

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	life: number;
	decay: number;
}

const MIN_COUNT = 18;
const MAX_COUNT = 34;
const GRAVITY = 0.14;

export function initConfetti(): void {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const trigger = document.querySelector<HTMLElement>('[data-confetti-trigger]');
	const canvas = document.querySelector<HTMLCanvasElement>('[data-confetti-canvas]');
	const ctx = canvas?.getContext('2d');
	if (!trigger || !canvas || !ctx) return;

	let particles: Particle[] = [];
	let raf = 0;

	const resize = () => {
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};

	const step = () => {
		const rect = canvas.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
		let alive = false;

		for (const p of particles) {
			p.vy += GRAVITY;
			p.x += p.vx;
			p.y += p.vy;
			p.life -= p.decay;
			if (p.life <= 0) continue;
			alive = true;
			ctx.globalAlpha = p.life;
			ctx.fillStyle = accent;
			ctx.fillRect(p.x, p.y, p.size, p.size);
		}
		ctx.globalAlpha = 1;

		if (alive) {
			raf = requestAnimationFrame(step);
		} else {
			particles = [];
		}
	};

	const burst = () => {
		cancelAnimationFrame(raf);
		resize();

		const stageRect = canvas.getBoundingClientRect();
		const dotRect = trigger.getBoundingClientRect();
		const cx = dotRect.left - stageRect.left + dotRect.width / 2;
		const cy = dotRect.top - stageRect.top + dotRect.height / 2;

		// A different count, a different origin jitter and a wider polar
		// spread every time, rather than the same shape replaying — a click
		// that always looks identical reads as an animation, not a reaction.
		const count = MIN_COUNT + Math.floor(Math.random() * (MAX_COUNT - MIN_COUNT + 1));

		particles = Array.from({ length: count }, () => {
			// Mostly upward, with enough spread either side that it never reads
			// as a straight fountain — roughly a 200° arc centred on "up".
			const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
			const speed = 1.5 + Math.random() * 4.5;

			return {
				x: cx + (Math.random() - 0.5) * 10,
				y: cy + (Math.random() - 0.5) * 10,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				size: 1.5 + Math.random() * 3.5,
				life: 1,
				// Faster-decaying specks vanish sooner than slower ones, so the
				// burst thins out gradually instead of cutting off as one block.
				decay: 0.014 + Math.random() * 0.018,
			};
		});

		raf = requestAnimationFrame(step);
	};

	trigger.addEventListener('click', burst);
	window.addEventListener('resize', resize);
	resize();
}
