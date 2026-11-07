export type BurstTier = "huge" | "medium" | "small";

export function burstTier(r: number): BurstTier {
  if (r < 0.22) return "huge";
  if (r < 0.65) return "medium";
  return "small";
}

export const TIER_SIZE: Record<BurstTier, number> = { huge: 1, medium: 0.55, small: 0.28 };

export function emberCount(size: number, jitter: number): number {
  return Math.round(50 + 190 * size * (0.8 + jitter * 0.4));
}
