"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useGtaMode } from "@/components/gta6/useGtaMode";

/** The mode itself: wallpapers, music and styles. Client only, and fetched
 *  the first time the mode turns on, never with the page. */
const GtaMode = dynamic(() => import("@/components/gta6/GtaMode"), { ssr: false });

/**
 * Keeps the GTA 6 mode in the hero while it is on, and for its fade out after
 * it turns off. `shown` outlives `on` until `GtaMode` reports it has faded;
 * turning back on mid-fade simply clears `leaving` again.
 */
export default function GtaModeMount() {
  const on = useGtaMode();
  const [shown, setShown] = useState(false);
  // Derived during render rather than in an effect, so the mode mounts in
  // the same commit that turned it on.
  if (on && !shown) setShown(true);
  if (!shown) return null;
  return <GtaMode leaving={!on} onGone={() => setShown(false)} />;
}
