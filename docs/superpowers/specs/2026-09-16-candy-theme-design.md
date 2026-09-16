# Candy theme: design spec

Date: 2026-09-16
Status: approved design, awaiting implementation plan
Canvas: https://claude.ai/code/artifact/2d7c95c3-451d-4380-81b9-33a518f81f78 (page 1 "Sticker Sheet" is the source of truth for how things look; page 2 holds the directions that were not chosen)
Reference scrape: `docs/reference/simpsons-concept-scrape.md`

## 1. Summary

The site gets a third theme, **Candy**, beside the existing Paper light and Paper dark. Candy is a sticker-sheet look: warm paper with a faint line grid, every interactive element drawn as a die-cut sticker (white border, ink outline, hard offset shadow, slight tilt), five candy tints, a rounded display face for headings, and no dividers anywhere. Light and dark stay exactly as they are.

Candy was distilled from a Simpsons concept website on Behance. Only the system transfers: flat colour, hard shadows, thick outlines, illustration-first playfulness. No characters, logo or lettering from the show appear anywhere.

## 2. Decisions already made

| Decision | Choice |
|---|---|
| Number of themes | Exactly three: `light`, `dark`, `candy` |
| Candy and dark mode | Candy is light only. It ignores `prefers-color-scheme`. There is no dark Candy. |
| Name | `candy` in code and storage. The label shown to people is "Candy". |
| Dividers | None. No bands, rails, ticks, hairlines between rows, dashed cut lines. Sections separate by whitespace. |
| Background | Line grid: 1px `#ece7d8` lines every 40px on `#fffdf7`. Fixed to the page, not the viewport. |
| Section chrome | The band label survives as a sticker; the band strip, rails and tick are hidden in Candy. |
| Thumbnails | Stay greyscale until hover, as today. Thumb wells sit on candy tints. |
| Pages left on Paper | The souvenir card canvas (`/card`, `lib/card/*`) and the OG image route keep their fixed colours. The `/offcod8` route keeps its forced dark palette. |
| New article pieces | Prose CSS for `blockquote`, `figure` and `figcaption`, which markdown already emits. No new MDX component. |
| Tilt | Deterministic, seeded by index, never random. Caps in section 7. |
| No new components | Every change restyles a file that already exists. New CSS utilities are allowed; new React components are not. |
| Fonts | Fredoka (600, 700) added as `--font-display`, loaded via `next/font/google` like the others. DM Sans and IBM Plex Mono unchanged. |

## 3. Theme model and switcher

### Storage contract

`localStorage["theme"]` holds one of `"light"`, `"dark"`, `"candy"`, or is absent. Absent means follow the OS between light and dark, as today. The old two-value contract is a strict subset, so existing visitors keep their preference.

### DOM contract

- `<html>` gets `data-theme="light" | "dark" | "candy"`.
- `.dark` is still toggled on `<html>` when, and only when, the resolved theme is `dark`. Every existing `dark:` utility and the `.dark .foo` selectors keep working untouched. Candy never sets `.dark`.
- Candy tokens are scoped with `:root[data-theme="candy"]`.

### Inline script in `app/layout.tsx`

Replaces the current one. Reads the key, validates it against the three names, resolves absent to the OS preference, sets `data-theme`, toggles `.dark`. Still the only place the class is applied on load.

### Hook

`app/hooks/useDarkMode.tsx` is renamed to `app/hooks/useTheme.tsx` and exports `useTheme`, returning `{ theme, setTheme, cycleTheme }`.

- `theme` is the resolved name, synced from the DOM with the same `themechange` event pattern.
- `setTheme(name)` writes the DOM contract, writes storage, dispatches `themechange`.
- `cycleTheme()` goes light, dark, candy, light. Stable identity (zero-dep `useCallback`), because `KeyboardShortcuts` lists it in a `keydown` effect's deps.
- `isDarkMode` and `toggleDarkMode` are removed. The three consumers (Navbar, CommandPalette, KeyboardShortcuts) move to the new names in the same change.

