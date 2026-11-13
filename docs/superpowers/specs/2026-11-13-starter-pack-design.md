# Starter pack card

Date: 2026-11-13. Branch: `starter-pack`.

## Intent

A toy "starter pack" blister card of Shashwat, hung on a lanyard, as a playful
object on the homepage. It is inspired by three illustrator references
(a character in a toy blister pack, items in clear plastic pods, a printed
card with a hanging tab), but every part is his own: his 3D offcod8 mascot,
his projects and brands, his interests, and the lettering from his game
Rooftop Madness. It should feel like a real object you can pick up: thick
card, plastic over everything, a strap that swings.

The prototype that settled the look is
`.superpowers/brainstorm/63841-1794556133/content/portfolio-pack-v22.html`
(git-ignored scratch; read it for exact values, do not ship it).

## Goals

- One self-contained component, driven by one config file, so adding or
  removing a bubble, a pod or a label is a one-line edit.
- Real physics: a verlet lanyard with the card as a heavy rigid arm, and
  bubbles that fall, collide by weight, roll, and feel the card's swing.
- Shown at the top right of the homepage on wide screens, and in the footer
  on phones and tablets.

## Non-goals

- No new content model: the bubbles and pods are hand-listed in the config,
  not derived from `lib/workData.ts` or `lib/clients.ts`.
- No third-party physics or animation library.
- Not on any page except the homepage (desktop) and the homepage footer
  (phones and tablets).

## Anti-goals (a failure even if it works)

- A selection highlight, image ghost or tap flash when the card is pressed or
  dragged.
- Hijacking page scroll on a phone: only a touch that starts on the card may
  drag it.
- Any sound that plays without a press. Automated tests must be silent.
- Anything sitting in front of the plastic that should be under it (mascot,
  pod items, bubbles), or the title drawn over the lanyard clip.

## What is on the card (all decided by Shashwat)

- **Title** "OFFCOD8" over "STARTER PACK", in Sedgwick Ave Display (the
  Rooftop Madness marker face), ink outline and hard drop shadow, tilted a
  little. Spelled with the letter O.
