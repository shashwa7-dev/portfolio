# CLAUDE.md

Project memory for Claude Code agents (and any other coding-LLM-driven sessions) working on this repository.

---

## Project at a glance

- **Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS 4 · React 19 · Framer Motion · Vercel
- **Owner:** Shashwat Tripathi — frontend engineer portfolio at `shashwa7.in`
- **Default branch:** `master`
- **Package manager:** `npm` (lockfile committed)

---

## Source-of-truth files

| File | What it contains | Updated by |
|---|---|---|
| `lib/workData.ts` | Organizations (ShopOS, Dehidden, …), roles, employment type, projects | Manually as work history evolves |
| `lib/clients.ts` | Brand affiliations, read by the OG card and the markdown homepage route. The homepage itself shows no brand row: each Work row carries a hand-written `summary` from `lib/workData.ts` that names partners where it matters. Do not re-add a hero brand row or a standalone brand strip. | Manually when a brand is added or dropped. **Update `data/agent-memory.md`'s "Worked with" line in the same change.** |
| `lib/diaryData.ts` | Long-form contributions log per org (the `/work/<org>` diary entries) | Manually when a notable contribution ships |
| `components/About.tsx` | Hero: identity row, headline (with the cycling `HeroPhrase`), lede copy, and the stats ticker | Manually when positioning changes |
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
| Brand added to or dropped from clients | "Worked with" section |
| Bio rewrite in `About.tsx` lede | "Who Shashwat is" section |

---

## Other conventions in this repo