### UI

- **Navbar control.** One button, same `control` class family as today. Shows the current theme's mark: Sun, Moon, or a candy dot. Click cycles. `aria-label` reads "Theme: Candy. Switch to light" and so on. In Candy the control is itself a sticker pill with the dot and the word "Candy" at `md` and up, dot only below.
- **Command palette.** "Toggle theme" becomes three rows under Actions: "Light theme", "Dark theme", "Candy theme", each calling `setTheme`. The `t` key hint moves to a single "Cycle theme" row.
- **Shortcut.** `t` cycles. `lib/shortcutsData.ts` label becomes "Cycle theme".
- **No crossfade** on switch. `CLAUDE.md` rejected a theme-toggle colour crossfade and that stands.

## 4. Tokens

Added to `app/globals.css` under `:root[data-theme="candy"]`. Existing semantic tokens are redefined so every component that already uses `bg-background`, `text-muted-foreground`, `border-border` and friends gets the paper and ink for free.

### Semantic tokens (HSL triplets, same names as Paper)

| Token | Value | Notes |
|---|---|---|
| `--background` | `48 100% 98.4%` | paper `#fffdf7` |
| `--foreground` | `0 0% 10.2%` | ink `#1a1a1a` |
| `--card` | `0 0% 100%` | sticker white |
| `--elevated` | `48 100% 98.4%` | same as paper; elevation comes from shadow, not tint |
| `--muted` | `44 33% 95%` | `#f5f2ea` |
| `--muted-foreground` | `0 0% 23%` | `#3a3a3a` |
| `--subtle` | `0 0% 42%` | `#6b6b6b` captions |
| `--accent` | `0 0% 10.2%` | ink, unchanged from Paper's idea that accent is foreground |
| `--accent-foreground` | `0 0% 100%` | |
| `--border` | `0 0% 10.2%` | ink; the sticker outline colour |
| `--border-strong` | `0 0% 10.2%` | |
| `--input` | `0 0% 10.2%` | |
| `--ring` | `346 100% 86%` | pink, for focus |
| `--radius` | `1rem` | `rounded-lg` 16, `rounded-md` 14, `rounded-sm` 12 |

Grid: `--grid-line: 40 40% 89%` (`#ece7d8`) and `--grid-size: 40px`, consumed by a `body` background in the Candy block.

### Candy tints (new, Candy only)

| Token | Hex | Hue |
|---|---|---|
| `--candy-pink` | `#ffb7c5` | 348 |
| `--candy-mint` | `#b8f0d8` | 154 |
| `--candy-butter` | `#fff0a3` | 50 |
| `--candy-sky` | `#bfe6ff` | 203 |
| `--candy-lavender` | `#e6d6ff` | 263 |

All five clear the verify gate C14 (no hue 241 or 242). Ink on every tint passes 4.5:1.

Exposed in Tailwind as `bg-candy-pink` and so on. In Paper themes these variables are undefined and the utilities must not be used outside Candy-scoped code paths; see section 10.

### Sticker scale (new, Candy only)

| Token | Value | Used by |
|---|---|---|
| `--sticker-cut` | `3px` white border | pills, cards; `2px` on chips under 30px tall |
| `--sticker-outline` | `2px` ink; `1.5px` on chips | |
| `--shadow-1` | `2px 2px 0 ink` | chips, org link chips |
| `--shadow-2` | `3px 3px 0 ink` | small pills, nav controls, tags |
| `--shadow-3` | `4px 4px 0 ink` | buttons, preview cards |
| `--shadow-4` | `7px 7px 0 ink` | showcase cards, bento, FAQ open item, hero image |
| `--sticker-radius-pill` | `999px` | |
| `--sticker-radius-card` | `22px` | showcase, bento, FAQ, shelf |
| `--sticker-radius-tile` | `16px` | preview cards, code block, table |
| `--sticker-radius-tag` | `8px` | rectangular tags, org link chips |

