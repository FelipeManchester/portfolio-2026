/**
 * Page transition fallback.
 *
 * Chrome and Safari animate navigations natively through the cross-document
 * View Transitions opt-in in global.css — no script involved, and no delay
 * between the click and the navigation. Firefox has no such thing, so this
 * stands in: fade the outgoing page out, then navigate, and let CSS fade the
 * incoming one in on load.
 *
 * The cost is real — the navigation is held back by the length of the exit
 * animation — which is why this only ever arms itself where the native path
 * is missing. `prefetch` in astro.config.mjs means the next document is
 * usually already in cache by the time the fade ends.
 */

/** Held slightly under --dur-page-out so the navigation starts as the fade lands. */
const EXIT_MS = 240;

export function initPageTransition(): void {
	const root = document.documentElement;

	// Set by the inline detection in BaseLayout, which runs before first paint
	// so the entry animation is never a frame late.
	if (!('pageFade' in root.dataset)) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	// Coming back through the bfcache restores the document mid-fade, exit
	// animation and all. Clear it, or the page stays invisible.
	window.addEventListener('pageshow', () => {
		root.removeAttribute('data-leaving');
	});

	document.addEventListener('click', (event) => {
		// Anything the visitor asked to open elsewhere — new tab, download,
		// modified click — has to keep its native behaviour.
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const link = (event.target as Element | null)?.closest('a');
		if (!link || link.target || link.hasAttribute('download')) return;

		const href = link.getAttribute('href');
		if (!href || href.startsWith('#')) return;

		const url = new URL(href, location.href);
		if (url.origin !== location.origin) return;
		// Same page: either a hash jump, which motion.ts owns, or a no-op.
		if (url.pathname === location.pathname && url.search === location.search) return;

		event.preventDefault();
		root.dataset.leaving = '';
		window.setTimeout(() => {
			location.href = url.href;
		}, EXIT_MS);
	});
}
