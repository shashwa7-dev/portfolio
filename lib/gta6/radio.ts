/**
 * Vice FM's pure track logic (the radio in `components/gta6/Radio.tsx`).
 */

/** The track `delta` steps from `index`, wrapping round a list of `length`. */
export function stepTrack(index: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (((index + delta) % length) + length) % length;
}

/** The playlist entry's title (`components/gta6/track.ts`), else "Track N"
 *  (counted from one) for an entry with none. */
export function trackTitle(index: number, title?: string): string {
  return title?.trim() || `Track ${index + 1}`;
}

/**
 * The order a session plays the playlist in, as playlist indices: the first
 * entry (the theme) always first, then every other entry once, shuffled
 * (Fisher-Yates with `random`, so a test can fix it). The radio loops this
 * same order, so the theme never repeats mid-loop.
 */
export function playOrder(length: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 1; i--) {
    // j in 1..i: index 0 never moves.
    const j = 1 + Math.floor(random() * i);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** A progress reading (0 to 1) taken while the radio was at `position`. */
export type ProgressReading = { position: number; value: number };

/** What the progress line shows at `position`: a reading belongs to the
 *  track it was taken on, so one from another track shows as 0 until the
 *  next reading arrives. */
export function shownProgress(reading: ProgressReading, position: number): number {
  return reading.position === position ? reading.value : 0;
}
