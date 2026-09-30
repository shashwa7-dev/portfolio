# Minimal home: design (phase 1: homepage)

Date: 2026-09-30
Status: awaiting review

## Goal

Make the site simple, minimal and modern, with character. Concretely: a
cleaner intro, no structural chrome (rails, bands, gutter dots, dividers), a
tighter homepage with fewer and stronger sections, and a human voice added
through handwritten margin notes. Candy is switched off until Shashwat asks for
it back.

Chosen in the visual companion session (mockups kept under
`.superpowers/brainstorm/`): intro **I1 stacked**, stats as a **slow ticker at
body width**, page structure **B**, character **X2 margin notes**.

## Non-goals

- Secondary routes keep their `PageBand` in this change (phase 2, section 7).
- No change to `/work/<org>` diary content, `/cv`, the visitor card, `/shelf`
  content or the blog.
- No new data sources, no new dependencies.
- Candy is not deleted: it is disabled behind a flag.
- The "live tiles", hover previews and handwritten sign-off ideas are out of
  scope.

## 1. Intro (`components/About.tsx`)

Stacked, left-aligned, inside the reading measure. Top to bottom:

1. **Identity row**: portrait, name, and one status line
   (`Open to work · Bengaluru, <local time> IST`, availability dot kept). Social
   icon links (GitHub, LinkedIn, X) on the right of the same row.
2. **Headline**: unchanged copy and treatment (muted frame, "ship and scale" in
   semibold real italic), with more space above it than today.
3. **Intro line**: "I'm Shashwat, an AI-adaptive frontend engineer. I ship
   fast, polished interfaces for agentic and generative AI products with top AI
   and Web3 teams. Reach me at contact@shashwa7.in." The "12+ so far" clause
   moves to the ticker.
4. **Actions**: "View selected work" (filled) and "Get in touch" (outline),
   unchanged.
5. **Stats ticker** (new, replaces the stat band): one line, **the width of the
   reading column** (not full bleed), clipped to it and faded at both edges with
   a mask. Items, in order, each a bold figure plus a short muted context:
   - **1M+** users reached · Coinbase × Polygon
   - **12+** products shipped
   - **30+** AI models in Spacelab
   - **10K+** spaces created
   - **5+ yrs** building frontend

   Separated by a small ✦ in `text-border-strong`. Content is rendered twice
   for a seamless loop and translated by 50%.

### Ticker behaviour

- Pure CSS keyframe (`translateX(0 → -50%)`), linear, ~40s per loop. Duration
  and easing come from new tokens in `lib/motionVariants.ts` mirrored as CSS
  custom properties in `app/globals.css` (repo rule: no literal durations).
- Pauses on hover and on focus-within.
- `prefers-reduced-motion: reduce`: no animation; the first copy shows as a
  static, wrapping row and the duplicate is removed.
- Accessibility: the duplicate copy is `aria-hidden`; the ticker is a `<ul>`
  with an accessible label ("Highlights").
- Data: `lib/stats.ts` gains an optional `context` per stat and the "10K+
  spaces created" entry. The OG card keeps quoting the first three stats.

## 2. Chrome removal, phase 1 (this change)

- **Rails**: `components/layout/Rails.tsx` is no longer rendered from
  `app/layout.tsx` (global, since it is one render site). The component and its
  CSS are deleted.
- **Section**: renders a small muted text label ("Work") above the title, no
  numbering and no band. `number` / `of` props and `HOMEPAGE_SECTION_TOTAL` are
  removed. Vertical spacing becomes one consistent step between sections
  (`py-14 md:py-20`), since whitespace is now the only separator. This also
  applies to `/shelf`, the only other route that uses `Section`; its call sites
  drop the removed props.
- **Homepage dividers**: any `border-t` / `divide-y` used purely to separate
  homepage sections goes, including the hero's rule above the old stat band.
  Component-internal borders (cards, inputs, the Impact callout) stay.
- `Band` and `PageBand` are untouched in phase 1 (see section 7).

## 3. Homepage structure (option B, FAQ kept)

`app/page.tsx` renders, in order: `About`, `Work`, `Projects`, `Currently`,
`Faq`, `Closing`.

- **Work** (from `ExperienceWork`): label "Work", title "Where I've worked, and
  what I shipped". One row per org: logo, name, products or partners beside the
  name (ShopOS: Sloosh · Spacelab · ShopOS; Dehidden: Coinbase · Polygon · Play
  AI), dates right. The row links to `/work/<org>`. The two featured Dehidden
  project cards stay under Dehidden. Tech tags, highlight bullets and
  Site/App chips move off the homepage (they remain on `/work/<org>`).
