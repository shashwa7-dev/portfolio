/**
 * The reveal timeline, as data.
 *
 * The card's reveal is choreographed across three stages, and it is
 * committed to finishing in under two seconds. Timings scattered through a
 * component make that a hope; here it is an assertion, and
 * revealSequence.test.ts fails the build if a stage grows past the budget.
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
  /** The card rising off the deck, blank. CardMinter.tsx's own CSS
   *  transition does the actual animating; this only says when it starts
   *  and how long the caller should wait before the canvas is touched. */
  cardRise: RevealStage;
  /** The existing print reveal in lib/card/reveal.ts, which runs 900ms. */
  print: RevealStage;
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

/** How long the print reveal itself takes. Mirrors --duration-print. */
const PRINT_MS = 900;

/** The beat between the card finishing printing and the issue line landing. */
const STAMP_BEAT_MS = 40;

/**
 * A duration small enough to be imperceptible, used where a stage has to
 * exist for the shape to stay uniform but must not actually play. Not zero,
 * so "every stage has a real duration" stays a meaningful invariant rather
 * than one with an exception carved into it.
 */
const ABSENT = 0.000001;

export const FULL_REVEAL: RevealTimeline = {
  // Mirrors --duration-card-rise / CARD_RISE_MS in lib/motionVariants.ts.
  // The card rises blank; nothing is drawn to the visible canvas until this
  // stage has had its full 500ms, or the finished card would be legible
  // while it is still moving.
  cardRise: { at: 0, duration: 500 },
  print: { at: 500, duration: PRINT_MS },
  issueLine: { at: 500 + PRINT_MS + STAMP_BEAT_MS, duration: 200 },
};

export const SHORT_REVEAL: RevealTimeline = {
  // Skips straight to print: the rise itself may still play (a re-roll's
  // card comes back off the deck the same way), but nothing waits on it.
  cardRise: { at: 0, duration: ABSENT },
  print: { at: 0, duration: PRINT_MS },
  issueLine: { at: PRINT_MS + STAMP_BEAT_MS, duration: 200 },
};

/** When the last stage finishes. */
export function timelineTotal(timeline: RevealTimeline): number {
  return Math.max(
    ...Object.values(timeline).map((stage) => stage.at + stage.duration)
  );
}
