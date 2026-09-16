// lib/candy.ts
/**
 * Deterministic pickers for the Candy theme.
 *
 * Tilts and tints are chosen by index, never at random: the server and the
 * client must agree on every class or hydration fails. The class strings are
 * written out in full so Tailwind's scanner sees them.
 */
export const TILT_CLASSES = [
  "tilt-a", "tilt-b", "tilt-c", "tilt-d", "tilt-e", "tilt-f", "tilt-g", "tilt-h", "tilt-i",
] as const;

const TILT_MD_CLASSES = [
  "tilt-md-a", "tilt-md-b", "tilt-md-c", "tilt-md-d", "tilt-md-e", "tilt-md-f", "tilt-md-g", "tilt-md-h", "tilt-md-i",
] as const;

export const TINT_CLASSES = [
  "candy:bg-candy-pink",
  "candy:bg-candy-mint",
  "candy:bg-candy-butter",
  "candy:bg-candy-sky",
  "candy:bg-candy-lavender",
] as const;

/** Always-on tilt, for chips, tags, badges and decorative stickers. */
export function tilt(i: number): string {
  return TILT_CLASSES[Math.abs(i) % TILT_CLASSES.length];
}

/** Tilt only from 640px up, for cards and buttons. */
export function tiltMd(i: number): string {
  return TILT_MD_CLASSES[Math.abs(i) % TILT_MD_CLASSES.length];
}

/** A candy background, cycling the five tints. Inert outside Candy. */
export function tint(i: number): string {
  return TINT_CLASSES[Math.abs(i) % TINT_CLASSES.length];
}
