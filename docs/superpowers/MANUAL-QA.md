# Manual QA checklist — portfolio simplification pass

Every item below was written to be judged without reading the implementation plan. Items marked `[x]` were personally verified in a real Chrome browser (via Chrome DevTools MCP) against a production build (`npm run build && npm run start`) during the Task 15 sweep on 2026-08-12. Items marked `[ ]` are left for the repo owner, with a note on why they were not (fully) verified in this pass, usually because they depend on subjective feel over real time, or on a live network condition that a scripted browser session cannot faithfully reproduce.

Screenshots referenced below live in `.superpowers/sdd/2026-08-12-portfolio-simplification/screenshots/`.

## Homepage (`/`)

- [x] Hero reads as one static sentence: "I build interfaces that ship and scale to millions." Correct: no cycling phrases, no layout shift, "ship and scale" is not a rotating word. Verified via accessibility snapshot and DOM read (`h1.textContent` is the full fixed sentence) in both themes. See `01-home-light-full.png`, `02-home-hero-viewport.png`.
- [x] Stats bento (1M+ / 100K / 9+ / 4+ yrs) renders with small brand-logo badges anchored to each stat. Correct: badges are grayscale avatars with a border, legible in both themes. See `02-home-hero-viewport.png`, `03-home-hero-dark.png`.
- [x] Clients / "Worked with" avatar row and the "Teams I've worked with" list render. Correct: avatar strip shows overlapping circular logos; the "Teams I've worked with" section shows one full card per brand with name + one-line contribution, always visible (this section has no tooltips by design — see note below).
- [x] Homepage sections are separated by whitespace alone, with no divider rules. Correct: scrolled the full page in both themes; there is no horizontal rule, gradient line, or "ambient chrome" between the 01–07 numbered sections. See "Honest verdict" note below for whether this reads as intentional.
- [x] FAQ's first item ("Are you available for new work?") is open on load. Correct: verified via the accessibility tree on first paint — the first `button` has `expanded=true` and its `region` is present; all other FAQ buttons are `expandable` but collapsed.
- [ ] "Sections read as intentional, not loose" is inherently a subjective call — see the honest verdict in the Task 15 report. Worth the owner's own look at `01-home-light-full.png` before trusting my read alone.

## `/work/shopos` (org page)

- [x] Experience / diary content has no timeline rail, no dots. Correct: each contribution is a numbered ("01"–"05") card with a heading, context, contributions list, and an "Impact" callout; no vertical line or dot marker runs down the page. See `08-work-shopos-dark-full.png`.
- [x] Left edge of the diary content aligns with the sections above and below. Correct: all content sits inside the same `Container` width; verified visually at full-page screenshot resolution.
- [ ] Pixel-perfect edge alignment across breakpoints was only checked at 1440px and 390px, not the full responsive range. Worth a spot check at a mid-size tablet width (e.g. 768–1024px).

## Project case study (`/work/dehidden/playai-hub`)

- [x] Page renders cleanly: status pill, title, "Built at Dehidden" link, preview image with a "Watch Preview" affordance, description, key features, tech stack chips, and links. Correct: all text legible in dark mode, no broken images, no overflow. See `09-project-case-study-dark.png`.

## Blog post (`/blogs/truffy-agent`)

- [x] `h2` sizing after the 1.75rem → 1.5rem move. Correct: measured `getComputedStyle(h2).fontSize` = `24px` (1.5rem), and visually it still reads as a clear section break, not undersized. See `10-blog-post-dark.png`.
- [x] **Syntax highlighting is color-differentiated.** Previously broken (see the git history on this line for the original note); fixed after this checklist was first committed, in commit `86d4955`. Root cause was `--sh-*` custom properties in `app/globals.css` defined as bare HSL triplets (e.g. `25 55% 38%`), but `sugar-high` (the highlighter) consumes them directly as `color:var(--sh-keyword)`, which expects a literal color, not a triplet. Fixed by wrapping all `--sh-*` tokens in `hsl(...)`, plus adding `--sh-property` and `--sh-entity`, two token types sugar-high emits that were never defined at all. Predates the simplification branch; not something Tasks 1–14 introduced.

