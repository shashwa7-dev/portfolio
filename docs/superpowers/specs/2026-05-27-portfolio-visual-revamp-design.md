# Portfolio Visual Revamp — Design Spec

- **Date:** 2026-05-27
- **Author:** Shashwat Tripathi
- **Status:** Approved (pending final spec review)
- **Repo:** personal portfolio (Next.js 14 App Router, TypeScript, Tailwind, motion, MDX)

## 1. Context & Goal

The current site is a polished but **cramped** single-column portfolio locked to `max-w-2xl` (672px) with a warm "e-ink" theme. The project content (3 side projects with rich data, work experience, clients, tech stack) is real, but the layout crams it into tiny rows, so the work doesn't showcase well. The supporting infrastructure (SEO metadata, dynamic OG route, sitemap, robots, RSS, MDX blog, books, project/work detail routes) is solid.

**Goal:** a complete visual/design-layer revamp — typography, spacing, layout, color/theme, and a few high-value structural upgrades — to help land interviews at top product companies and freelance/consulting work. The site must communicate strong engineering, product thinking, clean UI taste, performance obsession, and attention to detail.

The **data and infrastructure layers stay**; what changes is the visual/layout layer on top, plus targeted additions (case studies, ⌘K, branded OG).

## 2. Decisions Summary (locked)

| Area | Decision |
|------|----------|
| **Scope** | Visual revamp of existing site + a few key routes (combination of "revamp same site" + "add key pages"). Keep single-page homepage feel; split/expand where it relieves cramping. |
| **Layout** | **Hybrid (A) + editorial labels (C):** narrow ~680px reading column for prose; full-width "breakout" (~1080px) for showcases; editorial mono section labels; label-gutter on case studies. |
| **Typography** | **Fraunces** (display/headings, wt 500) · **Inter** (body) · **JetBrains Mono** (editorial labels/meta). |
| **Theme** | **Graphite + Indigo**, dark-mode-first, with mirrored light mode. Replaces the e-ink theme entirely. |
| **Projects** | Redesigned showcase grid (home + `/projects`) with large media cards. |
| **Case studies** | `/project/[slug]` upgraded to full case studies via optional data fields (graceful when empty). |
| **Motion** | Restrained & premium (staggered fade-ups, hover lifts, theme cross-fade). `prefers-reduced-motion` respected. |
| **⌘K palette** | Yes — fuzzy nav/search + quick actions. |
| **Dynamic OG** | Branded, route-aware OG cards for home, projects, case studies, blog posts, books. |
| **Not in scope** | Separate Experience page, Resume page, GitHub contribution graph, testimonials, AI search, particle/3D effects. |
| **Execution** | Approach 1 — tokens-first, incremental migration; site stays live & reviewable throughout. |

## 3. Design Foundation (tokens)

Reuse the **existing CSS-variable + Tailwind token architecture** (`app/globals.css` + `tailwind.config.ts`). Keep semantic var names (`--background`, `--foreground`, `--card`, `--border`, `--muted-foreground`, `--accent`, etc.) so existing Tailwind mappings keep working; swap values and add a few new tokens (`--elevated`, `--subtle`, font vars). Store colors as HSL triples per the current convention; hex below is for reference.

### Color — Dark (default)
| Token | Hex | Role |
|-------|-----|------|
| `--background` | `#0B0B0F` | page background (cool graphite near-black) |
| `--card` | `#15151B` | card / surface |
| `--elevated` | `#1C1C24` | raised surface (palette, popovers) |
| `--border` | `#24242C` | hairline border |
| `--border-strong` | `#2E2E38` | stronger border / inputs |
| `--foreground` | `#EDEDEF` | primary text |
| `--muted-foreground` | `#9A9AA6` | secondary text |
| `--subtle` | `#6E6E78` | labels / tertiary |
| `--accent` | `#6E6BF2` | indigo accent |
| `--accent-hover` | `#807DF5` | accent hover/italic emphasis |
| `--accent-foreground` | `#FFFFFF` | text on accent |

