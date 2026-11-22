import type { Kind } from "@games/vice-hunt";

/**
 * The rares seen so far in this visit, so they come back about once a minute
 * in later rounds (Play again, or the game opened again from the revolver or
 * /vice-hunt). Module state on purpose: it lasts until the page is reloaded
 * or the visitor leaves the site, and no longer (owner, 2026-11-22).
 */
const seen = new Set<Kind>();

export function spottedRares(): Kind[] {
  return [...seen];
}

export function markSpotted(kind: Kind): void {
  seen.add(kind);
}