## `/books` and a book detail page (`/books/cant-hurt-me`)

- [x] `/books` grid renders covers, titles, authors, and a green "completed" check badge on finished books, legible in light mode. See `13-books-light.png`.
- [x] Book detail page renders cover, description, buy link, chapter count pill, reading-status pill, and a chapter list with strikethrough + "Done" badges for completed chapters. See `14-book-detail-light.png`.

## 404 page (any bad URL)

- [x] Stagger sequence still plays and completes quickly. Correct: avatar, "404", heading, copy, and both buttons ("Go Home" / "Go Back") are all rendered and settled well under a second after navigation; only a small decorative "Lost in the void" line at the very bottom uses the sanctioned `duration.hero` exception (500ms) and is deliberately the slowest thing on the page. See `15-404-light.png`.
- [x] `duration.hero` (500ms) exists only in `app/not-found.tsx`, confirmed via repo-wide grep (see Task 15 report, Motion Budget Audit section).
- [x] Fixed: the decorative "Lost in the void" fade in `app/not-found.tsx` previously ran at `duration.hero * 2` (1000ms) instead of the token's own 500ms, a literal duration wearing a token's clothes. Now uses `duration.hero` directly, so it is genuinely the sole value above the 300ms UI budget, as the plan's framing intended.

## Cmd+K palette

- [x] Panel appears with no scale or fade on the panel itself; only the backdrop fades. Confirmed by reading `components/CommandPalette.tsx`: only the outer backdrop `motion.div` carries `variants={backdropFadeVariants}`; the inner panel is a plain, unanimated `<div>`. Visually confirmed open/close with no jump. See `05-cmdk-dark.png`.
- [x] Search, navigation, projects, and actions groups all populate and highlighted row keeps legible contrast (light text on a light highlight in dark mode, since `--accent` now equals `--foreground`). See `05-cmdk-dark.png`.

## `?` shortcuts overlay

- [x] Same no-scale/no-fade-on-panel treatment as Cmd+K, confirmed via `components/KeyboardShortcuts.tsx` (same `backdropFadeVariants`-only pattern).
- [x] `d` and `m` shortcuts are gone. Confirmed via `lib/shortcutsData.ts`: only `h` (Home), `w` (Work), `p` (Projects), `r` (Writing), `b` (Books) remain under "Go to". See `06-shortcuts-dark.png`.

## Navbar

- [x] No "Design" link. Confirmed: only Work, Projects, Writing, Books render in both desktop and mobile nav.
- [x] Mobile menu expands/collapses at a narrow viewport (390px). Correct: tapping "Menu" pushes the four nav links in-flow above the hero with no overlay glitch or layout jump; tapping again collapses cleanly. See `16-mobile-home.png`, `17-mobile-menu-open.png`.

## Clients / stats tooltips

- [x] First tooltip in the "Worked with" avatar row waits about 150ms. Measured directly in-page (dispatching real pointer events and timing until `[role="tooltip"]` mounts): **163ms** on a cold hover, matching the configured `delayDuration={150}` on the single global `TooltipProvider` in `app/layout.tsx`.
- [x] Moving the pointer to an adjacent avatar shows the next tooltip without the same 150ms wait. Confirmed via a real (CDP-trusted) hover-then-hover sequence: the tooltip content flipped cleanly from "Play AI" to "Polygon" with no visible empty gap. A fully isolated sub-millisecond timing measurement for the *second* hover wasn't possible with the tooling available (synthetic, non-trusted pointer events don't reproduce Radix's pointer-transit grace-area logic faithfully), so treat this as "behaves correctly in practice," not "timed to the millisecond."
- [x] Stats logo tooltips use the same delay as the Clients row, not the old 700ms. Measured directly: **167ms** — consistent with the Clients row's 163ms, and structurally guaranteed identical because there is exactly one `TooltipProvider` in the whole app (gate `C07`).

