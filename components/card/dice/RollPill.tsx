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
        className="group relative h-[60px] w-[min(340px,calc(100vw-3rem))] overflow-visible rounded-md bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
      >
        {/* The fill: clipped to its own wrapper so it never spills past the
            pill's corners, while the pill itself stays overflow-visible so
            the dice dock can send dice above it. Its radius has to match
            the button's exactly, or the fill bulges past the button's own
            (now square) corners on every roll. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
        >
          <span
            className="absolute inset-y-0 left-0 bg-accent-foreground/15"
            style={{ width: pct, transition: `width ${FILL_MS}ms ${FILL_EASE}` }}
          />
        </span>

        {/* Centred against the button itself, not against the label+dock
            pair: `justify-center` on the old flex row centred the group,
            which put the word left of the button's true centre with the
            dice filling the right half. The label now spans the button's
            full width and centres within it; the dock (below) is pinned to
            the right edge instead of sitting beside the label in flow, so
            the two are no longer a group to centre.

            font-semibold, sentence case: how every other primary action in
            the app labels itself (components/ui/button.tsx's base class;
            components/Navbar.tsx's CV link; components/Socials.tsx's email
            CTA; components/About.tsx's hero CTAs). The uppercase mono label
            this replaced read as a different design language next to
            those. Sized text-lg, up from text-sm: quiet was right for an
            ordinary button, too quiet for the only control on the stage.

            The pill widened from 240px to 340px to fit this at text-lg
            without crowding the dock, but a fixed 340px overflows the
            stage on real phones: it's `w-full max-w-[420px]` inside a
            24px-each-side (`px-6`) container, so a 360px Android has only
            312px to give and a 375px iPhone 327px. The width is now
            `min(340px, 100vw - 3rem)`, tracking the viewport directly
            rather than a percentage of an ancestor: the pill's own box has
            no in-flow content (every child here is `absolute`), and every
            ancestor up to the stage sizes to content, so a percentage
            width would resolve against that shrink-wrapped chain and
            collapse rather than fill the available space.

            That still has to clear the dock at the narrowest phones, which
            a fluid button alone doesn't guarantee. Both skins' docks are
            now the same 74px footprint (CubeDice's cubes came down from
            40px to 32px, closing their 12px gap to 10px: 32 + 32 + 10 =
            74, matching TossDice's dock exactly), inset 16px from the
            right, so the dock's own left edge sits at W - 16 - 74 = W - 90.
            "Roll again" (the longest label) measures ~78px at text-lg in
            DM Sans SemiBold, so centred in a button of width W its right
            edge lands at W/2 + 39. At the 320px-viewport floor, W is 272px:
            the dock's left edge is at 182px and the label's right edge at
            175px, 7px of clearance, identical for both skins now that
            their docks match. At the 340px cap, the dock's left edge is at
            250px and the label's right edge at 209px, 41px of clearance,
            again the same for both. */}
        <span className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-lg font-semibold">
          {label}
        </span>
        <span className="absolute right-4 top-1/2 z-[1] -translate-y-1/2">{children}</span>
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
