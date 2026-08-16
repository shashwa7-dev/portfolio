import type { Variants } from "motion/react";

// ──────────────────────────────────────────────────────────────────────
// Tokens
// ──────────────────────────────────────────────────────────────────────
// Easings, durations, and springs reused across the app. Mirror the
// `--ease-out` CSS variable defined in globals.css so motion props and
// CSS transitions feel consistent.

export const ease = {
  /** Emil Kowalski's published strong ease-out. The single UI curve. */
  out: [0.23, 1, 0.32, 1] as const,
} as const;

export const duration = {
  fast: 0.15,
  base: 0.2,
  med: 0.3,
  /** Entrances. Was 0.4, which broke the sub-300ms UI budget. */
  slow: 0.24,
  /** 404 page sequence only. The one sanctioned exception. */
  hero: 0.5,
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
// Hover / tap targets — use with `whileHover` / `whileTap`
// ──────────────────────────────────────────────────────────────────────
// These are animation targets, not full variants. Compose them with
// a transition prop on the consumer if a non-default feel is needed.

export const hoverLiftRotate = { scale: 1.02 } as const;
export const tapPress = { scale: 0.97 } as const;
