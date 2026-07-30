# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is Felipe's personal portfolio + blog site, currently at the bare Astro scaffold stage (`npm create astro@latest -- --template minimal`). The only route is [src/pages/index.astro](src/pages/index.astro). No components, layouts, content collections, styling framework, CMS integration, or i18n config exist yet — treat anything beyond the current file tree as not-yet-built, even if referenced below as planned direction.

## Commands

- `npm run dev` — start the dev server at `localhost:4321`
- `npm run build` — build to `./dist/` (runs a type check first via the Astro build step)
- `npm run preview` — serve the production build locally
- `npm run astro -- <command>` — run any Astro CLI command directly, e.g. `npm run astro -- check` for standalone type checking, or `npm run astro add <integration>` to add an integration (React/Vue/Svelte, Tailwind, an i18n helper, etc.)

There is no test runner or linter configured in this repo yet.

When starting the dev server for yourself (not for the user to watch), run it in the background: `./node_modules/.bin/astro dev` can be backgrounded, then inspected/stopped via `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Architecture

Standard Astro file-based routing: any `.astro` or `.md` file under `src/pages/` becomes a route named after its path. `src/components/` (not yet created) is the conventional place for Astro/framework components once they're added. `tsconfig.json` extends `astro/tsconfigs/strict`.

## Planned direction (not yet implemented — see below before assuming any of this exists in code)

Decisions already made for where this project is headed, so implementation should move toward these rather than introducing conflicting choices:

- **Purpose:** recruiter-facing portfolio + blog (primary audience: recruiters evaluating Felipe during an active job search; secondary: freelance clients). Positioning is skills-first, not a single rigid job title.
- **Sitemap:** `/` (hero + folded-in About + top 3 featured projects + latest post teasers), `/projects` (full list), `/projects/[slug]` (detail page per project), `/blog` (list, filterable by tag), `/blog/[slug]`, `/contact` (form, no CV download).
- **CMS:** Storyblok (official Astro integration), chosen for its managed free tier — no self-hosted backend to keep alive for a site recruiters will visit.
- **Styling:** Tailwind CSS.
- **Contact form:** an Astro API route calling Resend's email API, not a third-party form service.
- **i18n:** bilingual EN/PT via Astro's built-in i18n routing.
- **Design:** minimalist, large/impactful typography, low text density, light mode default with a dark mode toggle, no accent color chosen yet.
- **Hosting:** Vercel.
- **Featured projects** (all source repos private, so link out to the live site + stack + description only, no GitHub link): Memoamor (Next.js/React/Tailwind), Itaboraí Oxigênio (Astro/Sanity), Manchester Advogados (Astro/Sanity).
