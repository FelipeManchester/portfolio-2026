/**
 * Hover/scroll video previews on the work cards.
 *
 * Fine pointers get the ask as stated: play on hover, pause and rewind on
 * leave. Touch has no hover, so those cards play once scrolled into view and
 * pause once they leave it instead — the same gesture, driven by scroll
 * position rather than a cursor.
 */

export function initPreviews(): void {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const cards = document.querySelectorAll<HTMLElement>('[data-preview]');
	if (cards.length === 0) return;

	const fine = window.matchMedia('(pointer: fine)').matches;
	let observer: IntersectionObserver | null = null;

	if (!fine) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const video = entry.target.querySelector<HTMLVideoElement>('video');
					if (!video) continue;
					if (entry.isIntersecting) video.play().catch(() => {});
					else video.pause();
				}
			},
			{ threshold: 0.5 },
		);
	}

	for (const card of cards) {
		const video = card.querySelector<HTMLVideoElement>('video');
		if (!video) continue;

		// Placeholder today, a real file once the recording is dropped in —
		// hide the element rather than let the browser paint a broken-video box,
		// and stop trying to play something that will only ever error again.
		video.addEventListener(
			'error',
			() => {
				video.hidden = true;
				observer?.unobserve(card);
			},
			{ once: true },
		);

		if (fine) {
			card.addEventListener('pointerenter', () => video.play().catch(() => {}));
			card.addEventListener('pointerleave', () => {
				video.pause();
				video.currentTime = 0;
			});
		} else {
			observer?.observe(card);
		}
	}
}
