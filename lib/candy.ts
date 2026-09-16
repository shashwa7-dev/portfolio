// lib/candy.ts
/**
 * Deterministic pickers for the Candy theme.
 *
 * Tilts and tints are chosen by index, never at random: the server and the
 * client must agree on every class or hydration fails. The class strings are
 * written out in full so Tailwind's scanner sees them.
 *
 * The caps live here, not at the call sites. `tilt` never exceeds 2 degrees
 * (chips, tags, decorative stickers) and `tiltMd` never exceeds 0.8 (cards).
 * The 4-degree slots, `tilt-h` and `tilt-i`, are for the avatar and brand
 * marks only and are written as literals where they are used.
 */
export const TILT_CLASSES = [
  "tilt-a", "tilt-b", "tilt-c", "tilt-d", "tilt-e", "tilt-f", "tilt-g",
] as const;

export const TILT_CARD_CLASSES = ["tilt-md-f", "tilt-md-g"] as const;

export const TINT_CLASSES = [
  "candy:bg-candy-pink",
  "candy:bg-candy-mint",
  "candy:bg-candy-butter",
  "candy:bg-candy-sky",
  "candy:bg-candy-lavender",
] as const;

/** Always-on tilt, at most 2 degrees, for chips, tags, badges and decorative stickers. */
export function tilt(i: number): string {
  return TILT_CLASSES[Math.abs(i) % TILT_CLASSES.length];
}

/** Card tilt, under 1 degree and only from 640px up. Neighbours alternate. */
export function tiltMd(i: number): string {
  return TILT_CARD_CLASSES[Math.abs(i) % TILT_CARD_CLASSES.length];
}

/** A candy background, cycling the five tints. Inert outside Candy. */
export function tint(i: number): string {
  return TINT_CLASSES[Math.abs(i) % TINT_CLASSES.length];
}