Implemented as a `.sticker` utility plus `.sticker-sm` and `.sticker-lg` size variants in `@layer components`, and a `.tilt-*` set (section 7). Everything below is expressed as "sticker at shadow N with tint X".

### sugar-high colours (Candy)

| Var | Colour |
|---|---|
| `--sh-keyword` | `#d6336c` |
| `--sh-string` | `#1f8a5b` |
| `--sh-class` | `#b7791f` |
| `--sh-property` | `#2b7bbf` |
| `--sh-entity` | `#7c5cbf` |
| `--sh-comment` | `#8a8a8a` |
| `--sh-identifier` | ink |
| `--sh-sign` | `#6b6b6b` |
| `--sh-jsxliterals` | `#b7791f` |

## 5. Typography

- Headings, section titles, page titles, card titles, stat numbers, the footer wordmark: `font-display` (Fredoka 700). Sizes stay on the existing scale; the hero headline stays on its `clamp()`.
- Body, lede, prose: DM Sans, unchanged.
- Mono caps labels: IBM Plex Mono, unchanged sizes, weight 600 inside stickers.
- The hero headline's emphasis span gets a butter highlight block (`box-decoration-break: clone`) instead of a weight change.
- Inline links: butter underline-highlight (`linear-gradient` at 55%), pink fill on hover. Never a plain underline in Candy.

## 6. Layout and section chrome

- `Rails` renders nothing in Candy.
- `Band` renders nothing in Candy. `Section` therefore renders its `BandLabel` and `action` in a plain flex row above the title, inside the Container. `PageBand` does the same.
- `BandLabel` in Candy is a butter (sections) or lavender (pages) sticker at shadow 1, tilt slot A.
- Section rhythm stays `py-10 md:py-14`; with no bands the gap between sections may read larger, which is intended.
- The Navbar loses its bottom border in Candy. It keeps the translucent backdrop. The current link gets a pink highlight bar behind the text instead of the underline pseudo-element.
- The Footer loses its top and inner rules. The plate keeps the crosshairs and the wordmark, drawn as a white Fredoka sticker with a 3px ink stroke and a pink 10px offset shadow, tilted -2 degrees.

## 7. Tilt rules

- Tilt is a class from a fixed set: `tilt-a` -2°, `tilt-b` 1.5°, `tilt-c` -1°, `tilt-d` 2°, `tilt-e` -1.5°, `tilt-f` 0.8°, `tilt-g` -0.8°, `tilt-h` 4°, `tilt-i` -4°.
- A list assigns tilts by `index % n`, so server and client agree and hydration never mismatches.
- Caps: chips, tags, badges, nav pills up to 2°; the avatar and the brand mark up to 4°; cards under 1°; buttons up to 1.5°; prose, inputs, tables, code never tilt.
- Hover on a tilted card or button removes the tilt (`rotate(0)`), lifts by 1px and steps the shadow up one size. Press collapses the shadow to 1px and translates by the difference. `duration-fast`, the house `--ease-out`.
- Under 640px cards and buttons do not tilt; stat stickers and tags keep theirs.
- `prefers-reduced-motion`: tilts are static and stay; the hover lift and shadow step still run because they are colour and shadow only; the translate on press is dropped.

## 8. Components

Every item names the file, then how it looks in Candy. Anatomy and copy do not change unless stated.

