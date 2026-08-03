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

	// Hide on scroll down, reveal on scroll up — the nav pill and the corner
	// frame (clock + locale switch) move together, as one piece of chrome. It
	// never hides while the menu itself is open.
	const frame = document.querySelector<HTMLElement>('[data-frame]');
	const HIDE_AFTER = 80;
	// Lenis eases toward its target rather than tracking the wheel 1:1, so
	// scrollY does not step up in a clean line frame to frame — comparing every
	// frame to the one right before it reads spurious reversals into a single
	// downward gesture. Reacting only once movement clears this many pixels
	// (and only re-arming the baseline at that point) filters that out; a
	// same-frame comparison flickered data-hidden on and off fast enough that
	// the 300ms CSS transition never reached either end, which looked like the
	// nav trying to reappear before snapping shut.
	const DIRECTION_THRESHOLD = 24;

	let baseline = window.scrollY;
	let hidden = false;
	let ticking = false;

	const applyScrollDirection = () => {
		const y = window.scrollY;
		const delta = y - baseline;
		const menuOpen = trigger.getAttribute('aria-expanded') === 'true';

		if (y <= HIDE_AFTER) {
			hidden = false;
			baseline = y;
		} else if (!menuOpen && Math.abs(delta) >= DIRECTION_THRESHOLD) {
			hidden = delta > 0;
			baseline = y;
		}

		header?.toggleAttribute('data-hidden', hidden);
		frame?.toggleAttribute('data-hidden', hidden);
		ticking = false;
	};

	window.addEventListener(
		'scroll',
		() => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(applyScrollDirection);
		},
		{ passive: true },
	);
}
