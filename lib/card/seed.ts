/**
 * Deterministic seeding for the visitor card.
 *
 * The contract for this whole module is that the same input always produces
 * the same output, forever. A visitor's card is drawn from an id in their
 * browser, so any drift here silently changes cards people have already
 * downloaded and kept.
 *
 * FNV-1a with an avalanche step, feeding mulberry32. Both are standard and
 * both are chosen for being small and exactly reproducible, not for
 * cryptographic strength. Nothing here is a security boundary.
 */

export type Rand = () => number;

/** FNV-1a plus an avalanche mix, so ids differing by one character land far apart. */
export function hashStr(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return h >>> 0;
}

/**
 * A second, independent stream from the same input.
 *
 * This is what lets one visitor id drive the face, the issue and the serial
 * without any of them correlating, and what lets the typed name drive the
 * lettering without disturbing the face.
 */
export const hashWith = (str: string, salt: string): number =>
  hashStr(`${salt} ${str}`);

export function mulberry32(a: number): Rand {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Real in [a, b). */
export const rr = (R: Rand, a: number, b: number): number => a + R() * (b - a);

/** Integer in [a, b], inclusive both ends. */
export const ri = (R: Rand, a: number, b: number): number =>
  Math.floor(rr(R, a, b + 1));

export const chance = (R: Rand, p: number): boolean => R() < p;

export const pick = <T>(R: Rand, arr: readonly T[]): T =>
  arr[Math.floor(R() * arr.length)];

/** Weighted choice. Zero-weight entries are unreachable. */
export function weighted<T>(R: Rand, pairs: readonly (readonly [T, number])[]): T {
  let total = 0;
  for (const [, w] of pairs) total += w;
  let x = R() * total;
  for (const [value, w] of pairs) {
    x -= w;
    if (x < 0) return value;
  }
  return pairs[pairs.length - 1][0];
}

/**
 * `A-7A4E-C1`. The leading letter is a literal series marker, kept so there is
 * somewhere to go if the drawing code ever changes enough that old and new
 * cards should be told apart.
 *
 * Deliberately not `0x`-prefixed. That reads as a wallet address, and this
 * card is not on-chain.
 */
export function serialFrom(id: string): string {
  const hex = hashStr(id).toString(16).toUpperCase().padStart(8, "0");
  return `A-${hex.slice(0, 4)}-${hex.slice(4, 6)}`;
}
