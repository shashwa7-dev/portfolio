import type { Kind, Lane } from "./types";

// Every speed, hit and size lives here. Speeds are hero widths per second,
// hits are an inclusive integer range, sizes are the sprite box in px at a 1x
// hero (heights match each sprite's SVG viewBox aspect). Owner, 2026-11-21:
// rabbit and iguana 20% bigger, Bigfoot 30% bigger, the flamingo unchanged.
export const ANIMALS: Record<
  Kind,
  {
    lane: Lane;
    speed: [number, number];
    hits: [number, number];
    size: [number, number];
    weight: number;
  }
> = {
  rabbit: { lane: "ground", speed: [0.33, 0.45], hits: [1, 1], size: [84, 58], weight: 0.4 },
  iguana: { lane: "ground", speed: [0.15, 0.36], hits: [1, 1], size: [120, 40], weight: 0.33 },
  flamingo: { lane: "top", speed: [0.12, 0.18], hits: [1, 1], size: [104, 55], weight: 0.27 },
  // Bigfoot is rolled separately (BIGFOOT_CHANCE), so its weight is unused.
  bigfoot: { lane: "ground", speed: [0.05, 0.075], hits: [3, 3], size: [109, 153], weight: 0 },
};

export const SPAWN_INTERVAL: [number, number] = [0.9, 1.6];
export const MAX_ALIVE = 6;
export const BIGFOOT_CHANCE = 0.06;
export const BIGFOOT_AFTER = 8;
export const IGUANA_PAUSE: [number, number] = [0.2, 0.8];
export const MAX_DT = 0.05;
// Seconds between kills that still count as one streak (DOUBLE!, TRIPLE!).
export const STREAK_WINDOW = 1.5;
