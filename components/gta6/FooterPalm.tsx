"use client";

import { TreePalm } from "@phosphor-icons/react/ssr";
import { gtaMode } from "@/lib/gta6/store";
import { useGtaMode } from "@/components/gta6/useGtaMode";

/**
 * The quiet way into Vice City mode, for visitors who never find the spin:
 * a palm in the footer's bottom bar that toggles it. The click is a user
 * gesture, so the YouTube API starts loading inside it (the track may then
 * play with sound), and the mode turns on at once rather than after the load.
 */
export default function FooterPalm() {
  const on = useGtaMode();
  return (
    <button
      type="button"
      aria-label="Vice City mode"
      title="Vice City mode"
      aria-pressed={on}
      onClick={() => {
        void import("@/components/common/youtube").then((m) => m.primeYouTube());
        gtaMode.set(!gtaMode.get());
      }}
      className="grid place-items-center text-subtle transition-colors duration-fast ease-out hover:text-foreground"
    >
      <TreePalm aria-hidden className="h-3.5 w-3.5" />
    </button>
  );
}
