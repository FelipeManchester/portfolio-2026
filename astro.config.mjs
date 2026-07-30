// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},
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
