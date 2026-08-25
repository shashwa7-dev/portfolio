"use client";

import { forwardRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { blurSwapVariants, FILL_EASE, FILL_MS } from "@/lib/motionVariants";
import type { DiceRollState } from "@/components/card/dice/useDiceRoll";

/**
 * The button both dice skins share: the pill itself, its fill, the label
 * and the caption beneath. A skin passes only its dice dock as children;
 * everything else was previously copy-pasted between CubeDice and TossDice,
 * which a prior review flagged once already over Pips.tsx.
 *
 * The fill reuses `bg-accent` as its base (the same colour TossDice's old
 * button already stood on, proven in both themes) with a translucent
 * `accent-foreground` wash growing over it for progress. A fully opaque
 * second colour was tried and rejected: `--accent` is this palette's ink,
 * not a mid-tone brand hue, so an opaque fill and a static label colour
 * cannot both stay legible once the fill passes under the text. A subtle
 * wash never flips that contrast.
 */
type RollPillProps = {
  /** useDiceRoll's own return value, straight from the skin. RollPill reads
   *  `rolls`, `caption`, `disabled` and `reducedMotion` off it directly
   *  rather than taking each as its own prop: those seven props used to be
   *  passed identically from both skins. */
  state: DiceRollState;
  /** Set once the print reveal has finished; overrides `state.caption` with
   *  the issue line, flips the label to "Roll again", and is what decides
   *  `revealed` below. Threaded straight from the skin, same as `state`. */
  issueCaption: string | null;
  onClick: () => void;
  /** The skin's own dice, at rest or mid-throw. RollPill draws none of it. */
  children: ReactNode;
};

/** Forwards a ref to the underlying `<button>`: TossDice runs its own
 *  press-squash WAAPI animation directly on the button element, the same
 *  way it already reaches into its dice with refs, and that needs the real
 *  node now that the button lives in here instead of in the skin. */
const RollPill = forwardRef<HTMLButtonElement, RollPillProps>(function RollPill(
  { state, issueCaption, onClick, children },
  ref
) {
  const { rolls, caption: rollingCaption, disabled, reducedMotion } = state;
  // True once a card exists and `caption` is the issue line rather than a
  // rolling-in-progress count. Governs both the label and the one moment
  // the caption blurs in rather than plainly updating: see the caption
  // block below.
  const revealed = issueCaption !== null;
  const label = revealed ? "Roll again" : "Roll";
  const caption = issueCaption ?? rollingCaption;
  const progress = rolls.length / 3;
  const pct = `${Math.max(0, Math.min(1, progress)) * 100}%`;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`${label}. ${caption}`}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className="group relative inline-flex h-[60px] w-[240px] items-center justify-center gap-3 overflow-visible rounded-full bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
      >
        {/* The fill: clipped to its own rounded wrapper so it never spills
            past the pill's corners, while the pill itself stays
            overflow-visible so the dice dock can send dice above it. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        >
          <span
            className="absolute inset-y-0 left-0 bg-accent-foreground/15"
            style={{ width: pct, transition: `width ${FILL_MS}ms ${FILL_EASE}` }}
          />
        </span>

        {/* One step up the type scale from the caption below (2xs -> xs),
            with the weight and tracking every primary button in the app
            uses, since this is the pill's one primary action rather than
            another mono label. Checked against the pill's fixed 240px and
            the dock beside it at the longest label, "Roll again": see the
            task report for the arithmetic. */}
        <span className="relative z-[1] font-mono text-xs font-semibold uppercase tracking-tight">
          {label}
        </span>
        <span className="relative z-[1]">{children}</span>
      </button>

      {/* The caption. Every roll-count update (0, 1, 2, "N rolled") just
          plainly replaces the text: it changes once a second at most and a
          blur crossfade on top of the throw's own motion would be noise on
          noise. The one exception is the moment `revealed` turns true: the
          issue line landing is the swap blurSwapVariants exists for ("After
          the print completes, the caption under the pill swaps to the
          result"), so only that transition gets it, and only when motion is
          allowed. Rolling `revealed` back to false (Roll again) pops the
          plain caption back in without an exit animation: restarting the
          fill is the ceremony there, not the caption. */}
      {revealed && !reducedMotion ? (
        <motion.p
          variants={blurSwapVariants}
          initial="hidden"
          animate="visible"
          className="font-mono text-2xs uppercase tracking-label text-subtle"
        >
          {caption}
        </motion.p>
      ) : (
        <p className="font-mono text-2xs uppercase tracking-label text-subtle">{caption}</p>
      )}
    </div>
  );
});

export default RollPill;
