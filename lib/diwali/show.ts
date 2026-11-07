/** The song stops at 1:07. (Its id lives in `lib/diwali/video.ts`, out of the hero bundle.) */
export const VIDEO_END_SECONDS = 67;

export type Phase =
  | "idle" | "lit" | "centre" | "corner" | "finale" | "plate" | "picked" | "returning";

export type ShowState = { phase: Phase; picked: number | null };
export const INITIAL: ShowState = { phase: "idle", picked: null };

export type ShowEvent =
  | { type: "LIGHT" }
  | { type: "FUSE_BURNT" }
  | { type: "CENTRE_HOLD_DONE" }
  | { type: "VIDEO_ENDED" }
  | { type: "SKIP" }
  | { type: "ESCAPE" }
  | { type: "OPEN_PLATE" }
  | { type: "PICK"; index: number }
  | { type: "PICK_DONE" }
  | { type: "RETURNED" }
  /** The show could not load or render: back to rest from wherever it was. */
  | { type: "ABORT" };

export function reduce(state: ShowState, event: ShowEvent): ShowState {
  const { phase } = state;
  switch (event.type) {
    case "LIGHT":
      return phase === "idle" ? { phase: "lit", picked: null } : state;
    case "FUSE_BURNT":
      return phase === "lit" ? { ...state, phase: "centre" } : state;
    case "CENTRE_HOLD_DONE":
      return phase === "centre" ? { ...state, phase: "corner" } : state;
    case "VIDEO_ENDED":
    case "SKIP":
      return phase === "centre" || phase === "corner" ? { ...state, phase: "finale" } : state;
    case "ESCAPE":
      if (phase === "centre" || phase === "corner") return { ...state, phase: "finale" };
      if (phase === "finale") return { ...state, phase: "plate" };
      return state;
    case "OPEN_PLATE":
      return phase === "finale" ? { ...state, phase: "plate" } : state;
    case "PICK":
      return phase === "plate" ? { phase: "picked", picked: event.index } : state;
    case "PICK_DONE":
      return phase === "picked" ? { ...state, phase: "returning" } : state;
    case "RETURNED":
      return phase === "returning" ? INITIAL : state;
    case "ABORT":
      return phase === "idle" ? state : INITIAL;
    default:
      return state;
  }
}

export function shouldPlayVideo(phase: Phase): boolean {
  return phase === "centre" || phase === "corner";
}

export function isOverlayOpen(phase: Phase): boolean {
  return phase !== "idle" && phase !== "lit";
}

export function videoReachedEnd(seconds: number): boolean {
  return seconds >= VIDEO_END_SECONDS;
}

export function chakriBox(
  phase: "centre" | "corner",
  vw: number,
  vh: number,
): { x: number; y: number; size: number } {
  const m = Math.min(vw, vh);
  if (phase === "centre") {
    const size = 0.36 * m;
    return { x: (vw - size) / 2, y: (vh - size) / 2, size };
  }
  const size = Math.max(80, 0.15 * m);
  const margin = Math.max(28, 0.4 * size);
  return { x: vw - size - margin, y: vh - size - margin, size };
}

/** A square on screen by its centre, side and rotation (degrees). */
export type FlyerBox = { cx: number; cy: number; size: number; rotate: number };

/** A chakriBox (top-left corner and side) as a FlyerBox, unrotated. */
export function toFlyerBox(b: { x: number; y: number; size: number }): FlyerBox {
  return { cx: b.x + b.size / 2, cy: b.y + b.size / 2, size: b.size, rotate: 0 };
}

/**
 * The transform that puts the flyer, laid out once at `base` (the centre
 * box) with its origin at its centre, onto `box`. The flight is this
 * transform transitioning, never the flyer's layout box (FLIP).
 */
export function flyerTransform(
  box: FlyerBox,
  base: { x: number; y: number; size: number },
): string {
  const dx = box.cx - (base.x + base.size / 2);
  const dy = box.cy - (base.y + base.size / 2);
  const s = base.size > 0 ? box.size / base.size : 1;
  return `translate(${dx}px, ${dy}px) scale(${s}) rotate(${box.rotate}deg)`;
}
