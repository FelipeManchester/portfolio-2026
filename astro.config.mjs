// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	// The deployed origin. Everything that needs an absolute URL derives from
	// this one value — hreflang tags, the sitemap, and social preview images
	// later — so pointing the site at a custom domain is a one-line change here.
	site: 'https://portfolio-2026-one-murex.vercel.app',
	image: {
		domains: ['a.storyblok.com'],
	},
	vite: {
		plugins: [tailwindcss()],
	},
	// The page transition only plays while the browser holds the old page on
	// screen waiting for the new one. Prefetching on hover puts the next
	// document in cache before the click, so the swap has nothing to wait for.
	prefetch: { prefetchAll: true },
	i18n: {
		defaultLocale: 'pt',
		locales: ['pt', 'en'],
		// Portuguese is the primary version and stays at the root; English lives
		// under /en.
		routing: { prefixDefaultLocale: false },
	},
	integrations: [
		// The locale map is repeated here rather than shared with the block above
		// because the sitemap wants BCP 47 tags — `pt-BR` names the actual variant
		// being written, while the routing segment stays the shorter `pt`.
		sitemap({
			i18n: {
				defaultLocale: 'pt',
				locales: { pt: 'pt-BR', en: 'en' },
			},
		}),
	],
	fonts: [
		{
			provider: fontProviders.fontshare(),
			name: 'General Sans',
			cssVariable: '--font-general-sans',
			// 400 body, 500 nav/buttons, 600 the name. No 700 and no italics are
			// used anywhere on the page, and every extra face is a preloaded file
			// competing with the LCP render.
			weights: ['400', '500', '600'],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Geist Mono',
			cssVariable: '--font-geist-mono',
			weights: ['400'],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],
});
