import type { Kind, Lane } from "./types";

// Every speed, hit and size lives here. Speeds are hero widths per second,
// hits are an inclusive integer range, sizes are the sprite box in px at a 1x
// hero (heights match each sprite's SVG viewBox aspect).
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
  rabbit: { lane: "ground", speed: [0.55, 0.75], hits: [1, 2], size: [70, 48], weight: 0.4 },
  iguana: { lane: "ground", speed: [0.25, 0.6], hits: [3, 3], size: [100, 33], weight: 0.33 },
  flamingo: { lane: "top", speed: [0.2, 0.3], hits: [2, 3], size: [104, 55], weight: 0.27 },
  // Bigfoot is rolled separately (BIGFOOT_CHANCE), so its weight is unused.
  bigfoot: { lane: "ground", speed: [0.08, 0.12], hits: [7, 8], size: [84, 118], weight: 0 },
};

export const SPAWN_INTERVAL: [number, number] = [0.9, 1.6];
export const MAX_ALIVE = 6;
export const BIGFOOT_CHANCE = 0.06;
export const BIGFOOT_AFTER = 8;
export const IGUANA_PAUSE: [number, number] = [0.2, 0.8];
export const MAX_DT = 0.05;
export const MAX_HOLES = 12;
