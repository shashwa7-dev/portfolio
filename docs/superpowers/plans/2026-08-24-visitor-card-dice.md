# Visitor Card Dice Roll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visitor card's hidden 1d100 rarity roll with two dice the visitor throws three times, keeping their portrait, serial and origin permanently tied to their browser id.

**Architecture:** A new pure module `lib/card/dice.ts` owns the pip-total ladder and is the single source of rarity. `issues.ts` reads its display values from that ladder rather than carrying its own. A new `DiceRoller` component throws the dice; `CardMinter` orchestrates a staged reveal whose timeline lives as testable data in `lib/card/revealSequence.ts`. The card renderer changes in exactly two strings and gains no new draw calls.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, React 18, `motion` v12, vitest (node environment, no DOM).

**Spec:** `docs/superpowers/specs/2026-08-24-visitor-card-dice-design.md`

## Global Constraints

- **No em-dashes in any user-facing copy.** Use periods, colons, parentheses, or rephrase. Applies to UI strings, card text, and `data/agent-memory.md`.
- **No inline motion literals.** Every easing, duration, spring and variant lives in `lib/motionVariants.ts`, mirrored as a CSS custom property in `app/globals.css`. Never paste `[0.23, 1, 0.32, 1]` or a bare duration number into a component.
- **Pure modules stay DOM-free.** `seed.ts`, `issues.ts`, `types.ts`, `dice.ts` and `revealSequence.ts` must never touch `window`, `document`, or `requestAnimationFrame`. Vitest runs them in the `node` environment with no DOM at all.
- **Drawing modules hold no module-level mutable state.** They take a canvas context as a parameter. `IssueGallery` renders six canvases on one page.
- **`drawTicket` draws every size.** Never add a second drawing routine.
- **`lib/card/seed.ts` is frozen.** Cards people have downloaded must keep hashing to the same face forever. No task in this plan modifies it.
- **Type scale only.** Arbitrary `text-[Npx]` is forbidden; use `text-2xs` through `text-4xl` from `tailwind.config.ts`.
- **Every task ends green:** `npm test`, `npm run lint`, `npm run build`, and `./scripts/verify-simplification.sh` exiting 0.
- **The exact ladder**, used verbatim wherever these numbers appear:

| Issue | Total range | Sets (of 46,656) | `chance` | `label` |
|---|---|---|---|---|
| `inverted` | 34 to 36 | 28 | `0.060014` | `"0.06%"` |
| `misprint` | 30 to 33 | 890 | `1.907579` | `"1.9%"` |
| `firstDay` | 26 to 29 | 5830 | `12.495713` | `"12.5%"` |
| `commemorative` | 22 to 25 | 14414 | `30.894204` | `"30.9%"` |
| `definitive` | 6 to 21 | 25494 | `54.642490` | `"54.6%"` |

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `lib/card/types.ts` | shared types. Gains `Die`/`Roll`/`RollSet`; `Issue` swaps `share` for `chance`/`label`/`range`; `CardData` gains `roll`. | 1, 2 |
| `lib/card/dice.ts` | **new.** the ladder, the throw, the total. Single source of rarity. | 1 |
| `lib/card/dice.test.ts` | **new.** exhaustive 46,656-case distribution proof. | 1 |
| `lib/card/issues.ts` | the five issues. Reads display values from `DICE_BANDS`. `issueFrom` deleted. | 2 |
| `lib/card/ticket.ts` | two string edits. No new draw calls. | 2, 3 |
| `lib/card/revealSequence.ts` | **new.** the reveal timeline as data. | 4 |
| `lib/card/revealSequence.test.ts` | **new.** asserts the budget. | 4 |
| `lib/motionVariants.ts` | new throw/spring/stamp tokens. | 5, 6 |
| `app/globals.css` | `--duration-throw` mirror. | 5 |
| `components/card/DiceRoller.tsx` | **new.** pill, two SVG dice, three slots, running total. | 5 |
| `components/card/CardMinter.tsx` | owns the roll state and the reveal choreography. | 2, 5, 6 |
| `components/card/IssueGallery.tsx` | per-roll odds and total ranges. | 2, 7 |
| `app/card/page.tsx` | lede and OG subtitle. | 7 |
| `data/agent-memory.md` | chatbot system prompt, lines 184 to 203. | 7 |

---

### Task 1: The dice ladder

**Files:**
- Create: `lib/card/dice.ts`
- Create: `lib/card/dice.test.ts`
- Modify: `lib/card/types.ts` (append only, nothing existing changes)

**Interfaces:**
- Consumes: `Rand` from `lib/card/seed.ts`, `IssueKey` from `lib/card/types.ts`.
- Produces: `Die`, `Roll`, `RollSet` (declared in `types.ts`, re-exported from `dice.ts`); `DICE_BANDS: readonly DiceBand[]`; `rollPair(rand: Rand): Roll`; `pipTotal(set: RollSet): number`; `issueFromTotal(total: number): IssueKey`; `isPerfect(set: RollSet): boolean`; `MIN_TOTAL = 6`; `MAX_TOTAL = 36`.

This task is additive. It breaks nothing, so it must end with the full existing suite still green.

- [ ] **Step 1: Add the roll types to `lib/card/types.ts`**

Append to the end of the file. Nothing existing is touched in this step.

```ts
/** One face of one die. */
export type Die = 1 | 2 | 3 | 4 | 5 | 6;

/** One throw of two dice. */
export type Roll = readonly [Die, Die];

/**
 * Three throws, which is the whole set a visitor makes before their card
 * prints. Six dice in total, so the pip total runs 6 to 36.
 */
export type RollSet = readonly [Roll, Roll, Roll];
```

These live here rather than in `dice.ts` because `CardData` (Task 2) needs `RollSet` and `dice.ts` needs `IssueKey`. Declaring both in `types.ts` keeps the dependency one-directional, which is the same reason `issues.ts` re-exports `Issue` and `IssueKey` from here rather than declaring them.

- [ ] **Step 2: Write the failing test**

