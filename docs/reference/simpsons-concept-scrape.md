# The Simpsons Concept Website (Behance) — screen-by-screen scrape

Source: https://www.behance.net/gallery/132921847/The-Simpsons-Concept-Website
Author: Dmitry Kuzmin (signed "Dmitry Sablukov" on the closing slide). Published 10 Dec 2021. Tools: Photoshop, Figma. Fields: Graphic Design, Web Design, Illustration. 367 appreciations, ~2K views at scrape time (16 Sep 2026).
The embedded Vimeo walkthrough (649702456) no longer exists; everything below is read from the seven still images.

This is a reference for the **Creative** theme. Characters, the logo and the show's art are Fox/Disney IP and are not to be reproduced; what we take is the *system*: palette logic, shadow language, shapes, rhythm and the "illustration breaks the frame" trick.

## Source images (module order)

| # | URL | Size | Contents |
|---|-----|------|----------|
| 1 | `project_modules/fs_webp/978794132921847.61e6927607515.png` | 1920×1602 | Cover: sky, grass, "About project" |
| 2 | `project_modules/2800_webp/3a3698132921847.61b261c7e486a.png` | 2800×9612 | Homepage @1400 with mobile overlays |
| 3 | `project_modules/1400_webp/927354132921847.61b263e555d31.png` | 1400×776 | Full-bleed illustration (swing ride) |
| 4 | `project_modules/1400_webp/fc8fb4132921847.61b261c7e326b.png` | 1400×4132 | Episodes page @1400 |
| 5 | `project_modules/1400_webp/1d1e4e132921847.61b261c7e3ca6.png` | 1400×819 | Fonts and colors |
| 6 | `project_modules/1400_webp/6a4003132921847.61e6906e8d52f.png` | 1400×2600 | Full-bleed illustration + Mobile sheet |
| 7 | `project_modules/1400_webp/91ff97132921847.61b261c7e2bd6.png` | 1400×739 | "Thanks for watching" |

All under `https://mir-s3-cdn-cf.behance.net/`. Local copies and 1000px-tall slices live in the session scratchpad (`scratchpad/simpsons/`), not in the repo.

## Declared design tokens (screen 5, "Fonts and colors")

| Token | Value | Role |
|-------|-------|------|
| Yellow | `#FFDE00` | Primary action, logo, play buttons, store badges, "Aa" specimen |
| Blue | `#78C7F0` | Hero sky, promo bands, fact badges, character circles |
| Light blue | `#D4F0FF` | Secondary buttons, page tint, outline pills |
| Black | `#000000` | Text, borders, every shadow |
| Type | **TT Norms Pro**, Regular + Medium only | Geometric grotesk; two weights carry the whole site |

Nearest Google Fonts stand-ins for TT Norms Pro: DM Sans (already the portfolio body face), Outfit, Plus Jakarta Sans.

## Measured palette per screen (dominant colours, adaptive quantisation)

| Screen | Measured colours (share) |
|--------|--------------------------|
| Cover sky | `#4ab0e2` 19%, `#5ab6e0` 8%, clouds `#e3eed8`/white |
| Cover grass | `#65b34e` 84% (flat, no gradient), tufts `#0b0f0c` |
| Homepage backdrop | `#ecf9fe` ~50% (page tint), hero `#54b4e6`→`#77c7f0` |
| Homepage promo band | `#73c7f0` |
| Episodes backdrop | `#f5effc` (lavender; each page gets its own tint) |
| Episodes hero | `#f8a2ac` (salmon pink) |
| Mobile sheet backdrop | `#7cbd45` (grass, slightly cooler than cover) |
| Thanks slide | `#ecf9fe` bg, `#fee000` letters, `#030101` shadow |
| Season posters | pastel tints per card: sky `#cfe9f6`, mint, pink `#f5cfe2`, red `#d42a2a` |

