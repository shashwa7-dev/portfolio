"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { gtaMode } from "@/lib/gta6/store";
import { useGtaMode } from "@/components/gta6/useGtaMode";
import { useGtaDesktop } from "@/components/gta6/useDesktop";

/** The mode itself: wallpapers, music and styles. Client only, and fetched
 *  the first time the mode turns on, never with the page. */
const GtaMode = dynamic(() => import("@/components/gta6/GtaMode"), { ssr: false });

/**
 * Keeps the GTA 6 mode in the hero while it is on, and for its fade out after
 * it turns off. `shown` outlives `on` until `GtaMode` reports it has faded;
 * turning back on mid-fade simply clears `leaving` again.
 *
 * Desktop only: a screen that stops qualifying (resized narrow, say) turns
 * the mode off, so the pill never shows on a phone or tablet layout.
 */
export default function GtaModeMount() {
  const on = useGtaMode();
  const desktop = useGtaDesktop();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!desktop) gtaMode.set(false);
  }, [desktop]);
  // Derived during render rather than in an effect, so the mode mounts in
  // the same commit that turned it on.
  if (on && !shown) setShown(true);
  if (!shown) return null;
  return <GtaMode leaving={!on} onGone={() => setShown(false)} />;
}
