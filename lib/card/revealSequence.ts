/**
 * The reveal timeline, as data.
 *
 * The card's entry is choreographed across three stages, and it is
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
 * The entry plays in full on every roll, first one and every re-roll after
 * it: there used to be a shortened variant for re-rolls (the theory being
 * that someone grinding for a rare issue shouldn't sit through the rise each
 * time), but with a real exit that asymmetry read as broken rather than as
 * considerate, so it is gone. `EXIT_REVEAL` below is its replacement: not a
 * cheaper entry, but the entry's own reverse, played on the way out.
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

/**
 * The exit's own timeline: the card turning back to its blank back, then
 * falling back into the deck. `flip` mirrors `RevealTimeline.flip` (the same
 * CSS `rotateY` transition, run backward); `sink` mirrors `cardRise` (the
 * `motion` variant CardMinter mounts the card with, `cardRiseVariants` in
 * lib/motionVariants.ts, played in reverse via its own `exit` state rather
 * than a second variant).
 *
 * `flip` finishes before `sink` starts, the same order the entry uses
 * (rise, then turn) run in reverse (turn, then sink), and not only for
 * symmetry: CardMinter nulls the state that unmounts the card (which is what
 * triggers `sink`) only after `flip` has finished, because `AnimatePresence`
 * freezes the leaving element's props at whatever they were on the last
 * render before it started exiting. Nulling both in the same tick would
 * freeze that clone still showing its printed front.
 */
export type ExitTimeline = {
  flip: RevealStage;
  sink: RevealStage;
};

/** The ceiling the whole entry is designed against. */
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

/** How long the turn itself takes, entering. Mirrors --duration-flip. */
const FLIP_MS = 600;

/** The gap between the card landing at 520ms and the rise finishing at
 *  500ms: room for the rise's own small settle before the turn starts. */
const FLIP_GAP_MS = 20;

/** The beat between the card finishing its turn and the issue line landing. */
const STAMP_BEAT_MS = 40;

export const FULL_REVEAL: RevealTimeline = {
  // The source of truth for the rise's duration: cardRiseVariants in
  // lib/motionVariants.ts reads this value directly, and
  // --duration-card-rise in app/globals.css mirrors it for documentation
  // only. The card rises showing its back; the finished front is drawn to
  // the canvas the moment the roll lands (safe now, since the back is what
  // hides it, not late drawing), and only the turn below actually reveals
  // it.
  cardRise: { at: 0, duration: 500 },
  // Starts FLIP_GAP_MS after the rise's own 500ms, so the rise's small
  // settle finishes before the turn begins rather than the two overlapping.
  flip: { at: 500 + FLIP_GAP_MS, duration: FLIP_MS },
  issueLine: { at: 500 + FLIP_GAP_MS + FLIP_MS + STAMP_BEAT_MS, duration: 200 },
};

/** How long the exit's turn takes, back to blank. Quicker than FLIP_MS
 *  above: leaving is quicker than arriving, the same relationship every exit
 *  variant in lib/motionVariants.ts already keeps. */
const EXIT_FLIP_MS = 200;

/** How long the exit's fall back into the deck takes, once the turn above
 *  has finished. */
const EXIT_SINK_MS = 200;

/** Together, roughly a third of the entry's 1360ms: see the module comment. */
export const EXIT_REVEAL: ExitTimeline = {
  flip: { at: 0, duration: EXIT_FLIP_MS },
  sink: { at: EXIT_FLIP_MS, duration: EXIT_SINK_MS },
};

/** When the last stage finishes. Generic over either timeline shape above,
 *  since both are just named stages. */
export function timelineTotal(timeline: Record<string, RevealStage>): number {
  return Math.max(
    ...Object.values(timeline).map((stage) => stage.at + stage.duration)
  );
}
