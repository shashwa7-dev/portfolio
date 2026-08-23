import { hashWith, mulberry32, weighted, rr, type Rand } from "@/lib/card/seed";
import type { Cast } from "@/lib/card/types";

/**
 * The lean cast. Ink Folio runs a much larger wardrobe; this is the subset
 * that gives enough variety that two visitors rarely collide, while staying
 * small enough to read in one sitting.
 *
 * Weights are deliberately uneven. A wardrobe where everything is equally
 * likely produces a crowd where nothing stands out, and the whole point of
 * the issue tiers is that some cards feel luckier than others.
 */
export function castFrom(R: Rand): Cast {
  return {
    hair: weighted(R, [
      ["short", 26],
      ["long", 22],
      ["bob", 18],
      ["curls", 16],
      ["buzz", 12],
      ["topknot", 6],
    ] as const),
    glasses: weighted(R, [
      ["none", 62],
      ["round", 24],
      ["square", 14],
    ] as const),
    headwear: weighted(R, [
      ["none", 74],
      ["beanie", 18],
      ["flatCap", 8],
    ] as const),
    brow: weighted(R, [
      ["flat", 46],
      ["arched", 34],
      ["worried", 20],
    ] as const),
    mouth: weighted(R, [
      ["smile", 52],
      ["line", 33],
      ["open", 15],
    ] as const),
    shade: rr(R, 0.25, 0.85),
  };
}

/** The face comes off its own stream, so the name and the issue cannot disturb it. */
export const castForVisitor = (visitorId: string): Cast =>
  castFrom(mulberry32(hashWith(visitorId, "face")));
