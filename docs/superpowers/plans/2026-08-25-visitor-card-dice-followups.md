# Visitor card dice: deferred follow-ups

Written 2026-08-25, at the end of the dice-roll implementation
(`docs/superpowers/plans/2026-08-24-visitor-card-dice.md`). Everything here was
found by review, judged real, and deliberately not done. None of it blocks merge.

---

## 1. Collapse the two dice skins

`components/card/dice/` ships **two** presentations behind `?dice=cube` and
`?dice=toss`, with `DEFAULT_STYLE` in `DiceRoller.tsx` choosing what visitors get.
That fork exists so the owner could compare them live; it is not meant to be
permanent.

Once one is chosen: set `DEFAULT_STYLE`, delete the other skin, and remove the query
param plus its `Suspense` boundary. `useDiceRoll`, `RollPill` and `Pips` all stay,
since they are the shared seam rather than either skin.

## 2. Extract `CardMinter.tsx`

It is 535 lines with 11 `useState`, 7 `useRef` and 7 `useEffect`, owning: visitor-id
bootstrap, font and brand-mark loading, name editing, the reveal choreography,
roll-again teardown timing, PNG export, deck markup, header layout, and the roll
history strip.

The whole-branch review graded this Important and gave a plan, in value order:

- **`usePrintReveal({ roll, ready, buildData, canvasRef, markRef })` → `{ revealing,
  cardShown, riseMs, issueCaption, dismiss() }`.** Takes the ~95-line reveal effect,
  the four states only it owns, all three refs (`revealedOnceRef`,
  `hasEverRevealedRef`, `rollAgainTimerRef`) and `handleRollAgain`. About 180 lines,
  and the only part with a subtle lifecycle. Isolating it also makes the
  rise-duration behaviour testable, which it currently is not.
- **`<CardStageHeader>`** — the history strip, the edit and download buttons and the
  name input. Props: `{ rolls, hasCard, name, onName, revealing, onDownload }`.
- **`useCardAssets()`** — the fonts and brand-mark pair, returning `{ ready, markRef }`.
  Zero coupling to anything else.

What remains is composition, roughly 120 lines.

**Why it was deferred:** it restructures the most delicate lifecycle code in the
feature, `npm test` covers `lib/**` only so none of it has unit coverage, and it
would have landed on top of an eight-item fix wave at the end of a long session.
Refactoring choreography that is only verified by eye is how the React 18 batching
bug and the wedged-button bug were written in the first place.

## 3. `riseMs` does two jobs

`CardMinter` uses `variant.cardRise.duration` as both the wait before printing and the
CSS transition duration. On `SHORT_REVEAL` that value is `ABSENT` (0.000001ms), which
is correct for the wait and means the card pops rather than slides on every re-roll.
The behaviour is intended; the conflation is not obviously right. Splitting them would
let a re-roll still slide out while not delaying the print.

## 4. Two constants mirrored across a boundary

- `lib/card/revealSequence.ts`'s `PRINT_MS = 900` mirrors `--duration-print`, which
  `lib/card/reveal.ts` parses live from CSS. No test spans the two.
- `useDiceRoll`'s `HAPTIC_LANDING_STAGGER_MS = 40` mirrors `LANDING_STAGGER_S` in
  `lib/motionVariants.ts`, which is not exported.

Both were kept so their modules stay DOM-free. A DOM-free regex test asserting the CSS
literal matches `PRINT_MS` closes the first for about eight lines; exporting
`LANDING_STAGGER_S` closes the second in two.

## 5. Smaller, all judged shippable

- `lib/card/dice.ts`'s `rollDie` reimplements `ri(rand, 1, 6)` from the frozen
  `seed.ts` by hand. Identical maths; kept so `dice.ts` takes no value-level
  dependency on `seed.ts`.
- `lib/card/toss.ts`'s `Arc.outX` is `0` in both shipped arcs. The horizontal drift
  axis is plumbed through but unused.
- `CardMinter` reads reduced motion two ways in one file: via state in an effect for
  the history chips, and synchronously inside the reveal effect.
- `SLOT_CARD_H = 350` and a hardcoded `h-[350px]` must match by hand.

---

## Not deferred, just unverifiable from here

The visual and tactile pass. Nothing in this feature's motion, layout or haptics was
seen rendered or felt on a device during implementation: `npm test` covers `lib/**`
only, and the repo's convention is that the owner verifies visuals himself. The dice
throw, the card rising off the deck, the filling pill, the header at phone widths, and
the iOS and Android haptics all need a real look.
