/** Body colours for the cars crossing the beach scene's bridge. */
export const CAR_COLOURS = [
  "#e8e4dc",
  "#d64045",
  "#2f6fb5",
  "#f2c14e",
  "#3b3b45",
  "#7fc8a9",
  "#f28f6b",
] as const;

export type CarPlan = {
  colour: string;
  /** Left to right, or right to left. */
  ltr: boolean;
  /** Time to cross the bridge, 7 to 13 s. */
  seconds: number;
  /** Wait before the next car, 0.7 to 2.9 s. */
  gapMs: number;
};

/**
 * One car for the bridge, from a random source (`Math.random` in the app,
 * a fixed value in tests). Each draw is its own call so the four choices
 * are independent.
 */
export function planCar(random: () => number): CarPlan {
  return {
    colour: CAR_COLOURS[Math.floor(random() * CAR_COLOURS.length)],
    ltr: random() < 0.5,
    seconds: 7 + random() * 6,
    gapMs: 700 + random() * 2200,
  };
}