### Color — Light (mirrored)
| Token | Hex |
|-------|-----|
| `--background` | `#FBFBFD` |
| `--card` | `#FFFFFF` |
| `--elevated` | `#F4F4F7` |
| `--border` | `#E6E6EC` |
| `--foreground` | `#16161A` |
| `--muted-foreground` | `#5C5C66` |
| `--subtle` | `#8A8A94` |
| `--accent` | `#5B57E0` (deepened for AA contrast on light) |
| `--accent-foreground` | `#FFFFFF` |

Single accent used sparingly. AA contrast verified for text and accent in both modes.

### Typography
- Load via `next/font/google` (self-hosted, `display:swap`, Latin subset), exposing `--font-fraunces`, `--font-inter`, `--font-mono`. Map in Tailwind: `font-serif` → Fraunces, `font-sans` → Inter, `font-mono` → JetBrains Mono.
- Scale:
  - Display: `clamp(38px, 6vw, 58px)`, Fraunces 500, tracking `-0.02em`, line-height 1.02
  - h1: 36px Fraunces 500
  - h2 (section): 28px Fraunces 500, tracking `-0.01em`
  - h3 (card/sub): 20px Fraunces 500
  - body-lg / lede: 18px Inter, muted
  - body: 16px Inter, line-height **1.65**
  - small/meta: 14px
  - label: 11–12px JetBrains Mono, uppercase, tracking `0.14–0.16em`, `--subtle`
- Optional accent: one italic Fraunces phrase in the hero headline.

### Spacing, radius, rhythm
- 4px base scale.
- **Major section vertical rhythm: 96–128px desktop / ~72–80px mobile** (today 40px — primary cause of "cramped").
- Content gaps: 16 / 24 / 32px.
- Container: reading `max-w` 680px; breakout `max-w` 1080px; gutter padding `px-6` (24px).
- Radius: cards 14px, buttons 9px, media 16px, pills 999px.

### Motion (restrained & premium)
- Ease `cubic-bezier(0.22, 1, 0.36, 1)`; durations 200–400ms.
- Staggered fade-up reveals on scroll-in: `+12px` translate, 60ms stagger, via a lightweight in-view wrapper.
- Card hover: `translateY(-2px)` + border glow toward accent.
- Theme switch: smooth cross-fade.
- Transform/opacity only (GPU). All gated behind `prefers-reduced-motion: reduce`.
- Extend the existing `lib/motionVariants.ts`.

## 4. Layout System & Primitives

New/updated reusable primitives (server components where possible):

- **`Container`** — variants: `reading` (680px) and `wide` (1080px); handles gutter padding. Enables "narrow text, wide breakout".
- **`Section`** — vertical rhythm wrapper (96–128px), optional `Label` + heading header row, optional "view all" link slot.
- **`Label`** — mono uppercase editorial label.
- **`ProseGutter`** — the case-study two-column layout: sticky left meta/TOC gutter + content column (the "C" editorial influence).
- **`Reveal`** — client wrapper applying staggered fade-up via motion, reduced-motion aware.

## 5. Information Architecture

Homepage remains the primary single-page experience. Routes:

- `/` — Hero/About → Projects showcase → Experience → Clients → Toolkit → Now (activity) → Contact/Socials → Footer.
- `/projects` — full showcase grid + (conditional) filters.
- `/project/[slug]` — full case study.
- `/work/[org]` (existing `[project]` route retained) — work detail.
- `/blogs`, `/blogs/[slug]` — MDX blog (existing).
- `/books`, `/books/[slug]` — reading list (existing).
- 404 — restyled to new system.

No separate Experience or Resume page (timeline stays on home).

## 6. Page & Section Designs

### Global chrome
- **Navbar:** sticky, translucent blur on scroll; `offcod8` Fraunces wordmark; minimal links (Work · Projects · Writing · Books); `⌘K` pill; theme toggle. Active-section indication on homepage.
- **Footer:** minimal — name/mark, "built with", year.

### Hero / About (reading column)
Availability status (dot) · editorial label · Fraunces display headline (one italic accent phrase) · Inter lede with email link · primary "View work" + ghost "Get in touch". Small avatar/logo. Server component.

