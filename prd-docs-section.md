# PRD — Docs Section (`/docs`)

**Status:** Draft v1
**Type:** Feature addition to existing TokenGecko app
**Last updated:** 2026-08-05

---

## 1. Overview

TokenGecko currently has two distinct experiences: a marketing **landing page** (`/`, dark themed, section-based — hero, feature triage, model marquee, feature matrix, etc.) and a logged-in **app** (Inspector, History, Settings, Login/Signup). There is no dedicated documentation surface.

This PRD adds a new **`/docs` section**: a sidebar-navigated documentation site, styled after modern OSS/npm-package docs sites (reference: [ozzyrm.vercel.app/docs](https://ozzyrm.vercel.app/docs)) — sidebar nav, instant search, structured content pages, keyboard navigation.

Reference inspiration is **structural/UX only** (sidebar layout, search palette, content page anatomy) — visuals should stay consistent with TokenGecko's existing dark theme (`--bg-app: #141414`, `--bg-sidebar: #121212`, Inter font, existing shadcn/ui + Tailwind setup), not a copy of OzzyRM's brand.

This is **additive**: the existing landing page and app pages (Inspector, History, Settings, Login, Signup) are not modified by this PRD except for a new "Docs" link in the landing navbar.

---

## 2. Goals & Non-Goals

### Goals
- Give TokenGecko a proper documentation home covering **both**:
  1. **Product docs** — how to use the Inspector, History, Settings, BYOK setup, sharing, etc. (for end users of the hosted app)
  2. **Package/API docs** — if/when TokenGecko exposes an installable package or public API (model registry, cost/routing endpoints), document install, config, and usage the way a real npm package would
- Sidebar navigation with collapsible sections, active-page highlighting, and deep-linkable pages (`/docs/[...slug]`)
- Instant search across doc pages (client-side to start; keyboard shortcut to open, arrow-key navigation, matches OzzyRM's `↑↓ Navigate / ↵ Open / esc Close` pattern)
- Content authored in Markdown/MDX so non-engineers (or the agent itself) can add/edit pages without touching layout code
- Consistent with existing dark theme and component library (shadcn/ui, Tailwind, existing CSS variables)

### Non-Goals (this phase)
- No changes to the existing landing page sections or app/dashboard pages beyond a nav link
- No versioned docs (e.g. v1/v2 switcher) — single current version only
- No full-text server-side search (e.g. Algolia/Meilisearch) — client-side search over page metadata/headings is sufficient for v1
- No auto-generated API reference from code (e.g. TypeDoc) in this phase — pages are hand-authored Markdown/MDX
- No interactive playground/sandbox embedded in docs (that's what the Inspector app already is)

---

## 3. Information Architecture

Sidebar structure (grouped, collapsible sections):

```
Introduction
  - Overview
  - Quickstart

Using TokenGecko
  - The Inspector
  - Comparing Models
  - History & Sharing
  - Bringing Your Own Key (BYOK)
  - Settings

Package / API
  - Installation
  - Configuration
  - Model Registry
  - Cost & Routing API
  - Webhooks / Inngest events (if applicable)

Reference
  - Glossary (tokens, context window, BYOK, etc.)
  - Supported Models
  - Changelog
```

- Section grouping and page order should be config-driven (see §5.2), not hardcoded per-page, so the agent can add pages without touching layout components.
- Each page gets a stable slug under `/docs/[...slug]`, e.g. `/docs/inspector`, `/docs/api/model-registry`.
- `/docs` itself redirects/renders the "Overview" page (same pattern as OzzyRM's `/docs` root).

---

## 4. Page Anatomy

Each docs page includes:
- **Title + short description** at the top
- **Body content** rendered from Markdown/MDX (headings, paragraphs, code blocks with syntax highlighting, tables, callouts/admonitions)
- **On-this-page outline** (right rail, derived from page headings, scroll-spy highlighting — optional for v1, can ship in v2 if timeline is tight)
- **Prev/Next page links** at the bottom, based on sidebar order
- Code blocks need copy-to-clipboard, matching the `npm i` style snippet used on the landing hero

---

## 5. Technical Requirements

### 5.1 Routing & Rendering
- New route group: `src/app/docs/` with a shared `layout.tsx` (sidebar + search + content shell) and `[...slug]/page.tsx` for individual pages
- Static generation (SSG) for docs pages where possible — content is not user-specific or dynamic, so this should not use `'use client'` at the page level unless needed for interactivity (search palette, sidebar collapse state)
- Docs layout is **not** gated behind auth — publicly accessible like the landing page, distinct from the logged-in app shell

### 5.2 Content Source
- Content authored as Markdown/MDX files under a new `content/docs/` directory (or `src/content/docs/`), one file per page
- A single config file (e.g. `src/lib/docs-nav.ts`) defines sidebar structure (sections, page order, titles) separately from the content files themselves — this is the source of truth for §3's IA and for prev/next linking
- Recommended library: `next-mdx-remote` or Contentlayer-style approach, consistent with what's already installed in `package.json` — **check existing dependencies before adding a new MDX pipeline**, since Next.js 15 (per `next.config.ts`) has multiple valid options
- Frontmatter per page: `title`, `description`, `section` (must match a section key in `docs-nav.ts`)

### 5.3 Search
- v1: client-side search — build a static search index (page title, description, headings) at build time, filter in-browser
- Search UI: command-palette style (like OzzyRM's `Search…` input opening a modal with keyboard nav), reusing existing shadcn/ui `Command` component if already available in the project's component set
- Keyboard shortcut to open (e.g. `Cmd+K` / `Ctrl+K`), plus the sidebar search input itself
- v2 (future, out of scope): swap in a server-side/hosted search provider if content volume grows

### 5.4 Styling
- Reuse existing design tokens from `globals.css` (`--bg-app`, `--bg-sidebar`, `--border-theme`, existing shadcn/ui theme variables) — do not introduce a parallel color system
- Typography: continue using Inter (already imported)
- Sidebar and content layout should be responsive: sidebar collapses to a drawer/sheet on mobile (reuse existing mobile nav patterns from `LandingNavbar` if present)

### 5.5 Navigation Entry Points
- Add "Docs" link to `LandingNavbar` (`src/components/landing/navbar.tsx`), pointing to `/docs`
- Optionally add a "Docs" link in the logged-in app's nav/sidebar (Inspector/History/Settings shell) if one exists — for users already in the app who need reference material
- Landing hero (`HeroSection`) may add a secondary "Read the docs" CTA alongside the existing primary CTA — confirm with product owner before implementing (see Open Questions)

---

## 6. Content Plan (Initial Pages to Author)

| Page | Section | Priority |
|---|---|---|
| Overview | Introduction | P0 |
| Quickstart | Introduction | P0 |
| The Inspector | Using TokenGecko | P0 |
| Comparing Models | Using TokenGecko | P1 |
| BYOK Setup | Using TokenGecko | P0 |
| History & Sharing | Using TokenGecko | P1 |
| Installation | Package / API | P1 |
| Configuration | Package / API | P1 |
| Model Registry | Package / API | P2 |
| Cost & Routing API | Package / API | P2 |
| Glossary | Reference | P1 |
| Supported Models | Reference | P0 |
| Changelog | Reference | P2 |

P0 pages should ship in the first implementation pass so `/docs` is not an empty shell; P1/P2 can follow.

---

## 7. Data Model

No database changes required — docs content is static (file-based), not stored in InsForge/Postgres. If a future "was this page helpful?" feedback widget is added, that would need a lightweight table (e.g. `docs_feedback`), but that's out of scope for this phase.

---

## 8. Success Metrics

- `/docs` page views and average pages-per-session within docs
- Search usage rate (% of docs sessions that open the search palette)
- Reduction in support/feedback questions covered by existing docs content (qualitative, via the existing feedback/contact channel if one exists)

---

## 9. Open Questions

1. **MDX pipeline choice** — confirm which MDX/Markdown rendering approach to use given current dependencies (avoid adding a second, redundant content pipeline). Needs a dependency check before implementation starts.
2. **Package docs scope** — does TokenGecko currently expose (or plan to expose, per the other PRDs) a public API/npm package, or is "Package/API" section aspirational/future-facing? This affects how much of §6's P2 content is real vs placeholder.
3. **Landing page hero CTA** — should "Read the docs" be added as a secondary CTA on the landing hero, or is a navbar link sufficient for v1?
4. **App-shell docs link** — does the logged-in app currently have a persistent nav/sidebar where a "Docs" link could live? Needs confirmation of current app shell structure.
5. **On-this-page outline** — ship in v1 or defer to v2? Recommend deferring if timeline is tight; sidebar + search cover the core need.

---

## 10. Implementation Notes for Coding Agent

- This is additive — do not modify `src/app/page.tsx`, any `src/components/landing/*` section components (beyond the navbar link), or any existing app pages (`inspector`, `history`, `settings`, `login`, `signup`).
- Suggested build order:
  1. Scaffold `src/app/docs/layout.tsx` (sidebar shell, no content yet) and confirm it renders standalone, unauthenticated
  2. Build `src/lib/docs-nav.ts` config (IA from §3) and wire sidebar rendering from it
  3. Set up the Markdown/MDX content pipeline (§5.2) and get one page (`Overview`) rendering end-to-end through `[...slug]/page.tsx`
  4. Author remaining P0 content pages (§6)
  5. Add client-side search (§5.3) once enough pages exist to make it meaningful
  6. Add navbar "Docs" link last, once `/docs` has real content behind it — don't ship a linked-to empty shell
- Reuse existing shadcn/ui components wherever possible (`Command`/`Dialog` for search, `Sheet` for mobile sidebar) rather than building new primitives — check `src/components/ui/` before creating anything new.
- Check `package.json` before adding any new dependency for MDX rendering, syntax highlighting, or search — prefer what's already installed if it covers the need.
