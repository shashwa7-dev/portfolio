/**
 * Truffy's face: what it looks at and which expression it wears.
 *
 * Pure functions only. `components/chat/TruffyFace.tsx` feeds these from
 * pointer, scroll and visibility events and draws the result; keeping the
 * decisions here is what lets them be tested without a DOM.
 */

export const FACE = {
  /** Cursor closer than this to the face's centre makes it happy. */
  nearPx: 120,
  /** Pointer speed, in px per ms, that counts as a fast swoop. */
  fastPxPerMs: 3,
  /** How long the startled look holds after a fast swoop. */
  startleMs: 700,
  /** No pointer, scroll or key activity for this long and it dozes off. */
  sleepAfterMs: 20_000,
  /** How long it stays happy after the tab comes back into view. */
  perkMs: 1_200,
  /** Distance at which the gaze reaches its full turn. */
  reachPx: 320,
  blinkMinMs: 3_000,
  blinkMaxMs: 6_000,
  /** Share of blinks that are a quick double. */
  doubleBlinkChance: 0.2,
} as const;

export type Mood =
  | "idle"
  | "happy"
  | "startled"
  | "sleepy"
  | "away"
  | "listening"
  | "thinking"
  | "talking";

/**
 * Where the chat is. `thinking` is a sent message with no reply text yet;
 * `replying` is text arriving.
 */
export type ChatPhase = "closed" | "idle" | "typing" | "thinking" | "replying";

export type Point = { x: number; y: number };

export interface MoodInput {
  hidden: boolean;
  chat: ChatPhase;
  idleMs: number;
  /** Pointer distance from the face's centre, in px. */
  distance: number;
  /** Time since the last fast swoop. */
  sinceFastMs: number;
  /** Time since the tab became visible again. */
  sinceBackMs: number;
}

/**
 * Gaze as a vector inside the unit circle. It grows with distance and reaches
 * full length at `reach`, so the eyes ease toward a near cursor instead of
 * snapping to the edge the moment it moves.
 */
export function lookAt(target: Point, centre: Point, reach: number = FACE.reachPx): Point {
  const dx = target.x - centre.x;
  const dy = target.y - centre.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { x: 0, y: 0 };
  const length = Math.min(1, dist / reach);
  return { x: (dx / dist) * length, y: (dy / dist) * length };
}

/** Ordered: the first rule that holds wins. */
export function pickMood(s: MoodInput): Mood {
  if (s.hidden) return "away";
  if (s.chat === "replying") return "talking";
  if (s.chat === "thinking") return "thinking";
  if (s.chat === "typing") return "listening";
  if (s.idleMs >= FACE.sleepAfterMs) return "sleepy";
  if (s.sinceFastMs < FACE.startleMs) return "startled";
  if (s.sinceBackMs < FACE.perkMs) return "happy";
  if (s.distance < FACE.nearPx) return "happy";
  return "idle";
}

/**
 * A fixed gaze for moods that are about something other than the cursor, or
 * null when the cursor should keep driving it. Listening looks down toward
 * the input, thinking glances up and away, away looks at the floor.
 */
export function lookFor(mood: Mood): Point | null {
  switch (mood) {
    case "away":
      return { x: 0, y: 0.9 };
    case "listening":
      return { x: 0.25, y: 0.85 };
    case "thinking":
      return { x: -0.6, y: -0.75 };
    case "sleepy":
      return { x: 0, y: 0.35 };
    default:
      return null;
  }
}

/** The next blink, from two random numbers in [0, 1). */
export function blinkPlan(gapRandom: number, doubleRandom: number) {
  return {
    waitMs: Math.round(FACE.blinkMinMs + gapRandom * (FACE.blinkMaxMs - FACE.blinkMinMs)),
    double: doubleRandom < FACE.doubleBlinkChance,
  };
}
