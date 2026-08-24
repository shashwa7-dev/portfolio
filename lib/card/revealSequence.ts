/**
 * The reveal timeline, as data.
 *
 * The card's reveal is choreographed across five overlapping stages, and it
 * is committed to finishing in under two seconds. Timings scattered through
 * a component make that a hope; here it is an assertion, and
 * revealSequence.test.ts fails the build if a stage grows past the budget.
 *
 * It also keeps the two variants from drifting. The full ceremony plays
 * once, on a visitor's first completed set; every re-roll after that gets
 * the short one, because someone rolling repeatedly for a rare issue should
 * not sit through a backdrop each time. Both are described by the same
 * shape, so the component reads one table and never branches on which it
 * was handed.
 *
 * Kept DOM-free like the rest of lib/card. Nothing here reads window or
 * schedules anything: it is numbers, and the component turns them into
 * motion.
 */

/** Milliseconds from the moment the third pair of dice come to rest. */
export type RevealStage = {
  /** Offset from t = 0. */
  at: number;
  duration: number;
};

export type RevealTimeline = {
  backdropIn: RevealStage;
  cardForward: RevealStage;
  /** The existing print reveal in lib/card/reveal.ts, which runs 900ms. */
  print: RevealStage;
  issueStamp: RevealStage;
  backdropOut: RevealStage;
};

/** The ceiling the whole sequence is designed against. */
export const REVEAL_BUDGET_MS = 2000;

/** How long the print reveal itself takes. Mirrors --duration-print. */
const PRINT_MS = 900;

/** The beat between the card finishing printing and the issue landing. */
const STAMP_BEAT_MS = 40;

/**
 * A duration small enough to be imperceptible, used where a stage has to
 * exist for the shape to stay uniform but must not actually play. Not zero,
 * so "every stage has a real duration" stays a meaningful invariant rather
 * than one with an exception carved into it.
 */
const ABSENT = 0.000001;

export const FULL_REVEAL: RevealTimeline = {
  backdropIn: { at: 0, duration: 160 },
  // Overlaps the backdrop, and starts before the print so the card is
  // already settled by the time ink appears on it.
  cardForward: { at: 80, duration: 320 },
  // The 240ms of empty frame before this is deliberate anticipation. There
  // is nothing behind the canvas during it: a placeholder colour would show
  // through the card's real tear-line cuts, and a per-issue stock colour
  // would give away an Inverted result before it printed.
  print: { at: 240, duration: PRINT_MS },
  issueStamp: { at: 240 + PRINT_MS + STAMP_BEAT_MS, duration: 220 },
  backdropOut: { at: 240 + PRINT_MS + STAMP_BEAT_MS + 220 + 40, duration: 280 },
};

export const SHORT_REVEAL: RevealTimeline = {
  backdropIn: { at: 0, duration: ABSENT },
  cardForward: { at: 0, duration: ABSENT },
  print: { at: 0, duration: PRINT_MS },
  issueStamp: { at: PRINT_MS + STAMP_BEAT_MS, duration: 220 },
  backdropOut: { at: PRINT_MS + STAMP_BEAT_MS + 220, duration: ABSENT },
};

/** When the last stage finishes. */
export function timelineTotal(timeline: RevealTimeline): number {
  return Math.max(
    ...Object.values(timeline).map((stage) => stage.at + stage.duration)
  );
}