Create `lib/card/dice.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  DICE_BANDS,
  MAX_TOTAL,
  MIN_TOTAL,
  isPerfect,
  issueFromTotal,
  pipTotal,
  rollPair,
} from "./dice";
import { mulberry32 } from "./seed";
import type { Die, IssueKey, RollSet } from "./types";

/**
 * Every one of the 6^6 = 46,656 possible sets, as pip totals.
 *
 * Six explicit loops rather than a recursive product: this is the assertion
 * the published odds rest on, and it should be obvious by reading that it
 * enumerates exactly six dice of six faces and nothing else.
 */
function everyTotal(): number[] {
  const totals: number[] = [];
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++)
      for (let c = 1; c <= 6; c++)
        for (let d = 1; d <= 6; d++)
          for (let e = 1; e <= 6; e++)
            for (let f = 1; f <= 6; f++) totals.push(a + b + c + d + e + f);
  return totals;
}

const ALL = 46_656;

const set = (a: Die, b: Die, c: Die, d: Die, e: Die, f: Die): RollSet =>
  [
    [a, b],
    [c, d],
    [e, f],
  ] as const;

describe("DICE_BANDS", () => {
  it("tiles 6 to 36 with no gap and no overlap", () => {
    for (let total = MIN_TOTAL; total <= MAX_TOTAL; total++) {
      const hits = DICE_BANDS.filter((b) => total >= b.min && total <= b.max);
      expect(hits, `total ${total}`).toHaveLength(1);
    }
  });

  it("covers every issue exactly once", () => {
    const keys = DICE_BANDS.map((b) => b.key).sort();
    expect(keys).toEqual(
      ["commemorative", "definitive", "firstDay", "inverted", "misprint"].sort()
    );
  });

  it("declares chances that sum to 100", () => {
    const total = DICE_BANDS.reduce((n, b) => n + b.chance, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it("has no em-dash in any label", () => {
    for (const band of DICE_BANDS) expect(band.label).not.toContain("—");
  });
});

describe("the published odds are true", () => {
  /* The load-bearing test of this whole feature. Every possible outcome is
     enumerated and counted, so the page and the card cannot advertise a
     number the dice do not actually produce. If this fails, the copy is
     lying, not the test. */
  it("matches every band's declared chance against all 46,656 outcomes", () => {
    const totals = everyTotal();
    expect(totals).toHaveLength(ALL);

    const counts: Record<string, number> = {};
    for (const t of totals) {
      const key = issueFromTotal(t);
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const expected: Record<IssueKey, number> = {
      inverted: 28,
      misprint: 890,
      firstDay: 5830,
      commemorative: 14414,
      definitive: 25494,
    };

    for (const band of DICE_BANDS) {
      expect(counts[band.key], band.key).toBe(expected[band.key]);
      expect((counts[band.key] / ALL) * 100, band.key).toBeCloseTo(band.chance, 5);
    }

    const summed = Object.values(expected).reduce((n, c) => n + c, 0);
    expect(summed).toBe(ALL);
  });

  it("rounds each label to the chance it claims", () => {
    for (const band of DICE_BANDS) {
      const claimed = parseFloat(band.label);
      // Two significant figures below 1, one decimal place above it: the
      // labels are display values, so this checks they round from the
      // real number rather than being typed independently of it.
      const tolerance = band.chance < 1 ? 0.005 : 0.05;
      expect(Math.abs(claimed - band.chance), band.key).toBeLessThan(tolerance);
    }
  });
});

describe("issueFromTotal", () => {
  it("puts each boundary on the right side", () => {
    const cases: [number, IssueKey][] = [
      [6, "definitive"],
      [21, "definitive"],
      [22, "commemorative"],
      [25, "commemorative"],
      [26, "firstDay"],
      [29, "firstDay"],
      [30, "misprint"],
      [33, "misprint"],
      [34, "inverted"],
      [36, "inverted"],
    ];
    for (const [total, key] of cases) expect(issueFromTotal(total), `total ${total}`).toBe(key);
  });

  it("clamps rather than throwing on a total no set can produce", () => {
    expect(issueFromTotal(0)).toBe("definitive");
    expect(issueFromTotal(99)).toBe("inverted");
  });
});

describe("pipTotal", () => {
  it("adds all six dice", () => {
    expect(pipTotal(set(1, 1, 1, 1, 1, 1))).toBe(6);
    expect(pipTotal(set(6, 6, 6, 6, 6, 6))).toBe(36);
    expect(pipTotal(set(3, 4, 5, 2, 6, 1))).toBe(21);
  });
});

describe("isPerfect", () => {
  it("is true only for six sixes", () => {
    expect(isPerfect(set(6, 6, 6, 6, 6, 6))).toBe(true);
    expect(isPerfect(set(6, 6, 6, 6, 6, 5))).toBe(false);
    expect(isPerfect(set(5, 6, 6, 6, 6, 6))).toBe(false);
  });

  it("is false for a 35, which is the nearest miss", () => {
    const nearMiss = set(6, 6, 6, 6, 6, 5);
    expect(pipTotal(nearMiss)).toBe(35);
    expect(issueFromTotal(pipTotal(nearMiss))).toBe("inverted");
    expect(isPerfect(nearMiss)).toBe(false);
  });
});

describe("rollPair", () => {
  it("only ever returns faces 1 through 6", () => {
    const R = mulberry32(12345);
    for (let i = 0; i < 5_000; i++) {
      const [a, b] = rollPair(R);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(6);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(6);
      expect(Number.isInteger(a)).toBe(true);
      expect(Number.isInteger(b)).toBe(true);
    }
  });

  it("reaches every face", () => {
    const R = mulberry32(999);
    const seen = new Set<number>();
    for (let i = 0; i < 5_000; i++) rollPair(R).forEach((d) => seen.add(d));
    expect(seen.size).toBe(6);
  });

  it("replays exactly for the same injected Rand, which is what makes it testable", () => {
    expect(rollPair(mulberry32(7))).toEqual(rollPair(mulberry32(7)));
  });

  it("does not return the same pair forever", () => {
    const R = mulberry32(42);
    const pairs = new Set<string>();
    for (let i = 0; i < 200; i++) pairs.add(rollPair(R).join(","));
    expect(pairs.size).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npm test -- lib/card/dice.test.ts
```

Expected: FAIL, cannot resolve `./dice`.

- [ ] **Step 4: Write `lib/card/dice.ts`**

```ts
/**
 * The dice ladder.
 *
 * Identity is permanent, edition is fate. Everything that identifies a
 * visitor (their portrait, their serial, their origin) is hashed from an id
 * in their browser and never moves. Everything that grades the artefact is
 * decided here, by dice they throw themselves, and is not remembered
 * afterwards.
 *
 * This module is the single source of rarity in the app. It replaced a
 * hidden 1d100 that ran once per visitor and was never seen. `issues.ts`
 * reads its display values from DICE_BANDS rather than carrying its own,
 * so a number can only be wrong here.
 *
 * Deliberately NOT seeded from the visitor id. Every other random value on
 * the card is reproducible forever, on purpose; this one is a real roll,
 * and reproducing it would defeat the point. `rollPair` takes an injected
 * Rand purely so the tests can be exact.
 */
import type { Die, IssueKey, Roll, RollSet } from "@/lib/card/types";
import type { Rand } from "@/lib/card/seed";

export type { Die, Roll, RollSet } from "@/lib/card/types";

/** Three throws of two dice. */
export const MIN_TOTAL = 6;
export const MAX_TOTAL = 36;

export type DiceBand = {
  key: IssueKey;
  /** Inclusive pip-total bounds. */
  min: number;
  max: number;
  /** Exact per-roll probability as a percentage. Tested, never displayed. */
  chance: number;
  /** The rounded string that actually renders. */
  label: string;
};

/**
 * Ordered rarest first, which is only a reading convenience: the bands are
 * disjoint and `issueFromTotal` scans for a containing range rather than
 * walking a cumulative floor, so order carries no meaning here the way it
 * did in the 1d100 walk this replaced.
 *
 * The chances are not chosen. They are the 6d6 distribution, counted: of
 * the 46,656 possible sets, 28 total 34 or more, 890 total 30 to 33, and so
 * on. lib/card/dice.test.ts enumerates all of them and fails if any number
 * below drifts from what the dice really do.
 */
export const DICE_BANDS: readonly DiceBand[] = [
  { key: "inverted", min: 34, max: 36, chance: 0.060014, label: "0.06%" },
  { key: "misprint", min: 30, max: 33, chance: 1.907579, label: "1.9%" },
  { key: "firstDay", min: 26, max: 29, chance: 12.495713, label: "12.5%" },
  { key: "commemorative", min: 22, max: 25, chance: 30.894204, label: "30.9%" },
  { key: "definitive", min: 6, max: 21, chance: 54.642490, label: "54.6%" },
];

const rollDie = (rand: Rand): Die => (Math.floor(rand() * 6) + 1) as Die;

/** One throw of two dice. */
export function rollPair(rand: Rand): Roll {
  return [rollDie(rand), rollDie(rand)] as const;
}

/** 6 to 36. */
export function pipTotal(set: RollSet): number {
  return set.reduce((n, [a, b]) => n + a + b, 0);
}

/**
 * Clamps before matching rather than throwing on an impossible total. A
 * pure function in the draw path should degrade to a sensible card, not
 * take the page down, and the bands tile the whole legal range so a clamped
 * value always lands somewhere.
 */
export function issueFromTotal(total: number): IssueKey {
  const clamped = Math.min(MAX_TOTAL, Math.max(MIN_TOTAL, total));
  for (const band of DICE_BANDS) {
    if (clamped >= band.min && clamped <= band.max) return band.key;
  }
  return "definitive";
}

/** Double six, three times running. 1 in 46,656. */
export function isPerfect(set: RollSet): boolean {
  return set.every(([a, b]) => a === 6 && b === 6);
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm test -- lib/card/dice.test.ts
```

Expected: PASS, all cases.

- [ ] **Step 6: Confirm nothing else broke**

```bash
npm test && npm run lint && ./scripts/verify-simplification.sh
```

Expected: all green. This task is purely additive, so any failure here is a real regression, not an expected one.

- [ ] **Step 7: Commit**

