# Minimal home: design

Date: 2026-09-30
Status: awaiting review

## Goal

Make the site simple, minimal and modern, with character. Concretely: a
cleaner intro, no structural chrome (rails, bands, gutter dots, dividers), a
shorter homepage with fewer and stronger sections, and a human voice added
through handwritten margin notes. Candy is switched off until Shashwat asks for
it back.

Chosen in the visual companion session (mockups kept under
`.superpowers/brainstorm/`): intro **I1 stacked**, stats as a **slow ticker at
body width**, page structure **B**, character **X2 margin notes**.

## Non-goals

- No change to `/work/<org>` diary content or components, `/cv`, the visitor
  card, `/shelf` content or the blog, beyond losing their band chrome.
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

## 2. Structure: remove the chrome

Applies to every route.

- **Rails**: `components/layout/Rails.tsx` is no longer rendered from
  `app/layout.tsx`. The component and its CSS are deleted.
- **Band**: loses its top and bottom rules, gutter dots (`band-gutters`) and
  tick (`band-tick`). It becomes a plain label row.
- **Section**: renders a small muted text label (`Experience`) above the title,
  no numbering. `number` / `of` props and `HOMEPAGE_SECTION_TOTAL` are removed.
  Vertical spacing becomes one consistent step between sections
  (`py-14 md:py-20`), since whitespace is now the only separator.
- **PageBand** (secondary routes): renders the same plain label, as
  `Work · ShopOS` style text, flush under the navbar, no lines. The existing
  `pb-8 md:pb-12` page-padding convention stays.
- **Footer**: its border lines are removed; the columns and copyright row stay.
- Any other `border-t` / `divide-y` used purely as section dividers on the
  homepage goes. Component-internal borders (cards, inputs, the Impact callout)
  stay.

## 3. Homepage structure (option B)

`app/page.tsx` renders, in order: `About`, `Work`, `Projects`, `Currently`,
`Closing`.

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
  "What I'm building, reading and using". Three short rows: Building (current
  org product focus), Reading (current book from `lib/books.ts`), Stack (one row
  of existing stack chips). The Building text lives in a new `lib/currently.ts`
  (`building: "Sloosh, ShopOS's creator app"`), edited by hand like the other
  data files. `Activity` and `TechStack` components are deleted.
- **Closing** (replaces `Socials`): the line "Let's build something good." and
  the email plus GitHub / LinkedIn / X links. No section label.
- **FAQ** moves to a new route `/faq`, rendered from the existing `Faq`
  component content with its `FAQPage` JSON-LD. Linked from the footer, added
  to the sitemap, `llms.txt` and the command palette.

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

- `CLAUDE.md`: remove the "Rails and bands" convention, the per-page Rails ban,
  the `[ NN / 06 ]` / `HOMEPAGE_SECTION_TOTAL` notes; describe the plain label
  pattern, the ticker, margin notes and the Candy flag.
- `docs/design-system.md` and `.claude/skills/design-system/SKILL.md`: same.
- `scripts/verify-simplification.sh`: drop checks that require bands or rails;
  add checks that `Rails` is not rendered and that `CANDY_ENABLED` is false
  until re-enabled deliberately.
- `data/agent-memory.md`: the site sections Truffy describes (if listed).

## Testing

- `tsc --noEmit`, `npm run lint`, `scripts/verify-simplification.sh`,
  `npm test` all pass.
- New unit tests: theme flag fallback (stored `candy` → system theme; cycle is
  light ↔ dark).
- Manual, light and dark, desktop and 390px mobile: `/`, `/faq`,
  `/work/shopos`, `/projects`, `/blogs`, `/shelf`, `/cv`, `/card`.
- Reduced motion on: the ticker is static and fully readable.
- `/faq` validates as `FAQPage` JSON-LD; `/` no longer emits it.

## Risks

- Removing the FAQ from `/` drops its on-page content from the homepage;
  mitigated by `/faq` keeping the JSON-LD and being linked sitewide.
- Several components read `HOMEPAGE_SECTION_TOTAL` and `Band` props; the
  removal is mechanical but touches ~20 files. The verify script and `tsc`
  catch leftovers.
- Caveat already loads with `display: swap` via `cardHand`, so the notes never
  block text; its stylesheet now also loads on `/`.
