/**
 * Seeds the Storyblok space with the content the site shipped before the CMS
 * existed.
 *
 * The two arrays below were the site's hardcoded content. Nothing renders them
 * any more — the pages read Storyblok — but they stay here so the seed is
 * reproducible if the space is ever rebuilt, and so the slugs stay identical
 * (existing URLs keep working). Storyblok is the source of truth; editing an
 * array here changes nothing on the site.
 *
 * Idempotent by slug — a project that already exists is updated rather than
 * duplicated, and an existing post is left alone entirely.
 *
 *   node --env-file=.env scripts/storyblok-seed.mjs
 *
 * Requires STORYBLOK_MANAGEMENT_TOKEN.
 */

/**
 * The three featured builds. Source repos are private, so a project links out
 * to the live site and nothing else — a dead GitHub link reads worse than no
 * link at all.
 *
 * PLACEHOLDER: the summaries and descriptions are drafted copy, not Felipe's
 * own words. They seeded the stories, so rewrite them in Storyblok — a re-run
 * keeps whatever has been translated or edited there.
 */
const projects = [
	{
		slug: 'memoamor',
		name: 'Memoamor',
		year: '2025',
		url: 'https://memoamor.app',
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
		url: 'https://itaboraioxigenio.com.br',
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
		url: 'https://manchesteradvogados.com.br',
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
];

/** Titles, dates and tags only — these posts were never written. See below. */
const posts = [
	{
		slug: 'core-web-vitals-astro',
		date: '2026-06-18',
		tag: 'Performance',
		title: {
			en: 'Shipping a perfect LCP without giving up the design',
			pt: 'Um LCP perfeito sem abrir mão do design',
		},
	},
	{
		slug: 'astro-islands-in-practice',
		date: '2026-05-02',
		tag: 'Astro',
		title: {
			en: 'Islands in practice: what actually needs to hydrate',
			pt: 'Ilhas na prática: o que realmente precisa hidratar',
		},
	},
	{
		slug: 'motion-that-respects-users',
		date: '2026-03-27',
		tag: 'Accessibility',
		title: {
			en: 'Motion that respects the person reading it',
			pt: 'Animação que respeita quem está lendo',
		},
	},
];

const API = 'https://mapi.storyblok.com/v1';
const SPACE = process.env.STORYBLOK_SPACE_ID;
const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;

/**
 * The site routes on `pt` and `en`; Storyblok's default language is Portuguese
 * (it has no code of its own) and the alternate is registered as `en-us`.
 * Translated values live on suffixed keys in the same content object.
 *
 * The suffix is NOT the language code verbatim — hyphens become underscores,
 * so a language registered as `en-us` stores into `summary__i18n__en_us`.
 * Writing the hyphenated form is accepted without complaint and then ignored
 * by the delivery API, which serves the default language instead.
 */
const ALT_LANG = 'en-us';
const i18n = (field) => `${field}__i18n__${ALT_LANG.replace(/-/g, '_')}`;

/** Fields carrying a translation, and so worth protecting from a re-run. */
const TRANSLATED = ['summary', 'description'];

/** Folder slugs match the routes that render them. */
const FOLDERS = {
	projects: { name: 'Trabalhos', slug: 'trabalhos', contentType: 'project' },
	posts: { name: 'Blog', slug: 'blog', contentType: 'post' },
};

if (!SPACE || !TOKEN) {
	console.error('Missing STORYBLOK_SPACE_ID or STORYBLOK_MANAGEMENT_TOKEN.');
	process.exit(1);
}
if (!/^\d+$/.test(SPACE)) {
	console.error(`STORYBLOK_SPACE_ID must be digits only — got "${SPACE}".`);
	process.exit(1);
}

let authHeader = null;

async function api(path, init = {}) {
	const attempts = authHeader ? [authHeader] : [TOKEN, `Bearer ${TOKEN}`];
	let last;

	for (const auth of attempts) {
		const response = await fetch(`${API}${path}`, {
			...init,
			headers: { Authorization: auth, 'Content-Type': 'application/json', ...init.headers },
		});
		if (response.ok) {
			authHeader = auth;
			return response.status === 204 ? null : response.json();
		}
		last = response;
		if (response.status !== 401) break;
	}

	throw new Error(
		`${init.method ?? 'GET'} ${path} — ${last.status} ${last.statusText}\n${await last.text()}`,
	);
}

/**
 * `with_slug` matches the *full* path, so a story inside a folder has to be
 * looked up as `trabalhos/memoamor`. Passing the bare slug returns nothing,
 * which would make this script create duplicates instead of updating.
 */
async function findStory(fullSlug) {
	const { stories } = await api(
		`/spaces/${SPACE}/stories?with_slug=${encodeURIComponent(fullSlug)}&per_page=100`,
	);
	return stories[0];
}

/** The list endpoint omits `content`; only the single-story read carries it. */
async function storyContent(id) {
	const { story } = await api(`/spaces/${SPACE}/stories/${id}`);
	return story.content ?? {};
}

async function ensureFolder(folder) {
	const existing = await findStory(folder.slug);
	if (existing) return existing.id;

	const { story } = await api(`/spaces/${SPACE}/stories`, {
		method: 'POST',
		body: JSON.stringify({
			story: {
				name: folder.name,
				slug: folder.slug,
				is_folder: true,
				// New stories inside this folder default to the right content type,
				// so the editor never has to pick from the block list.
				default_root: folder.contentType,
			},
		}),
	});
	return story.id;
}

function toContent(project) {
	return {
		component: 'project',
		name: project.name,
		year: project.year,
		url: project.url,
		stack: [...project.stack],
		summary: project.summary.pt,
		[i18n('summary')]: project.summary.en,
		description: project.description.pt,
		[i18n('description')]: project.description.en,
		featured: true,
		// Storyblok's `number` field is stored as a string, and rejects an actual
		// number with a 422. The data layer parses it back on the way out.
		order: '0',
	};
}

const projectFolderId = await ensureFolder(FOLDERS.projects);
console.log(`folder   trabalhos (id ${projectFolderId})`);

for (const [index, project] of projects.entries()) {
	const content = { ...toContent(project), order: String(index + 1) };
	const existing = await findStory(`${FOLDERS.projects.slug}/${project.slug}`);

	// A PUT replaces content wholesale, so anything already translated by hand
	// in the editor would be reverted to the drafted copy in site.ts. Keep what
	// is there; only fill the gaps.
	if (existing) {
		const previous = await storyContent(existing.id);
		const kept = [];

		for (const field of TRANSLATED) {
			const key = i18n(field);
			if (previous[key]) {
				content[key] = previous[key];
				kept.push(field);
			}
		}

		if (kept.length > 0) console.log(`  kept translated: ${kept.join(', ')}`);
	}

	const payload = {
		story: {
			name: project.name,
			slug: project.slug,
			parent_id: projectFolderId,
			content,
		},
		// Published immediately: these are already live on the site, so leaving
		// them as drafts would make the first CMS build lose content.
		publish: 1,
	};

	if (existing) {
		await api(`/spaces/${SPACE}/stories/${existing.id}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
		});
		console.log(`updated  ${project.slug}`);
	} else {
		await api(`/spaces/${SPACE}/stories`, { method: 'POST', body: JSON.stringify(payload) });
		console.log(`created  ${project.slug}`);
	}
}

/**
 * The three posts in site.ts are titles, dates and tags — they were never
 * written. So each one is seeded as an *unpublished* draft carrying an obvious
 * placeholder where the prose goes: the slugs and the routing can be seen
 * working in `npm run dev` (which reads drafts) while nothing half-written can
 * reach production, where only published stories are fetched.
 */
const PLACEHOLDER = {
	pt: 'PLACEHOLDER — texto ainda não escrito. Reescreva no Storyblok antes de publicar.',
	en: 'PLACEHOLDER — not written yet. Rewrite this in Storyblok before publishing.',
};

/** Richtext is stored as a ProseMirror document, not as a string. */
const paragraph = (text) => ({
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

function toPostContent(post) {
	return {
		component: 'post',
		title: post.title.pt,
		[i18n('title')]: post.title.en,
		excerpt: PLACEHOLDER.pt,
		[i18n('excerpt')]: PLACEHOLDER.en,
		// The datetime field wants a time even with `disable_time` set.
		date: `${post.date} 00:00`,
		tag: post.tag,
		body: paragraph(PLACEHOLDER.pt),
		[i18n('body')]: paragraph(PLACEHOLDER.en),
	};
}

const postFolderId = await ensureFolder(FOLDERS.posts);
console.log(`\nfolder   blog (id ${postFolderId})`);

let created = 0;

for (const post of posts) {
	// Unlike the projects, a post that exists is never touched again: by then it
	// holds writing that only exists in Storyblok, and there is nothing in
	// site.ts worth overwriting it with.
	if (await findStory(`${FOLDERS.posts.slug}/${post.slug}`)) {
		console.log(`skipped  ${post.slug} (already in Storyblok)`);
		continue;
	}

	await api(`/spaces/${SPACE}/stories`, {
		method: 'POST',
		body: JSON.stringify({
			story: {
				name: post.title.pt,
				slug: post.slug,
				parent_id: postFolderId,
				content: toPostContent(post),
			},
			// No `publish` key: drafts stay out of the production build.
		}),
	});
	created += 1;
	console.log(`drafted  ${post.slug}`);
}

console.log(`\nSeeded ${projects.length} projects and drafted ${created} posts.`);
console.log('Storyblok is now the source of truth. Write the post bodies there, then publish.');
