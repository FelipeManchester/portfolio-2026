# Felipe Manchester — Portfolio

Personal portfolio and blog. Recruiter-facing, skills-first, bilingual (PT/EN).

## Stack

- [Astro](https://astro.build) (static output)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Storyblok](https://www.storyblok.com) — CMS for blog posts and project entries
- Astro's built-in i18n routing — Portuguese at `/`, English under `/en`
- Hosted on [Vercel](https://vercel.com)

## Project structure

```text
/
├── public/                favicon, static assets
├── scripts/                storyblok-schema.mjs, storyblok-seed.mjs
├── src/
│   ├── components/         page sections, one file per concern
│   ├── content/             shared.ts — strings/data used by 2+ components
│   ├── layouts/             BaseLayout.astro
│   ├── lib/                  storyblok.ts, i18n.ts
│   ├── pages/                 file-based routes (pt at root, en under /en)
│   ├── scripts/                client-side behavior (nav, theme, animations)
│   └── styles/                 global.css, Tailwind tokens
└── package.json
```

Routes stay in Portuguese under both locales (`/trabalhos`, `/en/trabalhos`) — the URL segment is not translated, only the page content.

## Commands

| Command                         | Action                                                  |
| :------------------------------- | :------------------------------------------------------- |
| `npm run dev`                    | Start the dev server at `localhost:4321`                 |
| `npm run build`                  | Build to `./dist/` (runs a type check first)              |
| `npm run preview`                 | Serve the production build locally                        |
| `npm run astro -- check`          | Standalone type checking                                   |
| `npm run astro -- add <name>`     | Add an Astro integration                                    |

## Environment

Copy `.env.example` to `.env` and fill in:

- `STORYBLOK_TOKEN` — Preview token from the Storyblok space (Settings > Access Tokens), reads drafts locally
- `STORYBLOK_SPACE_ID` — only needed for the Management API and visual editor

In production the build reads published content only.

## Content model

Two Storyblok content types: `post` (blog) and `project` (work). Schema and multi-select field options live in `scripts/storyblok-schema.mjs`; `scripts/storyblok-seed.mjs` seeds initial entries.
