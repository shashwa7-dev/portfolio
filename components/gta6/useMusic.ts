"use client";

import { useEffect, useSyncExternalStore } from "react";
import { PLAYLIST } from "@/components/gta6/track";
import { createRadio, type RadioState } from "@/lib/gta6/radioEngine";

export type { RadioState };

/** The YouTube API not here by then means it is blocked: "Radio unavailable". */
const LOAD_TIMEOUT = 8000; // ms

/** The fade time, read from the token so music and art fade together. */
function fadeMs(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--duration-gta-fade")
    .trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 0;
  return raw.endsWith("ms") ? n : n * 1000;
}

/**
 * The only radio. Module-level, so there is one player at a time and every
 * card (hero and HUD) shows the same track, even across remounts.
 */
const engine = createRadio({
  ids: PLAYLIST.map((t) => t.id),
  fadeMs,
  silent: () => navigator.webdriver,
  open(firstId, handlers, wanted) {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    // YouTube wants a player of at least 200x200; it is simply never seen.
    Object.assign(host.style, {
      position: "fixed",
      left: "-400px",
      top: "0",
      width: "200px",
      height: "200px",
      overflow: "hidden",
      opacity: "0",
      pointerEvents: "none",
    });
    document.body.appendChild(host);
    const player = import("@/components/common/youtube").then(async (m) => {
      await m.primeYouTube(LOAD_TIMEOUT);
      if (!wanted()) return null;
      const p = m.createPlayer(host, { videoId: firstId, title: "Vice FM" }, handlers);
      const frame = host.querySelector("iframe");
      if (frame) Object.assign(frame.style, { width: "100%", height: "100%", border: "0" });
      return p;
    });
    return { player, close: () => host.remove() };
  },
});

/** The radio's controls, safe to call with no player (automation, blocked). */
export const radio = {
  next: engine.next,
  prev: engine.prev,
  select: engine.select,
  togglePause: engine.togglePause,
  toggleMute: engine.toggleMute,
  retry: engine.retry,
};

/** The radio's state, for the cards. */
export function useRadio(): RadioState {
  return useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
}

/**
 * Vice FM, while `active`: the 31-track playlist on one hidden YouTube
 * player (off-screen, 200x200, invisible): the first track (the theme),
 * then the rest in an order shuffled once per session and looped (session
 * logic in `lib/gta6/radioEngine.ts`).
 *
 * The player is built when the mode turns on, plays on ready, and fades up
 * from silence once it is really playing. When a track ends the next one
 * in the order plays, looping round. Turning off fades it back to silence,
 * then destroys it; turning on again during that fade keeps the same player
 * (and track) and fades it back up.
 *
 * Under automation (`navigator.webdriver`) no player is ever made: test runs
 * stay silent, while the cards' controls still move their state.
 *
 * `setDuck(true)` steps the volume down (the game's Bigfoot event) and
 * `setDuck(false)` back up, over the same fade.
 */
export function useMusic(active: boolean): { setDuck(on: boolean): void } {
  useEffect(() => {
    if (!active) return;
    engine.start();
    return engine.stop;
  }, [active]);

  return { setDuck: engine.setDuck };
}
