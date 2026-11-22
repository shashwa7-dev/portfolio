// The merman's sea-lane cycle: he waits under water, rises, stays up, dives,
// then comes up somewhere else; after a few cycles he leaves. A first hit
// makes him duck: he slips under over his hit window. Pure, world time only.
import type { Rng } from "./rng";

export type SurfacePhase = "wait" | "rise" | "up" | "dive" | "duck";
/** `cycle`: dives completed; `from`: how far under he was when the duck began (0 up, 1 under). */
export type Surface = { phase: SurfacePhase; t: number; cycle: number; from: number };

export const SURFACE = { wait: 1.2, rise: 0.55, up: 2.6, dive: 0.45, duck: 1.1 } as const;
export const SURFACE_CYCLES = 3;
export const SURFACE_X: readonly [number, number] = [0.15, 0.7];
// Fraction of his height above the water line when fully up.
export const SURFACE_OUT = 0.78;
// Px below the water line his head goes when he is under.
const UNDER_MARGIN = 4;

export function newSurface(): Surface {
  return { phase: "wait", t: 0, cycle: 0, from: 1 };
}

/** How far under he is: 0 fully up, 1 out of sight. */
export function under(s: Surface): number {
  const k = Math.min(1, s.t / SURFACE[s.phase]);
  switch (s.phase) {
    case "wait":
      return 1;
    case "rise":
      return Math.pow(1 - k, 3);
    case "up":
      return 0;
    case "dive":
      return k * k;
    case "duck":
      return s.from + (1 - s.from) * (k * k * 0.9 + k * 0.1);
  }
}

/** Px below the fully-up resting y. */
export function sinkOffset(s: Surface, h: number): number {
  return under(s) * (h * SURFACE_OUT + UNDER_MARGIN);
}

/** Starts the duck from wherever he is now. */
export function duck(s: Surface): void {
  s.from = under(s);
  s.phase = "duck";
  s.t = 0;
}

/** Dives from wherever he is now (the window lapsed). */
export function dive(s: Surface): void {
  const u = under(s);
  s.phase = "dive";
  s.t = Math.sqrt(u) * SURFACE.dive;
}

/** Advances the cycle; returns "moved" when he should come up at a new x, "gone" when he leaves. */
export function stepSurface(s: Surface, dt: number): "moved" | "gone" | null {
  s.t += dt;
  if (s.phase === "duck") return null; // the world ends a duck when his window lapses
  if (s.t < SURFACE[s.phase]) return null;
  s.t -= SURFACE[s.phase];
  if (s.phase === "wait") s.phase = "rise";
  else if (s.phase === "rise") s.phase = "up";
  else if (s.phase === "up") s.phase = "dive";
  else {
    s.phase = "wait";
    s.cycle += 1;
    return s.cycle >= SURFACE_CYCLES ? "gone" : "moved";
  }
  return null;
}

export const surfaceX = (rng: Rng, width: number, w: number) =>
  Math.min(width - w, (SURFACE_X[0] + rng() * (SURFACE_X[1] - SURFACE_X[0])) * width);
