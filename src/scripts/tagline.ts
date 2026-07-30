/**
 * Rotating tagline.
 *
 * Uses the Web Animations API directly rather than GSAP — this is two eased
 * transforms on a timer, and it runs before (and without) any animation
 * library. The rotator is aria-hidden with a static sentence beside it: a
 * live region that rewrites itself every three seconds is hostile to screen
 * readers, and the sentences say the same thing anyway.
 */

const DWELL = 2800;
const DURATION = 700;
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function initTagline(): void {
	const root = document.querySelector<HTMLElement>('[data-tagline]');
	if (!root) return;

	const lines = [...root.querySelectorAll<HTMLElement>('[data-tagline-line]')];
	if (lines.length < 2) return;

	// Reduced motion keeps the first sentence, which is already in the HTML.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	let index = 0;
	let timer = 0;
	let paused = false;

	const advance = () => {
		const next = (index + 1) % lines.length;
		const outgoing = lines[index];
		const incoming = lines[next];
		if (!outgoing || !incoming) return;

		outgoing.animate(
			[
				{ transform: 'translateY(0)', opacity: 1 },
				{ transform: 'translateY(-100%)', opacity: 0 },
			],
			{ duration: DURATION, easing: EASING, fill: 'forwards' },
		);

		incoming.animate(
			[
				{ transform: 'translateY(100%)', opacity: 0 },
				{ transform: 'translateY(0)', opacity: 1 },
			],
			{ duration: DURATION, easing: EASING, fill: 'forwards' },
		);

		index = next;
	};

	const schedule = () => {
		window.clearTimeout(timer);
		if (paused) return;
		timer = window.setTimeout(() => {
			advance();
			schedule();
		}, DWELL);
	};

	const setPaused = (value: boolean) => {
		paused = value;
		if (value) window.clearTimeout(timer);
		else schedule();
	};

	// Hovering or focusing near the tagline means the visitor is reading it.
	root.addEventListener('pointerenter', () => setPaused(true));
	root.addEventListener('pointerleave', () => setPaused(false));
	document.addEventListener('visibilitychange', () => setPaused(document.hidden));

	schedule();
}