```bash
git add lib/card/dice.ts lib/card/dice.test.ts lib/card/types.ts
git commit -m "Add the dice ladder, proved against all 46,656 outcomes

Three throws of 2d6 is six dice, and the 6d6 bell curve lands almost
exactly on the five shares the card already advertised. So the rarity
ladder is not being redesigned, only exposed: the chances in DICE_BANDS
are the distribution counted, not numbers picked to look plausible.

dice.test.ts enumerates every possible set and fails if any published
number drifts from what the dice really do.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: The data model follows the dice

**Files:**
- Modify: `lib/card/types.ts` (`Issue`, `CardData`)
- Modify: `lib/card/issues.ts` (delete `issueFrom` and `BANDS`, read display values from `DICE_BANDS`)
- Modify: `lib/card/issues.test.ts` (rewrite)
- Modify: `lib/card/ticket.ts:509` (the odds string only)
- Modify: `lib/card/ticket.test.ts:143-153` (`cardFor` factory), plus the odds assertion
- Modify: `lib/card/ticket.scale.test.ts:245-255` (`cardFor` factory)
- Modify: `components/card/IssueGallery.tsx:46-57` (inline `CardData`), `:78-80` (the share caption)
- Modify: `components/card/CardMinter.tsx` (interim headless roll)

**Interfaces:**
- Consumes: `DICE_BANDS`, `issueFromTotal`, `pipTotal`, `rollPair`, `RollSet` from Task 1.
- Produces: `Issue` with `chance: number`, `label: string`, `range: readonly [number, number]` and **no** `share`. `CardData` with `roll: RollSet`. `issueFrom` no longer exists.

This is the breaking change. `share` is deleted, so every consumer must move in the same commit or the build fails. The interim roll in `CardMinter` is explicitly temporary and is replaced in Task 5.

- [ ] **Step 1: Establish the green baseline before breaking anything**

```bash
npm test -- lib/card/ticket.test.ts lib/card/ticket.scale.test.ts
```

Expected: PASS. Record the number of passing tests. Those files assert positionally against a recording stub, and this task must not change that count. If it does, a draw call moved and something is wrong.

- [ ] **Step 2: Write the failing test**

Replace the whole of `lib/card/issues.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ISSUES } from "./issues";
import { DICE_BANDS } from "./dice";
import type { IssueKey } from "./types";

const KEYS: IssueKey[] = ["definitive", "commemorative", "firstDay", "misprint", "inverted"];

