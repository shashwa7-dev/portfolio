"use client";

import { createContext, useContext } from "react";

/**
 * Bullet holes in the hero's frosted veil. Vice Hunt reports each shot in
 * hero (header) coordinates; `add` punches a clear hole there, so the
 * wallpaper shows through sharp, and `clear` frosts the veil over again.
 * `GtaMode` provides the real sink; outside it, shots go nowhere.
 */
export type HoleSink = { add(x: number, y: number): void; clear(): void };

/** Older holes heal as new ones land, so the mask stays cheap to paint. */
export const MAX_HOLES = 12;

export const HoleSinkContext = createContext<HoleSink>({ add() {}, clear() {} });

export function useHoleSink(): HoleSink {
  return useContext(HoleSinkContext);
}

/** One soft-edged clear circle per hole; with `intersect` compositing, each
 *  layer only takes away from the veil. */
export function holeMask(points: ReadonlyArray<readonly [number, number]>): string {
  return points
    .map(([x, y]) => `radial-gradient(circle at ${x}px ${y}px, transparent 0 25px, #000 46px)`)
    .join(", ");
}
