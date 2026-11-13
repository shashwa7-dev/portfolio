import type { Vec } from "./lanyard";

/**
 * The card is lit by one light at the viewport's top-left corner. Given the
 * card's centre on screen (CSS px) and its swing angle (CSS clockwise
 * radians), returns the unit vector from the card towards the light in the
 * card's own frame. The plastic's gloss sits on that side and every shadow
 * falls the opposite way, so they track the swing and the scroll.
 */
const FALLBACK = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 };

export function lightInCard(center: Vec, angle: number): Vec {
  const len = Math.hypot(center.x, center.y);
  const w = len < 1e-6 ? FALLBACK : { x: -center.x / len, y: -center.y / len };
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: w.x * c + w.y * s, y: -w.x * s + w.y * c };
}
