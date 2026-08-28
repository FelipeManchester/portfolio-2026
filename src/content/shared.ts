/**
 * The only content that genuinely belongs to more than one component.
 *
 * Everything else lives in the file that renders it — a label used in exactly
 * one place is easier to find and safer to change there than in a central
 * dictionary. What is left here is either a fact about Felipe (the address to
 * write to, where he is) or a string two components have to agree on: a section
 * heading that also titles the page it links to, a label the teaser and the
 * full list both print.
 *
 * Adding to this file is a decision, not a default. If a second component needs
 * a string, move it here; if it ever drops back to one, move it out again.
 */

import type { Locale } from '../lib/i18n';

/** Where mail from the contact section and the footer goes. */
export const email = 'f.p2809@gmail.com';

/** Recruiter-facing profiles, LinkedIn first. ContactPage.astro and Footer.astro. */
export const socials = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/felipemanchester' },
  { label: 'GitHub', url: 'https://github.com/felipemanchester' },
];

/** Written out in full on /contato. Digits-only version feeds the wa.me link. */
export const whatsappNumber = '+55 22 99726-4111';
const WHATSAPP_DIGITS = '5522997264111';

const whatsappMessage: Record<Locale, string> = {
  en: "Hi Felipe! I found your portfolio and I'd like to talk about a project.",
  pt: 'Olá, Felipe! Vi seu portfólio e gostaria de conversar sobre um projeto.',
};

/** Nav.astro (icon link) and ContactPage.astro (number written out) — both open the same pre-filled chat. */
export function whatsappUrl(locale: Locale): string {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(whatsappMessage[locale])}`;
}

type Shared = {
  /** Work.astro (home teaser) and TrabalhosList.astro (the full register). */
  workLabel: string;
  /** Work.astro and TrabalhoDetail.astro — both link out to a live project. */
  visitSite: string;
  /** Titles /trabalhos, and suffixes every project detail page. */
  trabalhosTitle: string;
  /** hero/About.astro folds the same intro the /sobre page opens with. */
  aboutLabel: string;
  aboutBody: string;
  /** The contact section on the home page and the /contato page share a voice. */
  contactLabel: string;
  contactHeadline: string;
  contactBody: string;
  /** Titles /blog, and suffixes every post page. */
  blogTitle: string;
  /** Journal.astro (home teaser) and BlogPage.astro. */
  journalLabel: string;
  /** The teaser's "see everything" link, and the post page's way back to it. */
  journalAll: string;
  /** Printed next to a read time in the teaser, the list and the post itself. */
  readTime: string;
};

export const shared: Record<Locale, Shared> = {
  en: {
    workLabel: 'Selected work',
    visitSite: 'Visit site',
    trabalhosTitle: 'Work | Felipe Manchester',
    aboutLabel: 'About',
    aboutBody:
      '<strong>Full-stack</strong> developer. I build fast, accessible, <strong>SEO</strong>-optimized applications structured around current technologies, focused on <strong>performance</strong>, usability and code quality, from planning to deploy.',
    contactLabel: 'Contact',
    contactHeadline: 'Your next project starts here.',
    contactBody:
      "If you need a website, want to get a project off the ground, or you're looking for a developer for your team, get in touch. WhatsApp is the fastest way to reach me, and I answer every message.",
    blogTitle: 'Blog | Felipe Manchester',
    journalLabel: 'Journal',
    journalAll: 'All posts',
    readTime: 'min read',
  },
  pt: {
    workLabel: 'Trabalhos',
    visitSite: 'Ver site',
    trabalhosTitle: 'Trabalhos | Felipe Manchester',
    aboutLabel: 'Sobre',
    aboutBody:
      'Desenvolvedor <strong>full-stack</strong>. Crio aplicações rápidas, acessíveis, otimizadas para <strong>SEO</strong> e estruturadas para as tecnologias atuais, com foco em <strong>performance</strong>, usabilidade e qualidade do código, do planejamento ao deploy.',
    contactLabel: 'Contato',
    contactHeadline: 'Seu próximo projeto começa aqui.',
    contactBody:
      'Se você precisa de um site, quer tirar um projeto do papel ou está procurando um desenvolvedor para a sua equipe, entre em contato. O WhatsApp é a forma mais rápida de falar comigo, e respondo todas as mensagens.',
    blogTitle: 'Blog | Felipe Manchester',
    journalLabel: 'Blog',
    journalAll: 'Todos os posts',
    readTime: 'min de leitura',
  },
};
