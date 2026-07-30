type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function currentTheme(): Theme {
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// Private mode / storage disabled — the theme still applies for this page.
	}
}

function syncLabels(buttons: NodeListOf<HTMLElement>, theme: Theme): void {
	for (const button of buttons) {
		const next = theme === 'dark' ? button.dataset.labelLight : button.dataset.labelDark;
		if (next) button.setAttribute('aria-label', next);
	}
}

export function initTheme(): void {
	const buttons = document.querySelectorAll<HTMLElement>('[data-theme-toggle]');
	if (buttons.length === 0) return;

	const root = document.documentElement;
	syncLabels(buttons, currentTheme());

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	for (const button of buttons) {
		button.addEventListener('click', () => {
			const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';

			const commit = () => {
				applyTheme(next);
				syncLabels(buttons, next);
			};

			// The wipe is decoration. Without View Transitions, or when motion is
			// reduced, swap straight to the new theme.
			if (typeof document.startViewTransition !== 'function' || reduceMotion.matches) {
				commit();
				return;
			}

			// Expand the circle from the toggle itself, sized to reach the
			// furthest viewport corner so it always covers the page.
			const rect = button.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;
			const radius = Math.hypot(
				Math.max(x, window.innerWidth - x),
				Math.max(y, window.innerHeight - y),
			);

			root.style.setProperty('--tx', `${x}px`);
			root.style.setProperty('--ty', `${y}px`);
			root.style.setProperty('--tr', `${radius}px`);
			root.dataset.themeWipe = '';

			const transition = document.startViewTransition(commit);
			transition.finished.finally(() => {
				delete root.dataset.themeWipe;
			});
		});
	}

	// Follow the OS only while the visitor has not made an explicit choice.
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(STORAGE_KEY);
		} catch {
			// Ignore — treat as no explicit choice.
		}
		if (stored) return;

		const next: Theme = event.matches ? 'dark' : 'light';
		document.documentElement.dataset.theme = next;
		syncLabels(buttons, next);
	});
}
