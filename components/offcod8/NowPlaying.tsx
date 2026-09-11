"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, MusicNotes } from "@phosphor-icons/react/ssr";

/**
 * What is playing behind the letter, and a way to go listen to it properly.
 *
 * Two targets, because they do two different things: the state on the left is
 * a button that starts the song, and the title on the right is a link out to
 * the video. Folding both into one control would mean a reader who wanted to
 * find the track had to start the audio to get there, or the other way round.
 *
 * The frame is here for its audio only, so it is positioned out of view rather
 * than laid out. `sr-only` would put it in the accessibility tree, and a 1x1
 * frame in the flow can still be tabbed into, so it gets `aria-hidden` and no
 * tab stop instead.
 */
const VIDEO_ID = "6tjlU4w4fSo";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const TRACK = "Love Yourz";
const ARTIST = "J. Cole";
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

/**
 * Did the browser grant audio permission for this call stack?
 *
 * Scrolling is the gesture this page listens for, and on a phone that works:
 * a scroll is a touch, and a touch activates. A trackpad or wheel scroll does
 * not. It fires no activation-triggering event, so the unmute below is refused,
 * and refused silently. Without this check the control would announce "now
 * playing" over silence, which is the one thing it must never do.
 *
 * `navigator.userActivation` is the exact answer where it exists (Chromium and
 * Safari). Firefox does not implement it, so there the attempt is assumed to
 * have worked, which is no worse than not asking at all.
 */
function hasActivation() {
  const activation = navigator.userActivation;
  return activation ? activation.isActive : true;
}

export default function NowPlaying() {
  const frame = useRef<HTMLIFrameElement | null>(null);

  /** The player's own answer, or null until it has given one. */
  const [reportedMuted, setReportedMuted] = useState<boolean | null>(null);
  /** Whether an unmute has gone out on a gesture the browser honoured. */
  const [attempted, setAttempted] = useState(false);

  // Trust the player over ourselves whenever it is talking. If it never talks
  // (the protocol below is undocumented and could change under us) fall back
  // to what we asked for, so the control cannot get stuck reading "play" over
  // music that is already playing.
  const playing = reportedMuted === null ? attempted : !reportedMuted;

  const send = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      ORIGIN
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
    if (hasActivation()) setAttempted(true);
  }, [send]);

  /**
   * Ask the player to report its state, and listen for the answer.
   *
   * `enablejsapi=1` opens the channel; the player only starts broadcasting
   * once the parent has posted a `listening` event at it. What comes back is
   * `infoDelivery`, carrying `muted` among other things. Two commands and one
   * subscription do not justify pulling in YouTube's IFrame API script on a
   * page that loads no other third-party JavaScript.
   */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;

      let data: unknown;
      try {
        data = JSON.parse(String(event.data));
      } catch {
        // The player sends non-JSON frames too. Not ours, not an error.
        return;
      }

      const info = (data as { info?: { muted?: unknown } } | null)?.info;
      if (info && typeof info.muted === "boolean") setReportedMuted(info.muted);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const subscribe = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: VIDEO_ID, channel: "widget" }),
      ORIGIN
    );
  }, []);

  /**
   * Scrolling is the interaction. Reading a letter means scrolling it, so the
   * song arrives while the reader is already in the middle of the thing it is
   * scored to, rather than as a demand made before they have read a word.
   *
   * The pointer and key listeners stay because of the wheel-scroll case above:
   * where a scroll carries no activation, the next real click or keypress
   * lifts the mute instead. They all keep firing until the player reports
   * itself unmuted, so a refused attempt costs nothing but the next gesture.
   */
  useEffect(() => {
    if (playing) return;
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;

    const onGesture = (event: Event) => {
      // Only a real gesture, never a dispatched one. `isTrusted` is the same
      // test the browser applies before it will let audio play, so a synthetic
      // event cannot lift the mute however convincing it looks.
      if (!event.isTrusted) return;
      start();
    };

    events.forEach((e) =>
      window.addEventListener(e, onGesture, { passive: true })
    );
    return () =>
      events.forEach((e) => window.removeEventListener(e, onGesture));
  }, [playing, start]);

  return (
    <div className="flex items-center gap-4 font-mono text-2xs uppercase tracking-label">
      <iframe
        ref={frame}
        title="Music"
        src={EMBED}
        onLoad={subscribe}
        allow="autoplay; encrypted-media"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      <button
        type="button"
        onClick={start}
        aria-live="polite"
        className="flex items-center gap-2.5 text-subtle transition-colors duration-fast ease-out hover:text-foreground"
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
          "Play the music"
        )}
      </button>

      <a
        href={WATCH_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-subtle transition-colors duration-fast ease-out hover:text-foreground"
      >
        {TRACK}
        <span className="px-1 text-border-strong">·</span>
        {ARTIST}
        <ArrowUpRight aria-hidden="true" className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}
