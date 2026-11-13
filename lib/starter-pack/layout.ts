/**
 * Where and how big the starter pack card hangs, per screen. Pure: the
 * component passes the box width and the hero column's width (`--measure`).
 *
 * - `hang`: desktop, the header's top-right corner. The page box spans the
 *   full width; the card is pinned HANG_EDGE in from the screen's right edge
 *   and scaled so it stays HANG_CLEARANCE clear of the hero column.
 * Tablets and phones get no card: their GPUs pay too much for its 3D layers.
 */
export type Variant = "hang";

export const CARD_W = 470;
export const HANG_BOX_H = 900;
/** At 1280px the margin only fits a 0.4 card once clearance and edge are taken out. */
export const HANG_SCALE = { min: 0.36, max: 0.6 } as const;
/** CSS px kept clear between the card and the hero column. */
export const HANG_CLEARANCE = 40;
/** CSS px from the card's right edge to the screen's right edge. */
export const HANG_EDGE = 32;

/** Desktop placement; `Variant` is kept so a future screen size can add its own branch. */
export function layout(_variant: Variant, width: number, measure: number) {
  const margin = (width - measure) / 2;
  // The card's width must fit the margin less the clearance and the edge inset.
  const scale = Math.min(HANG_SCALE.max, Math.max(HANG_SCALE.min, (margin - HANG_CLEARANCE - HANG_EDGE) / CARD_W));
  const anchorX = (width - HANG_EDGE) / scale - CARD_W / 2;
  return { scale, w: width / scale, h: HANG_BOX_H / scale, anchorX };
}
