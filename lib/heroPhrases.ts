/**
 * The phrases the intro headline cycles through, in order: "I build interfaces
 * that ___ to millions." The first is what renders on the server and what
 * stays under reduced motion, so it has to carry the claim alone. Each one has
 * to read as a full sentence in that slot.
 */
export const HERO_PHRASES = ["ship and scale", "feel effortless", "make AI usable", "feel instant"] as const;

/** The index after `i`, wrapping back to the first phrase. */
export function nextPhrase(i: number): number {
  return (i + 1) % HERO_PHRASES.length;
}
