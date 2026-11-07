export const VIDEO_ID = "QirCMADtks8";
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
  | { type: "RETURNED" };

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
