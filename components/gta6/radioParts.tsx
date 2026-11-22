"use client";

import { useSyncExternalStore } from "react";
import { Pause, Play } from "@phosphor-icons/react/ssr";
import { PLAYLIST } from "@/components/gta6/track";
import { radio, type RadioState } from "@/components/gta6/useMusic";
import { trackTitle } from "@/lib/gta6/radio";

/**
 * What Vice FM's two surfaces share: the card (`Radio.tsx`, in the hero's
 * popover and the game's HUD) and the hero pill (`RadioPill.tsx`).
 */

/** A track's YouTube cover thumbnail. */
export function cover(id: string): string {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

/** Playlist entry `i`'s names; "Track N" only if the entry is missing. */
export function names(i: number): { title: string; artist: string } {
  const track = PLAYLIST[i];
  return { title: trackTitle(i, track?.title), artist: track?.artist ?? "" };
}

/** The current track's id and names. */
export function nowPlaying(r: RadioState) {
  const index = r.order[r.position];
  return { id: PLAYLIST[index]?.id ?? "", ...names(index) };
}

/** Play/pause, or a retry while the browser has refused playback. */
export function PlayPause({ r, className }: { r: RadioState; className?: string }) {
  const showPause = !r.paused && !r.blocked;
  return (
    <button
      type="button"
      aria-label={showPause ? "Pause" : "Play"}
      title={showPause ? "Pause" : "Play"}
      onClick={r.blocked ? radio.retry : radio.togglePause}
      className={className}
    >
      {showPause ? <Pause aria-hidden weight="fill" /> : <Play aria-hidden weight="fill" />}
    </button>
  );
}

/**
 * How many HUD radios are mounted. While the game is open its HUD radio is
 * the one in view, so only it announces track changes: one live region at a
 * time, never the hero pill's (under the overlay) as well.
 */
let huds = 0;
const hudWatchers = new Set<() => void>();
function watchHuds(fn: () => void) {
  hudWatchers.add(fn);
  return () => {
    hudWatchers.delete(fn);
  };
}
export function countHud(delta: number) {
  huds += delta;
  for (const fn of hudWatchers) fn();
}
export function useHudOpen(): boolean {
  return useSyncExternalStore(watchHuds, () => huds > 0, () => false);
}
