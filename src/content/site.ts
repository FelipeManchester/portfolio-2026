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

/** Where mail from the contact section and the footer goes. */
export const email = 'f.p2809@gmail.com';

/** Recruiter-facing profiles, LinkedIn first. */
export const socials = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/felipemanchester' },
  { label: 'GitHub', url: 'https://github.com/felipemanchester' },
] as const satisfies readonly { label: string; url: string }[];

type Localized = Record<Locale, string>;

/**
 * The three featured builds. Source repos are private, so a project links out
 * to the live site and nothing else — a dead GitHub link reads worse than no
 * link at all.
 *
 * PLACEHOLDER: `url` and `summary` are both stand-ins. Fill the real addresses
 * and rewrite the summaries in Felipe's own words before this ships.
 */
export const projects = [
  {
    slug: 'memoamor',
    name: 'Memoamor',
    year: '2025',
    url: '',
    stack: ['Next.js', 'React', 'Tailwind'],
    summary: {
      en: 'A keepsake product built around a personalised gift flow, from first screen to checkout.',
      pt: 'Produto de recordação construído em torno de um fluxo de presente personalizado, da primeira tela ao checkout.',
    },
    description: {
      en: 'A keepsake product built around a personalised gift flow, from first screen to checkout. The interface leans on motion and copy that keep the moment feeling personal rather than transactional, while the checkout and order pipeline stay fast enough to hold up under gifting-season traffic.',
      pt: 'Produto de recordação construído em torno de um fluxo de presente personalizado, da primeira tela ao checkout. A interface usa animação e microcopy para manter o momento pessoal em vez de transacional, com checkout e pipeline de pedidos rápidos o suficiente para picos de tráfego em datas comemorativas.',
    },
  },
  {
    slug: 'itaborai-oxigenio',
    name: 'Itaboraí Oxigênio',
    year: '2025',
    url: '',
    stack: ['Astro', 'Sanity'],
    summary: {
      en: 'Site for a medical and industrial gas supplier, with the catalogue editable by the team.',
      pt: 'Site para uma distribuidora de gases medicinais e industriais, com o catálogo editável pela equipe.',
    },
    description: {
      en: 'Site for a medical and industrial gas supplier, with the catalogue editable by the team. Built on Astro for near-instant page loads, with Sanity as the CMS so product listings and specs stay current without a developer in the loop.',
      pt: 'Site para uma distribuidora de gases medicinais e industriais, com o catálogo editável pela equipe. Construído em Astro para carregamento quase instantâneo, com Sanity como CMS para que listagens e especificações fiquem sempre atualizadas sem depender de um desenvolvedor.',
    },
  },
  {
    slug: 'manchester-advogados',
    name: 'Manchester Advogados',
    year: '2024',
    url: '',
    stack: ['Astro', 'Sanity'],
    summary: {
      en: 'A law firm site built for search visibility, with practice areas managed in the CMS.',
      pt: 'Site de escritório de advocacia feito para busca orgânica, com áreas de atuação gerenciadas no CMS.',
    },
    description: {
      en: 'A law firm site built for search visibility, with practice areas managed in the CMS. Semantic markup and page structure were prioritised throughout so the firm ranks for the practice areas it actually wants to be found for.',
      pt: 'Site de escritório de advocacia feito para busca orgânica, com áreas de atuação gerenciadas no CMS. Marcação semântica e estrutura de página foram priorizadas para que o escritório rankeie pelas áreas de atuação que realmente importam.',
    },
  },
] as const satisfies readonly {
  slug: string;
  name: string;
  year: string;
  url: string;
  stack: readonly string[];
  summary: Localized;
  description: Localized;
}[];

/**
 * PLACEHOLDER: the blog is not wired to Storyblok yet. These three teasers
 * exist so the section has real shape to design against; replace the array with
 * the CMS query and the component keeps working.
 */
export const posts = [
  {
    slug: 'core-web-vitals-astro',
    date: '2026-06-18',
    minutes: 6,
    tag: 'Performance',
    title: {
      en: 'Shipping a perfect LCP without giving up the design',
      pt: 'Um LCP perfeito sem abrir mão do design',
    },
  },
  {
    slug: 'astro-islands-in-practice',
    date: '2026-05-02',
    minutes: 8,
    tag: 'Astro',
    title: {
      en: 'Islands in practice: what actually needs to hydrate',
      pt: 'Ilhas na prática: o que realmente precisa hidratar',
    },
  },
  {
    slug: 'motion-that-respects-users',
    date: '2026-03-27',
    minutes: 5,
    tag: 'Accessibility',
    title: {
      en: 'Motion that respects the person reading it',
      pt: 'Animação que respeita quem está lendo',
    },
  },
] as const;

/**
 * Grouped for the skills register — technology names are not translated, only
 * the three category headings are. Pulled from the CV list rather than every
 * tool he has touched: this is what he'd want a recruiter scanning for.
 */