Observed pattern: **one hue per surface, flat**. Gradients appear only in the hero sky (top `#54b4e6` fading to the page tint at the bottom, so the hero dissolves into the page instead of ending at a hard edge).

## Global system (what repeats on every screen)

**Shadows.** No blur anywhere. Every elevated thing has a hard black offset:
- Buttons and pills: `3px 3px 0 #000` on a 1.5px black border
- Fact badges and colour circles: `5px 5px 0 #000`
- Device / browser frames: `10–12px 10–12px 0 #000` on a 2px black border
- Text specimen "Aa" and the "Thanks" lettering: extruded black shadow ~`8px 8px 0 #000`

**Radii.** Three values only: `999px` (pills, circles), `16px` (cards, thumbnails, input), `40px` (device and browser frames, phone mocks).

**Borders.** Black, 1.5px on controls, 2px on frames, 1px hairline for list dividers. Nothing uses a grey border.

**Buttons.** Height ~40px desktop / ~32px mobile, horizontal padding ~44px, 14–15px Medium text, black on yellow (primary) or black on light blue (secondary/outline). Two buttons side by side always = one yellow + one light blue. Icon buttons are 44px yellow circles (play, next).

**Illustration breaks the frame.** Characters overlap the browser frame edge, peek in from the right, stand on top of section bands, and overflow circular avatar masks. Depth comes from overlap, not from blur or gradients.

**Rotated circular "Interesting fact" badges.** ~110px blue circle, hard shadow, rotated about -12°, 12px text, dropped into prose columns as an aside device. Three of them across the two pages.

**Page tint per route.** Home = pale blue, Episodes = lavender/pink. The hero colour and the page tint change together; the components do not.

**Cloud / grass motifs.** Flat white vector clouds with soft lobes; flat green ground with hand-drawn black squiggle tufts. Grass edge is a torn/uneven line, not straight.

## Screen 1 — Cover (1920×1602)

- Layout: full-bleed sky (top 60%) over flat grass (bottom 40%), two-column text on the grass.
- Meta labels in the four corners: "Website concept" (top-left), "UX/UI design" (top-right), "November 2021" (mid-left). ~16px Regular, black.
- "About project": ~44px Medium; body ~20px Regular, line-height ~1.45, black on green, measure ~520px.
- Illustration covers the horizon; a character stands in the left column so the copy sits right of it.

## Screen 2 — Homepage @1400 (2800×9612, shown at 1400 wide)

Frame: 900px-wide browser mock centred on the pale-blue Behance backdrop, `40px` radius, 2px black border, hard shadow. Phone mocks (300px, same frame language) overlap the left edge at three heights and the right edge once.

1. **Nav** — logo left (yellow hand-lettered), 4 links (~14px Regular, ~32px gap), search icon + 3-line hamburger right. Padding ~40px. Nav sits on the hero colour, no bar.
2. **Hero** — blue sky fading to page tint. H1 "Season 33" ~48px Medium, lede ~16px Regular in ~75% black, measure ~300px. Buttons: yellow pill "Watch now" + light-blue pill "Trailer", stacked with 12px gap. Platform logo row below (3 logos, ~28px). Character group on the right, overlapping the hero's bottom edge.
3. **New episodes** — H2 ~30px Medium + "See all" outline pill right. 3-col cards, 16px radius 16:9 thumbnail, 44px yellow play circle centred on the first, yellow next-arrow circle bleeding off the third. Title 16px Medium, description 12px, meta ("Aired 9-27-21  TV-PG DLV") 11px.
4. **Previous seasons** — 5 poster cards 140×180, each on a different pastel tint, caption "Season 1" 16px Medium + years 11px. Yellow next circle.
5. **Promo band** — full-width flat blue band, illustration on the left overlapping above the band, H2 30px two lines, body 16px, yellow + light-blue pills. A character peeks in from outside the browser frame on the right.
6. **About the Show** — H2, three prose paragraphs 16px, measure ~440px; a character stands in the right column; fact badge #1 rotated over the character.
7. **Meet the Characters** — H2 + "See all characters" outline pill. 5 light-blue circles ~128px, character art overflowing the top of each circle, caption 13px Medium.
8. **Merchandise** — H2 + "Other products" pill. Bold 16px product name, two prose paragraphs, product photo right, fact badge #2, "Buy now" yellow pill.
9. **Latest news** — H2, 3×2 grid: source label 11px, 16px-radius image, title 15px Medium two lines, description 12px.
10. **Newsletter** — H2 "Welcome to The Simpsons world" 32px, sub 16px, white pill input with black border + hard shadow, yellow "Subscribe" pill. Character right.
11. **App promo band** — blue band, H2, body, three yellow store badges (12px radius, hard shadow). Character enters from top-right outside the band.
12. **Footer** — logo, 4 vertical links 14px, "Search" pill input, 3 blue social icons, 10px legal line. Family illustration stands on the footer's bottom edge, clipped by the frame.

