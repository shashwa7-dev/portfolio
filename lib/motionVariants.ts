import type { Variants } from "motion/react";
import type { Die } from "@/lib/card/types";
import { EXIT_REVEAL, FULL_REVEAL } from "@/lib/card/revealSequence";

// ──────────────────────────────────────────────────────────────────────
// Tokens
// ──────────────────────────────────────────────────────────────────────
// Easings, durations, and springs reused across the app. Mirror the
// `--ease-out` CSS variable defined in globals.css so motion props and
// CSS transitions feel consistent.

export const ease = {
  /** Emil Kowalski's published strong ease-out. The single UI curve. */
  out: [0.23, 1, 0.32, 1] as const,
  /**
   * A thrown object: leaves fast, hangs, drops back hard. Not a UI curve
   * and must not be used as one. The only reason a second easing exists in
   * this file is that no ease-out can describe an arc that comes back down.
   */
  throw: [0.33, 0.02, 0.62, 1] as const,
} as const;

export const duration = {
  fast: 0.15,
  base: 0.2,
  med: 0.3,
  /** Entrances. Was 0.4, which broke the sub-300ms UI budget. */
  slow: 0.24,
  /** 404 page sequence only. The one sanctioned exception. */
  hero: 0.5,
  /**
   * The dice throw. Outside the sub-300ms UI budget, and unlike
   * --duration-sweep and --duration-print it cannot claim to be "not a
   * response to input", because it plainly is one. The justification is
   * different: this duration is the physics rather than a transition. A die
   * that completes its arc in 300ms does not read as a thrown object at
   * all, it reads as a glyph being swapped.
   */
  throw: 0.7,
} as const;

/** Per-item stagger offsets (seconds). Use instead of literal `i * 0.05`. */
export const stagger = {
  /** Tight lists: chips, palette rows. */
  tight: 0.04,
  /** Default list/grid stagger. */
  base: 0.06,
  /** Card grids, nav cards. */
  loose: 0.08,
} as const;


// ──────────────────────────────────────────────────────────────────────
// Variants — use with `variants={...}` + `initial="hidden" animate="visible"`
// ──────────────────────────────────────────────────────────────────────

/** Default child item for stagger containers. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/** Generic "fade up from 10px below" — the most reused inline pattern in the app. */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
  exit: { opacity: 0, y: 10, transition: { duration: duration.fast, ease: ease.out } },
};

/** Popover that floats up from below — small toasts, notification bubbles. */
export const popoverUpVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: duration.fast } },
};

/** Modal/dialog panel — gentle scale with a custom curve. */
export const dialogPopVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast, ease: ease.out } },
};

/** Pure fade for backdrops / overlays. */
export const backdropFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.out } },
};

/** FAB pop-in: starts near full scale, lands upright. Exits fast. Nothing appears from nothing. */
export const fabPopVariants: Variants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { scale: 0.96, opacity: 0, transition: { duration: duration.fast, ease: ease.out } },
};

/** Chat window / large floating panel — slides up + scales. Exit is faster than enter. */
export const chatWindowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast, ease: ease.out } },
};

/** Compact pill that floats up a few pixels — "new messages" indicators, small toasts. */
export const pillUpVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.fast } },
  exit: { opacity: 0, y: 6, transition: { duration: duration.fast } },
};

/**
 * Swapping one short string for another in place.
 *
 * Blur rather than only a crossfade: two pieces of text dissolving through each
 * other stay legible the whole way and read as a glitch. Blurring takes the
 * outgoing word out of focus first, so the eye lets go of it before the next
 * one resolves. Exit is faster than enter, or the two overlap in the middle.
 */
export const blurSwapVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)", y: 2 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    y: -2,
    transition: { duration: duration.fast, ease: ease.out },
  },
};

// ──────────────────────────────────────────────────────────────────────
// Dice cube (CubeDice) — a real `preserve-3d` cube rather than a flat
// SVG face flickering through random values. `duration.throw` and
// `ease.throw` above are its tokens.
// ──────────────────────────────────────────────────────────────────────

/**
 * Cube rotation, in degrees, that puts a given face toward the viewer. The
 * inverse of each face's placement transform in CubeDice.tsx. Stated once
 * here so both the resting pose and the throw's landing target read it
 * rather than recomputing it inline.
 */