### Controls
- `components/ui/button.tsx` default: pink sticker pill, shadow 3, 44px. Outline variant: white sticker pill, shadow 3. Sizes map: `sm` 36px shadow 2.
- Socials email CTA, CopyMarkdown "Copy" and "View raw", `CardNudge`: same two pills. "Copied" state is butter.
- Navbar CV: butter pill 34px shadow 2. Theme control and Menu: white pill 34px shadow 2.
- "View all" (band action): mono caps with a 2px ink underline. In-content "View all N": text with arrow, no sticker.
- Filter chips (`ProjectsIndex`): active is ink fill with white text; idle is white sticker pill 30px.
- Prose inline link and deep-dive CTA: section 5.
- `OrgLinkChip`: white rectangular tag, shadow 1, tilt slot by index.
- `Label`: unchanged type, `--subtle` colour.
- `BandLabel`: section 6.
- `EmploymentTag`: white rectangular tag, no shadow.
- `Tag` (skills): pill on a candy tint by index, mono 10px, no shadow.
- Blog tag chip and `Badge` secondary: same as `Tag` but DM Sans 12px 700.
- Shimmer flags "Recent" and "Live": rectangular tag, pink for Live, white for Recent. The shimmer sweep stays.
- Showcase overlay chips: white and butter rectangular tags, tilted; play button is a pink 34px circle at shadow 1.
- `StackIcon`: white sticker pill at shadow 2 (tier 1, 40px) and shadow 1 (tier 2, 30px). Icon glyph stays ink. Hover tints the pill with the next candy colour by index. Icon-only variant unchanged apart from ink. Icon-less fallback keeps mono caps.
- kbd chips: white, 2px ink border with a 4px bottom edge, radius 6. Chord keys (`g` prefix) are butter.
- Verified mark: mint 18px circle with ink outline and an ink check.
- Avatar: circular, white cut, ink outline, shadow 3, tilt -4°. The availability band stays ink with white mono text.
- "Open to work" pill: white sticker pill with a green dot.

### Cards and lists
- `ProjectPreviewCard`: white sticker tile at shadow 3, tilt f or g by index. Thumb well on a tint by index with a 2px ink right edge.
- `ProjectShowcaseCard`: white sticker card at shadow 4, tilt g. Media well on a tint. Title in `font-display`. The "Case study" CTA is a mint underline-highlight.
- Org block (`ExperienceWork`): the rail line and elbow are removed in Candy; the `pl-9` indent stays. Logo well tilted -4°. Highlight bullets are 8px tinted circles with ink outline. `ClientStrip` avatars gain ink outlines.
- `TechStack`: tier heads unchanged; pills per `StackIcon`; tier 2 running text unchanged.
- `Bento` and `Activity`: the shell is a sticker card at shadow 4; the hairline grid becomes a 2px ink grid (`gap-[2px] bg-foreground`); each cell picks a tint: Writing butter, Currently mint, reading strip white, Off the clock sky.
- `BookListItem`: cover tilted -3° with ink outline; progress track is a white pill with an ink outline and a pink fill.
- `Book` (shelf grid): tinted cover well, white cut, shadow 3, tilt by index; done badge mint; info overlay white with an ink top edge.
- `BlogPosts` row: no divider; `py-[18px]`; thumb is a tinted sticker at shadow 2, tilted; title in `font-display`.
- Shelf cards: sticker card at shadow 3.
- `CopyMarkdown` aside: white sticker card at shadow 3, tilt f.
- Newer and Older cards: sky and butter sticker tiles at shadow 2, tilted opposite ways.

### Sections and overlays
- `Navbar`, `Footer`, `Section`, `PageBand`, `Rails`, `Band`: section 6.
- `Faq`: each item is its own sticker card; closed items are white at shadow 3 with alternating tilts; the open item is pink, untilted, shadow 4. The caret sits in a 30px circle on a tint by index. Content animation unchanged (`accordion-down` and `accordion-up`).
- `Socials`: pills per Controls; social links are white sticker pills with a glyph.
- `CommandPalette`: panel is a white sticker card at shadow 4 with radius 18; input has a paper hairline (`1px solid #ece7d8`, the one hairline allowed, inside a sticker); the active row is a butter tile with an ink outline.
- `KeyboardShortcuts`: same panel; kbd chips per Controls.
- Mobile menu panel: the collapse stays; links become full-width white sticker pills stacked with 8px gap.
- Mobile chapters pill and sheet (`MobileChapters`): pill is a white sticker with a pink conic progress ring; the sheet's current row is butter.
- `StickyScrollSpyTOC`: ticks become 4px pill bars, pink and 28px wide for current, white and 14px otherwise.

