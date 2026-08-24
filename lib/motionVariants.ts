import type { Variants } from "motion/react";
import type { Die } from "@/lib/card/types";

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
// Dice cube (DiceRoller) — a real `preserve-3d` cube rather than a flat
// SVG face flickering through random values. `duration.throw` and
// `ease.throw` above are its tokens.
// ──────────────────────────────────────────────────────────────────────

/**
 * Cube rotation, in degrees, that puts a given face toward the viewer. The
 * inverse of each face's placement transform in DiceRoller.tsx. Stated once
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
