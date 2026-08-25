/**
 * The reveal timeline, as data.
 *
 * The card's reveal is choreographed across three stages, and it is
 * committed to finishing in under two seconds. Timings scattered through a
 * component make that a hope; here it is an assertion, and
 * revealSequence.test.ts fails the build if a stage grows past the budget.
 *
 * The middle stage is the card turning from its back to its printed front
 * (CardMinter.tsx's own CSS transition on a `rotateY`, driven by
 * `flip.duration` and `CARD_FLIP_EASE` in lib/motionVariants.ts). It replaced
 * an earlier `print` stage that composited the finished bitmap onto the
 * canvas top to bottom; at speed that read as an opacity wipe rather than as
 * printing, and it is gone along with lib/card/reveal.ts's `startPrintReveal`.
 *
 * It also keeps the two variants from drifting. The full ceremony plays
 * once, on a visitor's first completed set; every re-roll after that gets
 * the short one, because someone rolling repeatedly for a rare issue should
 * not sit through the card's rise each time. Both are described by the same
 * shape, so the component reads one table and never branches on which it
 * was handed.
 *
 * Kept DOM-free like the rest of lib/card. Nothing here reads window or
 * schedules anything: it is numbers, and CardMinter turns them into motion.
 */

/** Milliseconds from the moment the third pair of dice come to rest. */
export type RevealStage = {
  /** Offset from t = 0. */
  at: number;
  duration: number;
};

export type RevealTimeline = {
  /** The card rising off the deck, showing its back. CardMinter.tsx's own
   *  CSS transition does the actual animating; this only says when it
   *  starts and how long the caller should wait before touching the
   *  canvas. */
  cardRise: RevealStage;
  /** The turn from back to front: a CSS `rotateY` transition on the element
   *  that carries both faces, eased with CARD_FLIP_EASE in
   *  lib/motionVariants.ts. */
  flip: RevealStage;
  issueLine: RevealStage;
};

/** The ceiling the whole sequence is designed against. */
export const REVEAL_BUDGET_MS = 2000;

/**
 * How long the finished set stays on screen before the card takes over.
 *
 * The handoff cannot be immediate. onComplete is the parent's state setter,
 * so calling it in the same tick as the third roll's own state updates lets
 * React batch them into one commit: the filled third slot and the announced
 * total are dropped without ever painting. This beat gives the landed dice
 * a commit of their own and long enough to read.
 *
 * Like the 700ms throw, it sits before t = 0 and is outside REVEAL_BUDGET_MS,
 * which measures the reveal from the dice coming to rest.
 */
export const SETTLE_MS = 500;

/** How long the turn itself takes. Mirrors --duration-flip. */
const FLIP_MS = 600;

/** The gap between the card landing at 520ms and the rise finishing at
 *  500ms: room for the rise's own small settle before the turn starts. */
const FLIP_GAP_MS = 20;

/** The beat between the card finishing its turn and the issue line landing. */
const STAMP_BEAT_MS = 40;

/**
 * A duration small enough to be imperceptible, used where a stage has to
 * exist for the shape to stay uniform but must not actually play. Not zero,
 * so "every stage has a real duration" stays a meaningful invariant rather
 * than one with an exception carved into it.
 */
const ABSENT = 0.000001;

export const FULL_REVEAL: RevealTimeline = {
  // The source of truth for the rise's duration: CardMinter reads this
  // value directly (as variant.cardRise.duration), and --duration-card-rise
  // in app/globals.css mirrors it for documentation only. The card rises
  // showing its back; the finished front is drawn to the canvas the moment
  // the roll lands (safe now, since the back is what hides it, not late
  // drawing), and only the turn below actually reveals it.
  cardRise: { at: 0, duration: 500 },
  // Starts FLIP_GAP_MS after the rise's own 500ms, so the rise's small
  // settle finishes before the turn begins rather than the two overlapping.
  flip: { at: 500 + FLIP_GAP_MS, duration: FLIP_MS },
  issueLine: { at: 500 + FLIP_GAP_MS + FLIP_MS + STAMP_BEAT_MS, duration: 200 },
};

export const SHORT_REVEAL: RevealTimeline = {
  // Skips straight to the turn. ABSENT is also what CardMinter uses as the
  // card's own CSS transition duration (riseMs), so a re-roll's card does
  // not repeat the first card's animated rise off the deck: it just pops
  // into place with no visible transition, which is the intended behaviour
  // (someone rolling repeatedly for a rare issue should not sit through
  // the rise's ceremony every time). The turn itself still plays: the
  // moment of not knowing is what the turn is for, and skipping it on every
  // re-roll would leave nothing revealing the card at all.
  cardRise: { at: 0, duration: ABSENT },
  flip: { at: 0, duration: FLIP_MS },
  issueLine: { at: FLIP_MS + STAMP_BEAT_MS, duration: 200 },
};

/** When the last stage finishes. */
export function timelineTotal(timeline: RevealTimeline): number {
  return Math.max(
    ...Object.values(timeline).map((stage) => stage.at + stage.duration)
  );
}
