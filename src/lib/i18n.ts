import type { Locale } from '../content/site';

/** Portuguese is the primary version and served from the root; English sits under /en. */
const PREFIX: Record<Locale, string> = { pt: '', en: '/en' };

/**
 * Rewrites the current path for another locale, so the switcher keeps the
 * visitor on the page they are already reading instead of dropping them at the
 * home page. Works for routes that do not exist yet: /projects becomes
 * /en/projects the moment that route is added.
 */
export function localePath(pathname: string, target: Locale): string {
	const stripped = pathname.replace(/^\/en(?=\/|$)/, '');
	const normalised = stripped === '' ? '/' : stripped;
	if (target === 'pt') return normalised;
	return normalised === '/' ? '/en/' : `${PREFIX.en}${normalised}`;
}

/** Reads the locale back out of a URL path. */
export function localeFromPath(pathname: string): Locale {
	return /^\/en(?=\/|$)/.test(pathname) ? 'en' : 'pt';
}
