"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MusicNotes } from "@phosphor-icons/react/ssr";

/**
 * The song behind the letter.
 *
 * The frame is here for its audio only, so it is visually hidden rather than
 * laid out: `sr-only` would put it in the accessibility tree, and a 1x1 frame in
 * the flow can still be tabbed into, so it is absolutely positioned out of view
 * with `aria-hidden` and no tab stop.
 *
 * It cannot simply start with sound. Browsers refuse to autoplay audio before
 * the reader has interacted with the document, and refuse silently: the player
 * loads, reports nothing wrong, and never plays. So it starts muted, which is
 * always allowed, and the first gesture lifts the mute. The line below is the
 * invitation; clicking anywhere works too, because someone reading a letter is
 * more likely to click the page than the one control on it.
 *
 * The unmute goes through YouTube's postMessage interface rather than their
 * IFrame API script. Two commands do not justify a third-party script on a site
 * that loads none; `enablejsapi=1` is all the player needs to listen.
 */
const VIDEO_ID = "6tjlU4w4fSo";
const ORIGIN = "https://www.youtube-nocookie.com";

const EMBED = `${ORIGIN}/embed/${VIDEO_ID}?${new URLSearchParams({
  autoplay: "1",
  // Required for autoplay to be permitted at all. Lifted on first gesture.
  mute: "1",
  // `loop=1` does nothing to a single video. YouTube only loops playlists, so
  // the video has to name itself as a one-item playlist.
  loop: "1",
  playlist: VIDEO_ID,
  controls: "0",
  modestbranding: "1",
  rel: "0",
  iv_load_policy: "3",
  disablekb: "1",
  fs: "0",
  playsinline: "1",
  enablejsapi: "1",
}).toString()}`;

export default function LetterAudio() {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const send = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      ORIGIN,
    );
  }, []);

  /**
   * The postMessage calls have to run inside the gesture's own handler. The
   * browser grants audio permission for the length of that call stack, and
   * deferring to a timeout or an await hands it back first.
   */
  const start = useCallback(() => {
    send("unMute");
    send("setVolume", [100]);
    send("playVideo");
    setPlaying(true);
  }, [send]);

  useEffect(() => {
    if (playing) return;
    const events = ["pointerdown", "keydown", "touchstart"] as const;

    const onGesture = (event: Event) => {
      // Only a real gesture, never a dispatched one. `isTrusted` is the same
      // test the browser applies before it will let audio play, so a synthetic
      // event cannot lift the mute however convincing it looks, and treating
      // one as the trigger would flip this to "playing" in silence.
      if (!event.isTrusted) return;
      start();
    };

    events.forEach((e) =>
      window.addEventListener(e, onGesture, { passive: true }),
    );
    return () =>
      events.forEach((e) => window.removeEventListener(e, onGesture));
  }, [playing, start]);

  return (
    <>
      <iframe
        ref={frame}
        title="Music"
        src={EMBED}
        allow="autoplay; encrypted-media"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      <button
        type="button"
        onClick={start}
        aria-live="polite"
        className="flex items-center gap-2.5 font-mono text-2xs uppercase tracking-label text-subtle transition-colors duration-fast ease-out hover:text-foreground"
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 shrink-0 rounded-full bg-current ${
            playing ? "note-pulse" : ""
          }`}
        />
        {playing ? (
          <>
            <MusicNotes aria-hidden="true" className="h-3 w-3 shrink-0" />
            Now playing
          </>
        ) : (
          "Let the music play"
        )}
      </button>
    </>
  );
}
