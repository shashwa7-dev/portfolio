/** Centre x and radius r in percent of the plate image's width; centre y in percent of its height. */
export type LaddooSpot = { x: number; y: number; r: number };

export const PLATE_ASPECT = 1536 / 1024;

/** Percent of the plate box. Height uses PLATE_ASPECT so the button is a circle, not an ellipse. */
export function spotBox(s: LaddooSpot): { left: number; top: number; width: number; height: number } {
  const height = 2 * s.r * PLATE_ASPECT;
  return { left: s.x - s.r, top: s.y - s.r * PLATE_ASPECT, width: 2 * s.r, height };
}

/** Nine spots, front-most last so DOM order matches stacking. */
export const LADDOO_SPOTS: readonly LaddooSpot[] = [
  { x: 50.8, y: 20.5, r: 10.7 },
  { x: 36.1, y: 40, r: 8 },
  { x: 63.5, y: 43, r: 8.5 },
  { x: 25.4, y: 51.8, r: 6 },
  { x: 75.5, y: 62.5, r: 7.2 },
  { x: 47, y: 50.8, r: 10.6 },
  { x: 29.3, y: 68.4, r: 9.9 },
  { x: 65.8, y: 72.8, r: 10.7 },
  { x: 44.9, y: 72.8, r: 10.9 },
];
