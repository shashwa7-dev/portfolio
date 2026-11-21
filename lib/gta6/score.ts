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
