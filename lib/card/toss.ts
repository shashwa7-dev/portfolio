/**
 * The toss skin's parabolic arc, as tested data.
 *
 * Pure and DOM-free like the rest of lib/card: this returns plain keyframe
 * objects and never calls `element.animate` itself. TossDice.tsx is the
 * only caller, and it hands these straight to the Web Animations API.
 *
 * Per-keyframe easing is the reason this exists as data rather than a
 * single Framer Motion curve: a thrown die rises slower than it falls, and
 * no one cubic-bezier can express that direction change. Two easings
 * glued together, one per half of the arc, is a shape a motion *variant*
 * cannot hold; TOSS_EASE in lib/motionVariants.ts carries the curves
 * themselves, this module only shapes them into keyframes.
 */
import { TOSS_EASE } from "@/lib/motionVariants";

/** One die's trajectory, as an offset from wherever it rests. */
export type Arc = {
  /** Horizontal drift at the apex, and where the die ends up landing. */
  outX: number;
  /** How high the die rises. Negative: up is negative Y on screen. */
  upY: number;
  /** Total rotation in degrees; sign is spin direction. */
  spin: number;
};

/**
 * The two dice never fly as a pair: different apex, opposite spin, so two
 * dice landing at once doesn't read as one object mirrored.
 */
export const ARCS: readonly [Arc, Arc] = [
  { outX: 0, upY: -150, spin: 540 },
  { outX: 0, upY: -186, spin: -430 },
];

/**
 * Three keyframes: docked, apex, docked again. The die returns to exactly
 * where it started (translate 0, rotate 0), so CSS/rest state can take
 * back over the instant the animation ends without a visible jump.
 *
 * The rise (offset 0 to 0.5) and the fall (offset 0.5 to 1) each need
 * their own easing, declared on the keyframe that starts that segment:
 * `easing` on the offset-0 keyframe drives the rise, `easing` on the
 * offset-0.5 keyframe drives the fall. The final keyframe has none: there
 * is no segment after it for an easing to shape.
 */
export function tossKeyframes(arc: Arc): Keyframe[] {
  return [
    {
      transform: "translate(0px, 0px) rotate(0deg) scale(1)",
      offset: 0,
      easing: TOSS_EASE.rise,
    },
    {
      transform: `translate(${arc.outX * 0.5}px, ${arc.upY}px) rotate(${arc.spin * 0.6}deg) scale(1.06)`,
      offset: 0.5,
      easing: TOSS_EASE.fall,
    },
    {
      transform: `translate(${arc.outX}px, 0px) rotate(${arc.spin}deg) scale(1)`,
      offset: 1,
    },
  ];
}
