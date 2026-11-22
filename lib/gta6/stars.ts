/**
 * The wanted meter: how many of five stars `fastFor` seconds of fast spinning
 * has earned, when the fifth lands at `after` seconds. One star per fifth.
 */
export function starsFor(fastFor: number, after: number): number {
  return Math.min(5, Math.floor(fastFor / (after / 5)));
}
