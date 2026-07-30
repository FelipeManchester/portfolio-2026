/**
 * Every string on the first fold, shaped `{ en, pt }` so the planned Astro
 * i18n routing drops in later without touching components.
 */

export type Locale = 'en' | 'pt';

/** Flip to false the day he signs somewhere — the frame label reads from this. */
export const availableForWork = true;

/** Campos dos Goytacazes, RJ. Used for the coordinate annotation and clock. */
export const location = {
	coordinates: "21°45'S 41°19'W",
	timeZone: 'America/Sao_Paulo',
	label: 'Campos dos Goytacazes, Brazil',
} as const;

/** Real stack, taken from his CV — not the aspirational version. */
export const stack = [
	'React',
	'Next.js',
	'TypeScript',
	'Astro',
	'Node.js',
	'Tailwind',
	'Supabase',
	'PostgreSQL',
] as const;

type Copy = {
	nameLines: [string, string];
	nameAccessible: string;
	taglines: string[];
	taglineStatic: string;
	aboutLabel: string;
	aboutBody: string;
	ctaPrimary: string;
	ctaSecondary: string;
	nav: { label: string; href: string }[];
	navLabel: string;
	menuOpen: string;
	menuClose: string;
	themeToLight: string;
	themeToDark: string;
	available: string;
	unavailable: string;
	skip: string;
	scroll: string;
	stackLabel: string;
};

export const copy: Record<Locale, Copy> = {
	en: {
		nameLines: ['Felipe', 'Manchester'],
		nameAccessible: 'Felipe Manchester',
		taglines: [
			'Building digital products.',
			'Design meets engineering.',
			'Performance-first development.',
			'From concept to production.',
			'Motion-driven interfaces.',
		],
		taglineStatic: 'Full-stack developer building digital products.',
		// Placeholder copy — meant to be rewritten.
		aboutLabel: 'About',
		aboutBody:
			'Full-stack developer based in Brazil, working across React, Next.js and Astro. I care about the parts people feel: load time, motion, and interfaces that hold up on every screen.',
		ctaPrimary: 'View projects',
		ctaSecondary: 'Contact me',
		nav: [
			{ label: 'Home', href: '/' },
			{ label: 'Projects', href: '/projects' },
			{ label: 'About', href: '/#about' },
			{ label: 'Experience', href: '/#experience' },
			{ label: 'Contact', href: '/contact' },
		],
		navLabel: 'Main',
		menuOpen: 'Open menu',
		menuClose: 'Close menu',
		themeToLight: 'Switch to light theme',
		themeToDark: 'Switch to dark theme',
		available: 'Available for work',
		unavailable: 'Not taking new work',
		skip: 'Skip to content',
		scroll: 'Scroll',
		stackLabel: 'Technologies',
	},
	pt: {
		nameLines: ['Felipe', 'Manchester'],
		nameAccessible: 'Felipe Manchester',
		taglines: [
			'Construindo produtos digitais.',
			'Design encontra engenharia.',
			'Desenvolvimento focado em performance.',
			'Do conceito à produção.',
			'Interfaces movidas a animação.',
		],
		taglineStatic: 'Desenvolvedor full-stack construindo produtos digitais.',
		aboutLabel: 'Sobre',
		aboutBody:
			'Desenvolvedor full-stack no Brasil, trabalhando com React, Next.js e Astro. Cuido do que as pessoas sentem: tempo de carregamento, animação e interfaces que funcionam em qualquer tela.',
		ctaPrimary: 'Ver projetos',
		ctaSecondary: 'Fale comigo',
		nav: [
			{ label: 'Início', href: '/' },
			{ label: 'Projetos', href: '/projects' },
			{ label: 'Sobre', href: '/#about' },
			{ label: 'Experiência', href: '/#experience' },
			{ label: 'Contato', href: '/contact' },
		],
		navLabel: 'Principal',
		menuOpen: 'Abrir menu',
		menuClose: 'Fechar menu',
		themeToLight: 'Mudar para tema claro',
		themeToDark: 'Mudar para tema escuro',
		available: 'Disponível para trabalho',
		unavailable: 'Sem vagas no momento',
		skip: 'Pular para o conteúdo',
		scroll: 'Rolar',
		stackLabel: 'Tecnologias',
	},
};
