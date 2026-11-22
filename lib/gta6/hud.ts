import type { Kind } from "@games/vice-hunt";

/** Hearts at the start of a round (the game package's `HEARTS`). */
export const HEARTS = 3;
const MINUS = "−";

/** How many rares the player has met that the RARE menu lists. `inMenu` is
 *  the package's `isRare` and `isEnabled` together, passed in so `lib/`
 *  never imports the game (it loads only by dynamic import). */
export function rareCount(met: readonly Kind[], inMenu: (kind: Kind) => boolean): number {
  return met.filter(inMenu).length;
}

/** The hearts row for readers. */
export function heartsLabel(hearts: number): string {
  return `Health: ${hearts} of ${HEARTS}`;
}

/** Each heart's fill, left to right: 1 whole, 0.5 half, 0 empty. */
export function heartFills(hearts: number): number[] {
  return Array.from({ length: HEARTS }, (_, i) => Math.max(0, Math.min(1, hearts - i)));
}

/** The pop for hearts lost (what was there before less what is left). */
export function damageLabel(lost: number): string {
  return `${MINUS}${lost === 0.5 ? "½" : lost} ♥`;
}

/** "1 / 3" for a hit that does not finish its creature, when the total is
 *  shown (`of`; the UFO's is a secret and Bigfoot has a bar) and is more
 *  than one. Null for the finishing hit (the kill or penalty pop says it)
 *  and for a hit with a `penalty` of its own (the cow's −500 pops instead). */
export function hitLabel(n: number, of: number | undefined, penalty: number): string | null {
  if (of === undefined || of < 2 || n >= of || penalty !== 0) return null;
  return `${n} / ${of}`;
}

/** A penalty's pop, with a real minus sign. */
export function penaltyLabel(points: number): string {
  return `${MINUS}${Math.abs(points)}`;
}