describe("ISSUES", () => {
  it("chances sum to 100", () => {
    const total = Object.values(ISSUES).reduce((n, i) => n + i.chance, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it("takes chance, label and range from the dice bands, not its own copy", () => {
    /* The point of this test is that there is exactly one place a rarity
       number can be wrong. If someone hand-edits a percentage into
       issues.ts, this fails. */
    for (const key of KEYS) {
      const band = DICE_BANDS.find((b) => b.key === key)!;
      expect(ISSUES[key].chance, key).toBe(band.chance);
      expect(ISSUES[key].label, key).toBe(band.label);
      expect(ISSUES[key].range, key).toEqual([band.min, band.max]);
    }
  });

  it("no longer carries a share of cards, which stopped being true when rolls became unlimited", () => {
    for (const issue of Object.values(ISSUES)) {
      expect(issue).not.toHaveProperty("share");
    }
  });

  it("gives every issue but Definitive a five stop gradient", () => {
    expect(ISSUES.definitive.sticker).toBeNull();
    for (const key of ["commemorative", "firstDay", "misprint", "inverted"] as IssueKey[]) {
      expect(ISSUES[key].sticker).toHaveLength(5);
    }
  });

  it("inverts only the rarest issue", () => {
    const inverting = Object.values(ISSUES).filter((i) => i.inverted).map((i) => i.key);
    expect(inverting).toEqual(["inverted"]);
  });

  it("has no em-dash in any display name or label", () => {
    for (const issue of Object.values(ISSUES)) {
      expect(issue.name).not.toContain("—");
      expect(issue.label).not.toContain("—");
    }
  });

  it("orders the ranges so a higher total is never a commoner issue", () => {
    const byMin = [...Object.values(ISSUES)].sort((a, b) => a.range[0] - b.range[0]);
    for (let i = 1; i < byMin.length; i++) {
      expect(byMin[i].chance).toBeLessThan(byMin[i - 1].chance);
    }
  });
});
```

Add to `lib/card/ticket.test.ts`, inside the existing top-level `describe("drawTicket", ...)`:

```ts
  it("prints the odds per roll, not as a share of cards", () => {
    const { ctx, texts } = makeStubCtx();
    drawTicket(ctx, cardFor("odds-line", "firstDay"), CARD_W, CARD_H, FONTS);

    // The origin line and the odds line are drawn at the same y, left and
    // right aligned, so wordAt() returns both concatenated in x order.
    const row = wordAt(texts, CARD_H - CARD_H * 0.042);
    expect(row).toContain("12.5% PER ROLL");
    expect(row).not.toContain("OF CARDS");
  });

  it("keeps the odds line inside the column reserved for it", () => {
    // "0.06% PER ROLL" is the longest of the five. maxIssue (w * 0.36) is
    // the reserved width, and the hairline rule above the row is drawn
    // from exactly Rt - maxIssue, so overrunning it would visibly cross
    // the rule's left end.
    const { ctx, texts } = makeStubCtx();
    drawTicket(ctx, cardFor("odds-width", "inverted"), CARD_W, CARD_H, FONTS);

    const y = CARD_H - CARD_H * 0.042;
    const oddsChars = texts.filter((t) => Math.abs(t.y - y) < 0.01 && t.x > CARD_W * 0.5);
    expect(oddsChars.length).toBeGreaterThan(0);
    const leftmost = Math.min(...oddsChars.map((t) => t.x));
    expect(leftmost).toBeGreaterThanOrEqual(CARD_W * 0.903 - CARD_W * 0.36);
  });
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
npm test -- lib/card/issues.test.ts lib/card/ticket.test.ts
```

Expected: FAIL. `issues.test.ts` fails on `ISSUES.definitive.chance` being undefined; `ticket.test.ts` fails on the row containing `OF CARDS`.

- [ ] **Step 4: Change `Issue` and `CardData` in `lib/card/types.ts`**

Replace the `Issue` type and add one field to `CardData`:

```ts
export type Issue = {
  key: IssueKey;
  /** Shown on the card and in the gallery. */
  name: string;
  /**
   * Exact per-roll probability as a percentage, e.g. 12.495713. Comes from
   * DICE_BANDS and is asserted against an exhaustive enumeration of every
   * possible roll. Tested, never displayed: render `label` instead.
   */
  chance: number;
  /** The rounded string that renders, e.g. "12.5%". */
  label: string;
  /** The inclusive pip-total band that produces this issue. */
  range: readonly [number, number];
  /** Five gradient stops for the sticker, or null for the issue that has none. */
  sticker: readonly string[] | null;
  /** Only the rarest issue flips the stock. */
  inverted: boolean;
};
```

In `CardData`, add:

```ts
  /**
   * The three throws that produced this issue. Printed on the card so a
   * downloaded PNG records how it was earned and can be checked against
   * the ladder. Not persisted anywhere: a re-roll produces a new set.
   */
  roll: RollSet;
```

and import `RollSet` at the top of the file if it is declared below `CardData` (it is declared in the same file by Task 1, so no import is needed, but the declaration must appear before use or be hoisted by `type` semantics, which it is).

- [ ] **Step 5: Rewrite `lib/card/issues.ts`**

Replace the imports, the `ISSUES` table, and delete `BANDS` and `issueFrom` entirely:

```ts
import { DICE_BANDS } from "@/lib/card/dice";
import type { Issue, IssueKey } from "@/lib/card/types";

export type { Issue, IssueKey } from "@/lib/card/types";

/**
 * The rarity numbers are not written here. They are read from the dice
 * bands, which are the counted 6d6 distribution, so there is exactly one
 * place a percentage can be wrong. Hand-editing a number into this file is
 * caught by issues.test.ts.
 */
function odds(key: IssueKey): Pick<Issue, "chance" | "label" | "range"> {
  const band = DICE_BANDS.find((b) => b.key === key);
  if (!band) throw new Error(`No dice band declared for issue "${key}"`);
  return { chance: band.chance, label: band.label, range: [band.min, band.max] };
}

/**
 * Named from philately rather than from a loot table.
 *
 * Two reasons. The artefact is a stamp, so the vocabulary is already sitting
 * there. And "common" is a deflating thing to tell half your visitors,
 * where "commemorative" is something a person would repeat out loud.
 *
 * Each issue changes something its name promises. That is a rule for anyone
 * adding a sixth: if the only difference is the gradient, it does not earn a
 * name.
 *
 * Which issue a visitor gets is decided by lib/card/dice.ts, from three
 * throws they make themselves, and is not fixed to their id. Their portrait
 * and serial still are. Identity is permanent, edition is fate.
 */
export const ISSUES: Record<IssueKey, Issue> = {
  definitive: {
    key: "definitive",
    name: "Definitive",
    ...odds("definitive"),
    sticker: null,
    inverted: false,
  },
  commemorative: {
    key: "commemorative",
    name: "Commemorative",
    ...odds("commemorative"),
    sticker: ["#8c8579", "#615b53", "#a49c8e", "#57524a", "#7d766b"],
    inverted: false,
  },
  firstDay: {
    key: "firstDay",
    name: "First day",
    ...odds("firstDay"),
    sticker: ["#2f6a88", "#63b6cf", "#bfe8ef", "#4b93bb", "#27596f"],
    inverted: false,
  },
  misprint: {
    key: "misprint",
    name: "Misprint",
    ...odds("misprint"),
    sticker: ["#ef548f", "#ef8b6d", "#cfef6b", "#3bf0c1", "#bb4af0"],
    inverted: false,
  },
  inverted: {
    key: "inverted",
    name: "Inverted",
    ...odds("inverted"),
    sticker: ["#6b4d12", "#c9a227", "#fff3c4", "#e8c96a", "#7a5c1e"],
    inverted: true,
  },
};
```

The `hashWith` / `mulberry32` import at the top of the old file goes with `issueFrom`.

- [ ] **Step 6: Change the odds string in `lib/card/ticket.ts`**

At line 509, change one argument. Nothing around it moves:

```ts
  tracked(ctx, `${data.issue.label} PER ROLL`, Rt, shareY, w * 0.0028, "right");
```

Update the comment block directly above it so it explains the new claim:

```ts
  // the odds: the single most interesting fact on the card, so it gets a
  // hairline rule of its own and a size that actually reads, rather than
  // the footnote-sized veryFaint line every other stub value uses.
  //
  // Stated per roll, not as a share of all cards. Rolls are unlimited, so
  // "0.06% of cards" would be false: it is the chance of any one roll
  // landing here, and a patient visitor can hold a black card eventually.
```

- [ ] **Step 7: Update the two test factories**

In `lib/card/ticket.test.ts`, change `cardFor` (around line 143) and add the constant above it:

```ts
/* A fixture roll totalling 21. Deliberately independent of the issue key
   the factory is asked for: drawTicket never derives the issue from the
   roll, it prints both, so a fixture is free to pair any roll with any
   issue. The gallery specimens do the same thing for the same reason. */
const FIXTURE_ROLL: RollSet = [
  [3, 4],
  [5, 2],
  [6, 1],
];

function cardFor(id: string, key: IssueKey): CardData {
  return {
    visitorId: id,
    name: "Visitor",
    serial: serialFrom(id),
    issue: ISSUES[key],
    origin: "Bengaluru, IN",
    city: "Bengaluru",
    date: "23 Aug 2026",
    roll: FIXTURE_ROLL,
  };
}
```

Add `RollSet` to the existing type import at the top of the file:

```ts
import type { CardData, IssueKey, RollSet } from "./types";
```

Apply the identical change to `cardFor` in `lib/card/ticket.scale.test.ts` (around line 245), including the same `FIXTURE_ROLL` constant and the `RollSet` import.

- [ ] **Step 8: Update `IssueGallery.tsx`**

In the `drawTicket` call's inline `CardData` (around line 46), add the roll. Put it beside the existing comment about specimens showing their own issue:

```tsx
        // The specimen shows its own issue, not the one its id happens to
        // roll: ISSUES[spec.key], never issueFromTotal(...). The roll below
        // is a fixed prop for the same reason, so the six specimens are
        // identical for every visitor.
        issue: ISSUES[spec.key],
        roll: SPECIMEN_ROLL,
```

and declare it beside `SPECIMENS`:

```tsx
/* One fixed roll for every specimen. The gallery is showing what each issue
   looks like, not how it was won, and a random roll here would make the six
   cards differ between visitors for no reason. */
const SPECIMEN_ROLL: RollSet = [
  [3, 4],
  [5, 2],
  [6, 1],
];
```

Change the caption (around line 78) from the share to the label. The range line comes in Task 7:

```tsx
      <p className="font-mono text-2xs uppercase tracking-label text-subtle">
        {issue.label} per roll
      </p>
```

Add `RollSet` to the type import at the top of the file.

- [ ] **Step 9: Give `CardMinter` an interim roll**

`issueFrom` is gone, so `buildData` needs a roll. This is a placeholder with no UI, replaced wholesale in Task 5. Mark it so nobody ships it by accident.

Replace the `issueFrom` import:

```ts
import { ISSUES } from "@/lib/card/issues";
import { issueFromTotal, pipTotal, rollPair } from "@/lib/card/dice";
import type { CardData, RollSet } from "@/lib/card/types";
```

Add the state, next to the existing `useState` calls:

```ts
  /* INTERIM (Task 5 replaces this with <DiceRoller>): one silent set of
     three throws made on mount, so the card still renders while the dice UI
     is being built. Nothing about this is user-visible yet. */
  const [roll] = useState<RollSet>(() => [
    rollPair(Math.random),
    rollPair(Math.random),
    rollPair(Math.random),
  ]);
```

And in `buildData`:

```ts
      issue: ISSUES[issueFromTotal(pipTotal(roll))],
      roll,
```

Add `roll` to the `useCallback` dependency array.

- [ ] **Step 10: Run the full suite**

```bash
npm test
```

Expected: PASS, including the two new `ticket.test.ts` cases. The passing count in `ticket.test.ts` and `ticket.scale.test.ts` must be the baseline from Step 1 plus the two new cases. If any pre-existing assertion in those files fails, a draw call moved: revert Step 6 and investigate, because this task must not shift a single canvas call index.

- [ ] **Step 11: Verify the build and the gates**

```bash
npm run lint && npm run build && ./scripts/verify-simplification.sh
```

Expected: all green. The build is the real check that no `.share` reference survives anywhere.

- [ ] **Step 12: Commit**

```bash
git add lib/card/types.ts lib/card/issues.ts lib/card/issues.test.ts lib/card/ticket.ts lib/card/ticket.test.ts lib/card/ticket.scale.test.ts components/card/IssueGallery.tsx components/card/CardMinter.tsx
git commit -m "Take the issue from the dice, and state odds per roll

Issue.share was doing two jobs badly: band width for the 1d100 walk that
just got deleted, and the string printed on the card. Both jobs changed,
so it is replaced rather than renamed. chance is exact and tested, label
is what renders, and both are read from DICE_BANDS so a percentage can
only be wrong in one place.

Rolls are unlimited, which makes 'percent of cards' a false claim. Every
surface now says per roll instead.

CardMinter rolls silently on mount for now. The dice UI lands next.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Print the roll on the card

**Files:**
- Modify: `lib/card/ticket.ts:479-491` (the origin line)
- Modify: `lib/card/ticket.test.ts` (new cases)

**Interfaces:**
- Consumes: `pipTotal`, `CardData.roll` from Tasks 1 and 2.
- Produces: nothing new. The card face now reads `BENGALURU, IN · ROLLED 27`.

The downloaded PNG has to stand alone in a timeline with no page around it. It already carries who (portrait, name), which (issue), and where from (serial, origin, the `SHASHWA7.IN` row). This adds how.

**Why the date leaves this line.** `BENGALURU, IN · 23 AUG 2026 · ROLLED 27` is 39 characters. At `w * 0.022` with `w * 0.0028` tracking that measures about 707px against the roughly 511px of clear column before the odds row, so it would shrink to about `w * 0.0145` and land visibly smaller than the neighbouring values. The postmark cancel directly above already prints the day, month and year, so the date on this line was always a duplicate. Dropping it gives `BENGALURU, IN · ROLLED 27`, 25 characters, about 454px, which fits at full size. The no-origin branch keeps the date, because then nothing else on that row would carry one.

- [ ] **Step 1: Write the failing test**

Add to `lib/card/ticket.test.ts`, inside `describe("drawTicket", ...)`:

```ts
  it("prints the roll total on the origin line", () => {
    const { ctx, texts } = makeStubCtx();
    const data = { ...cardFor("roll-line", "definitive"), roll: FIXTURE_ROLL };
    drawTicket(ctx, data, CARD_W, CARD_H, FONTS);

    const row = wordAt(texts, CARD_H - CARD_H * 0.042);
    expect(row).toContain("BENGALURU, IN");
    expect(row).toContain("ROLLED 21");
  });

  it("drops the date from the origin line, since the postmark above already prints it", () => {
    const { ctx, texts } = makeStubCtx();
    drawTicket(ctx, cardFor("roll-nodate", "definitive"), CARD_W, CARD_H, FONTS);

    const row = wordAt(texts, CARD_H - CARD_H * 0.042);
    expect(row).toContain("BENGALURU, IN");
    expect(row).not.toContain("23 AUG 2026");
  });

  it("keeps the date on the origin line when there is no origin to print", () => {
    const { ctx, texts } = makeStubCtx();
    const data = { ...cardFor("roll-noorigin", "definitive"), origin: null };
    drawTicket(ctx, data, CARD_W, CARD_H, FONTS);

    const row = wordAt(texts, CARD_H - CARD_H * 0.042);
    expect(row).toContain("23 AUG 2026");
    expect(row).toContain("ROLLED 21");
  });

  it("prints the real total, not the fixture's", () => {
    const { ctx, texts } = makeStubCtx();
    const sixes: RollSet = [
      [6, 6],
      [6, 6],
      [6, 6],
    ];
    drawTicket(
      ctx,
      { ...cardFor("roll-perfect", "inverted"), roll: sixes },
      CARD_W,
      CARD_H,
      FONTS
    );

    expect(wordAt(texts, CARD_H - CARD_H * 0.042)).toContain("ROLLED 36");
  });

  it("shrinks the origin line rather than running it under the odds column", () => {
    // A long city plus the roll suffix is the case that overruns. The
    // hairline rule above the odds row starts at Rt - maxIssue, so the
    // origin line must end before that.
    const { ctx, texts, calls } = makeStubCtx();
    const data = { ...cardFor("roll-long", "definitive"), origin: "Sankt-Peterburg, RU" };
    drawTicket(ctx, data, CARD_W, CARD_H, FONTS);

    const y = CARD_H - CARD_H * 0.042;
    const originChars = texts.filter((t) => Math.abs(t.y - y) < 0.01 && t.x < CARD_W * 0.5);
    expect(originChars.length).toBeGreaterThan(0);

    // Recover the font size settled on before the origin run, the same way
    // the share-row and long-name tests above do.
    const firstCall = `fillText(${originChars[0].x},${originChars[0].y})`;
    const index = calls.indexOf(firstCall);
    let originFont: string | undefined;
    for (let i = index; i >= 0; i--) {
      if (calls[i].startsWith("font=")) {
        originFont = calls[i].slice("font=".length);
        break;
      }
    }
    expect(originFont).toBeDefined();
    const px = parseFloat(originFont!);

    // The stub models measureText as chars * px * 0.56; tracked() adds
    // w * 0.0028 of spacing per character on top of that.
    const text = "SANKT-PETERBURG, RU · ROLLED 21";
    const width = Array.from(text).length * (px * 0.56 + CARD_W * 0.0028);
    const L = CARD_W * 0.097;
    const oddsColumnLeft = CARD_W * 0.903 - CARD_W * 0.36;
    expect(L + width).toBeLessThanOrEqual(oddsColumnLeft);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -- lib/card/ticket.test.ts
```

Expected: FAIL. The row contains `23 AUG 2026` and does not contain `ROLLED 21`.

- [ ] **Step 3: Change the origin line in `lib/card/ticket.ts`**

Add the import at the top of the file:

```ts
import { pipTotal } from "@/lib/card/dice";
```

Replace lines 479 to 491 (the comment block, the `ctx.font` assignment and the if/else) with:

```ts
  // The place a visitor is minting from, and the roll that decided their
  // issue, on one row.
  //
  // The date used to sit on this line too. It left when the roll arrived:
  // the postmark cancel directly above already prints day, month and year,
  // so it was a duplicate, and keeping all three ran the row to 39
  // characters, which shrank it well below the size the neighbouring stub
  // values read at. The no-origin branch keeps it, because on that card
  // nothing else on this row would carry a date.
  //
  // shrinkToFit is a guard, not the normal case: at a typical origin this
  // settles at the full w * 0.022 and never engages. It exists because city
  // names have no length limit and this row now has a right-hand neighbour
  // (the odds column) it must not run under.
  ctx.fillStyle = P.faint;
  ctx.textAlign = "left";
  const stubLine = (
    data.origin ? `${data.origin} · ROLLED ${pipTotal(data.roll)}`
                : `${data.date} · ROLLED ${pipTotal(data.roll)}`
  ).toUpperCase();
  // tracked() adds its spacing outside measureText, so the budget handed to
  // shrinkToFit has to have that spacing taken out of it first or the line
  // fits on paper and overruns on screen.
  const stubSpacing = w * 0.0028;
  const stubBudget =
    Rt - maxIssue - L - w * 0.02 - Array.from(stubLine).length * stubSpacing;
  shrinkToFit(ctx, stubLine, fonts.mono, w * 0.022, w * 0.014, w * 0.0006, stubBudget);
  tracked(ctx, stubLine, L, h - h * 0.042, stubSpacing);
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test -- lib/card/ticket.test.ts lib/card/ticket.scale.test.ts
```

Expected: PASS, including the five new cases and every pre-existing one.

`shrinkToFit` replaces a single `ctx.font =` assignment with one or more, but `measureText` is not recorded by the stub and no draw call is added or removed. If a pre-existing positional assertion fails here, stop and report it rather than adjusting the assertion: it means the change did move a call index and the approach needs rethinking.

- [ ] **Step 5: Verify the gates**

```bash
npm test && npm run lint && npm run build && ./scripts/verify-simplification.sh
```

- [ ] **Step 6: Commit**

```bash
git add lib/card/ticket.ts lib/card/ticket.test.ts
git commit -m "Print the roll on the card, and drop the duplicated date

A downloaded PNG has to stand alone with no page around it. It already
said who, which and where from; this adds how it was earned.

The date leaves the origin line because the postmark directly above
prints it already, and carrying both plus the roll ran the row to 39
characters, which shrank it well under the neighbouring values. Cards
with no origin keep it, since nothing else on that row would show one.

Text inside an existing tracked() call rather than drawn pips: the
ticket tests index canvas calls by ordinal, so drawing new marks would
shift every assertion after them. Pips are worth doing on their own.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: The reveal timeline as data

**Files:**
- Create: `lib/card/revealSequence.ts`
- Create: `lib/card/revealSequence.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `REVEAL_BUDGET_MS = 2000`; `FULL_REVEAL: RevealTimeline`; `SHORT_REVEAL: RevealTimeline`; `type RevealStage = { at: number; duration: number }`; `type RevealTimeline = { backdropIn, cardForward, print, issueStamp, backdropOut, total }`; `timelineTotal(t: RevealTimeline): number`.

The spec commits to a reveal under two seconds. Putting the timings in a component makes that a hope. Putting them here makes it a test.

- [ ] **Step 1: Write the failing test**

Create `lib/card/revealSequence.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  FULL_REVEAL,
  REVEAL_BUDGET_MS,
  SHORT_REVEAL,
  timelineTotal,
  type RevealTimeline,
} from "./revealSequence";

const TIMELINES: [string, RevealTimeline][] = [
  ["full", FULL_REVEAL],
  ["short", SHORT_REVEAL],
];

describe("the reveal fits its budget", () => {
  it.each(TIMELINES)("%s stays under two seconds", (_name, timeline) => {
    expect(timelineTotal(timeline)).toBeLessThan(REVEAL_BUDGET_MS);
  });

  it("reports a total that matches the last stage to finish", () => {
    for (const [name, timeline] of TIMELINES) {
      const stages = [
        timeline.backdropIn,
        timeline.cardForward,
        timeline.print,
        timeline.issueStamp,
        timeline.backdropOut,
      ];
      const last = Math.max(...stages.map((s) => s.at + s.duration));
      expect(timelineTotal(timeline), name).toBe(last);
    }
  });
});

describe("the stages are ordered", () => {
  it.each(TIMELINES)("%s prints before it stamps the issue", (_name, timeline) => {
    const printEnds = timeline.print.at + timeline.print.duration;
    expect(timeline.issueStamp.at).toBeGreaterThanOrEqual(printEnds);
  });

  it("brings the card forward before it finishes printing, so the two overlap", () => {
    const printEnds = FULL_REVEAL.print.at + FULL_REVEAL.print.duration;
    expect(FULL_REVEAL.cardForward.at).toBeLessThan(printEnds);
  });

  it("releases the backdrop only after the issue has landed", () => {
    const stampEnds = FULL_REVEAL.issueStamp.at + FULL_REVEAL.issueStamp.duration;
    expect(FULL_REVEAL.backdropOut.at).toBeGreaterThanOrEqual(stampEnds);
  });

  it("starts every stage at or after zero and gives each a real duration", () => {
    for (const [name, timeline] of TIMELINES) {
      for (const [stage, value] of Object.entries(timeline)) {
        if (stage === "total") continue;
        const s = value as { at: number; duration: number };
        expect(s.at, `${name}.${stage}.at`).toBeGreaterThanOrEqual(0);
        expect(s.duration, `${name}.${stage}.duration`).toBeGreaterThan(0);
      }
    }
  });
});

describe("the short timeline is the cheap one", () => {
  it("skips the backdrop entirely", () => {
    expect(SHORT_REVEAL.backdropIn.duration).toBe(0.000001);
  });

  it("finishes sooner than the full sequence", () => {
    expect(timelineTotal(SHORT_REVEAL)).toBeLessThan(timelineTotal(FULL_REVEAL));
  });
});
```

Note the odd assertion on `backdropIn.duration`: the short timeline still declares every stage so both shapes are identical and a consumer never has to branch on shape, but its backdrop stages carry a duration so small they are effectively absent while still satisfying the "every duration is positive" invariant above. Implement it exactly as written.

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- lib/card/revealSequence.test.ts
```

Expected: FAIL, cannot resolve `./revealSequence`.

- [ ] **Step 3: Write `lib/card/revealSequence.ts`**

```ts
/**
 * The reveal timeline, as data.
 *
 * The card's reveal is choreographed across five overlapping stages, and it
 * is committed to finishing in under two seconds. Timings scattered through
 * a component make that a hope; here it is an assertion, and
 * revealSequence.test.ts fails the build if a stage grows past the budget.
 *
 * It also keeps the two variants from drifting. The full ceremony plays
 * once, on a visitor's first completed set; every re-roll after that gets
 * the short one, because someone rolling repeatedly for a rare issue should
 * not sit through a backdrop each time. Both are described by the same
 * shape, so the component reads one table and never branches on which it
 * was handed.
 *
 * Kept DOM-free like the rest of lib/card. Nothing here reads window or
 * schedules anything: it is numbers, and the component turns them into
 * motion.
 */

/** Milliseconds from the moment the third pair of dice come to rest. */
export type RevealStage = {
  /** Offset from t = 0. */
  at: number;
  duration: number;
};

export type RevealTimeline = {
  backdropIn: RevealStage;
  cardForward: RevealStage;
  /** The existing print reveal in lib/card/reveal.ts, which runs 900ms. */
  print: RevealStage;
  issueStamp: RevealStage;
  backdropOut: RevealStage;
};

/** The ceiling the whole sequence is designed against. */
export const REVEAL_BUDGET_MS = 2000;

/** How long the print reveal itself takes. Mirrors --duration-print. */
const PRINT_MS = 900;

/** The beat between the card finishing printing and the issue landing. */
const STAMP_BEAT_MS = 40;

/**
 * A duration small enough to be imperceptible, used where a stage has to
 * exist for the shape to stay uniform but must not actually play. Not zero,
 * so "every stage has a real duration" stays a meaningful invariant rather
 * than one with an exception carved into it.
 */
const ABSENT = 0.000001;

export const FULL_REVEAL: RevealTimeline = {
  backdropIn: { at: 0, duration: 160 },
  // Overlaps the backdrop, and starts before the print so the card is
  // already settled by the time ink appears on it.
  cardForward: { at: 80, duration: 320 },
  // The 240ms of empty frame before this is deliberate anticipation. There
  // is nothing behind the canvas during it: a placeholder colour would show
  // through the card's real tear-line cuts, and a per-issue stock colour
  // would give away an Inverted result before it printed.
  print: { at: 240, duration: PRINT_MS },
  issueStamp: { at: 240 + PRINT_MS + STAMP_BEAT_MS, duration: 220 },
  backdropOut: { at: 240 + PRINT_MS + STAMP_BEAT_MS + 220 + 40, duration: 280 },
};

export const SHORT_REVEAL: RevealTimeline = {
  backdropIn: { at: 0, duration: ABSENT },
  cardForward: { at: 0, duration: ABSENT },
  print: { at: 0, duration: PRINT_MS },
  issueStamp: { at: PRINT_MS + STAMP_BEAT_MS, duration: 220 },
  backdropOut: { at: PRINT_MS + STAMP_BEAT_MS + 220, duration: ABSENT },
};

/** When the last stage finishes. */
export function timelineTotal(timeline: RevealTimeline): number {
  return Math.max(
    ...Object.values(timeline).map((stage) => stage.at + stage.duration)
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- lib/card/revealSequence.test.ts
```

Expected: PASS. `timelineTotal(FULL_REVEAL)` is 1720, `timelineTotal(SHORT_REVEAL)` is about 1160.

- [ ] **Step 5: Commit**

```bash
git add lib/card/revealSequence.ts lib/card/revealSequence.test.ts
git commit -m "Put the reveal timeline in a testable table

The reveal is committed to finishing under two seconds. Timings spread
through a component make that a hope; a table with a test makes it a
build failure.

Both variants share one shape, so the component reads a timeline and
never branches on which one it got. The full ceremony plays on a
visitor's first completed set; re-rolls get the short one, because
somebody rolling repeatedly for a rare issue should not sit through a
backdrop every attempt.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The dice roller

**Files:**
- Modify: `lib/motionVariants.ts` (append tokens)
- Modify: `app/globals.css` (add `--duration-throw`)
- Create: `components/card/DiceRoller.tsx`
- Modify: `components/card/CardMinter.tsx` (replace the interim roll and the Mint button)

**Interfaces:**
- Consumes: `rollPair`, `pipTotal`, `issueFromTotal`, `isPerfect` from Task 1; `RollSet`, `Roll` from `types.ts`.
- Produces: `<DiceRoller onComplete={(set: RollSet) => void} />`; motion tokens `duration.throw`, `ease.throw`, `spring.card`, `diceThrowVariants`, `cardForwardVariants`, `issueStampVariants`.

`DiceRoller` owns only the throwing. It unmounts the moment the third roll completes, so it needs no reset path of its own: "Roll again" lives in `CardMinter` beside the download, clears the roll, and mounts a fresh `DiceRoller`.

- [ ] **Step 1: Add the motion tokens to `lib/motionVariants.ts`**

In the `ease` object:

```ts
export const ease = {
  /** Emil Kowalski's published strong ease-out. The single UI curve. */
  out: [0.23, 1, 0.32, 1] as const,
  /**
   * A thrown object: leaves fast, hangs, drops back hard. Not a UI curve
   * and must not be used as one. The only reason a second easing exists in
   * this file is that no ease-out can describe an arc that comes back down.
   */
  throw: [0.33, 0.02, 0.62, 1] as const,
} as const;
```

In the `duration` object:

```ts
  /**
   * The dice throw. Outside the sub-300ms UI budget, and unlike
   * --duration-sweep and --duration-print it cannot claim to be "not a
   * response to input", because it plainly is one. The justification is
   * different: this duration is the physics rather than a transition. A die
   * that completes its arc in 300ms does not read as a thrown object at
   * all, it reads as a glyph being swapped.
   */
  throw: 0.7,
```

Add a springs block after `stagger`:

```ts
/**
 * The one spring in the codebase.
 *
 * Everything else here is a duration plus ease.out, because everything else
 * is a state changing. The card arriving after a roll is an object with
 * mass coming to rest, which is the one thing an ease-out cannot express:
 * it has no settle. Confined to that single movement. In particular the
 * issue stamp deliberately does not use it, because a stamp that bounces
 * reads as cartoonish, and that moment is meant to feel like something
 * being certified.
 */
export const spring = {
  card: { type: "spring", stiffness: 260, damping: 26 } as const,
} as const;
```

And the three variants at the end of the variants section:

```ts
/** Two dice leaving a button, tumbling, and landing back on it. */
export const diceThrowVariants: Variants = {
  rest: { y: 0, x: 0, rotate: 0, scaleX: 1, scaleY: 1 },
  airborne: {
    y: [0, -90, 0],
    x: [0, 10, 18],
    scaleX: [1, 1, 1.15, 1],
    scaleY: [1, 1, 0.85, 1],
    transition: { duration: duration.throw, ease: ease.throw, times: [0, 0.45, 0.85, 1] },
  },
};

/** The finished card arriving. The only consumer of `spring.card`. */
export const cardForwardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, rotate: -1.5 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: spring.card },
};

/** The issue name pressed on, like a rubber stamp. Lands and stops. */
export const issueStampVariants: Variants = {
  hidden: { opacity: 0, scale: 1.08, rotate: -3 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.22, ease: ease.out },
  },
};
```

- [ ] **Step 2: Mirror the duration in `app/globals.css`**

After `--duration-print`:

```css
  /* The dice throw on /card. Outside the sub-300ms UI budget, and unlike
     the two above it cannot claim to be "not a response to input": it is
     one. The justification is that the duration is the physics, not a
     transition. A die that finishes its arc in 300ms reads as a glyph being
     swapped rather than an object being thrown. */
  --duration-throw: 700ms;
```

- [ ] **Step 3: Verify the tokens pass the gates before building on them**

```bash
npm run lint && ./scripts/verify-simplification.sh
```

Expected: green. `verify-simplification.sh` checks C05 (`no transition-all`) and C06 (`no tw-animate keyframes`) among others; nothing added here trips them.

- [ ] **Step 4: Write `components/card/DiceRoller.tsx`**

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { diceThrowVariants, tapPress } from "@/lib/motionVariants";
import { pipTotal, rollPair } from "@/lib/card/dice";
import { prefersReducedMotion } from "@/lib/card/reveal";
import type { Die, Roll, RollSet } from "@/lib/card/types";

/** Pip layout per face, on a 3x3 grid indexed 0 to 8. */
const PIPS: Record<Die, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Drawn as circles rather than set as the unicode dice characters, which
 * render at wildly different weights and baselines across platforms. This
 * is the same reason the card prints its roll as text rather than glyphs.
 */
function DieFace({ value }: { value: Die }) {
  return (
    <svg viewBox="0 0 30 30" className="h-7 w-7" aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="27"
        height="27"
        rx="6"
        className="fill-background stroke-foreground"
        strokeWidth="2"
      />
      {PIPS[value].map((slot) => (
        <circle
          key={slot}
          cx={8 + (slot % 3) * 7}
          cy={8 + Math.floor(slot / 3) * 7}
          r="2.1"
          className="fill-foreground"
        />
      ))}
    </svg>
  );
}

const randomDie = (): Die => (Math.floor(Math.random() * 6) + 1) as Die;

export default function DiceRoller({
  onComplete,
}: {
  onComplete: (set: RollSet) => void;
}) {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [face, setFace] = useState<Roll>([1, 1]);
  const [throwing, setThrowing] = useState(false);
  const controls = useAnimationControls();
  const flickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const throwDice = useCallback(async () => {
    if (throwing || rolls.length >= 3) return;
    setThrowing(true);

    const result = rollPair(Math.random);
    const reduced = prefersReducedMotion(window);

    if (!reduced) {
      /* The faces churn while the dice are in the air so the result cannot
         be read mid-flight. It is cosmetic: `result` was decided before the
         animation started and nothing here can change it. */
      flickerRef.current = setInterval(() => setFace([randomDie(), randomDie()]), 60);
      await controls.start("airborne");
      if (flickerRef.current) clearInterval(flickerRef.current);
      flickerRef.current = null;
      controls.set("rest");
    }

    setFace(result);
    const next = [...rolls, result];
    setRolls(next);
    setThrowing(false);

    if (next.length === 3) onComplete(next as unknown as RollSet);
  }, [controls, onComplete, rolls, throwing]);

  const runningTotal = rolls.reduce((n, [a, b]) => n + a + b, 0);
  const nextThrow = Math.min(rolls.length + 1, 3);
  const done = rolls.length === 3;

  return (
    <div className="mt-8">
      <ul className="flex gap-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex h-14 w-[4.5rem] items-center justify-center gap-1 rounded-md border border-border"
          >
            {rolls[i] ? (
              <>
                <DieFace value={rolls[i][0]} />
                <DieFace value={rolls[i][1]} />
              </>
            ) : (
              <span className="font-mono text-2xs uppercase tracking-label text-subtle">
                {i + 1}
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 font-mono text-2xs uppercase tracking-label text-subtle" aria-live="polite">
        {rolls.length === 0
          ? "Three throws decide your issue."
          : done
            ? `Total ${runningTotal}.`
            : `Roll ${rolls.length} of 3: ${rolls[rolls.length - 1][0]} and ${
                rolls[rolls.length - 1][1]
              }. Running total ${runningTotal}.`}
      </p>

      <div className="mt-4 flex items-center gap-3">
        {!done && (
          <motion.button
            type="button"
            onClick={throwDice}
            disabled={throwing}
            whileTap={tapPress}
            aria-label={`Throw the dice, roll ${nextThrow} of 3`}
            className="relative flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-base font-medium text-accent-foreground transition-colors duration-base ease-out hover:bg-accent-hover disabled:opacity-70"
          >
            <span>Roll</span>
            <motion.span
              className="flex gap-1"
              variants={diceThrowVariants}
              initial="rest"
              animate={controls}
            >
              <DieFace value={face[0]} />
              <DieFace value={face[1]} />
            </motion.span>
          </motion.button>
        )}

      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire it into `CardMinter.tsx`**

Delete the interim `useState<RollSet>` from Task 2 Step 9 and its comment. Replace with nullable state:

```ts
  const [roll, setRoll] = useState<RollSet | null>(null);
```

`buildData` returns null until there is a roll:

```ts
  const buildData = useCallback((): CardData | null => {
    if (!visitorId || !roll) return null;
    return {
      visitorId,
      name,
      serial: serialFrom(visitorId),
      issue: ISSUES[issueFromTotal(pipTotal(roll))],
      roll,
      origin,
      city,
      date: today(),
    };
  }, [visitorId, name, origin, city, roll]);
```

Replace `minted` with the roll itself: the card exists exactly when `roll` is non-null. Change the render's first branch from the Mint button to:

```tsx
      {!roll ? (
        <DiceRoller onComplete={setRoll} />
      ) : !ready ? (
```

and change the `useEffect` guard from `if (!minted || !ready) return;` to `if (!roll || !ready) return;`, with `roll` in its dependency array in place of `minted`.

Add a `Roll again` control under the Download button, which clears the roll and returns to the dice:

```tsx
          <button
            type="button"
            onClick={() => {
              revealedOnceRef.current = false;
              setRoll(null);
            }}
            className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-base text-foreground transition-colors duration-base ease-out hover:bg-secondary"
          >
            Roll again
          </button>
```

Extend the canvas `aria-label` so a screen reader gets the roll too, since the dice slots are gone by the time the card exists:

```tsx
            aria-label={
              data
                ? `A ${data.issue.name} visitor card, serial ${data.serial}, issued to ${data.name}, from a roll of ${pipTotal(data.roll)}.`
                : "A visitor card"
            }
```

Import what is needed and drop `issueFrom`:

```ts
import DiceRoller from "@/components/card/DiceRoller";
import { issueFromTotal, pipTotal } from "@/lib/card/dice";
import type { CardData, RollSet } from "@/lib/card/types";
```

- [ ] **Step 6: Run the gates**

```bash
npm test && npm run lint && npm run build && ./scripts/verify-simplification.sh
```

Expected: all green. `npm test` covers only `lib/**`, so this task's correctness rests on the build plus the pure modules it consumes.

- [ ] **Step 7: Commit**

```bash
git add lib/motionVariants.ts app/globals.css components/card/DiceRoller.tsx components/card/CardMinter.tsx
git commit -m "Add the dice roller

Two SVG dice on a pill. Three presses, three throws, and the total picks
the issue. Faces churn in flight so a result cannot be read mid-air, and
the churn is cosmetic: the pair was decided before the animation began.

Adds the first spring in the codebase and a second easing, both scoped
and both commented. The 700ms throw sits outside the sub-300ms budget
and cannot borrow the excuse the sweep and print durations use, since a
throw is plainly a response to input. The real reason is that the
duration is the physics: an arc that finishes in 300ms reads as a glyph
being swapped.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: The reveal choreography

**Files:**
- Modify: `components/card/CardMinter.tsx`

**Interfaces:**
- Consumes: `FULL_REVEAL`, `SHORT_REVEAL`, `RevealTimeline` from Task 4; `cardForwardVariants`, `issueStampVariants`, `backdropFadeVariants` from `lib/motionVariants.ts`; `startPrintReveal`, `prefersReducedMotion` from `lib/card/reveal.ts`.
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Add the reveal state**

In `CardMinter`, alongside the existing state:

```ts
  /* Which timeline this reveal runs on. The full ceremony plays once per
     session, on the first completed set. Every re-roll after that gets the
     short one: a visitor throwing repeatedly for a rare issue should not
     sit through the backdrop each attempt. */
  const hasRevealedRef = useRef(false);
  const [timeline, setTimeline] = useState<RevealTimeline>(FULL_REVEAL);
  const [backdrop, setBackdrop] = useState(false);
  const [stamped, setStamped] = useState(false);
```

with the imports:

```ts
import { motion, AnimatePresence } from "motion/react";
import { FULL_REVEAL, SHORT_REVEAL, type RevealTimeline } from "@/lib/card/revealSequence";
import {
  backdropFadeVariants,
  cardForwardVariants,
  issueStampVariants,
} from "@/lib/motionVariants";
```

- [ ] **Step 2: Drive the sequence from the timeline**

Replace the body of the existing draw effect's reveal section. The effect already builds the offscreen canvas; this schedules the stages around `startPrintReveal` instead of calling it immediately.

```ts
    const reducedMotion = prefersReducedMotion(window);
    const active = hasRevealedRef.current ? SHORT_REVEAL : FULL_REVEAL;
    setTimeline(active);
    setStamped(false);

    /* Reduced motion collapses the whole sequence to a crossfade: no
       backdrop, no blur, no spring, no beat. reveal.ts already jumps
       straight to the finished frame in that mode. */
    if (reducedMotion) {
      setBackdrop(false);
      setStamped(true);
      setRevealing(false);
      return startPrintReveal({
        ctx,
        source: off,
        width: pxW,
        height: pxH,
        durationMs,
        reducedMotion: true,
        onDone: () => {
          revealedOnceRef.current = true;
          hasRevealedRef.current = true;
        },
      });
    }

    setRevealing(true);
    const playsBackdrop = active.backdropIn.duration > 1;
    if (playsBackdrop) setBackdrop(true);

    const timers: ReturnType<typeof setTimeout>[] = [];
    let stopPrint: (() => void) | undefined;

    timers.push(
      setTimeout(() => {
        stopPrint = startPrintReveal({
          ctx,
          source: off,
          width: pxW,
          height: pxH,
          durationMs,
          reducedMotion: false,
          onDone: () => {
            revealedOnceRef.current = true;
            hasRevealedRef.current = true;
            setRevealing(false);
          },
        });
      }, active.print.at)
    );

    timers.push(setTimeout(() => setStamped(true), active.issueStamp.at));
    if (playsBackdrop) {
      timers.push(setTimeout(() => setBackdrop(false), active.backdropOut.at));
    }

    return () => {
      timers.forEach(clearTimeout);
      stopPrint?.();
      setBackdrop(false);
    };
```

- [ ] **Step 3: Render the backdrop and lift the card**

Wrap the card block. The backdrop is deliberately not a dialog: it traps nothing, blocks nothing, and releases itself, so it gets no `role`, no focus trap and no escape handler.

```tsx
      <AnimatePresence>
        {backdrop && (
          <motion.div
            variants={backdropFadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={cardForwardVariants}
        initial="hidden"
        animate="visible"
        className={`max-w-[420px] ${backdrop ? "relative z-[60]" : ""}`}
      >
        {/* existing canvas, name field, download and roll-again controls */}
      </motion.div>
```

- [ ] **Step 4: Add the issue announcement**

Directly under the canvas, inside the lifted wrapper:

```tsx
          <AnimatePresence>
            {stamped && data && (
              <motion.p
                variants={issueStampVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 text-2xl font-semibold tracking-tight text-foreground"
              >
                {data.issue.name}
                <span className="mt-1 block font-mono text-2xs uppercase tracking-label text-subtle">
                  {data.issue.label} per roll · you rolled {pipTotal(data.roll)}
                  {isPerfect(data.roll) ? " · a perfect set" : ""}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
```

with `isPerfect` added to the `@/lib/card/dice` import.

- [ ] **Step 5: Run the gates**

```bash
npm test && npm run lint && npm run build && ./scripts/verify-simplification.sh
```

- [ ] **Step 6: Commit**

```bash
git add components/card/CardMinter.tsx
git commit -m "Stage the reveal after the third throw

Backdrop dims and blurs, the card springs forward with a small rotation,
the existing print reveal runs inside it, and the issue name lands late
like a stamp being pressed. Driven entirely off the timeline table, so
the under-two-seconds claim stays something a test can check.

The backdrop is not a dialog. It traps nothing, blocks nothing and
releases itself, so it gets no role, no focus trap and no escape key.

Reduced motion collapses all of it to a crossfade.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Copy, the gallery, and the chatbot's memory

**Files:**
- Modify: `components/card/IssueGallery.tsx` (add the range line, and the section blurb)
- Modify: `app/card/page.tsx` (lede, OG subtitle)
- Modify: `data/agent-memory.md` (lines 184 to 203)

**Interfaces:**
- Consumes: `Issue.label`, `Issue.range` from Task 2.
- Produces: nothing.

Three surfaces currently promise the opposite of what now ships. `data/agent-memory.md` is the Truffy chatbot's system prompt, read at module load by `app/api/chat/route.ts`; CLAUDE.md makes updating it mandatory in the same change as any portfolio fact change.

- [ ] **Step 1: Add the total range to the gallery**

Under the existing label line in `Specimen`:

```tsx
      <p className="font-mono text-2xs uppercase tracking-label text-subtle">
        {issue.label} per roll
      </p>
      <p className="font-mono text-2xs uppercase tracking-label text-subtle">
        Totals {issue.range[0]} to {issue.range[1]}
      </p>
```

And update the section blurb so the gallery reads as a target list:

```tsx
      <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">
        Each one changes something its name promises. The Misprint plate really
        does slip, and the Inverted portrait really is upside down. The number
        under each is what your six dice have to add up to.
      </p>
```

- [ ] **Step 2: Rewrite the lede in `app/card/page.tsx`**

```tsx
        <p className="mt-3 max-w-[56ch] text-base text-muted-foreground">
          Identity is permanent, edition is fate. Your portrait comes from a
          random id kept in this browser, so it is yours and it never changes.
          Which of the five issues it prints on is decided by three throws of
          the dice, and you can roll as many times as you like.
        </p>
```

- [ ] **Step 3: Update the OG subtitle in the same file**

```tsx
const DESCRIPTION =
  "Mint yourself a stamp card. The portrait is drawn in your browser from a random id, the issue is decided by three throws of the dice, and the card downloads as a PNG.";

const CARD_OG = ogUrl({
  title: "Mint a visitor card",
  subtitle: "Identity is permanent, edition is fate.",
  type: "generic",
  label: "Card",
});
```

- [ ] **Step 4: Rewrite `data/agent-memory.md` lines 184 to 203**

Replace that whole section with:

```markdown
## The visitor card (`/card`)

Anyone visiting the site can mint themselves a card: a portrait drawn in their
browser on a perforated stamp, cancelled with a postmark carrying their city and
the date, signed with a name they choose, and downloadable as a PNG.

The framing line is "identity is permanent, edition is fate". The portrait is
generated from a random id kept in that browser's local storage, so a person's
face and serial are stable and do not change between visits. Nothing is stored
on a server, there is no account, and there is no wallet: "mint" is flavour, not
a blockchain.

Which of the five issues the card prints on is not fixed. The visitor throws two
dice three times, and the six pips added together decide it: 6 to 21 is a
Definitive, 22 to 25 a Commemorative, 26 to 29 a First day, 30 to 33 a Misprint,
and 34 or more the Inverted. Those bands are the true 6d6 distribution, so the
chances per roll are 54.6%, 30.9%, 12.5%, 1.9% and 0.06%.

Each issue differs in a way its name promises. The Misprint plate really does
slip, so its frame and portrait print twice slightly out of register. The
Inverted card is printed on black stock with gold ink and its portrait really is
upside down.

If someone asks how to get a rarer one: roll again. Rolls are unlimited and
nothing is remembered between them, so the odds above are per roll rather than a
share of all cards. Rolling three double sixes for a perfect 36 is 1 in 46,656.
```

- [ ] **Step 5: Check the em-dash rule and the gates**

```bash
grep -n "—" app/card/page.tsx components/card/IssueGallery.tsx data/agent-memory.md components/card/DiceRoller.tsx
```

Expected: no output.

```bash
npm test && npm run lint && npm run build && ./scripts/verify-simplification.sh
```

Expected: all green.

- [ ] **Step 6: Confirm no stale claim survives anywhere**

```bash
grep -rn "of cards\|no re-roll\|does not change\|issueFrom\|\.share" app components lib data | grep -v node_modules
```

Expected: no hits describing the card. Any hit is a surface still making the old promise.

- [ ] **Step 7: Commit**

```bash
git add app/card/page.tsx components/card/IssueGallery.tsx data/agent-memory.md
git commit -m "Say what the card now does, on every surface that claimed otherwise

Three places promised the opposite of what ships: the page lede said the
issue does not change, and agent-memory.md told Truffy there is no
re-roll and the card is theirs rather than a pull. Both are now false.

The gallery gains each issue's dice range, which turns it from a list of
what exists into a list of what to roll for.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Verification

After Task 7, the whole feature is in. Confirm end to end:

```bash
npm test && npm run lint && npm run build && ./scripts/verify-simplification.sh
```

Then check by hand, since none of this is covered by the node-environment tests:

1. `/card` opens on three empty slots and a Roll pill with two dice on it.
2. Three presses throw the dice; faces are unreadable in flight and land on a result.
3. After the third, the backdrop dims and blurs, the card springs forward, prints top to bottom, and the issue name lands late.
4. The whole reveal is under two seconds.
5. "Roll again" returns to the dice, and the second reveal skips the backdrop.
6. The downloaded PNG carries the portrait, name, serial, issue, origin, `ROLLED n`, and the per-roll odds.
7. With reduced motion enabled at the OS level, everything crossfades and nothing tumbles or springs.