export const FACE_ROTATION: Record<Die, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

/** "Thrown roughly 40px up and back", per the brief. */
const THROW_ARC_PX = 40;

/** How far apart the two dice land. Not a UI transition, so it isn't one
 *  of the sub-300ms tokens above; it is the throw's own physics. */
const LANDING_STAGGER_S = 0.04;

type CubePose = {
  rotateX: number;
  rotateY: number;
  y: number | number[];
  transition?: { duration: number; ease: typeof ease.throw; delay?: number };
};

/**
 * The pose pair for one die in one throw: where it rests showing `face`,
 * and the animation that spins it there. `dieIndex` only decides which way
 * it spins (the two dice always turn opposite ways) and whether it lands
 * first or `LANDING_STAGGER_S` later.
 *
 * The landing rotation is `FACE_ROTATION[face]` plus whole 360deg turns,
 * and a whole turn is the identity: the extra spin makes the face unreadable
 * in flight without changing where the cube ends up. `face` must already be
 * the decided result when this is called, never a placeholder swapped in
 * after the fact, or the one guarantee this component has to keep (the roll
 * can't be read from, or changed by, the animation) breaks.
 */
export function diceThrowVariants(
  face: Die,
  dieIndex: 0 | 1
): { rest: CubePose; airborne: CubePose } {
  const target = FACE_ROTATION[face];
  const direction = dieIndex === 0 ? 1 : -1;
  const turns = 2 + Math.round(Math.random()); // 2 or 3 full spins
  const spin = direction * 360 * turns;

  return {
    rest: { rotateX: target.x, rotateY: target.y, y: 0 },
    airborne: {
      rotateX: target.x + spin,
      rotateY: target.y + spin,
      y: [0, -THROW_ARC_PX, 0],
      transition: {
        duration: duration.throw,
        ease: ease.throw,
        delay: dieIndex === 0 ? 0 : LANDING_STAGGER_S,
      },
    },
  };
}

// ──────────────────────────────────────────────────────────────────────
// Hover / tap targets — use with `whileHover` / `whileTap`
// ──────────────────────────────────────────────────────────────────────
// These are animation targets, not full variants. Compose them with
// a transition prop on the consumer if a non-default feel is needed.

export const hoverLiftRotate = { scale: 1.02 } as const;
export const tapPress = { scale: 0.97 } as const;

// ──────────────────────────────────────────────────────────────────────
// Dice toss (TossDice) — the reference "toss" skin. Its arc runs on the
// Web Animations API (element.animate), not Framer Motion: per-keyframe
// easing is the point, since a single curve cannot express a die rising
// slower than it falls. lib/card/toss.ts turns these into keyframes; these
// are just the tokens, kept here with every other easing/duration so a
// component never pastes a literal cubic-bezier or interval number.
// ──────────────────────────────────────────────────────────────────────

/** `ease.out` in the string form the Web Animations API takes, since it
 *  can't accept the array form Framer Motion wants. Used for the toss
 *  button's press squash, which is ordinary UI feedback and gets the
 *  app's one UI curve rather than a bespoke one. */
function cssEase(curve: readonly [number, number, number, number]): string {
  return `cubic-bezier(${curve.join(", ")})`;
}

export const TOSS_EASE = {
  /** Eased out: leaves the dock fast, slows toward the apex. */
  rise: "cubic-bezier(0.22, 0.9, 0.3, 1)",
  /**
   * Eased in: hangs, then drops hard. Deliberately not `ease.throw` above,
   * which is a single symmetric curve for the cube's up-and-back bounce;
   * this arc is asymmetric on purpose (rise and fall read differently),
   * which is a shape one curve cannot hold, hence a second easing pair
   * rather than reuse.
   */
  fall: "cubic-bezier(0.5, 0, 0.75, 0.4)",
  /** The button's press squash. */
  press: cssEase(ease.out),
} as const;

/** How often the shown faces shuffle while a die is airborne. */
export const TOSS_SHUFFLE_MS = 55;

// ──────────────────────────────────────────────────────────────────────
// The card's rise off the deck, the deck itself, and the roll pill's fill
// (CardMinter.tsx, RollPill.tsx).
// ──────────────────────────────────────────────────────────────────────