- **Projects** (from `Projects`): label "Projects", title "Things I build for
  fun". Rows of small thumbnail, name, optional "new" tag (the `isRecent`
  project), date right, each linking to its project page. Replaces the large
  cards.
- **Currently** (merges `Activity` and `TechStack`): label "Currently", title
  "What I'm building, reading and using". Three short rows: Building, Reading
  (current book from `lib/books.ts`), Stack (one row of existing stack chips).
  The Building text lives in a new `lib/currently.ts`
  (`building: "Sloosh, ShopOS's creator app"`), edited by hand like the other
  data files. `Activity` and `TechStack` components are deleted.
- **FAQ** stays on the homepage with its `FAQPage` JSON-LD. Restyled to the
  minimal pattern: label "FAQ", title "Questions, answered", questions as plain
  rows that expand (same accordion behaviour), no card or sticker chrome.
- **Closing** (replaces `Socials`): the line "Let's build something good." and
  the email plus GitHub / LinkedIn / X links. No section label.

## 4. Character: margin notes (X2)

- A `MarginNote` component renders a short handwritten note in Caveat, reusing
  the existing `cardHand` font from `lib/card/fonts.ts` (`next/font`, weight
  600, `display: swap`, variable `--font-hand`), in a warm accent colour, slightly rotated (−4° to +3°, from a fixed per-note
  value, not random).
- Desktop (≥ 1024px): absolutely positioned in the right margin beside the row
  it annotates, outside the reading column.
- Below 1024px: rendered inline under its row as a small note, not rotated.
- `aria-hidden` is **not** used: the notes are real content, read after the
  row.
- Notes are data, kept next to what they annotate:
  - ShopOS row: "three apps, one canvas"
  - Dehidden row: "1M users on launch day!"
  - Mehfil row: "3,916 songs, all playable"
  At most three notes on the page.
- Copy follows the repo rules: no em-dashes.

## 5. Candy off

- `lib/theme.ts`: a single `CANDY_ENABLED = false` flag. When false, `THEMES`
  is `["light", "dark"]`, `resolveTheme` maps a stored `"candy"` to the system
  preference, and the boot script does the same.
- The theme switcher lists only Light and Dark.
- All `candy:` classes and Candy CSS stay in place, inert.
- `lib/theme.test.ts` updated for both flag states' behaviour that is reachable
  (stored candy falls back; cycle is light ↔ dark).

## 6. Rules, docs and gates

- `CLAUDE.md`: remove the Rails parts of the "Rails and bands" convention and
  the per-page Rails ban; replace the `[ NN / 06 ]` / `HOMEPAGE_SECTION_TOTAL`
  notes with the plain section-label pattern; document the ticker, margin notes
  and the Candy flag. The `Band` / `PageBand` rules stay until phase 2.
- `docs/design-system.md` and `.claude/skills/design-system/SKILL.md`: same
  scope.
- `scripts/verify-simplification.sh`: drop checks that require rails or section
  numbering; add checks that `Rails` is not rendered and that `CANDY_ENABLED`
  is false until re-enabled deliberately.
- `data/agent-memory.md`: update only if it describes the homepage sections.

## 7. Phase 2: the other pages (next change, not this one)

How the rest of the site follows, for review now and a separate spec later:

- **PageBand** on the 13 secondary routes (`/work/<org>`, project pages,
  `/projects`, `/blogs`, a post, `/books`, a book, `/shelf`, `/cv`, `/card`,
  `/coffee`, `/offcod8`, 404) becomes a plain breadcrumb-style label
  ("Work · ShopOS") flush under the navbar, no lines, gutter dots or tick.
- **Band** and its CSS (`band-gutters`, `band-tick`, `BandLabel` tones) are then
  deleted.
- **Footer** loses its divider lines; columns and copyright row stay.
- Page-level spacing aligned to the homepage's section step.
- Inner components with divider lists (e.g. `/work/<org>` Projects header rows)
  reviewed case by case.

## Testing

- `tsc --noEmit`, `npm run lint`, `scripts/verify-simplification.sh`,
  `npm test` all pass.
- New unit tests: theme flag fallback (stored `candy` → system theme; cycle is
  light ↔ dark).
- Manual, light and dark, desktop and 390px mobile: `/` in full, plus `/shelf`
  (shares `Section`) and one secondary route (`/work/shopos`) to confirm the
  missing rails do not leave anything misaligned.
- Reduced motion on: the ticker is static and fully readable.
- `/` still emits valid `FAQPage` JSON-LD.

## Risks

- Several components read `HOMEPAGE_SECTION_TOTAL`; the removal is mechanical
  but touches the homepage sections and `/shelf`. The verify script and `tsc`
  catch leftovers.
- Caveat already loads with `display: swap` via `cardHand`, so the notes never
  block text; its stylesheet now also loads on `/`.
