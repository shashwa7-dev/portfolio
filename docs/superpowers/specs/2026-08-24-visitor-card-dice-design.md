# Visitor card: the dice roll

Design spec. 2026-08-24. Branch `visitor-card`.

> **Identity is permanent, edition is fate.**

That line is the whole architecture in five words, and it is the test to apply to
every decision below. Anything that identifies the visitor stays welded to their
browser id and never moves. Anything that grades the artefact is rolled for, in
public, with dice they throw themselves.

---

## 1. What this replaces

`issueFrom(visitorId)` is a hidden 1d100. It runs once, silently, and hands down a
rarity tier the visitor never watches being decided. It is the least interesting part
of the feature and it is the part people care most about.

The dice make that roll visible, physical, and repeatable.

## 2. What does not change

Stated first because it is the constraint everything else works around.

| Element | Source | Status |
|---|---|---|
| Portrait | `engine.portrait(visitorId, box)` | unchanged |
| Serial | `serialFrom(visitorId)` | unchanged |
| Sticker shine and rotation | `mulberry32(hashWith(visitorId, "paper"))` | unchanged |
| Origin and postmark | Vercel geo headers | unchanged |
| Name | typed, or "Visitor" | unchanged |
| `localStorage["shashwa7:visitor-id"]` | `crypto.randomUUID()` on first visit | unchanged |

No new key is written to `localStorage`. The dice layer is entirely in memory and
dies with the tab. A visitor returning tomorrow gets the same face and the same
serial they had yesterday, and three empty dice slots.

The seeding contract in `lib/card/seed.ts` is untouched. Cards people have already
downloaded must keep hashing to the same face forever, and nothing here goes near
that.

## 3. The dice layer

A visitor throws two dice, three times. The six pips added together give a total `T`
in `[6, 36]`, and `T` selects the issue.

```
press -> throw 2d6 -> slot 1
press -> throw 2d6 -> slot 2
press -> throw 2d6 -> slot 3  ->  T = sum of all six  ->  issue  ->  card prints
```

**Rolls are unlimited.** "Roll again" clears all three slots. A visitor may throw as
long as they like.

**The dice are honestly random and are not seeded from the visitor id.** This is the
one place in `lib/card` where determinism is wrong. `rollPair` takes an injected
`Rand` so tests are exact; production passes `Math.random`.

### 3.1 The ladder

Three throws of 2d6 is six dice. The 6d6 bell curve lands almost exactly on the five
shares the site already advertises, which is why this mapping was chosen over an
invented combination table. The rarity ladder is not being redesigned, only exposed.

| Total `T` | Issue | Chance per roll | Odds | Previously stated |
|---|---|---|---|---|
| 34 to 36 | Inverted | 0.060% | 1 in 1,666 | 0.1% |
| 30 to 33 | Misprint | 1.908% | 1 in 52 | 1% |
| 26 to 29 | First day | 12.496% | 1 in 8 | 11.9% |
| 22 to 25 | Commemorative | 30.894% | 1 in 3 | 27% |
| 6 to 21 | Definitive | 54.642% | 1 in 2 | 60% |

The five sum to exactly 100.000%, verified by enumerating all `6^6 = 46,656`
outcomes.

### 3.2 The perfect roll

A clean 36, double-six three times running, is 1 in 46,656. It unlocks Inverted like
any other 34 or above, and additionally prints a `PERFECT` overprint that no other
black card carries.

It is deliberately not the only door to Inverted. At roughly four seconds a set, 1 in
46,656 is about fifty hours of clicking, and a black card no real visitor can reach
is dead content in the gallery.

## 4. Odds are stated per roll, never as a share of cards

With unlimited re-rolls, "0.06% of cards" is false. It is a per-roll probability, and
a patient visitor can eventually hold a black card. Every surface that quotes odds
changes wording:

| Surface | Was | Becomes |
|---|---|---|
| `IssueGallery.tsx`, under each specimen | `0.1% of cards` | `1 in 1,666 per roll` |
| **The card face**, `ticket.ts` stub | `0.1% OF CARDS` | `1 IN 1666 PER ROLL` |
| `app/card/page.tsx` lede | "Most people get a Definitive" | rewritten, see section 9 |

The card-face string is described in its own source comment as "the single most
interesting fact on the card". It keeps that status and its hairline rule. Only the
claim changes, because the old claim stops being true.

The gallery gains the total range per issue, so it reads as a target list: a visitor
can see they are rolling for 34 or better.

### 4.1 `Issue` loses `share` and gains three fields

