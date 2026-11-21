import type { Kind } from "@games/vice-hunt";
import type { Tally } from "@/lib/gta6/streak";

/** Each animal's points for a lone kill (spec, revision 3). */
export const POINTS: Record<Kind, number> = { rabbit: 100, iguana: 150, flamingo: 200, bigfoot: 1000 };

/** One kill's points at its streak (the game's count of kills each within
 *  1.5 s of the one before): a DOUBLE adds 50%, a TRIPLE or more adds 100%. */
export function scoreFor(kind: Kind, streak: number): number {
  const bonus = streak >= 3 ? 2 : streak === 2 ? 1.5 : 1;
  return Math.round(POINTS[kind] * bonus);
}

/** A hunt's score: every kill at the streak it was made on. */
export function totalScore(tally: Pick<Tally, "log">): number {
  return tally.log.reduce((sum, k) => sum + scoreFor(k.kind, k.streak), 0);
}
