/** Centre x and radius r in percent of the plate image's width; centre y in percent of its height. */
export type LaddooSpot = { x: number; y: number; r: number };

export const PLATE_ASPECT = 1536 / 1024;

/** Percent of the plate box. Height uses PLATE_ASPECT so the button is a circle, not an ellipse. */
export function spotBox(s: LaddooSpot): { left: number; top: number; width: number; height: number } {
  const height = 2 * s.r * PLATE_ASPECT;
  return { left: s.x - s.r, top: s.y - s.r * PLATE_ASPECT, width: 2 * s.r, height };
}

/**
 * Nine spots, front-most last so DOM order matches stacking. Measured on the
 * 1536x1024 source by drawing each circle over the image and fitting it to
 * the ball's visible rim (pistachio excluded); a ball hidden behind its
 * neighbours keeps its full circle, and the later, front-most button wins the
 * overlap.
 */
export const LADDOO_SPOTS: readonly LaddooSpot[] = [
  { x: 50.8, y: 23, r: 10.6 },
  { x: 36.5, y: 40.5, r: 7.7 },
  { x: 63.5, y: 44, r: 8.5 },
  { x: 26.7, y: 53.5, r: 5.9 },
  { x: 75.8, y: 61.5, r: 7 },
  { x: 47, y: 51, r: 10.6 },
  { x: 29.2, y: 68.4, r: 9.9 },
  { x: 65.8, y: 73.2, r: 10.7 },
  { x: 44.8, y: 74.3, r: 10.8 },
];

/**
 * Where the ball sits inside `laddoo.webp` (and, within a few px,
 * `laddoo-bitten.webp`): a 640x602 canvas with the ball's centre at
 * (311.5, 295) and a radius of 182.5, measured from the image's alpha.
 */
export const LADDOO_IMAGE = { width: 640, height: 602, cx: 311.5, cy: 295, r: 182.5 } as const;

/**
 * The laddoo image's box, in px, that lays its ball exactly over a ball of
 * diameter `d` centred at (`x`, `y`). `originX` / `originY` are the ball's
 * centre as fractions of that box, for a transform that scales about the ball.
 */
export function laddooImageBox(x: number, y: number, d: number) {
  const k = d / (2 * LADDOO_IMAGE.r);
  const width = LADDOO_IMAGE.width * k;
  const height = LADDOO_IMAGE.height * k;
  return {
    left: x - LADDOO_IMAGE.cx * k,
    top: y - LADDOO_IMAGE.cy * k,
    width,
    height,
    originX: LADDOO_IMAGE.cx / LADDOO_IMAGE.width,
    originY: LADDOO_IMAGE.cy / LADDOO_IMAGE.height,
  };
}
