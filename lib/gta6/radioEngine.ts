/**
 * Vice FM's session logic: one hidden player for a looping playlist, its
 * fades, and the state the radio cards show. Free of React and the DOM: the
 * player (and the hidden box it lives in) comes from `deps.open`, so tests
 * drive it with a fake. `components/gta6/useMusic.ts` wires it to YouTube.
 */

import { playOrder, stepTrack } from "@/lib/gta6/radio";

/** The radio's volume once faded in (YouTube's 0 to 100 scale). */
export const VOLUME = 60;
/** The volume while the game asks the music to step back (Bigfoot). */
export const DUCKED = 25;
/** Volume steps per fade. */
const FADE_STEPS = 20;
/** No "playing" this long after a visitor asked for it means the browser
 *  refused it (Safari without a fresh gesture): the play button retries. */
export const REFUSED_AFTER = 4000; // ms

/** The slice of the shared YouTube player the radio uses. */
export type RadioPlayer = {
  play(): void;
  pause(): void;
  setVolume(volume: number): void;
  loadVideo(id: string): void;
  cueVideo(id: string): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
};

export type PlayerHandlers = {
  onReady(): void;
  onPlaying(): void;
  onEnded(): void;
  onError(code: number): void;
};

export type RadioDeps = {
  ids: readonly string[];
  /**
   * Makes the hidden box and, once the API is there, the player in it,
   * starting on `firstId`. `player` resolves to null if `wanted()` has gone
   * false by then (no player is made), and rejects if the API never loads.
   * `close` removes the box.
   */
  open(
    firstId: string,
    handlers: PlayerHandlers,
    wanted: () => boolean,
  ): { player: Promise<RadioPlayer | null>; close(): void };
  /** The fade time, in ms. */
  fadeMs(): number;
  /** Automation: never make a player (test runs stay silent). */
  silent(): boolean;
  /** The shuffle's source (defaults to `Math.random`). */
  random?: () => number;
};

/** What the radio cards show. */
export type RadioState = {
  /** This session's play order, as playlist indices: the first entry, then
   *  the rest shuffled (`playOrder`). Looped as it is. */
  order: readonly number[];
  /** Where in `order` the radio is; the track is `order[position]`. */
  position: number;
  /** The visitor paused it. */
  paused: boolean;
  /** The visitor muted it. Kept for the page's life, across exits. */
  muted: boolean;
  /** Really playing right now. */
  playing: boolean;
  /** Playback was refused or failed: the play button retries. */
  blocked: boolean;
  /** The YouTube API never loaded: the card says so and nothing plays. */
  unavailable: boolean;
};

/** A fresh start (with a fresh `order`); `muted` carries over. */
const FRESH = {
  position: 0,
  paused: false,
  playing: false,
  blocked: false,
  unavailable: false,
} satisfies Partial<RadioState>;

type Session = {
  player: RadioPlayer | null;
  close(): void;
  /** The player can take commands. */
  ready: boolean;
  /** The video id last handed to the player. */
  loaded: string;
  /** Wanted: false while it fades out to be destroyed. */
  active: boolean;
  /** Torn down for good; late callbacks are ignored. */
  dead: boolean;
  /** A whole lap of tracks errored: only a rebuild can help. */
  failed: boolean;
  /** Really playing `loaded` (recorded even while fading out). */
  playing: boolean;
  /** Errors in a row; a track that cannot play is skipped, up to a lap. */
  errors: number;
  volume: number;
  /** Ducked under the game's Bigfoot event. */
  duck: boolean;
  ramp?: ReturnType<typeof setInterval>;
  refused?: ReturnType<typeof setTimeout>;
};

export type Radio = ReturnType<typeof createRadio>;

/**
 * One radio: never more than one player, even if the mode turns back on
 * while the last one is still fading out (that one is taken back, track and
 * all).
 */
