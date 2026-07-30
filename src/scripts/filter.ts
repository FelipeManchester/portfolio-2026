/**
 * Tag filtering on the blog index.
 *
 * Progressive enhancement: the list ships complete and every post is visible
 * without this module. The filter buttons are the only thing that needs it, so
 * they stay hidden until it runs — a dead filter row is worse than none.
 *
 * State lives in the DOM (`aria-pressed` on the buttons, `hidden` on the rows)
 * rather than in a variable, so the accessible name and the visual state can
 * never disagree.
 */

const ALL = '*';

export function initFilter(): void {
	const root = document.querySelector<HTMLElement>('[data-filter]');
	if (!root) return;

	const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter-tag]'));
	const items = Array.from(document.querySelectorAll<HTMLElement>('[data-post]'));
	const empty = document.querySelector<HTMLElement>('[data-filter-empty]');
	if (buttons.length === 0 || items.length === 0) return;

	// Revealed only now that the behaviour behind it exists.
	root.hidden = false;

	const apply = (tag: string) => {
		let shown = 0;

		for (const item of items) {
			const match = tag === ALL || item.dataset.post === tag;
			item.hidden = !match;
			if (match) shown += 1;
		}

		for (const button of buttons) {
			button.setAttribute('aria-pressed', String(button.dataset.filterTag === tag));
		}

		if (empty) empty.hidden = shown > 0;
	};

	for (const button of buttons) {
		button.addEventListener('click', () => apply(button.dataset.filterTag ?? ALL));
	}

	apply(ALL);
}
