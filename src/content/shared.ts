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

/** Campos dos Goytacazes, RJ. Drives the clock annotation and the about page. */
export const location = {
	timeZone: 'America/Sao_Paulo',
	label: 'Campos dos Goytacazes, Brazil',
} as const;

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
		trabalhosTitle: 'Work — Felipe Manchester',
		aboutLabel: 'About',
		aboutBody:
			'Full-stack developer based in Brazil, working across React, Next.js and Astro. I care about the parts people feel: load time, motion, and interfaces that hold up on every screen.',
		contactLabel: 'Contact',
		contactHeadline: 'Let’s build something.',
		contactBody:
			'Open to full-time roles and freelance projects. The fastest way to reach me is email — I answer every message.',
		blogTitle: 'Blog — Felipe Manchester',
		journalLabel: 'Journal',
		journalAll: 'All posts',
		readTime: 'min read',
	},
	pt: {
		workLabel: 'Trabalhos',
		visitSite: 'Ver site',
		trabalhosTitle: 'Trabalhos — Felipe Manchester',
		aboutLabel: 'Sobre',
		aboutBody:
			'Desenvolvedor full-stack no Brasil, trabalhando com React, Next.js e Astro. Cuido do que as pessoas sentem: tempo de carregamento, animação e interfaces que funcionam em qualquer tela.',
		contactLabel: 'Contato',
		contactHeadline: 'Vamos construir algo.',
		contactBody:
			'Aberto a vagas efetivas e projetos freelance. O caminho mais rápido é o e-mail — respondo todas as mensagens.',
		blogTitle: 'Blog — Felipe Manchester',
		journalLabel: 'Blog',
		journalAll: 'Todos os posts',
		readTime: 'min de leitura',
	},
};
