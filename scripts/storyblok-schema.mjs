/**
 * Storyblok block schema, as code.
 *
 * The two content types this site reads live here rather than only inside
 * Storyblok, so the shape the components expect is reviewable in a diff and
 * reproducible if the space is ever rebuilt. Field names are the API keys the
 * data layer reads — renaming one here means renaming it there.
 *
 * Idempotent: existing blocks are updated in place, so this can be re-run
 * after editing a definition below.
 *
 *   node --env-file=.env scripts/storyblok-schema.mjs
 *
 * Needs STORYBLOK_MANAGEMENT_TOKEN, which is write-capable and only needed
 * while this runs. Revoke it afterwards.
 */

// The space is in the EU region. US spaces use api-us.storyblok.com.
const API = 'https://mapi.storyblok.com/v1';

const SPACE = process.env.STORYBLOK_SPACE_ID;
const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;

if (!SPACE || !TOKEN) {
	console.error('Missing STORYBLOK_SPACE_ID or STORYBLOK_MANAGEMENT_TOKEN.');
	console.error('Run with: node --env-file=.env scripts/storyblok-schema.mjs');
	process.exit(1);
}

// Storyblok's UI shows the ID as `#294232718418035`. Pasted with the prefix,
// the API quietly answers with the account's space list instead of a 404, and
// the failure only surfaces later as a missing key.
if (!/^\d+$/.test(SPACE)) {
	console.error(`STORYBLOK_SPACE_ID must be digits only — got "${SPACE}".`);
	process.exit(1);
}

/** Storyblok wants option lists as {name, value} pairs; the site only uses the value. */
const options = (...values) => values.map((value) => ({ name: value, value }));

const post = {
	name: 'post',
	display_name: 'Post',
	is_root: true, // a story can be of this type
	is_nestable: false, // but it cannot be dropped inside another story
	preview_field: 'title',
	schema: {
		title: {
			type: 'text',
			translatable: true,
			required: true,
			pos: 0,
			description: 'Shown on the blog list, the homepage teaser and the post itself.',
		},
		excerpt: {
			type: 'textarea',
			translatable: true,
			required: true,
			max_length: 200,
			pos: 1,
			description: 'One or two sentences. Used as the teaser and the meta description.',
		},
		date: {
			type: 'datetime',
			disable_time: true,
			required: true,
			pos: 2,
			description: 'Publication date. Posts are ordered newest first.',
		},
		tag: {
			type: 'option',
			required: true,
			options: options('Performance', 'Astro', 'Accessibility'),
			pos: 3,
			description: 'Drives the filter row on /blog. One tag per post.',
		},
		body: {
			type: 'richtext',
			translatable: true,
			required: true,
			pos: 4,
			description: 'The post. Read time is calculated from this, so there is no field for it.',
		},
	},
};

const project = {
	name: 'project',
	display_name: 'Project',
	is_root: true,
	is_nestable: false,
	preview_field: 'name',
	schema: {
		name: {
			type: 'text',
			required: true,
			pos: 0,
			description: 'Not translatable — a brand name reads the same in both languages.',
		},
		year: {
			type: 'text',
			required: true,
			pos: 1,
			description: 'Year shipped, e.g. 2025.',
		},
		url: {
			type: 'text',
			pos: 2,
			description:
				'Live site, including https://. Source repos are private, so this is the only outbound link. Left empty, the card reads "Em breve".',
		},
		stack: {
			type: 'options',
			options: options(
				'Next.js',
				'React',
				'Tailwind',
				'Astro',
				'Sanity',
				'TypeScript',
				'JavaScript',
				'Sass',
				'Node.js',
				'Express',
				'PHP',
				'REST APIs',
				'GraphQL',
				'MySQL',
				'PostgreSQL',
				'Firebase',
				'Supabase',
				'WordPress',
				'Wix',
				'Git',
				'Figma',
				'Jest',
				'CI/CD',
				'Vercel',
				'Netlify',
			),
			pos: 3,
			description: 'Shown as the card meta line.',
		},
		poster: {
			type: 'asset',
			filetypes: ['images'],
			pos: 4,
			description:
				'Still frame shown before the video plays, and the only image if there is no video. Landscape, ideally 16:10. Without it the card falls back to the hatched placeholder.',
		},
		video: {
			type: 'asset',
			filetypes: ['videos'],
			pos: 5,
			description:
				'Short muted loop, roughly 6-10s, MP4. Plays on hover. Optional — a poster alone works fine.',
		},
		summary: {
			type: 'textarea',
			translatable: true,
			required: true,
			max_length: 160,
			pos: 6,
			description: 'One sentence, used on the project cards and the /trabalhos list.',
		},
		description: {
			type: 'textarea',
			translatable: true,
			required: true,
			pos: 7,
			description: 'The longer version, shown only on the project detail page.',
		},
		featured: {
			type: 'boolean',
			pos: 8,
			description: 'Featured projects appear on the homepage. The rest only on /trabalhos.',
		},
		order: {
			type: 'number',
			pos: 9,
			description: 'Lowest first. Controls sequence on both the homepage and /trabalhos.',
		},
	},
};

/**
 * Storyblok has issued personal access tokens in two shapes over time: older
 * ones go in the Authorization header raw, newer ones are Bearer. Rather than
 * guess, the first request settles it and every later one reuses the answer.
 */
let authHeader = null;

async function api(path, init = {}) {
	const attempts = authHeader ? [authHeader] : [TOKEN, `Bearer ${TOKEN}`];
	let last;

	for (const auth of attempts) {
		const response = await fetch(`${API}${path}`, {
			...init,
			headers: {
				Authorization: auth,
				'Content-Type': 'application/json',
				...init.headers,
			},
		});

		if (response.ok) {
			authHeader = auth;
			return response.status === 204 ? null : response.json();
		}

		last = response;
		if (response.status !== 401) break;
	}

	const body = await last.text();
	throw new Error(`${init.method ?? 'GET'} ${path} — ${last.status} ${last.statusText}\n${body}`);
}

async function sync(definition) {
	const { components } = await api(`/spaces/${SPACE}/components`);
	const existing = components.find((c) => c.name === definition.name);

	if (existing) {
		await api(`/spaces/${SPACE}/components/${existing.id}`, {
			method: 'PUT',
			body: JSON.stringify({ component: { ...definition, id: existing.id } }),
		});
		return `updated  ${definition.name}`;
	}

	await api(`/spaces/${SPACE}/components`, {
		method: 'POST',
		body: JSON.stringify({ component: definition }),
	});
	return `created  ${definition.name}`;
}

for (const definition of [post, project]) {
	console.log(await sync(definition));
}

console.log('\nBlock library is in sync.');