`share: number` was doing two jobs badly: it was the band width for the 1d100 walk
**and** the string interpolated onto the card. The walk is gone and the string is no
longer a percentage, so it is replaced rather than renamed:

```ts
chance: number;   // 12.496, the true per-roll probability. tested, not displayed.
odds:   string;   // "1 in 8", what the card and the gallery print.
range:  readonly [min: number, max: number];   // [26, 29]
```

`chance` exists so `dice.test.ts` can assert the enumerated distribution against a
number rather than parsing a display string. `odds` is the only one that renders.
Keeping them separate is what stops a copy edit from silently changing a claim the
tests believe they are still checking.

## 5. The roll interaction

A pill button reading **Roll**, with two line-art dice perched on its right edge,
slightly overlapping and each rotated a few degrees off square. Three result slots sit
above it.

Per press:

| Element | Motion |
|---|---|
| Pill | `tapPress` (`scale: 0.97`), which already exists in `lib/motionVariants.ts` |
| Launch | ballistic arc, `y: 0 -> -90 -> 0`, `x` drifting `+18px` |
| Spin | 380 to 520 degrees, randomised per die, opposite directions |
| Faces | flicker to a random face every ~60ms while airborne, so the result is unreadable in flight, then snap to the true face on landing |
| Landing | the two dice land ~40ms apart, each squashing to `(1.15, 0.85)` and settling to `1` over ~120ms |
| Total | ~700ms |

Two inline SVG dice, rounded squares with dot pips, animated with `motion`. Not Rive:
a wasm runtime is not worth a 700ms tumble, and inline SVG takes the site's own
colour tokens.

The faces must be drawn as circles rather than set as unicode dice glyphs, which
render inconsistently across platforms.

## 6. The reveal

The third roll is the payoff and gets a staged sequence. The brief is subtle and
collectible, not flashy.

### 6.1 The timeline

`t = 0` is the moment the third pair of dice come to rest, not the moment the third
press lands. The 700ms throw runs first and is not part of this budget.

| ms | What |
|---|---|
| 0 to 160 | backdrop fades in over the page: `bg-background/70` plus `backdrop-blur-sm` |
| 80 to 400 | the card springs forward: `scale 0.94 -> 1`, `rotate -1.5deg -> 0` |
| 240 to 1140 | the existing print reveal composites the card top to bottom |
| 1180 to 1400 | the issue name stamps in |
| 1440 to 1720 | backdrop fades out, page returns to normal |

**Total 1,720ms**, inside the two second budget.

The 240ms gap before printing begins is deliberate anticipation, not dead time: the
card springs into an empty frame and then prints into it.

Nothing sits behind the canvas during that gap. A placeholder colour is tempting and
wrong twice over: the card's tear-line holes are genuine `destination-out` cuts, so a
backing colour would show through them and break the effect, and a per-issue stock
colour behind the canvas would spoil an Inverted result before it printed.

### 6.2 The parts

**Backdrop.** A `fixed inset-0` overlay following the `VideoModal.tsx` pattern
already in the repo (`bg-background/90 backdrop-blur-sm z-50`), at a lighter tint. It
is **not** a modal: no scroll lock, no focus trap, no escape handler, and it releases
itself at the end of the sequence. The card sits above it at `z-[60]`; the sticky
navbar is `z-40` and passes underneath.

**Card forward.** A spring, which is a new class of token for this repo. Every
existing transition is duration plus `ease.out`. Justification in section 8.

**The issue name, as a delayed stamp.** After the print completes, a 40ms beat, then
the name lands: `opacity 0 -> 1`, `scale 1.08 -> 1`, `rotate -3deg -> 0` over 220ms
on `ease.out`. It arrives slightly large and rotated and stops dead, the way a rubber
stamp is pressed and lifted. No bounce, no overshoot: a spring here would read as
cartoonish and this moment is meant to feel like a thing being certified.

It renders as a DOM line directly under the card:

```
First day
1 in 8 per roll   ·   You rolled 27
```

This does not duplicate the card's own stub, which prints the same issue name small
and in mono. The card records it; this announces it.

### 6.3 Re-rolls do not replay the full ceremony

A visitor grinding for 34 or better would otherwise sit through 1.7 seconds of
backdrop every attempt.

- **First completed set of a session:** full sequence.
- **Every re-roll after that:** short reveal. No backdrop, no blur, no spring. The
  print reveal, the 40ms beat, then the issue stamp. 1,160ms.
- **Exception:** a result of `T >= 26` (First day or better) always earns the full
  sequence, on any roll. Roughly one roll in seven, which is the frequency worth a
  moment.

