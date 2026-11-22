import type { Tally } from "@/lib/gta6/streak";

/** One kill's points at its streak (the game's count of kills each within
 *  1.5 s of the one before): a DOUBLE adds 50%, a TRIPLE or more adds 100%. */
export function scoreFor(base: number, streak: number): number {
  const bonus = streak >= 3 ? 2 : streak === 2 ? 1.5 : 1;
  return Math.round(base * bonus);
}

/** A hunt's score: kills and penalties folded in order, never below zero. */
export function totalScore(tally: Pick<Tally, "entries">): number {
  return tally.entries.reduce((acc, e) => Math.max(0, acc + e.points), 0);
}

/** The results card's lines: what each kind earned at its base points (its
 *  kills) or cost (its penalties), what streaks added on top, and what the
 *  zero floor kept when a penalty would have taken the score below 0. They
 *  add up to `totalScore`. */
export type Breakdown = { earned: Record<string, number>; streakBonus: number; floor: number };

export function breakdown(
  tally: Pick<Tally, "entries" | "kills">,
  pointsFor: (kind: Tally["entries"][number]["kind"]) => number,
): Breakdown {
  const earned: Record<string, number> = {};
  let bases = 0;
  for (const [kind, n] of Object.entries(tally.kills) as [Tally["entries"][number]["kind"], number][]) {
    earned[kind] = n * pointsFor(kind);
    bases += earned[kind];
  }
  let gained = 0;
  let raw = 0;
  for (const e of tally.entries) {
    raw += e.points;
    if (e.points < 0) earned[e.kind] = (earned[e.kind] ?? 0) + e.points;
    else gained += e.points;
  }
  return { earned, streakBonus: gained - bases, floor: totalScore(tally) - raw };
}
