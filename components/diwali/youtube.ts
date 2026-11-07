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

declare global {
  interface Window {
    YT?: { Player?: unknown };
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