export function createRadio(deps: RadioDeps) {
  const { ids } = deps;
  const shuffle = () => playOrder(ids.length, deps.random);
  let state: RadioState = { ...FRESH, order: shuffle(), muted: false };
  const subscribers = new Set<() => void>();
  let session: Session | null = null;

  function update(patch: Partial<RadioState>) {
    state = { ...state, ...patch };
    for (const fn of subscribers) fn();
  }

  /** Steps the volume to `to` over the fade time, then runs `done`. Cancels
   *  any fade under way, from wherever the volume has got to. */
  function fadeTo(s: Session, to: number, done?: () => void) {
    clearInterval(s.ramp);
    const from = s.volume;
    let step = 0;
    s.ramp = setInterval(() => {
      step += 1;
      s.volume = from + ((to - from) * step) / FADE_STEPS;
      s.player?.setVolume(s.volume);
      if (step < FADE_STEPS) return;
      clearInterval(s.ramp);
      done?.();
    }, deps.fadeMs() / FADE_STEPS);
  }

  /** Where the volume rests while playing: full, or ducked. */
  function level(s: Session): number {
    return s.duck ? DUCKED : VOLUME;
  }

  /** The video id at the current position. */
  function current(): string {
    return ids[state.order[state.position]];
  }

  /** The position `delta` steps on, looping the order. */
  function step(delta: number): number {
    return stepTrack(state.position, delta, state.order.length);
  }

  /**
   * Brings the player in line with the state: the right track, playing or
   * paused. A track change while paused is only cued; the track already
   * playing is left alone. `gesture` (a visitor's request, or the mode
   * starting) arms the refusal clock; automatic changes (a track ending, a
   * skipped error) do not. `onPlaying` stops it.
   */
  function sync(s: Session, gesture: boolean) {
    const player = s.player;
    if (!player || !s.ready || s.failed || !s.active) return;
    const id = current();
    if (state.paused) {
      clearTimeout(s.refused);
      if (s.loaded !== id) player.cueVideo(id);
      else player.pause();
      s.loaded = id;
      return;
    }
    if (s.loaded === id && s.playing) return;
    if (s.loaded !== id) {
      s.playing = false;
      player.loadVideo(id);
    } else player.play();
    s.loaded = id;
    if (!gesture) return;
    clearTimeout(s.refused);
    s.refused = setTimeout(() => update({ blocked: true }), REFUSED_AFTER);
  }

  function kill(s: Session) {
    s.dead = true;
    s.playing = false;
    clearInterval(s.ramp);
    clearTimeout(s.refused);
    s.player?.destroy();
    s.close();
    if (session === s) {
      session = null;
      update({ playing: false });
    }
  }

  function build(): Session {
    const s: Session = {
      player: null,
      close: () => {},
      ready: false,
      loaded: current(),
      active: true,
      dead: false,
      failed: false,
      playing: false,
      errors: 0,
      volume: 0,
      duck: false,
    };
    // A fresh player (the retry path included) has not played yet.
    update({ playing: false, blocked: false, unavailable: false });

    const opened = deps.open(
      s.loaded,
      {
        onReady() {
          if (s.dead) return;
          s.ready = true;
          // Always set, so the card and the player never disagree.
          if (state.muted) s.player?.mute();
          else s.player?.unMute();
          // The mode's start (or a retry): a visitor's gesture.
          sync(s, true);
        },
        onPlaying() {
          if (s.dead) return;
          s.errors = 0;
          // A backstop: paused while it was getting there.
          if (s.active && state.paused) return s.player?.pause();
          // Recorded even while fading out, so taking the session back
          // knows it only needs a fade up, not another play().
          s.playing = true;
          // Never fade back up over a fade out that has begun.
          if (!s.active) return;
          clearTimeout(s.refused);
          update({ blocked: false, playing: true });
          fadeTo(s, level(s));
        },
        onEnded() {
          if (!s.active || s.dead) return;
          s.playing = false;
          update({ position: step(1) });
          sync(s, false);
        },
        onError() {
          if (s.dead) return;
          clearTimeout(s.refused);
          s.playing = false;
          s.errors += 1;
          // One track that cannot play (removed, not embeddable) is
          // skipped; a whole lap of them means the player is no good.
          if (s.active && s.errors < ids.length) {
            update({ position: step(1) });
            return sync(s, false);
          }
          s.failed = true;
          update({ blocked: true, playing: false });
        },
      },
      () => !s.dead && s.active,
    );
    s.close = opened.close;
    opened.player
      .then((player) => {
        if (s.dead) return player?.destroy();
        // Turned off while the API loaded: nothing to fade, just go.
        if (!player || !s.active) {
          s.player = player;
          return kill(s);
        }
        s.player = player;
      })
      .catch(() => {
        // The API (or its loader) never came: no player, no errors.
        if (s.dead) return;
        const wanted = s.active;
        kill(s);
        if (wanted) update({ unavailable: true });
      });
    return s;
  }

  /** Moves to `position` in the order on a visitor's request. */
  function go(position: number) {
    update({ position });
    const s = session;
    if (!s) return;
    s.errors = 0;
    sync(s, true);
  }

  return {
    getState: () => state,
    subscribe(fn: () => void) {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    },

    /** The mode turned on: the radio starts from the top and plays. */
    start() {
      if (deps.silent()) {
        // No player under automation; the cards' state still works.
        update({ ...FRESH, order: shuffle() });
        return;
      }
      const s = session;
      if (s && !s.failed) {
        // Still fading out from a moment ago: take it back.
        s.active = true;
        // Stop the fade out first, or it would destroy the player under
        // the mode a moment from now.
        clearInterval(s.ramp);
        update({ paused: false });
        if (s.playing) {
          update({ playing: true });
          fadeTo(s, level(s));
        } else sync(s, true);
        return;
      }
      if (s) kill(s);
      update({ ...FRESH, order: shuffle() });
      session = build();
    },

    /** The mode turned off: fade out from wherever the volume is, then go. */
    stop() {
      const s = session;
      if (!s) return;
      s.active = false;
      clearTimeout(s.refused);
      update({ blocked: false });
      if (s.dead) return;
      // No player yet: `build` lets it go once the API arrives.
      if (!s.player) return;
      fadeTo(s, 0, () => kill(s));
    },

    next: () => go(step(1)),
    prev: () => go(step(-1)),

    /** Picks the track at `position` in the order (the list): it plays.
     *  Picking the one already playing does nothing; picking it while paused
     *  resumes it. */
    select(position: number) {
      if (position === state.position && !state.paused) return;
      update({ paused: false });
      go(position);
    },

    togglePause() {
      const paused = !state.paused;
      update({ paused, ...(paused ? { playing: false } : {}) });
      const s = session;
      if (!s) return;
      if (paused) s.playing = false;
      sync(s, true);
    },

    toggleMute() {
      const muted = !state.muted;
      update({ muted });
      if (muted) session?.player?.mute();
      else session?.player?.unMute();
    },

    /**
     * For the play button while `blocked`, so it runs inside the visitor's
     * click. A refused player is asked again; one that failed is thrown away
     * and rebuilt, on the same track.
     */
    retry() {
      const s = session;
      update({ blocked: false, paused: false });
      if (!s || s.dead || !s.active) return;
      if (!s.failed) return sync(s, true);
      kill(s);
      session = build();
    },

    /** Steps the volume down to `DUCKED` (Bigfoot) or back up, over a fade. */
    setDuck(on: boolean) {
      const s = session;
      if (!s || s.dead || s.duck === on) return;
      s.duck = on;
      // Only a wanted, playing track moves now; one still loading picks the
      // level up when it starts, and a fade out is left to finish.
      if (s.active && s.playing) fadeTo(s, level(s));
    },
  };
}
