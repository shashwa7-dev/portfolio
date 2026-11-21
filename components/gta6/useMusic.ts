"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { YouTubePlayer } from "@/components/common/youtube";
import { PLAYLIST } from "@/components/gta6/track";
import { stepTrack } from "@/lib/gta6/radio";

/** The radio's volume once faded in (YouTube's 0 to 100 scale). */
const VOLUME = 60;
/** The volume while the game asks the music to step back (Bigfoot). */
const DUCKED = 25;
/** Volume steps per fade. */
const FADE_STEPS = 20;
/** No "playing" this long after asking for it means the browser refused it
 *  (Safari without a fresh gesture), so the play button turns into a retry. */
const REFUSED_AFTER = 4000; // ms
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

/** What the radio card shows. Shared by every card (hero and HUD), so moving
 *  between them keeps the track and its position. */
export type RadioState = {
  /** The track, an index into `PLAYLIST`. */
  index: number;
  /** The visitor paused it. */
  paused: boolean;
  muted: boolean;
  /** Really playing right now. */
  playing: boolean;
  /** Playback was refused or failed: the play button retries. */
  blocked: boolean;
  /** The YouTube API never loaded: the card says so and nothing plays. */
  unavailable: boolean;
  /** Titles learned from the player, by video id (kept for the page's life). */
  titles: Readonly<Record<string, string>>;
};

const FRESH: Omit<RadioState, "titles"> = {
  index: 0,
  paused: false,
  muted: false,
  playing: false,
  blocked: false,
  unavailable: false,
};

let state: RadioState = { ...FRESH, titles: {} };
const SERVER_STATE = state;
const subscribers = new Set<() => void>();

