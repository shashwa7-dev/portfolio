/**
 * Vice FM's pure track logic (the radio in `components/gta6/Radio.tsx`).
 */

/** The track `delta` steps from `index`, wrapping round a list of `length`. */
export function stepTrack(index: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (((index + delta) % length) + length) % length;
}

/** The player's own title once known, else "Track N" (counted from one). */
export function trackTitle(index: number, title?: string): string {
  return title?.trim() || `Track ${index + 1}`;
}
