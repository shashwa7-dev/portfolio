import type { Kills, Kind } from "@games/vice-hunt";

/** The callout for a kill that chains onto the last (the game's `streak`:
 *  kills each within 1.5 s of the one before). A lone kill gets none. */
export function callout(streak: number): "DOUBLE!" | "TRIPLE!" | null {
  if (streak >= 3) return "TRIPLE!";
  if (streak === 2) return "DOUBLE!";
  return null;
}

/** Hits over shots as a whole percentage; 0 before the first shot. */
export function accuracy(hits: number, shots: number): number {
  return shots > 0 ? Math.round((hits / shots) * 100) : 0;
}

/** The pop-up's name for an animal: "+1" then this. */
export function killLabel(kind: Kind): string {
  return kind.toUpperCase();
}

/** One hunt's numbers, for the results card. */
export type Tally = { shots: number; hits: number; kills: Kills; bestStreak: number };

export function emptyTally(): Tally {
  return { shots: 0, hits: 0, kills: { rabbit: 0, iguana: 0, flamingo: 0, bigfoot: 0 }, bestStreak: 0 };
}

export function recordShot(t: Tally, hit: boolean): Tally {
  return { ...t, shots: t.shots + 1, hits: t.hits + (hit ? 1 : 0) };
}

export function recordKill(t: Tally, kind: Kind, streak: number): Tally {
  return {
    ...t,
    kills: { ...t.kills, [kind]: t.kills[kind] + 1 },
    bestStreak: Math.max(t.bestStreak, streak),
  };
}