/**
 * Overshoots slightly past 1 before settling, which is what gives the card
 * its flick off the top of the deck rather than a plain ease-in. Not
 * `ease.out` above: that curve never exceeds 1, so it cannot produce an
 * overshoot at all. Private: nothing outside `cardRiseVariants` below needs
 * it, since CardMinter no longer builds its own CSS transition string.
 */
const CARD_RISE_EASE = [0.3, 1.1, 0.4, 1] as const;

/**
 * The card rising off the deck to enter, and sinking back into it to leave.
 * Mounted and unmounted by `AnimatePresence` in CardMinter.tsx, so the exit
 * actually gets to play before the card leaves the tree, rather than being
 * cut off by an unmount racing its own transition.
 *
 * This carries only the rise (opacity, `y`, `scale`): the turn from the
 * card's blank back to its printed front is a separate `rotateY` on a
 * `preserve-3d` child, kept as a plain CSS transition rather than folded in
 * here. That split is deliberate, not leftover: a previous round proved in a
 * real browser that a CSS transition on that 3D transform keeps
 * `backface-visibility: hidden` doing its job (the front never shows while
 * the card faces away), and moving that specific transform onto `motion`
 * risked exactly the leak this reveal exists to prevent. This variant never
 * touches a 3D property, so it carries none of that risk; CARD_FLIP_EASE
 * below still drives the turn itself.
 *
 * Durations are read from lib/card/revealSequence.ts
 * (FULL_REVEAL.cardRise.duration to enter, EXIT_REVEAL.sink.duration to
 * leave), the single source CardMinter's own flip timer also reads, not
 * restated here as separate numbers. The entrance overshoots past its
 * resting scale on `y` and `scale`, not on `opacity`: a fade that overshoots
 * past full opacity and back is a flicker, not a landing. The exit does not
 * overshoot at all, since retreating is not a moment that needs a flourish.
 */
export const cardRiseVariants: Variants = {
  hidden: { opacity: 0, y: 42, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      default: { duration: FULL_REVEAL.cardRise.duration / 1000, ease: CARD_RISE_EASE },
      opacity: { duration: FULL_REVEAL.cardRise.duration / 1000, ease: ease.out },
    },
  },
  exit: {
    opacity: 0,
    y: 42,
    scale: 0.92,
    transition: { duration: EXIT_REVEAL.sink.duration / 1000, ease: ease.out },
  },
};

/** The two idle cards behind the rising one, always present so the slot
 *  never looks empty before a roll. Offsets and rotation lifted verbatim
 *  from the owner's reference. Mirrored in app/globals.css as
 *  --deck-offset-back and --deck-offset-front, documentation only. */
export const DECK_OFFSET_BACK = "translate(6px, 8px) rotate(3deg)";
export const DECK_OFFSET_FRONT = "translate(-4px, 4px) rotate(-2deg)";

/**
 * The card's turn from its back to its printed front, and back again to
 * leave (a CSS `rotateY` transition on the element carrying both faces, kept
 * off `motion` for the reason documented on `cardRiseVariants` above).
 * Duration is FULL_REVEAL.flip.duration entering and EXIT_REVEAL.flip.
 * duration leaving, both in lib/card/revealSequence.ts: the component reads
 * the duration from there, this file only owns the curve.
 *
 * Linear would read as a spinning sign, so this is eased out (brisk start,
 * decelerating into face-up) and, like CARD_RISE_EASE, overshoots slightly
 * past its target (past 180deg) before settling back, so the turn ends with
 * a small settle rather than stopping dead. The standard "ease out back"
 * curve. Used for both directions: the exit's own turn is simply the same
 * curve run over EXIT_REVEAL.flip.duration instead of FULL_REVEAL.flip.
 * duration, not a second easing.
 */
export const CARD_FLIP_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/** How far the flip's perspective sits from the card, in CSS pixels: how
 *  pronounced the 3D turn looks. Kept here with every other flip token
 *  rather than pasted into CardMinter.tsx as a literal. */
export const CARD_FLIP_PERSPECTIVE = "1200px";

/** How long the pill's fill bar takes to grow to its new width. */
export const FILL_MS = 420;
/** A touch gentler than CARD_RISE_EASE and never overshoots: the fill is a
 *  meter, not a thrown object. */
export const FILL_EASE = "cubic-bezier(0.3, 1, 0.4, 1)";
