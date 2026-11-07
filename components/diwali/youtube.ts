/**
 * The YouTube IFrame API, loaded once and only on demand.
 *
 * `primeYouTube()` is called from the same click that lights the fuse, so the
 * API is (usually) ready by the time the fuse has burnt and the show wants a
 * player. It injects the script tag once, chains any `onYouTubeIframeAPIReady`
 * someone else already set, and resolves once `window.YT.Player` exists. Every
 * call returns the same promise. On the server it resolves at once and does
 * nothing.
 */

import { VIDEO_END_SECONDS } from "@/lib/diwali/show";
import { VIDEO_ID } from "@/lib/diwali/video";

/** The slice of the IFrame API this file uses. */
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  setVolume(volume: number): void;
  destroy(): void;
};

type YTPlayerCtor = new (
  el: HTMLElement | string,
  options: {
    events?: {
      onReady?: (e: { target: YTPlayer }) => void;
      onStateChange?: (e: { data: number; target: YTPlayer }) => void;
      onError?: (e: { data: number }) => void;
    };
  },
) => YTPlayer;

declare global {
  interface Window {
    YT?: {
      Player?: YTPlayerCtor;
      PlayerState?: { ENDED: number; PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";

let ready: Promise<void> | null = null;

export function primeYouTube(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (ready) return ready;
  ready = new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = API_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return ready;
}

/** YouTube's player states, in case `YT.PlayerState` is missing. */
const ENDED = 0;
const PLAYING = 1;

export type DiwaliPlayer = {
  play(): void;
  pause(): void;
  currentTime(): number;
  /** The song's volume, 0 to 100. */
  setVolume(volume: number): void;
  destroy(): void;
};

/**
 * Builds the song's iframe by hand (so it carries a referrer, which YouTube
 * needs, and the privacy-enhanced host) and hands it to `YT.Player`. Call it
 * only once `primeYouTube()` has resolved. Every method swallows the API's
 * errors: a half-loaded player must never break the show.
 *
 * The iframe does not autoplay (`autoplay=0`): the caller starts the song from
 * `onReady`, and only if it still wants it, so a show that has moved on never
 * hears a moment of it. `onPlaying` can still pause it as a backstop. The
 * player is silenced (volume 0) before `onReady` runs, so the caller can fade
 * the song in once it is actually playing.
 */
export function createPlayer(
  host: HTMLElement,
  handlers: {
    /** The API can take commands: call `play()` here to start the song. */
    onReady(): void;
    onPlaying(): void;
    onEnded(): void;
    onError(code: number): void;
  },
): DiwaliPlayer {
  const params = new URLSearchParams({
    enablejsapi: "1",
    autoplay: "0",
    start: "0",
    end: String(VIDEO_END_SECONDS),
    controls: "0",
    rel: "0",
    playsinline: "1",
    disablekb: "1",
    origin: window.location.origin,
  });
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?${params}`;
  iframe.allow = "autoplay; encrypted-media";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.title = "The Diwali Song";
  iframe.tabIndex = -1;
  iframe.setAttribute("aria-hidden", "true");
  host.appendChild(iframe);

  let player: YTPlayer | null = null;
  let destroyed = false;
  const Player = window.YT?.Player;
  const states = window.YT?.PlayerState;
  if (Player) {
    try {
      player = new Player(iframe, {
        events: {
          onReady: (e) => {
            if (destroyed) return;
            try {
              e.target.setVolume(0);
            } catch {
              // A player that cannot take a volume plays at its own.
            }
            handlers.onReady();
          },
          onStateChange: (e) => {
            if (destroyed) return;
            if (e.data === (states?.PLAYING ?? PLAYING)) handlers.onPlaying();
            if (e.data === (states?.ENDED ?? ENDED)) handlers.onEnded();
          },
          onError: (e) => {
            if (!destroyed) handlers.onError(e.data);
          },
        },
      });
    } catch {
      player = null;
    }
  }

  const call = (fn: (p: YTPlayer) => void) => {
    if (destroyed || !player) return;
    try {
      fn(player);
    } catch {
      // The API is not ready yet, or the iframe has gone.
    }
  };

  return {
    play: () => call((p) => p.playVideo()),
    pause: () => call((p) => p.pauseVideo()),
    setVolume: (volume) =>
      call((p) => p.setVolume(Math.max(0, Math.min(100, Math.round(volume))))),
    currentTime() {
      let t = 0;
      call((p) => {
        t = p.getCurrentTime() || 0;
      });
      return t;
    },
    destroy() {
      if (destroyed) return;
      call((p) => p.destroy());
      destroyed = true;
      player = null;
      iframe.remove();
    },
  };
}
