# CLAUDE.md

Project memory for Claude Code agents (and any other coding-LLM-driven sessions) working on this repository.

---

## Project at a glance

- **Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · React 18 · Framer Motion · Vercel
- **Owner:** Shashwat Tripathi — frontend engineer portfolio at `shashwa7.in`
- **Default branch:** `master`
- **Package manager:** `npm` (lockfile committed)

---

## Source-of-truth files

| File | What it contains | Updated by |
|---|---|---|
| `lib/workData.ts` | Organizations (ShopOS, Dehidden, …), roles, employment type, projects | Manually as work history evolves |
| `lib/clients.ts` | Brand affiliations shown in the "Worked with" row and Clients section | Manually when a new brand is added |
| `lib/diaryData.ts` | Long-form contributions log per org (the `/work/<org>` diary entries) | Manually when a notable contribution ships |
| `components/About.tsx` | Hero bio, stats, lede copy, Worked-with row | Manually when positioning changes |
| **`data/agent-memory.md`** | **Truffy chat assistant's system prompt** | **MUST be updated whenever any of the above changes** |

---

## The agent-memory rule (READ THIS)

**Whenever portfolio information changes** — any of: role, current org, employment, projects, stats, brand list, bio, contact, tech stack, recent shipments, personal interests — **you MUST also update `data/agent-memory.md` in the same change** so the Truffy chat assistant stays in sync.

The chatbot at `app/api/chat/route.ts` reads `data/agent-memory.md` at module load to build its system prompt. If you change a fact about Shashwat somewhere else in the codebase and forget the memory file, Truffy will keep telling visitors the old story.

Concrete triggers that REQUIRE a memory-file update:

| Change | What to update in `data/agent-memory.md` |
|---|---|
| New role / job change | "Current engagement" + "Past engagement" sections |
| Project added or rebranded | "Recently shipped" or "Most notable Dehidden ships" table |
| Stat update (users, mints, products shipped) | "Proof points" section |
| Personal info (interests, location, contact) | "Personal" + "Contact" sections |
| New tech in the stack | "Tech stack" section |
| Brand added to clients | "Worked with" section |
| Bio rewrite in `About.tsx` lede | "Who Shashwat is" section |

---

## Other conventions in this repo

- **No em-dashes** in any user-facing copy. Use periods, colons, parentheses, or rephrase. (This applies to UI strings, blog content, and `data/agent-memory.md` itself.)
- **All Framer Motion variants and tokens** live in `lib/motionVariants.ts`, mirrored as CSS custom properties in `app/globals.css`. Never paste literal easings like `[0.23, 1, 0.32, 1]` or duration numbers like `0.4` into a component: import the named token instead.
- Motion opportunities were audited against `find-animation-opportunities`. These were rejected on the frequency gate and must not be re-added: command palette and shortcuts-overlay open/close, nav link underline slides, theme-toggle colour crossfade, homepage section scroll reveals, stat bento count-up, Experience list stagger.
- **Emphasis in prose is `<strong>`** (`font-semibold text-foreground`), used sparingly: a term or a claim worth pulling out, never a whole run of sentences. There is no underline highlight device. `components/common/Marker.tsx` survives for exactly one decorative use, the contact address in the `About.tsx` hero, and must not be reintroduced as a highlight: its SVG is absolutely positioned at `w-full`, so any phrase that wraps gets one flat rule across the whole paragraph. Underlines otherwise belong to links only (`underline decoration-border-strong underline-offset-4`).
- **All markdown-emitter routes** (`app/*/markdown/route.ts`) use `lib/markdownResponse.ts` for the response factory + frontmatter helpers.
- **Page padding** is standardized at `py-8 md:py-12` on the `<main>` of every secondary route. Match this when adding a new top-level route.
- **The global `<Navbar />`** is rendered once in `app/layout.tsx`. Per-page Navbar imports are forbidden.
- **Markdown-for-agents** is wired in `middleware.ts` — when adding a new route family with a `text/markdown` rendition, add it both to the matcher and to the rewrite branches there.
- **Design tokens (color, type, spacing)** are documented in `docs/design-system.md`; reusable Claude Code skill at `.claude/skills/design-system/SKILL.md`.
- **Type scale** comes from `tailwind.config.ts`: sizes `text-2xs` through `text-4xl`, tracking from `tracking-label` / `tracking-tight` / `tracking-tighter`. Arbitrary `text-[Npx]` is forbidden: use the scale instead.
- **`scripts/verify-simplification.sh`** is the mechanical gate for the simplification pass (typography, motion, deleted surfaces, palette). It must exit 0 before any change to `app/`, `components/`, or `lib/` is considered done.

---

## Commands

```bash
npm run dev      # next dev (port 3000 by default; this repo uses 3001 in practice)
npm run build    # next build
npm run lint     # next lint
```

(There is no test script yet.)

---

## Useful entry points

- Homepage layout composition: `app/page.tsx` → renders `<About>`, `<ExperienceWork>`, `<Projects>`, `<TechStack>`, `<Clients>`, `<Activity>`, `<Faq>`, `<Socials>` back to back, with no divider between sections. `<CommandPalette>` mounts globally from `app/layout.tsx`. `<ChatBot>` is homepage-only, mounted from `app/page.tsx`: as a fixed bottom-right bubble it collided with anything else anchored to that corner on other routes.
- Org page: `app/work/[org]/page.tsx` — header + key contributions + projects + inline diary.
- Project case-study: `app/work/[org]/[project]/page.tsx`.
- Blog: `app/blogs/*` with MDX posts under `app/blogs/posts/`.
- Agent discovery: `app/robots.txt/route.ts`, `public/.well-known/llms.txt`, `app/markdown/route.ts`, `middleware.ts`, `docs/dns-aid.md`.
