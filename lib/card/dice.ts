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
