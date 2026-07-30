const INTERACTIVE = 'a, button, [data-magnetic], [role="button"], input, textarea, select';

/**
 * Deliberately no easing and no shared ticker frame: the ring is set directly
 * from the event, so it never lags a single frame behind the real cursor.
 */
export function initCursor(ring: HTMLElement): void {
	if (!window.matchMedia('(pointer: fine)').matches) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	// Hides the native arrow only once the replacement is actually running.
	document.documentElement.dataset.cursor = '';

	window.addEventListener(
		'pointermove',
		(event) => {
			ring.style.translate = `${event.clientX}px ${event.clientY}px`;
			if (!('visible' in ring.dataset)) ring.dataset.visible = '';
		},
		{ passive: true },
	);

	document.addEventListener('pointerover', (event) => {
		const target = (event.target as Element | null)?.closest(INTERACTIVE);
		ring.classList.toggle('is-active', Boolean(target));
	});

	window.addEventListener('pointerdown', () => ring.classList.add('is-pressed'));
	window.addEventListener('pointerup', () => ring.classList.remove('is-pressed'));
}
