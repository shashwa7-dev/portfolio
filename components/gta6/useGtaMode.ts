"use client";

import { useSyncExternalStore } from "react";
import { gtaMode } from "@/lib/gta6/store";

/** Whether the GTA 6 mode is on. Always off on the server and on first paint,
 *  since a reload starts normal. */
export function useGtaMode(): boolean {
  return useSyncExternalStore(gtaMode.subscribe, gtaMode.get, () => false);
}
