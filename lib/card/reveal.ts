/**
 * Browser-preference helpers for the card's reveal.
 *
 * Used to carry the printing reveal's compositing (`startPrintReveal`),
 * which drew the finished bitmap onto the visible canvas top to bottom over
 * time. That reveal was replaced by a flip: the card now rises off the deck
 * showing its back, then turns to its printed front (CardMinter.tsx's own
 * CSS transition on a `rotateY`, choreographed by lib/card/revealSequence.ts
 * and eased with CARD_FLIP_EASE in lib/motionVariants.ts). Nothing in this
 * file composites pixels any more, only `prefersReducedMotion` survives.
 *
 * Kept framework and DOM free (window is passed in, never read directly) so
 * it can be unit tested the same way the rest of lib/card is, with no
 * browser.
 */

/**
 * Resolves `(prefers-reduced-motion: reduce)` against a given window,
 * defaulting to `false` (motion allowed) when `matchMedia` itself is
 * missing. That default matters: a visitor whose browser cannot report the
 * preference should get the same reveal everyone already gets today, not a
 * card that fails to draw because a feature-detection branch was skipped.
 * Takes `window` as a parameter, the same reason the rest of this file
 * takes its browser primitives as parameters, so the resolution itself is
 * unit testable without a DOM.
 */
export function prefersReducedMotion(win: Window | undefined): boolean {
  if (!win || typeof win.matchMedia !== "function") return false;
  return win.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
