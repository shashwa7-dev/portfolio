# Visitor card

A visitor to shashwa7.in mints themselves a stamp card: a drawn portrait on a
perforated stamp, cancelled by a postmark, signed with a name they choose, and
issued at one of five rarities. It downloads as a PNG. Nothing is stored and
nothing leaves the browser.

Status: design approved 2026-08-23 after seven rounds in the visual companion
(mockups under `.superpowers/brainstorm/`). Not yet implemented.

---

## Where this came from

`/Users/shashwa7/Desktop/personal/inkfolio/portrait.html` is a standalone
1,895-line generative portrait engine, forked from Kevin Ngo's
[cyber-crowd](https://github.com/kengocodes/cyber-crowd) (MIT) and written up in
`app/blogs/posts/drawing-faces-with-code.mdx`.

**We are not porting it.** It is the reference for how the ink should feel. We
write a smaller renderer of our own here. Two techniques are worth
reimplementing because they are the right answers and not novel to that file:
FNV-1a hashing into a `mulberry32` PRNG, and a salted `hashWith(str, salt)` so
one input drives several independent streams. Nothing is copied verbatim; if any
block ever is, it carries the cyber-crowd MIT notice with it.

The sticker treatment is adapted from Stephanie Eckles' "CSS Sticker" pen
(`codepen.io/5t3ph/pen/mdVZYpr`). Her version is CSS; ours is the same four
layers rebuilt in canvas, for the reason in the sticker section below.

---

## The card

1200x1500 (4:5), rounded corners. Top to bottom:

```
+------------------------------------------+
|                                          |
|        +~~~~~~~~~~~~~~~~~~~~~~~+         |   perforated stamp
|        |                       |         |
|        |   drawn portrait      |         |
|        |                    .-"-.        |   cancel, overlapping
|        | shashwa7.in  one v( 23·08 )     |
|        +~~~~~~~~~~~~~~~~~~~~`-.-'        |
|                                          |
|               Visitor                    |   handwriting
|- - - - - - - - - - - - - - - - - - - - - |   painted perforation + edge notches
|  SERIAL                          ISSUE   |
|  A-7A4E-C1                    Misprint   |
|  BENGALURU, IN · 23 AUG 2026  1% OF CARDS|
+------------------------------------------+
```

Design decisions reached by elimination, recorded so they are not re-litigated:

- **No corner tab and no corner notch.** Both were tried. A tab that carries no
  content strands an empty band across the top; a tab wide enough to carry
  content became a header competing with the stamp. Cut.
- **No header row.** The stamp carries `shashwa7.in` and `one visit` along its
  foot, the way a real stamp carries a country and a denomination. That is the
  branding, and it means nothing sits above the stamp.
- **The stamp is the hero.** The portrait sits inside a perforated stamp rather
  than a plain frame. The frame is load-bearing: a generated portrait is clean
  line work, an uploaded photo (second PR) is a rough unpredictable crop, and the
  perforated window is what lets both share one slot.
- **Rarity is on the card**, in the stub: the issue name, with its share of all
  cards beneath it. Not in a tab, not in a separate stats panel.
- **The tear line** is painted with edge notches, following the treatment
  `app/cv/page.tsx` documents for the CV sheet (`NOTCH = 22`).

---

## The five issues

Named from philately, because the artefact is a stamp and because "common" is a
deflating thing to tell 27% of your visitors.

| Issue | Share | What actually differs |
|---|---|---|
| Definitive | 60% | The everyday issue. No sticker. |
| Commemorative | 27% | Second frame line on the stamp. Graphite sticker in the card's own ink. |
| First day | 11.9% | Cancel becomes a first-day mark; "first day of issue" legend under the stamp. Cool foil sticker. |
| Misprint | 1% | The plate slips: frame and portrait print twice, ~2px apart. Full holographic sticker. |
| Inverted | 0.1% | Black stock, pale ink, gold cancel, gold foil sticker, and the portrait printed upside down. |

Each tier changes something its name promises. A tier that only swapped a colour
would not be worth naming.

**The odds are loose on purpose.** The original sketch put Inverted at 0.01%
(1 in 10,000). At this site's traffic that is one card every couple of years and
nobody would ever meet the holder, so the tier would be dead code. 0.1% keeps it
a story while making it reachable.

**Rarity is fixed to the visitor id**, drawn from `hashWith(visitorId, 'issue')`.
It never changes, and no re-roll button exists: the card is yours, not a pull.

Open naming detail: "Commemorative" overflows the stub column. The renderer
measures the issue value and shrinks it to fit rather than truncating to
"Commem.", so the fix is mechanical and no tier needs renaming.

---

## Identity, and what "one card" actually means

`crypto.randomUUID()` on first visit, persisted in `localStorage` under
`shashwa7:visitor-id`. Everything on the card except the name and the location
derives from it.

**This is one card per browser, not one per person, and it is not enforced.**
Clearing site data or opening a private window yields a fresh roll. That is
accepted, not overlooked. Enforcing one per person needs accounts; enforcing one
per IP fails on its own terms, because a shared router or carrier NAT hands the
same "unique" card to everyone behind it and a phone changes IP between wifi and
cellular. The tiers are a roll, not a supply, so there is no scarcity to protect.

Country and city come from `x-vercel-ip-country` and `x-vercel-ip-city`, read per
request, never stored, and never used as a seed. Absent in local dev, so the
fallback is no origin line rather than a guess. The page carries one plain line
saying the card reads your country to print it and stores nothing.

| Field | Source |
|---|---|
| Portrait | `hashWith(visitorId, 'face')` |
| Issue | `hashWith(visitorId, 'issue')` |
| Serial | `A-XXXX-XX`, uppercase hex off `hashStr(visitorId)`. `A` is a literal series letter. Not `0x`-prefixed: that reads as a wallet address, and this is not on-chain. |
| Name | Their input, default `Visitor`. Seeds only the lettering, `hashWith(name, 'label')`. |
| Origin, date | Request headers, render date. |

---

## The sticker

Four stacked layers, from the reference pen: a fat white stroke giving the
die-cut vinyl edge, a tier gradient with a diagonal specular stripe across it, a
hairline dark stroke for definition, and an offset shadow for lift.

**It must be rebuilt in canvas, not CSS.** A CSS sticker would render in the
preview and vanish from the downloaded PNG, which is the only artefact that
matters. All four layers map over directly: fat white `strokeText` under the
fill for the die-cut edge, `createLinearGradient` as `fillStyle` for the foil, a
clipped white band for the shine, `shadowOffset`/`shadowBlur` for the lift.

Sits at the card's left edge, rotated about -7 degrees, overlapping the stamp so
it reads as applied rather than printed. The shine angle is seeded, so no two
stickers catch the light identically.

---

## The page, `/card`

1. The card, drawn to a `<canvas>` at CSS size times `devicePixelRatio`.
2. A name field. Typing redraws the lettering only; the portrait never moves.
3. Download PNG.
4. One line on what is read and what is stored.
5. **The issue gallery**: all five tiers shown as small cards, so a visitor can
   see what exists and what they might have got. Rendered by the same
   `drawTicket` at thumbnail size from five fixed demo seeds, so the gallery can
   never drift from what the generator actually produces.

Server component reads the headers, which opts the route into dynamic rendering.
Everything else is client-side.

Download filename: `shashwa7-visitor-A-7A4E-C1.png`.

---

## Architecture

- **`lib/card/seed.ts`** — pure, no DOM. `hashStr`, `hashWith`, `mulberry32`,
  `rr`/`ri`/`chance`/`pick`/`weighted`, `serialFrom`, `issueFrom`. Same input,
  same output, always. That is the whole contract.
- **`lib/card/portrait.ts`** — the lean cast: one head-shape family, ~6 hair
  styles, a few eye/brow/mouth sets, optional glasses and headwear, luminance
  hatching. 350-450 lines. Every function takes `(ctx, R, box)`.
- **`lib/card/sticker.ts`** — the four-layer canvas sticker, plus the tier
  gradient table.
- **`lib/card/ticket.ts`** — `drawTicket(ctx, data, w, h)`. Composes stock,
  stamp, perforation, portrait, cancel, lettering, tear line, stub, sticker.
- **`app/card/page.tsx`** + **`components/card/*`** — headers, canvas, name
  field, download, gallery.

**No module-level mutable state anywhere in `lib/card/`.** Ink Folio's globals
(`ctx`, `mode`, `variant`, `CUR_INK`, `INK_BOOST`, `W`, `H`) are exactly what
breaks under React StrictMode's double render and with two canvases on one page,
and the gallery puts six canvases on this one.

**One function draws every size.** The preview, the 1200x1500 export and the
gallery thumbnails are all `drawTicket` at different scales. Never two drawings
that must be kept in agreement by hand.

---

## Fonts

Two additions, both through `next/font/google`, both used only here:

- **Caveat** for the handwritten name.
- **Alegreya Sans SC** 900 italic for the sticker. DM Sans and IBM Plex Mono
  cannot do that vinyl chunk.

The canvas waits on `document.fonts.load` before drawing text, and uses the
hashed family names `next/font` returns. Not embedded base64, which is how
Ink Folio does it and why that file is 132 KB.

---

## Not in this spec

- **The photo path.** Tracing an uploaded photo into ink is a different
  algorithm from drawing a face from a seed: luminance hatching or edge
  detection, plus a crop the user did not choose. It drops into the same stamp
  window and gets its own spec and its own PR.
- **A gallery of minted cards.** Needs storage and moderation of visitor-typed
  names. Out of scope.
- **Guilloche and registration marks.** Drawn, considered, cut. They were the
  first two elements that existed because there was room rather than because
  they had a job.

---

## Repo conventions this touches

- `data/agent-memory.md` **must** be updated in the same change. CLAUDE.md's
  agent-memory rule lists recent shipments as a trigger, and a new
  visitor-facing surface qualifies.
- Register `/card` in `lib/commandData.ts` and `app/sitemap.ts`, with an OG image
  via the existing `ogUrl()` helper.
- `<main>` padding is `py-8 md:py-12`, matching every other secondary route.
- Type scale from `tailwind.config.ts`. No arbitrary `text-[Npx]`.
- Motion tokens from `lib/motionVariants.ts`. No literal easings or durations.
- Global `<Navbar />` from `app/layout.tsx`. No per-page import.
- No em-dashes in user-facing copy.

---

## Verification

No test runner in this repo, so the gates are `npm run lint`, `npm run build`,
and `scripts/verify-simplification.sh` exiting 0.

Three things those cannot catch, to be checked by hand:

- **Determinism.** The same visitor id must draw the same card across reloads
  and browsers. The issue gallery doubles as the check: it renders five fixed
  seeds, so any unintended change to the drawing code shows up there as a visible
  diff.
- **Tier distribution.** A throwaway script rolling 100k ids should land within a
  point of 60 / 27 / 11.9 / 1 / 0.1. Worth running once; a bad hash-to-band
  mapping is invisible by eye.
- **The download.** iOS Safari is historically unreliable with programmatic blob
  downloads. Fallback is opening the PNG in a new tab to be long-pressed.

---

## Open question carried from the first draft

The card is drawn on Ink Folio's warm paper (`#f6f1e5` stock, `#1f1d1a` ink),
while `app/og/route.tsx` draws share previews on `#F1F0EF` with `#0E0D0C` ink,
lifted from the favicon so generated imagery and the app icon read as one system.

Match the OG card and everything the site generates shares a ground. Keep the
warm paper and the visitor card stays a keepsake rather than a share preview,
which the pencil work suits. I lean warm. Brand call, not a code one.
