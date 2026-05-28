import type { Variants, Transition } from "motion/react";

// ──────────────────────────────────────────────────────────────────────
// Tokens
// ──────────────────────────────────────────────────────────────────────
// Easings, durations, and springs reused across the app. Mirror the
// `--ease-out` CSS variable defined in globals.css so motion props and
// CSS transitions feel consistent.

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  modal: [0.23, 1, 0.32, 1] as const,
} as const;

export const duration = {
  fast: 0.15,
  base: 0.2,
  slow: 0.4,
  hero: 0.5,
} as const;

export const spring = {
  /** Calm pop. Chat windows, popovers. */
  soft: { type: "spring", stiffness: 300, damping: 30 } satisfies Transition,
  /** Confident pop with weight. FABs, attention buttons. */
  pop: { type: "spring", stiffness: 380, damping: 24, mass: 0.85 } satisfies Transition,
  /** Slightly bouncier inner hover, e.g. the FAB's image inside its shell. */
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

/** Container that slides itself up while staggering children. */
export const slideUpContainerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, ease: ease.out, duration: duration.slow },
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
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: ease.out } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18, ease: ease.out } },
};

/** Popover that floats up from below — small toasts, notification bubbles. */
export const popoverUpVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: duration.base } },
};

/** Modal/dialog panel — gentle scale with a custom curve. */
export const dialogPopVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.modal } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.base, ease: ease.modal } },
};

/** Pure fade for backdrops / overlays. */
export const backdropFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.modal } },
  exit: { opacity: 0, transition: { duration: duration.base, ease: ease.modal } },
};

/** FAB pop-in: starts small + rotated, lands upright. Exits fast. */
export const fabPopVariants: Variants = {
  hidden: { scale: 0.5, opacity: 0, rotate: -12 },
  visible: { scale: 1, opacity: 1, rotate: 0, transition: spring.pop },
  exit: { scale: 0.7, opacity: 0, transition: { duration: duration.fast, ease: ease.out } },
};

/** Chat window / large floating panel — slides up + scales, soft spring. */
export const chatWindowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.soft },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: spring.soft },
};

/** Accordion-style height collapse. Pair with overflow-hidden on the consumer. */
export const collapseHeightVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

/** Per-word blur-in for hero titles. Use `custom={index}` to stagger via delay. */
export const blurInVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.hero, delay: i * 0.05, ease: ease.out },
  }),
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

export const hoverLift = { scale: 1.06 } as const;
export const hoverLiftRotate = { scale: 1.06, rotate: -3 } as const;
export const hoverZoom = { scale: 1.08 } as const;
export const tapPress = { scale: 0.94 } as const;