export const skillGroups = [
  {
    label: { en: 'Front-end', pt: 'Front-end' },
    skills: ['React', 'Next.js', 'Astro', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Sass'],
  },
  {
    label: { en: 'Back-end', pt: 'Back-end' },
    skills: ['Node.js', 'Express', 'PHP', 'REST APIs', 'GraphQL', 'MySQL', 'Firebase', 'Supabase'],
  },
  {
    label: { en: 'Tools & workflow', pt: 'Ferramentas' },
    skills: ['WordPress', 'Sanity', 'Wix', 'Git', 'Figma', 'Jest', 'CI/CD', 'Vercel', 'Netlify'],
  },
] as const satisfies readonly { label: Localized; skills: readonly string[] }[];

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
  workLabel: string;
  workLead: string;
  workAll: string;
  visitSite: string;
  soon: string;
  trabalhosTitle: string;
  trabalhosDescription: string;
  trabalhosLead: string;
  trabalhosBack: string;
  viewProject: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutIntro: string;
  locationLabel: string;
  contactTitle: string;
  contactDescription: string;
  socialsLabel: string;
  skillsLabel: string;
  skillsLead: string;
  journalLabel: string;
  journalLead: string;
  journalAll: string;
  readTime: string;
  contactLabel: string;
  contactHeadline: string;
  contactBody: string;
  contactCta: string;
  footerNote: string;
  backToTop: string;
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
      { label: 'Projects', href: '/trabalhos' },
      { label: 'About', href: '/sobre' },
      { label: 'Contact', href: '/contato' },
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
    workLabel: 'Selected work',
    workLead: 'Three builds that show the range — product, catalogue, and a site that lives or dies on search.',
    workAll: 'All projects',
    visitSite: 'Visit site',
    soon: 'Soon',
    trabalhosTitle: 'Work — Felipe Manchester',
    trabalhosDescription:
      'Every build worth showing — product, catalogue and marketing sites, with the stack and the reasoning behind each.',
    trabalhosLead: 'Every build worth showing, with the stack and the reasoning behind each one.',
    trabalhosBack: 'All work',
    viewProject: 'View project',
    aboutTitle: 'About — Felipe Manchester',
    aboutDescription:
      'Full-stack developer based in Brazil, working across React, Next.js and Astro.',
    // Placeholder copy — meant to be rewritten.
    aboutIntro:
      'Most of what I do is invisible when it works: pages that load before anyone notices, layouts that hold up on the fifth screen size, code the next person can actually read. I like working close to the design, not just implementing it.',
    locationLabel: 'Based in',
    contactTitle: 'Contact — Felipe Manchester',
    contactDescription: 'Get in touch by email or find Felipe Manchester on LinkedIn and GitHub.',
    socialsLabel: 'Elsewhere',
    skillsLabel: 'Skills',
    skillsLead: 'The stack behind the work above.',
    journalLabel: 'Journal',
    journalLead: 'Notes on performance, Astro and building interfaces that hold up.',
    journalAll: 'All posts',
    readTime: 'min read',
    contactLabel: 'Contact',
    contactHeadline: 'Let’s build something.',
    contactBody:
      'Open to full-time roles and freelance projects. The fastest way to reach me is email — I answer every message.',
    contactCta: 'Send a message',
    footerNote: 'Built with Astro. Designed and coded in Campos dos Goytacazes.',
    backToTop: 'Back to top',
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
      { label: 'Trabalhos', href: '/trabalhos' },
      { label: 'Sobre', href: '/sobre' },
      { label: 'Contato', href: '/contato' },
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
    workLabel: 'Trabalhos',
    workLead: 'Três projetos que mostram a variação — produto, catálogo e um site que depende de busca orgânica.',
    workAll: 'Todos os projetos',
    visitSite: 'Ver site',
    soon: 'Em breve',
    trabalhosTitle: 'Trabalhos — Felipe Manchester',
    trabalhosDescription:
      'Todos os projetos que valem a pena mostrar — produto, catálogo e sites institucionais, com a stack e o raciocínio por trás de cada um.',
    trabalhosLead: 'Todos os projetos que valem a pena mostrar, com a stack e o raciocínio por trás de cada um.',
    trabalhosBack: 'Todos os trabalhos',
    viewProject: 'Ver projeto',
    aboutTitle: 'Sobre — Felipe Manchester',
    aboutDescription:
      'Desenvolvedor full-stack no Brasil, trabalhando com React, Next.js e Astro.',
    aboutIntro:
      'A maior parte do que eu faço é invisível quando funciona: páginas que carregam antes de alguém notar, layouts que se sustentam na quinta tela diferente, código que a próxima pessoa consegue ler de fato. Gosto de trabalhar perto do design, não só implementá-lo.',
    locationLabel: 'Baseado em',
    contactTitle: 'Contato — Felipe Manchester',
    contactDescription: 'Fale por e-mail ou encontre Felipe Manchester no LinkedIn e no GitHub.',
    socialsLabel: 'Outros lugares',
    skillsLabel: 'Habilidades',
    skillsLead: 'A stack por trás do trabalho acima.',
    journalLabel: 'Blog',
    journalLead: 'Notas sobre performance, Astro e interfaces que se sustentam.',
    journalAll: 'Todos os posts',
    readTime: 'min de leitura',
    contactLabel: 'Contato',
    contactHeadline: 'Vamos construir algo.',
    contactBody:
      'Aberto a vagas efetivas e projetos freelance. O caminho mais rápido é o e-mail — respondo todas as mensagens.',
    contactCta: 'Enviar mensagem',
    footerNote: 'Feito com Astro. Desenhado e codado em Campos dos Goytacazes.',
    backToTop: 'Voltar ao topo',
  },
};