- **No em-dashes** in any user-facing copy. Use periods, colons, parentheses, or rephrase. (This applies to UI strings, blog content, and `data/agent-memory.md` itself.)
- **All Framer Motion variants and tokens** live in `lib/motionVariants.ts`, mirrored as CSS custom properties in `app/globals.css`. Never paste literal easings like `[0.23, 1, 0.32, 1]` or duration numbers like `0.4` into a component: import the named token instead.
- Motion opportunities were audited against `find-animation-opportunities`. These were rejected on the frequency gate and must not be re-added: command palette and shortcuts-overlay open/close, nav link underline slides, theme-toggle colour crossfade, homepage section scroll reveals, stat bento count-up, Experience list stagger.
- **Emphasis in prose is `<strong>`** (`font-semibold text-foreground`), used sparingly: a term or a claim worth pulling out, never a whole run of sentences. There is no underline highlight device. `components/common/Marker.tsx` is **deleted**: its last use was the contact address in the `About.tsx` hero, and the hero rework dropped it as the least premium element on the page. Do not bring it back. Its SVG was absolutely positioned at `w-full`, so any phrase that wrapped got one flat rule across the whole paragraph. Underlines belong to links only (`underline decoration-border-strong underline-offset-4`).
- **All markdown-emitter routes** (`app/*/markdown/route.ts`) use `lib/markdownResponse.ts` for the response factory + frontmatter helpers.
- **No rails, no bands.** The page rails, section bands, gutter dots and the per-route header row (`PageBand`) were all removed in the minimal-home pass (spec `docs/superpowers/specs/2026-09-30-minimal-home-design.md`); `Band`, `BandLabel` and `PageBand` are deleted (verify checks C16 to C21). Do not bring any of them back. Homepage sections use `Section`; secondary routes open directly with their own heading. The one sanctioned exception to "no rules" is the section label row (`components/layout/SectionLabel.tsx`, shared by `Section` and the `/cv` sheet's section heads, so never re-implement it), chosen by Shashwat on 2026-11-03: a 3x3 dot-matrix glyph (hashed from the label), the label in the dot face (`font-label`, muted, no accent colour), then a dotted leader (`.section-leader`) to the section number ("02", a CSS counter, `.section-no`, so it follows page order on its own), with the section's arrow link (`ViewAllLink`, icon only) right after it. Hovering the section head ripples the glyph's dots (`.section-glyph`, `--duration-glyph-wave` / `--duration-glyph-step`, hover devices only, off under reduced motion). Do not grow it into bands or solid rules.
- **The measure lives in one place**, `--measure` in `app/globals.css`. `Container width="reading"` reads it. Never write `760px` into a component.
- **Page padding**: every secondary route's `<main>` carries `pt-8 md:pt-12 pb-8 md:pb-12` (a blog post puts the same on its section). There is no header row above the content any more, so the top padding lives on the page. Match this when adding a new top-level route.
- **The global `<Navbar />`** is rendered once in `app/layout.tsx`. Per-page Navbar imports are forbidden. It is a dock, not a top bar: always dark, at the bottom middle of the screen below 1280px and on the left edge from 1280px. Desktop widens it on hover to show X, GitHub and Email; phones get a chevron that raises a drawer card instead. Its CSS (the "Dock" block in `app/globals.css`) is deliberately outside `@layer components`, because the global unlayered `a { transition }` rule would otherwise flatten its link animations, so inside the dock use the block's media queries for show/hide, not Tailwind's `md:hidden`. Use `max-md:`, not the custom `-md:` variant, which has no effect. Below 1280px, a page with chapters (a blog post with headings, `/coffee`) narrows the dock to one bar: the chapter ring and name on the left, Home on the right. The dock stays mounted and its width really transitions (`--duration-dock-morph`, `--ease-dock-morph`, no `layoutId`): `.dock-chapter-space` opens, Home slides right, and `.dock-rest` collapses, all keyed on `body:has(.chapter-dock):not(:has(.no-script))`, so visitors without JavaScript keep the full dock. `components/common/MobileChapters.tsx` lays its server-rendered button over the open space, so a hard load has no flash and plays no animation. The floating chapter pill was removed because it sat on the site dock and took its taps; do not bring it back.
- **Markdown-for-agents** is wired in `proxy.ts` (Next 16's name for middleware; the function is `proxy`). When adding a new route family with a `text/markdown` rendition, add it both to the matcher and to the rewrite branches there.
- **Candy is disabled** by `CANDY_ENABLED = false` in `lib/theme.ts`. A stored `candy` preference falls back to the system theme and the palette hides the Candy action. Its styles and `candy:` classes stay in place; flip the flag (and verify check C18) only when Shashwat asks for it back.
- **Intro stats ticker**: `components/common/StatsTicker.tsx` renders `tickerStats` from `lib/stats.ts` (`stats` keeps its first three for the OG card). The loop length is `duration.ticker` / `--duration-ticker`; it pauses on hover and wraps statically under reduced motion. Never name it or import anything as `Marquee` (verify check C13).
- **Intro phrase cycle**: the italic phrase in the `About.tsx` headline is `components/common/HeroPhrase.tsx`, cycling `HERO_PHRASES` from `lib/heroPhrases.ts` (the first, "ship and scale", is the SSR and reduced-motion text). The two phrases overlap (`popLayout`): old words blur out word by word while the new ones blur in, and the slot width eases to the new phrase at the same time, clipped so nothing spills onto " to millions" (`phraseSwapVariants` + `phraseWordVariants`, `duration.phraseStart` / `phraseHold`). Runs only while the hero is in view and the tab is visible. Never name it or a token `wordCycle` (verify check C09).
- **Closing dot-matrix sign**: `components/common/DotMarquee.tsx` scrolls "LET'S BUILD" right to left on a 7-row dot strip as the closing section's only headline (`Closing.tsx`, the written "Let's build something good." was removed as a repeat), full column width. Columns come from the strip's width (`PITCH`), so dots keep their size at every width; one column per `duration.marqueeStep`; lit dots 0.8, unlit 0.1, no fades (`.dot-marquee`). It writes `data-on` to the dots directly, never through React state. Steps only while on screen and the tab is visible; still under reduced motion; exposed as `role="img"` named "Let's build", its dots aria-hidden. It replaced the graffiti hand (GraffitiHand.tsx, `public/graffiti-hand.webp`, `handRiseVariants` and `ease.sway` are deleted) and then a 9x9 `DotMatrix` panel (deleted); do not bring either back.
- **Hero intro line and goggles**: the hero opens with one line, the page's h1: "Hi, I am (photo) Shashwat ✓" (`components/About.tsx`). The portrait is a small round photo inline in that sentence, sized in `em` (`components/AvatarHover.tsx`), with an "Open to work" tooltip. It is a button, not a link (the old `/offcod8` link was removed on purpose; nothing in the UI links there now): a click spins it like a fidget spinner (`components/common/SpinAvatar.tsx`: rAF physics of a bottom-weighted spinner: it goes round while it has the energy, then stalls, swings back and rocks to rest upright, never an extra lap; off under reduced motion; the F key spins it too while the photo is on screen and you are not typing; not Space, which scrolls, and not S, which is "g s"), with minimal synthesised sound (`components/common/spinSound.ts`: a flick per click, a fading tick every half turn, a click on settling; 2.5s of fast spinning dissolves the photo into an 8s "You Spin Me Round" video with sound, `public/video/spin-me-round.webm` plus an `.mp4` fallback, which turns with the spinner and fades out with its sound when it settles or ends; fade time is `--duration-spin-clip`, shared by picture and sound; spam never restarts, cuts or plays over the clip: five flicks in 1.5s while it is up queues `public/audio/mat-kar-lala.mp3` to play once after it ends, never stacked). It is ringed by a slowly turning dotted status ring in the accent ink (`.status-ring`, `--duration-status-ring`) and an amber live dot (amber 700 / 300, the margin notes' ink); the dot and "Open to work" are the only amber there, so keep the ring off amber. Below it, two mono lines: the role, then BLR local time and an amber "Open to work" led by a pulsing 3x3 live glyph (`.live-glyph`, `--duration-live-pulse` / `--duration-live-ring`). The postage stamp, its perforated edge and the OPEN postmark were removed (Postmark.tsx deleted); do not bring them back. Hovering the photo slides a pair of goggles onto its glasses (`components/common/Goggles.tsx`). One look: a matte black visor with a fire-red lens. Placement in `.goggles` (`app/globals.css`) is in percent of the photo, measured from the portrait's glasses, so re-measure it if `avatar.png` changes. Hover only; fades instead of sliding under reduced motion.
- **Background brand mark**: `components/common/BrandBackdrop.tsx`, homepage only, mounted from `app/page.tsx`. A large faint dot-matrix copy of `public/brand-mark.png` (31x31 bitmap, corners rounded by leaving dots out), absolute at the top right of the page behind everything, running off the top and right edges and clipped by its own wrapper so it never widens the page. It draws in once per page load, one diagonal at a time (`.brand-backdrop`, `--duration-backdrop-dot` / `--duration-backdrop-step`, off under reduced motion; `data-drawn` stops it replaying when client navigation returns to the homepage). On mouse devices, dots fill in around the pointer (`components/common/BrandBackdropFill.tsx`, `.brand-backdrop-fill`, `--duration-backdrop-fill`): a brighter copy of the dots seen through a soft mask that trails the pointer, read from the window because the backdrop takes no pointer events; the mask jumps instead of trailing under reduced motion. The bitmap is shared in `components/common/brandBitmap.ts`.
- **Margin notes**: handwritten asides from `lib/marginNotes.ts`, keyed by row id (org or side-project slug), five at most, rendered by `components/common/MarginNote.tsx` in Caveat (`--font-hand`). In the right margin from `lg`, inline below it.
- **Two icon packages, and only two.** `@phosphor-icons/react` for UI, actions and concepts, always imported from `@phosphor-icons/react/ssr` (the package root is a `"use client"` barrel, so the root entry drags every icon page into the client bundle and breaks server components). `simple-icons` for technology and brand marks, via `components/common/StackIcon.tsx`. `lucide-react` was replaced wholesale and must not come back. `devicon` was evaluated and rejected: it covers 18 of this stack's 27 tools, missing Claude, OpenAI, Gemini, wagmi and Solana among others, and measures 2.13x simple-icons' bytes on the marks they share. Phosphor has no `strokeWidth`; it has `weight`.
- **Design tokens (color, type, spacing)** are documented in `docs/design-system.md`; reusable Claude Code skill at `.claude/skills/design-system/SKILL.md`.
- **Tailwind 4**, still configured from `tailwind.config.ts`: `app/globals.css` loads it with `@config`, after `@import "tailwindcss"` and two documented v4 compatibility rules (theme border colour, button cursor). Custom classes stay in plain `@layer utilities` blocks rather than `@utility`, because several use compound selectors (`a.sticker:hover`) that `@utility` cannot express. The four default-palette colours in use (amber 300/700, emerald 400/500) are pinned to their v3 values, since v4 redrew its palette.
- **Type scale** comes from `tailwind.config.ts`: sizes `text-2xs` through `text-4xl`, tracking from `tracking-label` / `tracking-tight` / `tracking-tighter`. Arbitrary `text-[Npx]` is forbidden: use the scale instead.
- **`scripts/verify-simplification.sh`** is the mechanical gate for the simplification pass (typography, motion, deleted surfaces, palette). It must exit 0 before any change to `app/`, `components/`, or `lib/` is considered done.
- **All visitor-card drawing** goes through `lib/card/`. The pure modules (`seed`, `issues`, `types`, `dice`, `toss`, `revealSequence`) carry vitest tests and must stay free of DOM access; the drawing modules (`sticker`, `ticket`, and the vendored `engine`) take a canvas context as a parameter and must never hold module-level mutable state, because the issue gallery renders five canvases on one page. `drawTicket` draws every size: preview, export and thumbnail. Never add a second drawing routine.
- **The card's link previews are five committed PNGs**, `public/og/issue-*.png`, rendered from the real `drawTicket` by `scripts/render-issue-og.ts` (`npm run og:issues`, needs network the first time to cache the OFL fonts into a git-ignored `.cache/`). Re-run it whenever the card's drawing changes, or the previews keep advertising the old design. `@napi-rs/canvas` and `tsx` are devDependencies for that script alone and must not be imported by anything under `app/` or `components/`: nothing renders a card at request time, which is what keeps the `?issue=` param a five-value enum rather than an input to a renderer.
- **Two vendored licence notices ship with the card feature**: `lib/card/engine/LICENSE-cyber-crowd.md` (the portrait engine derives from Kevin Ngo's cyber-crowd, MIT) and `lib/card/LICENSE-fonts.md` (Caveat and Alegreya Sans SC, SIL OFL 1.1). Keep both; do not strip them as unused files.
- **`components/card/dice/`** holds the dice-roll UI: `useDiceRoll` (the shared roll state, the three fixes to its throw/settle/reset lifecycle, and the pill's click contract), `RollPill` (the shared button, fill bar and caption, driven by `useDiceRoll`'s own return value), `Pips` (the flat die-face icon), and the two skins `CubeDice` and `TossDice`. `DiceRoller.tsx` picks a skin via the `?dice=cube` / `?dice=toss` query param and exports `SkinProps`, the prop shape both skins take. The `web-haptics` dependency drives the throw's press, landing and completion taps and the card's reveal. Both the weights and the wrapper live in `components/card/haptics.ts`: `HAPTICS` names each moment rather than its preset, so the ladder from press to reveal is decided in one place, and `safeHaptic` makes sure a missing implementation, an unsupported browser, or a declined permission never interrupts a throw. `CardMinter` fires `HAPTICS.reveal` alongside the chime; `useDiceRoll` fires the other three.

---

## Commands

```bash
npm run dev      # next dev (port 3000 by default; this repo uses 3001 in practice)
npm run build    # next build
npm run lint     # eslint . (flat config in eslint.config.mjs; Next 16 removed next lint)
npm test         # vitest run (pure lib modules: card's seed, issues, types, dice, toss, revealSequence, plus chatStream)
npm run cv:pdf   # re-render public/shashwat-tripathi-cv.pdf from data/cv.md (system Chrome; aims for one page)
```

After any edit to `data/cv.md`, run `npm run cv:pdf` in the same change, or the downloadable PDF keeps the old CV while `/cv` shows the new one.

---

## Useful entry points

- Homepage layout composition: `app/page.tsx` → `<About>`, `<ExperienceWork>`, `<Writing>`, `<Currently>`, `<Projects>`, `<Faq>`, `<Closing>`. Sections use `Section` with a plain `label` and `title` and are separated by whitespace only: no bands, no rules, no numbering (`HOMEPAGE_SECTION_TOTAL` and `lib/sections.ts` are gone). Work and Projects are rows, not cards; Work shows no project cards (they live on `/work/<org>`). `<CommandPalette>` mounts globally from `app/layout.tsx`. `<ChatBot>` is homepage-only, mounted from `app/page.tsx`: as a fixed bottom-right bubble it collided with anything else anchored to that corner on other routes.
- Org page: `app/work/[org]/page.tsx` — header + key contributions + projects + inline diary.
- Project case-study: `app/work/[org]/[project]/page.tsx`.
- Blog: `app/blogs/*` with MDX posts under `app/blogs/posts/`.
- Agent discovery: `app/robots.txt/route.ts`, `public/.well-known/llms.txt`, `app/markdown/route.ts`, `proxy.ts`, `docs/dns-aid.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