## Screen 3 — Full-bleed illustration (1400×776)

Lavender/pink sky with flat purple-grey clouds; characters on swing ropes entering from the top-right. Used as a breather between the homepage and the episodes page. Colour cue: the episodes page's lavender backdrop is set up here.

## Screen 4 — Episodes page @1400 (1400×4132)

- Backdrop `#f5effc`. Same 40px browser frame, phone mocks overlapping left (hero) and right (list).
- **Hero** on salmon pink `#f8a2ac`: same nav, H1 "All new episodes" 48px Medium over two lines, lede 16px, single yellow pill "List of episodes". Living-room illustration right, its floor colour (teal) forms the hero's bottom band.
- **Season header**: 80px app icon (16px radius), "Season 33" 48px, meta paragraph 12px right-aligned.
- **Episode rows** (nine): title 20px Medium, description 15px, meta 11px, yellow "Watch now" + light-blue "Add to watchlist", 270×150 thumbnail right, 1px black hairline between rows, ~80px row padding.
- **Scheduled episodes**: H2 + fact badge #3; three table rows (title left, date right, 16px) with hairlines; light-blue "All seasons" pill left, yellow "Watch previous season ›" pill right.
- Footer identical to the homepage.

## Screen 5 — Fonts and colors (1400×819)

Backdrop lavender. Giant "Aa" in yellow with extruded black shadow, a character standing between the letters. "TT Norms Pro" 44px with weight labels Regular / Medium, full alphabet in caps and lowercase 22px. Four 220px colour circles with hard shadows and the hex inside (FFDE00, 78C7F0, D4F0FF, 000000).

## Screen 6 — Illustration + Mobile (1400×2600)

Top 1000px: full-bleed lake scene, sky to horizon. Then a flat grass sheet with "Mobile" 52px label and six 300×580 phone mocks in two rows: Home hero (blue), New episodes list, Latest news, Episodes hero (pink), Episode list, and a character breaking out of the grass on the right.

Mobile specifics: H1 32px, lede 13px, pills 32px tall with 12px gap, cards full-width with 16px radius, meta 10px. Hamburger only, no visible links.

## Screen 7 — Thanks for watching (1400×739)

Pale-blue backdrop, corner meta labels, hand-lettered yellow uppercase with heavy black extruded shadow over two lines, a character diving in from the top-right, disclaimer 16px bottom-left, author bottom-right.

## What transfers to the Creative theme (and what does not)

Transfers:
- Four-colour system: one warm primary, one cool surface hue, one pale tint, black. No greys.
- Hard offset shadows at three sizes (3 / 5 / 10px), black borders, three radii (999 / 16 / 40).
- Flat single-hue surfaces, hero dissolving into the page tint.
- Per-route surface tint.
- Rotated circular aside badges.
- Illustration or artwork that overlaps container edges.
- Two type weights only.

Does not transfer: the characters, the logo, the show's lettering, the poster art, the platform logos. Any illustration in the theme has to be original.
