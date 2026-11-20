"use client";

import { useEffect, useRef, useState } from "react";
import type { YouTubePlayer } from "@/components/common/youtube";
import { TRACK_ID } from "@/components/gta6/track";

/** The track's volume once faded in (YouTube's 0 to 100 scale). */
const VOLUME = 60;
/** Volume steps per fade. */
const FADE_STEPS = 20;
/** No "playing" this long after play() means the browser refused it (Safari
 *  without a fresh gesture), so the tag turns into a play button. */
const REFUSED_AFTER = 4000; // ms

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
 * The Vice City track, while `active`.
 *
 * A hidden YouTube player (off-screen, 1x1) is built when the mode turns on,
 * starts playing on ready, and fades up from silence to `VOLUME` once it is
 * really playing. Turning off fades it back to silence, then destroys it.
 * `onEnded` runs when the track finishes.
 *
 * Under automation (`navigator.webdriver`) no player is ever made: test runs
 * stay silent.
 *
 * `blocked` is true when playback failed or was refused; `retry()` is for a
 * play button, so it runs inside the visitor's click.
 */
export function useMusic(active: boolean, onEnded: () => void): { blocked: boolean; retry(): void } {
  const [blocked, setBlocked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ended = useRef(onEnded);
  useEffect(() => {
    ended.current = onEnded;
  });
  // The live player and whether it errored, for retry().
  const live = useRef<{ player: YouTubePlayer | null; failed: boolean; refused: number }>({
    player: null,
    failed: false,
    refused: 0,
  });

  useEffect(() => {
    if (!active || navigator.webdriver) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;
    let volume = 0;
    let ramp = 0;
    const l = live.current;
    l.failed = false;

    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    Object.assign(host.style, {
      position: "fixed",
      left: "-10px",
      top: "-10px",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      pointerEvents: "none",
    });
    document.body.appendChild(host);

    /** Steps the volume to `to` over the fade time, then runs `done`. */
    const fadeTo = (to: number, done?: () => void) => {
      window.clearInterval(ramp);
      const from = volume;
      const every = fadeMs() / FADE_STEPS;
      let step = 0;
      ramp = window.setInterval(() => {
        step += 1;
        volume = from + ((to - from) * step) / FADE_STEPS;
        player?.setVolume(volume);
        if (step < FADE_STEPS) return;
        window.clearInterval(ramp);
        done?.();
      }, every);
    };

    void import("@/components/common/youtube").then(async (m) => {
      await m.primeYouTube();
      if (cancelled) return;
      player = m.createPlayer(
        host,
        { videoId: TRACK_ID, title: "Vice City mode" },
        {
          onReady() {
            if (cancelled) return;
            player?.play();
            window.clearTimeout(l.refused);
            l.refused = window.setTimeout(() => setBlocked(true), REFUSED_AFTER);
          },
          onPlaying() {
            // Never fade back up over a fade out that has begun.
            if (cancelled) return;
            window.clearTimeout(l.refused);
            setBlocked(false);
            fadeTo(VOLUME);
          },
          onEnded() {
            if (!cancelled) ended.current();
          },
          onError() {
            if (cancelled) return;
            window.clearTimeout(l.refused);
            l.failed = true;
            setBlocked(true);
          },
        },
      );
      l.player = player;
    });

    return () => {
      cancelled = true;
      window.clearTimeout(l.refused);
      l.player = null;
      setBlocked(false);
      const p = player;
      if (!p) {
        window.clearInterval(ramp);
        host.remove();
        return;
      }
      // Fade out from wherever the volume is, then let the player go.
      fadeTo(0, () => {
        p.destroy();
        host.remove();
      });
    };
  }, [active, attempt]);

  return {
    blocked,
    retry() {
      const l = live.current;
      setBlocked(false);
      // A refused player can simply be asked again, now inside a click; one
      // that errored is rebuilt.
      if (l.player && !l.failed) {
        l.player.play();
        window.clearTimeout(l.refused);
        l.refused = window.setTimeout(() => setBlocked(true), REFUSED_AFTER);
      } else {
        setAttempt((n) => n + 1);
      }
    },
  };
}
