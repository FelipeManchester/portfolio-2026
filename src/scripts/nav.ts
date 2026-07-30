/**
 * Nav behaviour: the scrolled state and the small-screen disclosure.
 *
 * The scrolled state is driven by an IntersectionObserver watching a 1px
 * sentinel at the top of the document rather than a scroll listener — it fires
 * once per crossing instead of on every scroll event, and it works before any
 * animation library has loaded.
 */

export function initNav(): void {
	const header = document.querySelector<HTMLElement>('[data-nav]');
	const sentinel = document.querySelector<HTMLElement>('[data-nav-sentinel]');

	if (header && sentinel) {
		new IntersectionObserver(
			([entry]) => {
				header.toggleAttribute('data-scrolled', !entry?.isIntersecting);
			},
			{ threshold: 0 },
		).observe(sentinel);
	}

	const trigger = document.querySelector<HTMLButtonElement>('[data-menu-trigger]');
	const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
	if (!trigger || !panel) return;

	// The same <ul> is the inline list on desktop and the drop panel on mobile,
	// so `inert` must only ever apply at the collapsed breakpoint.
	const collapsed = window.matchMedia('(max-width: 720px)');

	const setOpen = (open: boolean) => {
		trigger.setAttribute('aria-expanded', String(open));
		panel.toggleAttribute('data-open', open);
		const label = open ? trigger.dataset.labelClose : trigger.dataset.labelOpen;
		if (label) trigger.setAttribute('aria-label', label);
		// Keeps the collapsed links out of the tab order and the accessibility
		// tree without `display: none`, so the panel can still animate.
		panel.inert = collapsed.matches && !open;
	};

	setOpen(false);

	trigger.addEventListener('click', () => {
		const open = trigger.getAttribute('aria-expanded') === 'true';
		setOpen(!open);
		if (!open) panel.querySelector<HTMLAnchorElement>('a')?.focus();
	});

	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;
		if (trigger.getAttribute('aria-expanded') !== 'true') return;
		setOpen(false);
		trigger.focus();
	});

	document.addEventListener('pointerdown', (event) => {
		if (trigger.getAttribute('aria-expanded') !== 'true') return;
		const target = event.target as Node;
		if (panel.contains(target) || trigger.contains(target)) return;
		setOpen(false);
	});

	// Following a link should not leave the panel open behind the navigation.
	panel.addEventListener('click', (event) => {
		if ((event.target as HTMLElement).closest('a')) setOpen(false);
	});

	// Crossing the breakpoint must not strand the page open, and must recompute
	// `inert` for the width it just landed on.
	collapsed.addEventListener('change', () => setOpen(false));
}