This follows the reasoning already in `CardMinter.tsx`, where redraws after the first
reveal skip to the finished frame because reprinting on every keystroke "would be
noise, not a moment".

### 6.4 The timeline is data, not hardcoded delays

The sequence lives in a new pure module, `lib/card/revealSequence.ts`, exported as a
timeline object of delays and durations, DOM-free and unit tested the same way
`reveal.ts` is. The component reads it and drives `motion` from it.

This makes "under two seconds" an assertion rather than an intention: a test sums the
timeline and fails if it crosses 2,000ms. It also keeps the full and short variants
from drifting apart, since both are derived from one table.

### 6.5 Reduced motion

The entire sequence collapses to a crossfade. No backdrop blur, no dim, no spring, no
rotation, no tumble, no face flicker. The card and the issue name fade in over
`duration.base`. `reveal.ts` already has the reduced-motion path that jumps straight
to the finished frame, and `prefersReducedMotion(window)` already defaults to
motion-allowed when `matchMedia` is missing.

## 7. The PNG is the share artifact

The downloaded 1200x1500 PNG has to stand on its own in a Twitter timeline, with no
page around it to explain what it is. It must carry all four of: **who** (portrait and
name), **which** (issue), **how** (the roll), and **where from** (serial, origin, and
the brand row).

| Element | Status |
|---|---|
| Portrait | already drawn |
| Name in handwriting | already drawn |
| `SHASHWA7.IN` brand row | already drawn, this is the provenance |
| Serial | already drawn |
| Issue name | already drawn in the stub |
| Origin and date | already drawn |
| Odds line | already drawn, **reworded** to per roll |
| **The roll** | **new** |
| **`PERFECT` overprint** | **new**, only on a clean 36 |

### 7.1 Printing the roll

Three pairs of pips drawn as circles, then the total. Circles rather than glyphs, for
the same font-portability reason as the UI dice.

It goes in the band between the tear line (`y = h - 0.218h`) and the `SERIAL` label
(`y = h - 0.152h`), which is about 99px of clear height at export size and is
currently empty. Left-aligned to `L`, so it shares the serial's column edge.

Constraints: it must not collide with the tear line above or the stub label below, and
it must pass through `shrinkToFit` like every other value on the card rather than
assuming it fits.

### 7.2 The framing line does not print on the card

"Identity is permanent, edition is fate" lives in the page lede, the OG subtitle, and
as the thesis comment atop `lib/card/dice.ts`.

It is not printed on the card. The stub already carries six values and is gaining a
seventh, and the card states the idea structurally anyway: a permanent serial sitting
in the left column beside a rolled edition in the right. Adding the sentence would
crowd the densest region of the layout to say what the layout is already saying.

Flagged as easy to override if you want it printed.

## 8. Motion tokens

Nothing is inlined. Repo rule: all variants and tokens live in
`lib/motionVariants.ts`, mirrored as CSS custom properties in `app/globals.css`.

New tokens:

| Token | Value | Why it needs justifying |
|---|---|---|
| `duration.throw` / `--duration-throw` | `700ms` | breaks the sub-300ms UI budget |
| `ease.throw` | ballistic arc | the repo has exactly one curve, `ease.out` |
| `spring.card` | stiffness ~260, damping ~26 | the repo has no springs at all today |
| `diceThrowVariants` | arc, spin, squash | composes `duration.throw` and `ease.throw` |
| `cardForwardVariants` | `scale 0.94 -> 1`, `rotate -1.5deg -> 0` | composes `spring.card` |
| `issueStampVariants` | `scale 1.08 -> 1`, `rotate -3deg -> 0`, 220ms | plain `ease.out`, deliberately not the spring |

Two sanctioned budget exceptions already exist, each documented in `globals.css` with
its reasoning: `--duration-sweep: 700ms` and `--duration-print: 900ms`. Both are
excused on the grounds that they are "not a response to input".

**That excuse does not apply here and must not be copied.** A thrown die is very much
a response to input. The honest justification is different: the duration is the
physics rather than a transition, and a die that completes its arc in 300ms does not
read as a thrown object at all. Write that reasoning into the comment rather than
reusing the sweep and print wording.

The spring is the first in the codebase. It is warranted because the card coming
forward is an object with mass arriving, not a state changing, and `ease.out` cannot
express settle. It is confined to that one movement: the issue stamp deliberately
does not use it, per section 6.2.

Reused as-is: `tapPress` for the pill, `backdropFadeVariants` for the overlay.

## 9. Copy

Three places currently promise the opposite of what this ships and all three change in
the same commit.

