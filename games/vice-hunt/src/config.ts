export const SPAWN_INTERVAL: [number, number] = [0.9, 1.6];
export const MAX_ALIVE = 6;
export const IGUANA_PAUSE: [number, number] = [0.2, 0.8];
export const MAX_DT = 0.05;
// Seconds between kills that still count as one streak (DOUBLE!, TRIPLE!).
export const STREAK_WINDOW = 1.5;
// The water line of the sea lane, a fraction of the height (matches the beach
// scene's sea; checked by eye in the final pass).
export const SEA_LINE = 0.69;
// Hearts at the start of a round.
export const HEARTS = 3;
// How often a rare comes back once it has been spotted (per minute), in
// place of its own rate. Not Bigfoot: he keeps his (owner, 2026-11-22).
export const SPOTTED_PER_MINUTE = 1;
// Where the ground lane's feet rest, a fraction of the height.
export const GROUND_LINE = 0.94;