### Article and MDX
- Post title, h1 to h4: `font-display`. Anchor `#` is a small pink tag that appears on hover.
- Hero image and `RoundedImage`: sky tile, white cut, shadow 4, tilt -0.6°.
- Inline code: butter chip with a 1.5px ink outline, radius 6.
- Code block: white sticker tile at shadow 3 with a header row (file name in mono caps, three tinted dots) separated by a 2px ink rule. Colours per section 4.
- Lists: bullets are 10px tinted circles by index with ink outlines; numbers stay.
- Tables: wrapped in a white sticker tile; header row on butter with a 2px ink bottom edge; body rows separated by the paper hairline.
- New prose rules only: `blockquote` is a pink sticker card at shadow 4, tilt -1°, with a large white Fredoka quote mark outlined in ink at the top-left (`::before`). `figure` and `figcaption`: caption in mono 11px `--subtle`. No callout; the board's callout sketch is dropped.

## 9. Mobile rules (from the 390px board)

- Under 640px: buttons stack full width; cards lose their tilt; stat stickers go 2x2 at `aspect-ratio: 1`; shadows step down one size; nav links live behind Menu, as today; the brand row wraps.
- Under 900px: rails and bands are already hidden in every theme; nothing changes.
- Hit targets never under 44px.

## 10. Constraints and gates

- `scripts/verify-simplification.sh` must exit 0. Relevant checks: C01 no arbitrary `text-[Npx]`, C02 no arbitrary tracking, C03 no `font-serif`, C04 no Inter/Fraunces/JetBrains, C05 no `transition-all`, C13 do not resurrect `AvatarWithThemeSwitch`, C14 no indigo hue.
- No arbitrary radii in class names (`rounded-[Npx]` is retired). All sticker radii go through the tokens in section 4.
- Motion literals only in `lib/motionVariants.ts`; CSS durations only via the existing `--duration-*` and `--ease-out`.
- Candy-only utilities (`bg-candy-*`, `.sticker`, `.tilt-*`) must be harmless in Paper themes. Rule: `.sticker` and `.tilt-*` are defined only under `[data-theme="candy"]`, so in Paper they are no-ops and components keep their Paper classes alongside. This avoids branching in JSX for most components. Where the structure differs (Band, Rails, the org rail, the Bento grid colour), the component reads the theme from the DOM contract via a small `useTheme()` or a CSS `[data-theme="candy"] &` variant, whichever keeps the file smaller.
- `body:has([data-bare])` (the `/offcod8` route) continues to force the dark palette and must win over Candy.
- No em-dashes in any copy.

## 11. Out of scope

- A dark Candy.
- Any new React component, including a callout.
- Restyling the souvenir card canvas, the OG image, or the `/offcod8` route.
- New illustration assets. Thumb wells use tints, not artwork.
- Changing any copy, data, or information architecture.

## 12. Testing

- Manual matrix at 1440, 900, 670x460 and 375 for the homepage, `/projects`, `/blogs`, one post, `/books`, `/shelf`, `/cv`, 404, in all three themes.
- Switcher: fresh visitor with OS dark lands on dark; stored `light` or `dark` unchanged; stored `candy` lands on Candy regardless of OS; the `t` key cycles in order; palette rows set directly; three consumers stay in sync via `themechange`; no flash on load.
- Hydration: no warnings with tilts on lists.
- Reduced motion: no transform transitions on hover or press.
- Contrast: ink on each tint and `--subtle` on paper at 4.5:1 or better.
- `scripts/verify-simplification.sh` exits 0. `npm run build` passes.
- `docs/design-system.md` gains a Candy section and its two stale claims (font names, the ease value) are corrected while there.