## `/projects`

- [x] Filter chips depress on click (`active:scale-[0.97]`) and the grid crossfades between filters with `mode="wait"` + `initial={false}` (no fade on first load). Confirmed by reading `components/ProjectsIndex.tsx`.
- [ ] **Filter chips are not currently visible on the live page.** `lib/projectFilters.ts` only renders chips when at least two tags are each used by two or more projects (`deriveFilters`), and the current `sideProjects` dataset (3 projects) has only one project with any tags at all. This is existing, intentional gating logic, not a defect introduced by the simplification — but it means the click-to-filter behavior can't be exercised visually until the side-projects dataset grows. Worth knowing before assuming the feature is broken.

## Chat FAB

- [x] Opens from near-full scale (0.96 → 1), not from nothing. Confirmed via `lib/motionVariants.ts` (`fabPopVariants.hidden.scale = 0.96`).
- [x] Closes faster than it opens. Confirmed: exit uses `duration.fast` (150ms) vs. enter's `duration.base` (200ms), same pattern on `chatWindowVariants`.

## Footer

- [x] No live clock. Confirmed: footer only renders `© {year} / S7.dev / MIT License`, no time-of-day or ticking element, in both the accessibility tree and the rendered screenshot.

## FAQ keyboard test

- [x] With items closed, Tab skips the collapsed content entirely. Confirmed structurally: the component is a Radix Accordion (`data-state="closed"`, `aria-expanded="false"`), and collapsed items' answer text is fully absent from both the DOM's accessible tree and normal tab flow until expanded — this isn't a custom implementation that could regress independently.

## Both themes + mobile pass

- [x] Light and dark mode both checked on `/`, `/work/shopos`, a project case study, a blog post, `/books`, a book detail page, the 404 page, Cmd+K, and the shortcuts overlay. No invisible or near-invisible elements found: the verified-check badge on the avatar (`bg-foreground text-background`) is clearly visible in both themes, uppercase mono labels (`FRONTEND ENGINEER · AI · WEB3`, section numbers, chapter counts) all hold contrast, highlight bullet dots in diary lists are visible against the card background, and every button label (including "View selected work", which now sits on `bg-accent` where accent equals foreground) stays legible because `--accent-foreground` is the correctly-inverted color in both palettes.
- [x] Mobile pass (390×844) done on the homepage and the mobile nav menu; no clipped text or overlapping elements found.
- [ ] Mobile pass was not repeated across every secondary page (project case study, blog post, books). Worth a quick mobile scroll-through if the owner wants full breakpoint coverage, though nothing about the simplification changes (color tokens, spacing, type scale) is layout-breakpoint-specific, so risk here is low.

## OS reduced motion

- [x] `MotionConfig reducedMotion="user"` is wired at the root of `app/layout.tsx`, confirmed by reading the file directly — this is what makes the OS-level "reduce motion" setting also suppress Framer Motion transforms app-wide, not just CSS transitions.
- [ ] Actually toggling the OS/browser "prefers-reduced-motion: reduce" setting and confirming colours/opacity still transition while nothing slides was not exercised live — the available browser-automation tooling in this pass didn't expose a reduced-motion emulation switch. Worth a real check in system settings (macOS: System Settings → Accessibility → Display → Reduce motion) plus a reload.

## Type scale spot-check

- [x] Scanned every page visited above for text that reads too small given the ~1px reduction on Tailwind's `xs`/`sm`/`base`/`lg` and the intentionally-darkened `--subtle`. Correct: nothing read as illegible or undersized at normal viewing distance in either theme; mono labels (chapter counts, tags, timestamps) are small by design but are clearly legible, not degraded.
