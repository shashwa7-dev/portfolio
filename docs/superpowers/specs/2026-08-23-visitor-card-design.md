# Visitor card

A visitor to shashwa7.in can mint themselves a ticket: a drawn portrait on paper,
their own name if they want one, a serial, and where they came from. It downloads
as a PNG. Nothing is stored and nothing leaves the browser.

Status: design approved 2026-08-23. Not yet implemented.

---

## Where this came from

`/Users/shashwa7/Desktop/personal/inkfolio/portrait.html` is a standalone 1,895-line
generative portrait engine, forked from Kevin Ngo's [cyber-crowd](https://github.com/kengocodes/cyber-crowd)
(MIT) and written up in `app/blogs/posts/drawing-faces-with-code.mdx`. It already
contains an `exportCard(name, w, h)` that renders a card offscreen, commented
"the exact path claim-time PNG generation will take in the real product".

**We are not porting it.** It is the reference for how the ink should feel, not a
dependency. We write a smaller renderer of our own in this repo. Two techniques are
worth reimplementing because they are the right answers and are not novel to that
file: FNV-1a hashing into a `mulberry32` PRNG, and a salted `hashWith(str, salt)`
so one input can drive several independent streams.

Nothing is copied verbatim. If any block ever is, it carries the cyber-crowd MIT
notice with it.

---

## The card

Bottom-stub tear-off, 1200x1500 (4:5), chosen from three shapes in the brainstorm
session (mockups in `.superpowers/brainstorm/`).

