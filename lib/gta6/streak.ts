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

/** One kill, at the streak it was made on. */
export type Kill = { kind: Kind; streak: number };

/** One scoring event: signed points, already streak-weighted. */
export type Entry = { kind: Kind; points: number };

/** One hunt's numbers, for the HUD and the results card. `log` is every kill
 *  in order (the HUD lights the latest chip); `entries` is every kill and
 *  penalty in order, which the score folds. `met` lists kinds hit at least once. */
export type Tally = {
  shots: number;
  hits: Record<Kind, number>;
  kills: Kills;
  met: readonly Kind[];
  bestStreak: number;
  log: readonly Kill[];
  entries: readonly Entry[];
};

function zeros(kinds: readonly Kind[]): Record<Kind, number> {
  return Object.fromEntries(kinds.map((k) => [k, 0])) as Record<Kind, number>;
}

export function emptyTally(kinds: readonly Kind[]): Tally {
  return { shots: 0, hits: zeros(kinds), kills: zeros(kinds), met: [], bestStreak: 0, log: [], entries: [] };
}

export function recordShot(t: Tally): Tally {
  return { ...t, shots: t.shots + 1 };
}

export function recordHit(t: Tally, kind: Kind): Tally {
  return { ...t, hits: { ...t.hits, [kind]: t.hits[kind] + 1 }, met: t.met.includes(kind) ? t.met : [...t.met, kind] };
}

/** Total hits across every kind. */
export function hitCount(t: Pick<Tally, "hits">): number {
  return Object.values(t.hits).reduce((a, b) => a + b, 0);
}

/** `points` is the kill's `scoreFor(base, streak)`. */
export function recordKill(t: Tally, kind: Kind, streak: number, points: number): Tally {
  return {
    ...t,
    kills: { ...t.kills, [kind]: t.kills[kind] + 1 },
    bestStreak: Math.max(t.bestStreak, streak),
    log: [...t.log, { kind, streak }],
    entries: [...t.entries, { kind, points }],
  };
}

/** `points` is negative; a penalty is not a kill. */
export function recordPenalty(t: Tally, kind: Kind, points: number): Tally {
  return { ...t, entries: [...t.entries, { kind, points }] };
}
