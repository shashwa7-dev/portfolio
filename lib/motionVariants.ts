import type { Variants, Transition } from "motion/react";

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

export const spring = {
  /** Chat FAB inner hover. The only spring left; keep it subtle. */
  hoverIn: { type: "spring", stiffness: 300, damping: 22 } satisfies Transition,
} as const;

// ──────────────────────────────────────────────────────────────────────
// Variants — use with `variants={...}` + `initial="hidden" animate="visible"`
// ──────────────────────────────────────────────────────────────────────

/** Pure stagger container — children fade in sequence, parent stays put. */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

/** Default child item for stagger containers. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/** Plain fade-in, no movement. */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
};

/** Reveal-on-scroll, used by the <Reveal> primitive. */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/** Generic "fade up from 10px below" — the most reused inline pattern in the app. */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
  exit: { opacity: 0, y: 10, transition: { duration: duration.fast, ease: ease.out } },
};

/** Popover that drops down from above (`y:-8`) with a touch of scale. */
export const popoverDownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: duration.fast, ease: ease.out } },
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

// ──────────────────────────────────────────────────────────────────────
// Hover / tap targets — use with `whileHover` / `whileTap`
// ──────────────────────────────────────────────────────────────────────
// These are animation targets, not full variants. Compose them with
// a transition prop on the consumer if a non-default feel is needed.

export const hoverLiftRotate = { scale: 1.02 } as const;
export const hoverZoom = { scale: 1.02 } as const;
export const tapPress = { scale: 0.97 } as const;
