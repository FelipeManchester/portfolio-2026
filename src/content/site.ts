/**
 * Every string on the first fold, shaped `{ en, pt }` so the planned Astro
 * i18n routing drops in later without touching components.
 */

export type Locale = 'en' | 'pt';

/** Flip to false the day he signs somewhere — the frame label reads from this. */
export const availableForWork = true;

/** Campos dos Goytacazes, RJ. Drives the clock annotation. */
export const location = {
  timeZone: 'America/Sao_Paulo',
  label: 'Campos dos Goytacazes, Brazil',
} as const;

/** Primary locale first — drives switcher order and the hreflang x-default. */
export const locales = ['pt', 'en'] as const satisfies readonly Locale[];

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
  title: string;
  description: string;
  localTimeLabel: string;
  localeLabel: string;
};

export const copy: Record<Locale, Copy> = {
  en: {
    nameLines: ['Felipe', 'Manchester'],
    nameAccessible: 'Felipe Manchester',
    taglines: [
      'Building scalable web applications.',
      'Creating modern and responsive interfaces.',
      'Turning ideas into digital products.',
      'From prototype to production.',
      'Performance and SEO by design.',
      'Clean code. Thoughtful architecture.',
      'Crafting intuitive user experiences.',
      'Focused on quality and maintainability.',
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
    title: 'Felipe Manchester — Full-stack developer',
    description:
      'Full-stack developer building fast, accessible web products with React, Next.js, Astro and TypeScript.',
    localTimeLabel: 'Local time',
    localeLabel: 'Language',
  },
  pt: {
    nameLines: ['Felipe', 'Manchester'],
    nameAccessible: 'Felipe Manchester',
    taglines: [
      'Construindo produtos digitais.',
      'Criando interfaces modernas.',
      'Desenvolvimento focado em performance.',
      'Da ideia à produção.',
      'Código limpo e escalável.',
      'Experiências web intuitivas.',
      'Performance, acessibilidade e SEO.',
      'Soluções para web moderna.',
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
    title: 'Felipe Manchester — Desenvolvedor full-stack',
    description:
      'Desenvolvedor full-stack criando produtos web rápidos e acessíveis com React, Next.js, Astro e TypeScript.',
    localTimeLabel: 'Horário local',
    localeLabel: 'Idioma',
  },
};
