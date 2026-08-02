/**
 * Storyblok content, fetched at build time.
 *
 * Every page is pre-rendered, so these requests happen once during `astro
 * build` and never in a visitor's browser — no runtime API call, no token in
 * the client bundle, and the deployed site is still plain static HTML.
 *
 * Text arrives already resolved for a single locale rather than as
 * `{ en, pt }`: each page knows its own locale, so resolving here halves the
 * requests and keeps `[locale]` lookups out of the templates.
 */

import { renderRichText, type SbRichTextDoc } from '@storyblok/richtext';
import type { Locale } from '../lib/i18n';

const API = 'https://api.storyblok.com/v2/cdn';

/**
 * Portuguese is Storyblok's default language and has no code of its own; the
 * alternate is registered as `en-us`. Note this is the *query* code — the key
 * translated values are stored under swaps the hyphen for an underscore, which
 * only the seed script has to care about.
 */
const LANGUAGE: Record<Locale, string> = { pt: 'default', en: 'en-us' };

/**
 * Drafts while developing, published content in a build. Writing a post and
 * seeing it locally without publishing is the whole point of the preview
 * token; shipping drafts to production would defeat it.
 */
const VERSION = import.meta.env.DEV ? 'draft' : 'published';

const TOKEN = process.env.STORYBLOK_TOKEN ?? import.meta.env.STORYBLOK_TOKEN;

export interface Project {
	slug: string;
	name: string;
	year: string;
	/** Empty when the site is not public yet — the card then reads "Em breve". */
	url: string;
	stack: string[];
	summary: string;
	description: string;
	/** Absolute Storyblok asset URLs, or null when nothing was uploaded. */
	poster: string | null;
	video: string | null;
	featured: boolean;
	order: number;
}

export interface Post {
	slug: string;
	title: string;
	excerpt: string;
	/** ISO date (YYYY-MM-DD). Storyblok stores a datetime; only the day is used. */
	date: string;
	tag: string;
	/** The body already rendered to HTML — pages set it with `set:html`. */
	body: string;
	/** Estimated read time in whole minutes, never less than 1. */
	minutes: number;
}

interface Asset {
	filename?: string | null;
}

interface Story<T> {
	slug: string;
	full_slug: string;
	content: T;
}

/**
 * One build fetches each locale once, however many components ask for it.
 * Astro renders 16 pages from the same process, and without this the same
 * three projects would be requested a dozen times.
 */
const cache = new Map<string, Promise<unknown>>();

async function fetchStories<T>(folder: string, locale: Locale): Promise<Story<T>[]> {
	if (!TOKEN) {
		throw new Error(
			'STORYBLOK_TOKEN is not set. Copy .env.example to .env and add the preview token.',
		);
	}

	const key = `${folder}:${locale}:${VERSION}`;
	const hit = cache.get(key);
	if (hit) return hit as Promise<Story<T>[]>;

	const url = new URL(`${API}/stories`, API);
	url.searchParams.set('token', TOKEN);
	url.searchParams.set('version', VERSION);
	url.searchParams.set('starts_with', `${folder}/`);
	url.searchParams.set('language', LANGUAGE[locale]);
	url.searchParams.set('per_page', '100');
	// Storyblok caches delivery responses per space. A build wants whatever was
	// published a moment ago, not a cached copy from the previous deploy.
	url.searchParams.set('cv', String(Date.now()));

	const request = fetch(url)
		.then(async (response) => {
			if (!response.ok) {
				throw new Error(
					`Storyblok ${folder} (${locale}) — ${response.status} ${response.statusText}\n${await response.text()}`,
				);
			}
			const { stories } = (await response.json()) as { stories: Story<T>[] };
			return stories;
		})
		.catch((error) => {
			// Drop the rejected promise so a later call can retry rather than
			// inheriting the same failure from the cache.
			cache.delete(key);
			throw error;
		});

	cache.set(key, request);
	return request;
}

/**
 * CMS responses are untyped, and a missing field would otherwise reach a page
 * as the string "undefined". Failing the build names the story and the field.
 */
function required(value: unknown, field: string, slug: string): string {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`Storyblok: story "${slug}" is missing required field "${field}".`);
	}
	return value;
}

/** An emptied asset field comes back as an object with a null filename, not as null. */
function asset(value: Asset | null | undefined): string | null {
	return value?.filename ? value.filename : null;
}

export async function getProjects(locale: Locale): Promise<Project[]> {
	const stories = await fetchStories<Record<string, unknown>>('trabalhos', locale);

	return stories
		.map(({ slug, content }): Project => {
			return {
				slug,
				name: required(content.name, 'name', slug),
				year: required(content.year, 'year', slug),
				url: typeof content.url === 'string' ? content.url : '',
				stack: Array.isArray(content.stack) ? (content.stack as string[]) : [],
				summary: required(content.summary, 'summary', slug),
				description: required(content.description, 'description', slug),
				poster: asset(content.poster as Asset),
				video: asset(content.video as Asset),
				featured: content.featured === true,
				// Storyblok's number field stores a string, and an untouched one is ''.
				order: Number.parseInt(String(content.order ?? ''), 10) || 0,
			};
		})
		.sort((a, b) => a.order - b.order);
}

/** The homepage carries only the projects flagged featured; /trabalhos lists all. */
export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
	return (await getProjects(locale)).filter((project) => project.featured);
}

export async function getProject(slug: string, locale: Locale): Promise<Project | undefined> {
	return (await getProjects(locale)).find((project) => project.slug === slug);
}

/** Storyblok datetimes arrive as "2026-06-18 00:00" even with the time disabled. */
function isoDate(value: unknown, slug: string): string {
	const date = required(value, 'date', slug).slice(0, 10);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new Error(`Storyblok: story "${slug}" has an unreadable date "${String(value)}".`);
	}
	return date;
}

/** Every text node in the body, flattened — used for the word count, nothing else. */
function plainText(node: unknown): string {
	if (!node || typeof node !== 'object') return '';
	const { text, content } = node as { text?: unknown; content?: unknown };
	if (typeof text === 'string') return text;
	if (!Array.isArray(content)) return '';
	return content.map(plainText).join(' ');
}

/**
 * 200 words a minute, the usual figure for prose on screen. Deliberately not a
 * CMS field: a number typed by hand drifts away from the text it describes the
 * first time a paragraph is edited.
 */
function readMinutes(body: unknown): number {
	const words = plainText(body).split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

export async function getPosts(locale: Locale): Promise<Post[]> {
	const stories = await fetchStories<Record<string, unknown>>('blog', locale);

	return stories
		.map(({ slug, content }): Post => {
			// An untouched richtext field is an empty doc, and a post being drafted
			// may not have a body yet. That renders as nothing rather than failing
			// the dev build mid-write; the other fields still have to be there.
			const body = content.body as SbRichTextDoc | undefined;

			return {
				slug,
				title: required(content.title, 'title', slug),
				excerpt: required(content.excerpt, 'excerpt', slug),
				date: isoDate(content.date, slug),
				tag: required(content.tag, 'tag', slug),
				body: body?.content?.length ? renderRichText(body) : '',
				minutes: readMinutes(body),
			};
		})
		.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string, locale: Locale): Promise<Post | undefined> {
	return (await getPosts(locale)).find((post) => post.slug === slug);
}