### Projects showcase (breakout — the core fix)
Section header (`Label` + Fraunces heading + "View all →"). **2-column large cards**: 16:10 media (screenshot / hover-played preview video via existing `useVideoPreview`), Fraunces title, optional "Recent" badge, tagline, mono tech stack, live/GitHub/download links, and a **"Read case study →"** affordance when case-study content exists. Trailing dashed "+ more → /projects" card. Cards link to `/project/[slug]`; outbound links `stopPropagation`.

### Experience (reading column)
Editorial timeline from `lib/workData.ts`: `120px` mono tabular date column + role/org/short blurb rows, hairline separators.

### Clients
Existing logo marquee, restyled: muted by default → full color on hover.

### Toolkit
Tech grouped by Frontend / Backend / Tools with mono category labels and chips (reuse `StackIcon`).

### Now (activity)
Two cards: Spotify last-listen + current book (existing integrations).

### Contact / Socials
Centered Fraunces CTA, email button, social links (GitHub, X, LinkedIn, RSS).

### Projects index (`/projects`)
Editorial header + showcase grid of all projects. **Conditional filters:** derive tag chips from data; render the filter bar only when there are ≥2 tag groups each with multiple projects (effectively hidden at 3 projects today, future-proofed). Filtering is client-side.

### Case study (`/project/[slug]`)
- Header: back link, editorial label (`Name · Year · Role`), Fraunces title, lede, full-width hero media.
- **`ProseGutter` layout:** sticky left gutter (Role, Year, Stack, Links + on-page TOC) + content column.
- Content sections render **only when their data field is present**: Overview → Problem → Constraints → Architecture → Tradeoffs → Performance → Results → Lessons. Each has a mono section label + Fraunces heading.
- **Results** render as metric cards (e.g., `<1s export`, `100% client-side`) — measurable, recruiter- and GEO-friendly. No fabricated metrics; author supplies real numbers.

### ⌘K command palette
Client component, lazy-loaded. Fuzzy search across sections, projects, and blog posts; grouped results (Navigation / Projects / Writing / Actions); quick actions (toggle theme, copy email); full keyboard nav (↑↓ / ↵ / esc), `aria` roles, focus trap. Triggered by `⌘K` / `Ctrl K` and the navbar pill.

## 7. Data Model Changes

