/**
 * Where and how big the starter pack card hangs, per screen. Pure: the
 * component passes the box width and the hero column's width (`--measure`).
 *
 * - `hang`: desktop, the header's top-right corner. The page box spans the
 *   full width; the card is pinned HANG_EDGE in from the screen's right edge
 *   and scaled so it stays HANG_CLEARANCE clear of the hero column.
 * - `footer`: tablets, its own slot above the footer.
 * - `mini`: phones, a small card overlaid at the right of the footer.
 */
export type Variant = "hang" | "footer" | "mini";

export const CARD_W = 470;
export const HANG_BOX_H = 900;
/** At 1280px the margin only fits a 0.4 card once clearance and edge are taken out. */
export const HANG_SCALE = { min: 0.36, max: 0.6 } as const;
/** CSS px kept clear between the card and the hero column. */
export const HANG_CLEARANCE = 40;
/** CSS px from the card's right edge to the screen's right edge. */
export const HANG_EDGE = 32;
/** The tablet slot's height in CSS px, reserved by the server markup in app/page.tsx. */
export const FOOTER_SLOT_HEIGHT = 640;
const FOOTER_MAX_SCALE = 0.68;
const GUTTER = 32;
/** Phones: a 0.3 card in a 150 x 300 CSS px box (`.starter-pack-foot-box`). */
const MINI_SCALE = 0.3;
const MINI_BOX_H = 300;

export function layout(variant: Variant, width: number, measure: number) {
  if (variant === "hang") {
    const margin = (width - measure) / 2;
    // The card's width must fit the margin less the clearance and the edge inset.
    const scale = Math.min(HANG_SCALE.max, Math.max(HANG_SCALE.min, (margin - HANG_CLEARANCE - HANG_EDGE) / CARD_W));
    const anchorX = (width - HANG_EDGE) / scale - CARD_W / 2;
    return { scale, w: width / scale, h: HANG_BOX_H / scale, anchorX };
  }
  if (variant === "mini") {
    const w = width / MINI_SCALE;
    // Right-aligned: the card's right edge meets the box's right edge.
    return { scale: MINI_SCALE, w, h: MINI_BOX_H / MINI_SCALE, anchorX: w - CARD_W / 2 };
  }
  const scale = Math.min(FOOTER_MAX_SCALE, (width - GUTTER) / CARD_W);
  const w = width / scale;
  return { scale, w, h: FOOTER_SLOT_HEIGHT / scale, anchorX: w / 2 };
}