- **Every label** in Barlow Condensed italic 800/900 (the game's label face).
- **Mascot**: `mascot3d.png` (his 3D offcod8 figure, background removed and
  edge fringe cleaned) under a tall plastic dome. Plastic is the front layer:
  mascot, pod items and bubbles all sit behind it. No sticker outline on the
  mascot. A "HI :)" speech bubble sits on top of the plastic.
- **'SHIPPED' pod** (the big pod, top right of the grid): physics bubbles,
  Swoopy and Sloosh large; ShopOS, Coinbase, DeHidden, Polygon, Santul and
  Play AI small. Logos are cropped to circles. Label: the tilted
  highlighter chip "'SHIPPED'", in front of the pod, never behind it.
- **ESSENTIALS**: four pods, Anime (black samurai cat figure), Coffee
  (V60 dripper on a cup), Music (electric guitar), Gaming (question-mark block), as 3D
  icon renders (160px webp), with a vertical "ESSENTIALS ★" label beside them.
- **Badges**: "OPEN TO WORK", a round "BLR" stamp.
- **Warning label**: "FRAGILE!!!" with "FR" faded and struck out, so it
  reads AGILE, over "SHIPS IN SPRINTS".
- **Ticket**: a decorative barcode reading "BLR DD MM YY" (today's date,
  computed on the client) next to a real QR code and a "SCAN ME" tag. The QR
  code and a click on the ticket open
  `https://www.youtube.com/watch?v=YlbvZ542Ijo&list=RDYlbvZ542Ijo&start_radio=1`
  in a new tab. Pressing the ticket must not start a card drag.
- **Themes**: two, chosen at random per page load:
  - A, card stock: cream board, one amber corner block, halftone dots
    fading up, printed inner rule.
  - B, orange halftone: warm orange, halftone, soft sun rays behind the
    mascot.
  Each theme has its own foreground tokens (title, sub-title, side label and
  star, chip, badge, stamp, warning, strap). Values are in the prototype's
  `.th-a` / `.th-b` blocks.
- **Card edge**: visible thickness from stacked darker layers, a halftone
  cast shadow, a die-cut hanging tab with a slot.

## Behaviour

- **Lanyard**: a strap (blue with white stitching, colour from the theme)
  comes from above the top of its container to a metal clip through the
  card's slot. Verlet chain plus a rigid arm from the clip to the card's
  centre with a heavier mass. The card drops in on first show, swings and
  settles. Grab anywhere except a bubble or the ticket and throw it.
- **Pointer tilt**: the card also tilts a few degrees toward the pointer in
  3D, on top of the swing.
- **Bubbles**: gravity in the card's frame (rotated by the card's angle, plus
  the card's own acceleration as a pseudo-force), wall and ball collisions
  weighted by size, rolling spin. Press one: it squashes, jumps and knocks
  the others, with a soft synthesised "bloop", lower for bigger balls.
- **Reduced motion**: the card hangs still and upright, bubbles rest, no
  swing or tilt. A press still plays its sound but does not move anything.
- Animation runs only while the card is on screen and the tab is visible,
  and sleeps once everything has settled.

## Placement

> **Update (2026-11-14):** tablets and phones (under 1280px) no longer get a
> card at all. It is decoration, and on touch devices its 3D layers cost too
> much (about a fifth of a phone's main thread, measured), so it is desktop
> only. The slit and strap feed-out went with the tablet card. The per-frame lighting was also removed: the light is constant.
> Where this document still mentions a phone card, the update wins.

- **Wide screens**: absolute at the top right of the homepage, in the empty
  margin right of the hero column, the strap coming from the top edge of the
  page; scrolls away with the page. Scaled to fit the margin (about 60%).
  Shown only from the width where the margin is wide enough for the scaled
  card without touching the hero text (the builder picks the breakpoint from
  `--measure` and the card's scaled width). The card hangs in front of the
  faint brand-mark backdrop (`BrandBackdrop`), which stays as it is (builder's
  call, not discussed).
- **Below that width** (phones, tablets): the card hangs from the top edge
  of the footer, homepage only, scaled to fit the screen width. The footer
  itself is unchanged otherwise.
- Never on another route.

## Constraints (from CLAUDE.md, binding)

- Motion durations and easings come from named tokens (`lib/motionVariants.ts`
  and `app/globals.css`); no literal easings or durations in components.
  Physics constants (gravity, damping, restitution) are physics, not motion
  tokens, and live in the physics modules.
- No em-dashes in any user-facing copy.
- Icons: none needed; if any, Phosphor from `@phosphor-icons/react/ssr` only.
- Type scale: no arbitrary `text-[Npx]` classes. The card's own lettering is
  sized inside the card's scoped CSS, not with Tailwind text classes.
- Fonts: load Sedgwick Ave Display and Barlow Condensed with `next/font`,
  scoped to the component as CSS variables (both are SIL OFL).
- Sound follows `components/common/spinSound.ts`: lazy AudioContext created
  inside the gesture, every failure a silent no-op.
- `scripts/verify-simplification.sh`, `npm test`, `npm run lint` and the
  type check must pass.
- Pure physics modules carry vitest tests and touch no DOM.

## Performance and web vitals (binding)

The card is decoration; it must cost the homepage nothing it can see.

- **LCP**: the hero stays the LCP element. The card is loaded with
  `next/dynamic` (`ssr: false`) and mounted only after the page has loaded
  and the browser is idle (`requestIdleCallback`, with a timeout fallback),
  so it can never be an LCP candidate that arrives late. No card image uses
  `priority` or `fetchPriority="high"`; all are lazy. The mascot ships as a
  WebP sized for its largest on-screen size at 2x (about 260x830), not the
  1024x1536 source.
- **Fonts**: Sedgwick Ave Display and Barlow Condensed are loaded with
  `next/font` with `preload: false`, imported only inside the dynamic chunk,
  so they never compete with the hero's fonts. `display: "swap"` is
  acceptable because the card drops in from above anyway.
- **CLS**: on wide screens the card is absolutely positioned and takes no
  layout space. In the footer, its container has a fixed height reserved in
  the server-rendered HTML before the card mounts, so nothing below it moves.
- **INP / main thread**: one `requestAnimationFrame` loop for the lanyard
  and the bubbles together, fixed timestep with a cap on catch-up steps. It
  runs only while the card is intersecting the viewport and the tab is
  visible, and stops completely once the card and every bubble are at rest;
  any input wakes it. Pointer handlers do no layout reads in the move path
  beyond one cached `getBoundingClientRect` per gesture.
- **Bundle**: nothing from the card lands in the homepage's initial JS or
  CSS. Add a check in the spirit of `scripts/check-diwali-bundle.sh` that
  fails if card code or styles reach the initial chunks.
- **Images**: logos and pod art are small (circle logos at most 128px,
  SVG for pod art and QR).

## Known bug risks the build must handle

- **Hydration**: the random theme and the barcode date differ between server
  and client. Both are decided on the client only (the card is client-only).
- **Resize**: the lanyard anchor and the scale are recomputed on resize and
  orientation change; the prototype computed them once.
- **Scaled card and the pointer**: physics runs in the card's unscaled
  coordinates; pointer positions must be converted through the current scale
  and the card's 3D tilt must not throw grabs off.
- **Touch**: `touch-action: none` only on the card itself, so page scroll is
  untouched elsewhere. A press on a bubble or the ticket never starts a card
  drag, and pointer capture must not swallow the ticket's click.
- **Selection**: `user-select: none`, `-webkit-user-drag: none`,
  `draggable="false"`, no tap highlight or touch callout, and `selectstart`
  and `dragstart` cancelled on the card.
- **Paint order**: chip in front of its pod; mascot, items and bubbles behind
  their plastic; strap and clip above the title. Verified in Chromium and
  WebKit (WebKit sorts 3D layers differently).
- **Tab switch and backgrounding**: the timestep clamp stops a jump when the
  tab returns.
- **Reduced motion** can change while the page is open; listen for it.
- **Unmount**: client navigation away from and back to the homepage must not
  leak listeners, observers, the rAF loop or the AudioContext.
- **Overlap**: on wide screens the card must not cover hero text, the
  margin notes (`lib/marginNotes.ts`, right margin from `lg`) or the dock.
  In the footer on phones it must clear the bottom dock and the chat bubble.
- **Sound in tests**: automated tests never trigger audio; e2e runs muted.
- **QR**: the committed QR must decode to the exact ticket URL; the owner
  scans it once on a phone before merge.

## Structure (the builder's call within this shape)

- `components/starter-pack/`: the card, a pod, the bubbles pod, the lanyard
  and the ticket as separate components; scoped CSS.
- `components/starter-pack/starterPack.config.ts`: title, labels, bubbles
  (logo, size), pods (art, label), ticket link, themes. The only file to
  edit to change contents.
- `lib/starter-pack/`: `lanyard.ts` (verlet) and `bubbles.ts` (ball physics),
  pure and tested; `bloop.ts` for sound.
- `public/starter-pack/`: mascot, logos, pod art, QR.

## Owner defaults (asked, not yet answered; change in config)

- The ticket link stays exactly as given (it starts a YouTube radio mix after
  the song).
- The tag on the ticket reads "SCAN ME".

## Left to the builder

- The exact desktop breakpoint and scale, and the footer scale on phones.
- How the random theme avoids a hydration mismatch (for example: choose on
  the client after mount, while the card is still dropping in from above).
- Accessibility wording: the card is a `figure` with a visually hidden
  description of its contents; the ticket is a real link with a label;
  bubbles are not focus stops.
- Dark mode: the card is a printed object and keeps its own colours in both
  site themes; only its cast shadow may adapt.