function update(patch: Partial<RadioState>) {
  state = { ...state, ...patch };
  for (const fn of subscribers) fn();
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** One hidden player and everything about it. */
type Session = {
  host: HTMLDivElement;
  player: YouTubePlayer | null;
  /** The player can take commands. */
  ready: boolean;
  /** The video id last handed to the player. */
  loaded: string;
  /** Wanted: false while it fades out to be destroyed. */
  active: boolean;
  /** Torn down for good; late callbacks are ignored. */
  dead: boolean;
  /** Every track errored: only a rebuild can help. */
  failed: boolean;
  /** Really playing (recorded even while fading out). */
  playing: boolean;
  /** Errors in a row; a track that cannot play is skipped, up to a lap. */
  errors: number;
  volume: number;
  /** Ducked under the game's Bigfoot event. */
  duck: boolean;
  ramp: number;
  refused: number;
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

/** Records the loaded video's title, if the player knows it yet. */
function learnTitle(s: Session) {
  const data = s.player?.videoData();
  if (!data || state.titles[data.videoId] === data.title) return;
  update({ titles: { ...state.titles, [data.videoId]: data.title } });
}

/**
 * Brings the player in line with the radio's state: the right track, playing
 * or paused. A track change while paused is only cued. Asking to play starts
 * the refusal clock; `onPlaying` stops it.
 */
function sync(s: Session) {
  const player = s.player;
  if (!player || !s.ready || s.failed || !s.active) return;
  const id = PLAYLIST[state.index];
  window.clearTimeout(s.refused);
  if (state.paused) {
    if (s.loaded !== id) player.cueVideo(id);
    else player.pause();
    s.loaded = id;
    return;
  }
  if (s.loaded !== id) player.loadVideo(id);
  else player.play();
  s.loaded = id;
  s.refused = window.setTimeout(() => update({ blocked: true }), REFUSED_AFTER);
}

function kill(s: Session) {
  s.dead = true;
  s.playing = false;
  window.clearInterval(s.ramp);
  window.clearTimeout(s.refused);
  s.player?.destroy();
  s.host.remove();
  if (session === s) {
    session = null;
    update({ playing: false });
  }
}

function build(): Session {
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
  const s: Session = {
    host,
    player: null,
    ready: false,
    loaded: PLAYLIST[state.index],
    active: true,
    dead: false,
    failed: false,
    playing: false,
    errors: 0,
    volume: 0,
    duck: false,
    ramp: 0,
    refused: 0,
  };
  // A fresh player (the retry path included) has not played yet.
  update({ playing: false, blocked: false, unavailable: false });

  import("@/components/common/youtube")
    .then(async (m) => {
      await m.primeYouTube(LOAD_TIMEOUT);
      if (s.dead) return;
      // Turned off while the API loaded: nothing to fade, just go.
      if (!s.active) return kill(s);
      s.player = m.createPlayer(
        host,
        { videoId: s.loaded, title: "Vice FM" },
        {
          onReady() {
            if (s.dead) return;
            s.ready = true;
            if (state.muted) s.player?.mute();
            learnTitle(s);
            if (s.loaded !== PLAYLIST[state.index] || !state.paused) sync(s);
          },
          onPlaying() {
            if (s.dead) return;
            s.errors = 0;
            learnTitle(s);
            // A backstop: paused while it was getting there.
            if (s.active && state.paused) return s.player?.pause();
            // Recorded even while fading out, so taking the session back
            // knows it only needs a fade up, not another play().
            s.playing = true;
            // Never fade back up over a fade out that has begun.
            if (!s.active) return;
            window.clearTimeout(s.refused);
            update({ blocked: false, playing: true });
            fadeTo(s, level(s));
          },
          onCued() {
            if (!s.dead) learnTitle(s);
          },
          onEnded() {
            if (!s.active || s.dead) return;
            update({ index: stepTrack(state.index, 1, PLAYLIST.length) });
            sync(s);
          },
          onError() {
            if (s.dead) return;
            window.clearTimeout(s.refused);
            s.errors += 1;
            // One track that cannot play (removed, not embeddable) is
            // skipped; a whole lap of them means the player is no good.
            if (s.active && s.errors < PLAYLIST.length) {
              update({ index: stepTrack(state.index, 1, PLAYLIST.length) });
              return sync(s);
            }
            s.failed = true;
            s.playing = false;
            update({ blocked: true, playing: false });
          },
        },
      );
      const frame = host.querySelector("iframe");
      if (frame) Object.assign(frame.style, { width: "100%", height: "100%", border: "0" });
    })
    .catch(() => {
      // The API (or its loader chunk) never came: no player, no errors.
      if (s.dead) return;
      const wanted = s.active;
      kill(s);
      if (wanted) update({ unavailable: true });
    });
  return s;
}

/** The mode turned on: the radio starts from the top and plays. */
function start() {
  if (navigator.webdriver) {
    // Silent under automation: the card's state still works, with no player.
    update({ ...FRESH });
    return;
  }
  const s = session;
  if (s && !s.failed) {
    // Still fading out from a moment ago: take it back, track and all.
    s.active = true;
    // Always stop the fade out first, or it would destroy the player
    // under the mode a moment from now.
    window.clearInterval(s.ramp);
    update({ paused: false });
    if (s.playing) {
      update({ playing: true });
      fadeTo(s, level(s));
    } else {
      // Asked to play but not playing yet: ask again; onPlaying fades up.
      sync(s);
    }
    return;
  }
  if (s) kill(s);
  update({ ...FRESH });
  session = build();
}

/** The mode turned off: fade out from wherever the volume is, then go. */
function stop() {
  const s = session;
  if (!s) return;
  s.active = false;
  window.clearTimeout(s.refused);
  update({ blocked: false });
  if (s.dead) return;
  // No player yet: `build` lets it go once the API arrives.
  if (!s.player) return;
  fadeTo(s, 0, () => kill(s));
}

/** Moves to track `index` and plays it (or cues it, while paused). */
function go(index: number, play: boolean) {
  update({ index, ...(play ? { paused: false } : {}) });
  const s = session;
  if (!s) return;
  s.errors = 0;
  sync(s);
}

/** The radio's controls, safe to call with no player (automation, blocked). */
export const radio = {
  next: () => go(stepTrack(state.index, 1, PLAYLIST.length), false),
  prev: () => go(stepTrack(state.index, -1, PLAYLIST.length), false),
  /** Picks a track from the list: it plays. */
  select: (index: number) => go(index, true),
  togglePause() {
    const paused = !state.paused;
    update({ paused, ...(paused ? { playing: false } : {}) });
    const s = session;
    if (!s) return;
    if (paused) s.playing = false;
    sync(s);
  },
  toggleMute() {
    const muted = !state.muted;
    update({ muted });
    if (muted) session?.player?.mute();
    else session?.player?.unMute();
  },
  /**
   * For the play button while `blocked`, so it runs inside the visitor's
   * click. A refused player is simply asked again; one that failed is thrown
   * away and rebuilt, on the same track.
   */
  retry() {
    const s = session;
    update({ blocked: false, paused: false });
    if (!s || s.dead || !s.active) return;
    if (!s.failed) return sync(s);
    kill(s);
    session = build();
  },
};

/** The radio's state, for the cards. */
export function useRadio(): RadioState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

/**
 * Vice FM, while `active`: the 30-track playlist on one hidden YouTube
 * player (off-screen, 200x200, invisible), starting from the first track.
 *
 * The player is built when the mode turns on, plays on ready, and fades up
 * from silence to `VOLUME` once it is really playing. When a track ends the
 * next one plays, wrapping round to the first. Turning off fades it back to
 * silence, then destroys it; turning on again during that fade keeps the
 * same player (and track) and fades it back up.
 *
 * Under automation (`navigator.webdriver`) no player is ever made: test runs
 * stay silent, while the card's controls still move its state.
 *
 * `setDuck(true)` steps the volume down to `DUCKED` (the game's Bigfoot
 * event) and `setDuck(false)` back up, over the same fade.
 */
export function useMusic(active: boolean): { setDuck(on: boolean): void } {
  useEffect(() => {
    if (!active) return;
    start();
    return stop;
  }, [active]);

  return {
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
