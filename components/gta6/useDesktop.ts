"use client";

import { useSyncExternalStore } from "react";

/** The GTA 6 mode is desktop only (spec, revision 2): a wide screen and a
 *  mouse. Phones and tablets get no palm, no star meter and no mode. */
export const GTA_DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

/** Whether this screen qualifies for the mode right now. */
export function isGtaDesktop(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia(GTA_DESKTOP_QUERY).matches;
}

function subscribe(listener: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(GTA_DESKTOP_QUERY);
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
}

/** `isGtaDesktop`, kept live. False on the server and on first paint. */
export function useGtaDesktop(): boolean {
  return useSyncExternalStore(subscribe, isGtaDesktop, () => false);
}