1. **`app/card/page.tsx` lede.** Currently: "The portrait comes from a random id kept
   in this browser, so it is yours and it does not change. Five issues exist. Most
   people get a Definitive." The portrait clause survives. The rest is replaced, built
   on the framing line, and states that the issue is rolled for and re-rollable.
2. **`lib/card/issues.ts`,** the doc comment on `issueFrom`: "Fixed to the visitor id,
   so a person's issue never changes. There is no re-roll: the card is theirs, not a
   pull." The function is deleted; the comment goes with it.
3. **`data/agent-memory.md` lines 184 to 203.** This is the chatbot's system prompt.
   CLAUDE.md makes updating it mandatory in the same change. The passage to rewrite
   ends "the issue is fixed to their id and there is no re-roll. That is deliberate.
   The card is theirs, not a pull." It becomes the opposite, plus the new odds and the
   framing line, so Truffy can answer "how do I get the black card" correctly.

The OG subtitle for `/card` also picks up the framing line.

No em-dashes in any of it, per CLAUDE.md.

## 10. Accessibility

- The result line is `aria-live="polite"` and announces each throw: "Roll two of
  three: five and three, eight. Running total nineteen."
- The final announcement names the outcome: "Total twenty-seven. First day, one in
  eight per roll."
- The button labels which throw is next, so a screen reader user knows where they are
  in the set of three.
- Dice SVGs are `aria-hidden`. The text carries all meaning.
- The backdrop is not a dialog and must not be given `role="dialog"`, since it traps
  nothing and the visitor is never blocked by it.
- The canvas keeps its existing `role="img"` and its `aria-label` gains the roll.

## 11. Files

| File | Change |
|---|---|
| `lib/card/dice.ts` | **new.** pure, DOM-free, tested. `Die`, `Roll`, `RollSet`, `rollPair`, `pipTotal`, `issueFromTotal`, `isPerfect`, `DICE_BANDS`. Carries the framing line as its thesis comment. |
| `lib/card/revealSequence.ts` | **new.** pure, DOM-free, tested. the full and short timelines as data. |
| `components/card/DiceRoller.tsx` | **new.** pill, two SVG dice, three slots, running total. |
| `components/card/CardMinter.tsx` | Mint button becomes `<DiceRoller>`. `buildData()` sources the issue from the roll. Owns the reveal choreography. Fonts, mark, download untouched. |
| `lib/card/issues.ts` | delete `issueFrom`. retire `share`, see below. add the total range per issue. |
| `lib/card/types.ts` | `CardData` gains the roll. `Issue` swaps `share` for `chance`, `odds` and `range`. |
| `lib/card/ticket.ts` | print the roll, the `PERFECT` overprint, reword the odds line. |
| `lib/motionVariants.ts` | new tokens per section 8. |
| `app/globals.css` | `--duration-throw` with its own justification comment. |
| `components/card/IssueGallery.tsx` | per-roll odds and the total range per specimen. |
| `app/card/page.tsx` | lede and OG subtitle. |
| `data/agent-memory.md` | lines 184 to 203. |

## 12. Testing

- **`lib/card/dice.test.ts`** enumerates all 46,656 sets and asserts the resulting
  distribution matches the published odds to three decimal places. This is the load
  bearing test: it makes it impossible for the page or the card to advertise numbers
  the dice do not produce. Plus the band boundaries `21|22`, `25|26`, `29|30`,
  `33|34`, both ends `6` and `36`, and `isPerfect`.
- **`lib/card/revealSequence.test.ts`** asserts both timelines total under 2,000ms and
  that no stage starts before the one it depends on.
- `issues.test.ts` updated for the removal of `issueFrom`.
- `ticket.test.ts` and `ticket.scale.test.ts` updated for the roll row, the `PERFECT`
  overprint, and the reworded odds line. These assert positionally against a recording
  stub context ("the Nth `fillStyle` assignment"), so inserting draw calls mid-routine
  shifts indices. This is the largest single chunk of work in the change.
- Gates: `npm test`, `npm run build`, `npm run lint`, and
  `./scripts/verify-simplification.sh` exiting 0.
- No browser or dev-server visual checks. Those are verified by the owner.

## 13. Out of scope

- Capping the number of rolls. Rolls are unlimited by decision, and the odds wording
  changes to stay honest about it.
- Persisting a settled card, or remembering that someone once unlocked Inverted.
  Nothing is stored.
- A sixth issue. The existing rule stands: if the only difference is the gradient, it
  has not earned a name.
- Any change to `lib/card/seed.ts` or to the vendored portrait engine.