```
+------------------------------------------+
|  ADMIT ONE                   shashwa7.in |   header, mono caps, faint
|                                          |
|         +----------------------+         |
|         |                      |         |
|         |   drawn portrait     |         |   framed window, 1.4px rule
|         |   or traced photo    |         |
|         |                      |         |
|         +----------------------+         |
|                                          |
|               Visitor                    |   handwriting (Caveat)
|            ~~~~~~~~~~~~                  |   drawn rule, not a border
|- - - - - - - - - - - - - - - - - - - - - |   painted perforation
|  SERIAL                        .-""-.    |
|  A-7A4E-C1                    ( visited)|   postmark, dashed circle
|  BENGALURU, IN · 23 AUG 2026   `-..-'    |
+------------------------------------------+
```

**The frame is load-bearing.** A generated portrait is clean line work that always
fits its box. An uploaded photo is a rough, unpredictably cropped subject traced
into ink. The drawn window is what lets both sit in one slot without the second
looking like a mistake. This is why the "specimen" direction, where the portrait
floats free on paper, was rejected.

The perforation is painted, not bordered, following the treatment `app/cv/page.tsx`
already documents at length for the CV sheet's tear line.

---

## What is on the card, and where each value comes from

| Field | Source | Notes |
|---|---|---|
| Portrait | `hashWith(visitorId, 'face')` | Fixed the moment they land. Editing the name never redraws it. |
| Name | Their input, default `Visitor` | Seeds only the lettering stream, `hashWith(name, 'label')`. |
| Serial | Derived from `visitorId` | `A-XXXX-XX`, where `A` is a literal series letter (room to bump it if the drawing code ever changes enough to matter) and the rest is uppercase hex off `hashStr(visitorId)`. Not `0x`-prefixed: that reads as a wallet address, and this is not on-chain. |
| Origin | `x-vercel-ip-country` / `x-vercel-ip-city` | Read server-side per request. Never stored, never seeds anything. |
| Date | Render date | Formatted on the client. |

### The visitor ID is random, not IP-derived

The original sketch derived the ID from the visitor's IP. That fails at both jobs
asked of it. IPs are shared, so everyone behind one office router or one carrier's
CGNAT gets the same "unique" ID and the same face. IPs are unstable, so one person
gets a different card on wifi than on cellular, and a different one again next week.
It is also personal data under GDPR and India's DPDP Act, on a site with no privacy
policy page that deliberately runs Umami instead of Google Analytics.

So: `crypto.randomUUID()` on first visit, persisted in `localStorage` under
`shashwa7:visitor-id`. Stable, genuinely unique, re-rollable, and nothing personal
is processed to get it.

Country and city still come from the request headers, because they are coarse,
useful on the card, and never touch the seed. The page carries one plain line
saying the card reads your country to print it and stores nothing.

---

## Architecture

Four pieces, each independently testable.

### `lib/card/seed.ts`

Pure, no DOM. `hashStr`, `hashWith(str, salt)`, `mulberry32(seed)`, and the small
helpers the renderer needs (`rr`, `ri`, `chance`, `pick`, `weighted`). Also
`serialFrom(visitorId)`. Same input always yields the same output, which is the
whole contract.

### `lib/card/portrait.ts`

Pure drawing, given a `CanvasRenderingContext2D` and a seeded PRNG. The lean cast:
one head-shape family, ~6 hair styles, a few eye/brow/mouth sets, optional glasses
and headwear, luminance hatching for shade. Target 350-450 lines.

Every function takes `(ctx, R, box)` and returns nothing. **No module-level mutable
state.** Ink Folio's globals (`ctx`, `mode`, `variant`, `CUR_INK`, `INK_BOOST`, `W`,
`H`) are exactly what would break under React StrictMode's double render and under
two canvases on one page.

### `lib/card/ticket.ts`

Composes the card: paper, header, frame, portrait slot, handwritten name, drawn
rule, perforation, stub, postmark. Takes a `CardData` object and a target size, so
the on-screen preview and the 1200x1500 export are the same function at two scales,
never two drawings that must be kept in agreement.

Signature: `drawTicket(ctx, data: CardData, w: number, h: number)`.

### `app/card/page.tsx` + `components/card/*`

Server component reads the headers and renders a client component that owns the
canvas, the name input, and the download button.

---

## Flow

1. Server component reads `headers()` for country and city. This opts the route into
   dynamic rendering, which is correct and expected. Values are absent in local dev,
   so the fallback is no origin line rather than a guess.
2. Client mounts, reads or mints the visitor ID in `localStorage`.
3. Preview draws to a `<canvas>` sized to its CSS box times `devicePixelRatio`.
4. They may type a name. Each keystroke redraws the lettering. The portrait does not
   move, because it is seeded from the ID.
5. Download renders a fresh offscreen canvas at 1200x1500, `toBlob()`, object URL,
   `<a download>`, revoke.

Filename: `shashwa7-visitor-A-7A4E-C1.png`.

---

## Decisions already made

- **No backend, no database, no wallet.** "Mint" is flavour. Nothing persists.
- **Client-side rendering only.** `app/og/route.tsx` uses Satori, which lays out JSX
  and cannot execute canvas drawing code, so the export could not go through it even
  if we wanted a server render. Client-side also means zero per-visitor cost.
- **Lean cast** for the generator, not a full port.
- **Dedicated `/card` route**, registered in `lib/commandData.ts` and `app/sitemap.ts`,
  with an OG image via the existing `ogUrl()` helper.
- **Generated portrait ships first.** The upload-and-trace path is a second PR.

---

## Not in this spec

- The photo path. Tracing a photo into ink is a different algorithm from drawing a
  face from a seed: luminance-driven hatching or edge detection, plus a crop the
  user did not choose. It drops into the same framed slot and gets its own spec.
- A gallery of minted cards. That needs storage and moderation of visitor-typed
  names, and was explicitly out of scope.

---

## Repo conventions this touches

- `data/agent-memory.md` **must** be updated in the same change. CLAUDE.md's
  agent-memory rule lists "recent shipments" as a trigger, and a new visitor-facing
  surface qualifies. Truffy should be able to tell someone the card exists.
- Page padding on `<main>` is `py-8 md:py-12`, matching every other secondary route.
- Type scale from `tailwind.config.ts`. No arbitrary `text-[Npx]`.
- Motion tokens from `lib/motionVariants.ts`. No literal easings or durations.
- The global `<Navbar />` comes from `app/layout.tsx`. No per-page import.
- No em-dashes in any user-facing copy.
- Caveat loads through `next/font/google`, not as an embedded base64 blob. The canvas
  waits on `document.fonts.load` before drawing lettering, and uses the hashed family
  name `next/font` returns.

---

## Verification

There is no test runner in this repo, so the gates are the existing ones:
`npm run lint`, `npm run build`, and `scripts/verify-simplification.sh` exiting 0.

Two things those gates cannot catch, to be checked by hand:

- **Determinism.** The same visitor ID must draw the same face across reloads and
  across browsers. Worth a dev-only page rendering a fixed set of IDs so a change to
  the drawing code shows up as a visible diff rather than a silent one.
- **The download.** iOS Safari has historically been unreliable with programmatic
  blob downloads. If it fails there, the fallback is opening the PNG in a new tab so
  it can be long-pressed and saved.

---

## Open question for review

The card is drawn on Ink Folio's warm paper (`#f6f1e5` ground, `#1f1d1a` ink). But
`app/og/route.tsx` draws share previews on `#F1F0EF` with `#0E0D0C` ink, values
lifted from the favicon artwork so that generated imagery and the app icon read as
one system.

Two defensible answers. Match the OG card, and every generated image on the site
shares a ground. Or keep the warm paper, on the grounds that the visitor card is a
keepsake rather than a share preview, and pencil work sits better on a warmer sheet.

I lean warm, but this is a call about the brand rather than about the code, so it is
yours.
