"use client";

import { useEffect, useRef, useState } from "react";
import type { YouTubePlayer } from "@/components/common/youtube";
import { TRACK_ID } from "@/components/gta6/track";

/** The track's volume once faded in (YouTube's 0 to 100 scale). */
const VOLUME = 60;
/** The volume while the game asks the music to step back (Bigfoot). */
const DUCKED = 25;
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

/** Where the track's state goes: the component that wants it right now. */
type Listener = { blocked(on: boolean): void; playing(on: boolean): void; ended(): void };

/** One hidden player and everything about it. */
type Session = {
  host: HTMLDivElement;
  player: YouTubePlayer | null;
  /** Wanted: false while it fades out to be destroyed. */
  active: boolean;
  /** Torn down for good; late callbacks are ignored. */
  dead: boolean;
  failed: boolean;
  playing: boolean;
  volume: number;
  /** Ducked under the game's Bigfoot event. */
  duck: boolean;
  ramp: number;
  refused: number;
  listen: Listener;
};

/**
 * The only session. Module-level rather than a ref, so there is never more
 * than one player, even if the mode turns back on (or remounts) while the
 * last one is still fading out: that one is picked up again instead.
 */
let session: Session | null = null;

/** Steps the volume to `to` over the fade time, then runs `done`. Cancels
 *  any fade already under way, from wherever the volume has got to. */
function fadeTo(s: Session, to: number, done?: () => void) {
  window.clearInterval(s.ramp);
  const from = s.volume;
  let step = 0;
  s.ramp = window.setInterval(() => {
    step += 1;
    s.volume = from + ((to - from) * step) / FADE_STEPS;
    s.player?.setVolume(s.volume);
    if (step < FADE_STEPS) return;
    window.clearInterval(s.ramp);
    done?.();
  }, fadeMs() / FADE_STEPS);
}

/** Where the volume rests while playing: full, or ducked. */
function level(s: Session): number {
  return s.duck ? DUCKED : VOLUME;
}

/** Asks for playback and starts the refusal clock. */
function play(s: Session) {
  s.player?.play();
  window.clearTimeout(s.refused);
  s.refused = window.setTimeout(() => s.listen.blocked(true), REFUSED_AFTER);
}

function kill(s: Session) {
  s.dead = true;
  s.playing = false;
  window.clearInterval(s.ramp);
  window.clearTimeout(s.refused);
  s.player?.destroy();
  s.host.remove();
  if (session === s) session = null;
}

function build(listen: Listener): Session {
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
  const s: Session = {
    host,
    player: null,
    active: true,
    dead: false,
    failed: false,
    playing: false,
    volume: 0,
    duck: false,
    ramp: 0,
    refused: 0,
    listen,
  };
  // A fresh player (the retry path included) has not played yet.
  listen.playing(false);

  void import("@/components/common/youtube").then(async (m) => {
    await m.primeYouTube();
    if (s.dead) return;
    // Turned off while the API loaded: nothing to fade, just go.
    if (!s.active) return kill(s);
    s.player = m.createPlayer(
      host,
      { videoId: TRACK_ID, title: "Vice City mode" },
      {
        onReady() {
          if (s.active && !s.dead) play(s);
        },
        onPlaying() {
          if (s.dead) return;
          // Recorded even while fading out, so taking the session back
          // knows it only needs a fade up, not another play().
          s.playing = true;
          // Never fade back up over a fade out that has begun.
          if (!s.active) return;
          window.clearTimeout(s.refused);
          s.listen.blocked(false);
          s.listen.playing(true);
          fadeTo(s, level(s));
        },
        onEnded() {
          if (s.active && !s.dead) s.listen.ended();
        },
        onError() {
          if (s.dead) return;
          window.clearTimeout(s.refused);
          s.failed = true;
          s.listen.blocked(true);
        },
      },
    );
  });
  return s;
}

/**
 * The Vice City track, while `active`.
 *
 * A hidden YouTube player (off-screen, 1x1) is built when the mode turns on,
 * starts playing on ready, and fades up from silence to `VOLUME` once it is
 * really playing. Turning off fades it back to silence, then destroys it;
 * turning on again during that fade keeps the same player and fades it back
 * up. `onEnded` runs when the track finishes.
 *
 * Under automation (`navigator.webdriver`) no player is ever made: test runs
 * stay silent.
 *
 * `setDuck(true)` steps the volume down to `DUCKED` (the game's Bigfoot
 * event) and `setDuck(false)` back up, over the same fade.
 *
 * `playing` is true from the first moment it really plays. `blocked` is true
 * when playback failed or was refused; `retry()` is for a play button, so it
 * runs inside the visitor's click.
 */
export function useMusic(
  active: boolean,
  onEnded: () => void,
): { playing: boolean; blocked: boolean; retry(): void; setDuck(on: boolean): void } {
  const [blocked, setBlocked] = useState(false);
  const [playing, setPlaying] = useState(() => session?.playing ?? false);
  const [attempt, setAttempt] = useState(0);
  const ended = useRef(onEnded);
  useEffect(() => {
    ended.current = onEnded;
  });

  useEffect(() => {
    if (!active || navigator.webdriver) return;
    const listen: Listener = {
      blocked: setBlocked,
      playing: setPlaying,
      ended: () => ended.current(),
    };
    let s = session;
    if (s && !s.failed) {
      // Still fading out from a moment ago: take it back.
      s.active = true;
      s.listen = listen;
      // Always stop the fade out first, or it would destroy the player
      // under the mode a moment from now.
      window.clearInterval(s.ramp);
      if (s.playing) {
        listen.playing(true);
        fadeTo(s, level(s));
      } else if (s.player) {
        // Asked to play but not playing yet: ask again; onPlaying fades up.
        play(s);
      }
    } else {
      if (s) kill(s);
      s = build(listen);
      session = s;
    }
    const mine = s;

    return () => {
      mine.active = false;
      window.clearTimeout(mine.refused);
      setBlocked(false);
      if (mine.dead) return;
      // No player yet: `build` lets it go once the API arrives.
      if (!mine.player) return;
      // Fade out from wherever the volume is, then let the player go.
      fadeTo(mine, 0, () => kill(mine));
    };
  }, [active, attempt]);

  return {
    playing,
    blocked,
    retry() {
      const s = session;
      setBlocked(false);
      // A refused player can simply be asked again, now inside a click; one
      // that errored is thrown away and rebuilt.
      if (s && s.player && !s.failed) play(s);
      else setAttempt((n) => n + 1);
    },
    setDuck(on) {
      const s = session;
      if (!s || s.dead || s.duck === on) return;
      s.duck = on;
      // Only a wanted, playing track moves now; one still loading picks the
      // level up when it starts, and a fade out is left to finish.
      if (s.active && s.playing) fadeTo(s, level(s));
    },
  };
}