Extend `TSideProject` in `lib/projectsData.ts` with **optional** case-study fields (page renders only what's present):

```ts
caseStudy?: {
  role?: string;
  year?: string;
  overview?: string;
  problem?: string;
  constraints?: string[];
  architecture?: string[] | string;
  tradeoffs?: string[] | string;
  performance?: string[] | string;
  results?: { value: string; caption: string }[];
  lessons?: string[] | string;
};
tags?: string[]; // for /projects filtering (e.g., "web", "ai", "desktop", "tools")
```

Existing fields (`highlights`, `screenshots`, `preview`, `thumbnail`, `stack`, `links`) are reused.

## 8. Dynamic OG System

Upgrade `app/og/route.tsx` (currently a bare white card) into a **branded, route-aware OG generator** using `next/og` `ImageResponse` (Edge), matching the new graphite + indigo + Fraunces aesthetic.

- **Query params:** `title`, `subtitle` (tagline/excerpt), `type` (`home | project | post | books | generic`), `label` (eyebrow, e.g. "CASE STUDY", "WRITING", stack), optional `meta` (date/reading time).
- **Visual:** graphite `#0B0B0F` background, subtle indigo radial/accent bar, mono eyebrow label, Fraunces title, Inter subtitle, footer wordmark `shashwa7.in` + small avatar/logo. 1200×630.
- **Fonts in `ImageResponse`:** load Fraunces + Inter font binaries (fetched/bundled in `public` or via `fetch`) and pass to `ImageResponse.fonts` so OG cards use the real type.
- **Per-route wiring:** each route's `generateMetadata` sets `openGraph.images` / `twitter.images` to `/og?...` with appropriate params:
  - `/` → home template
  - `/project/[slug]` → `type=project`, title + tagline + stack label
  - `/blogs/[slug]` → `type=post`, title + excerpt + date/reading-time
  - `/books`, `/books/[slug]` → `type=books`
  - generic fallback for everything else
- Add `alt` text and stable cache (`?v=` bust on template change).

## 9. SEO / GEO

- **Keep** existing metadata, robots, RSS.
- **Fix:** `app/sitemap.ts` emits `/blog/<slug>` but the route is `/blogs/<slug>` — correct to `/blogs/`, and add `/projects` + `/project/<slug>` entries.
- **Canonical URLs** per route via `metadata.alternates.canonical`.
- **JSON-LD** structured data: `Person` (root), `WebSite`, `SoftwareApplication`/`CreativeWork` per project, `Article` per blog post, optional `FAQPage`. Inject via `<script type="application/ld+json">` in the relevant layouts/pages.
- **GEO:** semantic landmarks, descriptive headings, concise expertise summaries, measurable Results blocks, clear authorship signals — structured so AI engines can extract and cite. Proper heading hierarchy (single h1 per page).

## 10. Performance

Targets: Lighthouse Performance 95+, SEO 100, Accessibility 100, Best Practices 100.

- Fonts self-hosted via `next/font` (no render-blocking, zero layout shift); subset Latin; Fraunces optical sizing.
- Server-first components; only `ChatBot`, ⌘K palette, theme toggle, and `Reveal` wrappers are client. ⌘K and ChatBot remain `dynamic()` + lazy.
- `next/image` for all project media; preview videos lazy with `poster`, play only on hover/in-view.
- Reserve media aspect-ratios (CLS); hero LCP is text, not an image.
- Motion via transform/opacity only; avoid hydrating the whole page for reveals.
- Watch INP: keep ⌘K search and filters debounced/cheap.

## 11. Accessibility

Target: 100. AA contrast on both themes (incl. indigo on graphite / indigo on light), visible focus rings, full keyboard navigation including ⌘K (focus trap, esc), `aria` labels/roles, semantic HTML, reduced-motion honored everywhere, accessible names on icon-only controls (theme toggle, social links).

## 12. Build Phasing (Approach 1 — incremental, site stays live)

1. **Foundation** — tokens (color/type/spacing/radius), fonts via `next/font`, motion variants, layout primitives (`Container`, `Section`, `Label`, `ProseGutter`, `Reveal`).
2. **Global chrome** — Navbar (+ ⌘K), Footer, theme toggle restyle.
3. **Hero + Projects showcase** (home) — highest-impact change.
4. **Case-study pages** + `TSideProject` extension.
5. **Projects index** + conditional filters.
6. **Remaining home sections** — Experience, Clients, Toolkit, Now, Contact.
7. **Dynamic OG system** + per-route metadata wiring.
8. **SEO/GEO + polish** — JSON-LD, sitemap/canonical fixes, Lighthouse + a11y + reduced-motion QA.

Each phase is independently shippable and reviewable.

## 13. Out of Scope (YAGNI)

Separate Experience page, Resume page, GitHub contribution graph, testimonials section, certifications, AI-powered semantic search, particle/3D backgrounds, dashboard-style UI, animated gradient-everywhere. May revisit later.

## 14. Risks & Open Questions

- **Case-study depth is author-supplied.** Pages look complete with partial data, but the recruiter value depends on writing real Problem/Architecture/Results content per project. No fabricated metrics.
- **Font weight on Fraunces** — verify rendering/legibility of the serif at body-adjacent sizes; keep it to display/headings only.
- **Light mode** ships alongside dark but dark is the default and primary QA target.
- **OG font loading on Edge** — confirm font binary fetch works within `ImageResponse` size/time limits; bundle locally if needed.

---

## 15. Revision 2 — Structure, Consistency & Cleanup (2026-05-27)

After the initial build, a strategic review reprioritized the page around **professional experience** (the strongest job-seeking asset) and surfaced consistency/cleanup needs. The visual direction (graphite+indigo, Fraunces/Inter/JetBrains Mono, primitives) is unchanged; the **information architecture, section consistency, and feature set** change as below. All decisions were validated in the visual companion.

### 15.1 New information architecture (homepage order)
1. **Hero** — adds a one-line **proof statement** ("Shipped products used by 1M+ · Coinbase, Polygon, Sentient").
2. **Experience & Work (combined)** — promoted near the top; the page's anchor. Each role is a block; for roles with projects, the standout projects nest underneath (projects shown in the context where they were built).
3. **Side Projects** — demoted to a small secondary strip ("Things I build for fun"): PaperNoise, Kiryouku, Eatri8 as a compact list, linking to `/projects`. No longer the primary showcase.
4. **Toolkit** (tech stack)
5. **Trusted by** (clients) — kept as its own strip.
6. **Now** — Writing + Reading (books). **Music/Spotify removed.**
7. **Contact**

Rationale: the side projects are basic; the real credibility is the professional work (1M+ users, Coinbase/Polygon partnerships, AI×Web3). Lead with proof.

### 15.2 Combined Experience & Work section (new component)
- Roles connected by a **vertical timeline rail** (node per role; green node = current role) — replaces hard divider lines between roles.
- **ShopOS** (current): "Currently building" badge + highlights, no project cards.
- **Dehidden**: role + 1–2 highlights + a 2-col grid of **5 featured project cards** + "View all 9 →" linking to `/work/dehidden`. Featured (curated): **Coinbase × Polygon NFT, PlayAI Hub, Polygon Copilot, Node Explorer, Agent Experience**.
- **Cope.Studio**: compact internship block.
- **Project cards are small/tight** (~54px thumbnail, condensed text): thumbnail or ▶video · title · one headline metric · mono stack · link. Cards link to the work-project detail route (`/work/[org]/[project]`).
- **Data:** add `featured?: boolean` to `TProject` in `lib/workData.ts` and mark the 5 selected projects. The combined section reads featured work projects from `workData`, not from `sideProjects`.

### 15.3 Section consistency system (apply to ALL sections)
- The `Section` primitive gains an optional `number` prop. Every section renders an identical header: **numbered mono eyebrow** (`01 / EXPERIENCE & WORK`) + **serif title**, left-aligned, identical margins.
- **No horizontal divider lines** between sections — **whitespace (~96px) + the numbered eyebrow** create the rhythm. Remove `Separator`/`border-top` section dividers.
- Numbering: 01 Experience & Work · 02 Side Projects · 03 Toolkit · 04 Trusted by · 05 Now · 06 Contact. Hero is the un-numbered intro.
- Every section (and the hero) inherits this exact treatment — fixes the current uneven, piecemeal headers.

### 15.4 Remove sound effects
- Delete `app/providers/SoundProvider.tsx`, `components/IntroSound.tsx`, and sound assets `public/sound/mouse-click.wav`, `public/sound/intro.mp3`.
- Remove the `SoundProvider` wrapper from `app/layout.tsx` and the **sound/mute toggle** from `components/Navbar.tsx` (drop `useSound`).
- Remove any remaining `useSound`/`IntroSound` references.

### 15.5 Remove music (Spotify) integration
- Delete `components/SpotifyLastListen.tsx`, `components/LoginButton.tsx`, and API routes `app/api/last-listened`, `app/api/auth`, `app/api/callback`, `app/api/refresh-token`.
- Decouple `app/api/chat/route.ts` from Spotify (it references it) — the ChatBot stays (Gemini), minus any "now playing" context.
- "Now" section keeps Writing + Reading only. This also removes the pre-existing `/api/last-listened` `nextUrl.origin` build error.
- Leave incidental textual references (e.g., "inspired by Spotify Wrapped" in a project description, a `spotify` tech-icon name) untouched.

### 15.6 Icon consolidation (lightweight, 3G-friendly)
- **UI icons → `lucide-react`** (tree-shakeable). Migrate all `feather-icons-react` and `@iconify/react` UI-icon usages.
- **Tech/brand logos → `simple-icons`** (per-icon imports, tree-shaken, monochrome) used in the **Toolkit** section; rewrite `StackIcon` to use it. Stack tags on cards use **mono text**, not logos.
- **Remove `@iconify/react` and `feather-icons-react`** from dependencies.
- **Verify**: check `next build` First-Load-JS after migration; if `simple-icons` adds meaningful weight, fall back to **text-only** tech labels in the Toolkit too. Target: snappy on 3G, bundle no larger than before (should be smaller — iconify runtime removed).

### 15.7 Out of scope (unchanged)
Resume page, dedicated Experience page (it's now the combined home section), GitHub graph, testimonials, AI search.
