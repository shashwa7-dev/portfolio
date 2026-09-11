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
 * The frame plays the video too, filling the viewport behind the letter under a
 * scrim. It is still furniture rather than content: `aria-hidden` keeps it out
 * of the accessibility tree and `tabIndex={-1}` keeps it out of the tab order,
 * since there is nothing in it to read or operate.
 *
 * `pointer-events-none` on the layer is load-bearing, not tidiness. A click
 * that lands inside a cross-origin iframe belongs to YouTube: the window
 * listeners below never see it, so the one gesture that was going to lift the
 * mute would be the one gesture that could not.
 */
const VIDEO_ID = "RkqCCWxv3ZU";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const TRACK = "Home Again";
const ARTIST = "PJ Morton";
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
 * How many times to ask for sound before the page has been touched.
 *
 * Some browsers will just say yes. Chrome keeps a Media Engagement score per
 * origin and grants autoplay outright once a visitor has played enough media
 * here, and any browser will grant it if the visitor has allowed sound for the
 * site in their own settings. In those cases the song starts on load with no
 * gesture at all, which is the whole point of asking.
 *
 * Where permission is not granted the ask is refused silently, so the budget is
 * what stops a refusal from becoming a loop: the player reports its state
 * several times a second once it is playing, and retrying on every report would
 * mean thousands of doomed postMessages behind the letter. Four is enough to
 * cover the player still warming up when the first ask goes out.
 */
const UNPROMPTED_TRIES = 4;

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
  const unpromptedTries = useRef(0);

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

      const frameEvent = (data as { event?: unknown } | null)?.event;
      const info = (data as { info?: { muted?: unknown } } | null)?.info;

      if (info && typeof info.muted === "boolean") {
        setReportedMuted(info.muted);
        if (!info.muted) return;
      }

      // Still muted, and the player is now answering, so it is ready to be
      // told what to do. Ask again, within the budget: the ask on `onLoad`
      // often lands before the player has finished setting itself up, and a
      // command sent then is dropped rather than refused.
      if (frameEvent === "onReady" || info) {
        if (unpromptedTries.current >= UNPROMPTED_TRIES) return;
        unpromptedTries.current += 1;
        start();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [start]);

  /**
   * Open the channel the moment the frame exists, and ask for sound straight
   * away rather than waiting to be touched.
   *
   * There is no trick available here and no way to force it: an unmute with no
   * user activation behind it is decided entirely by the browser, and a browser
   * that says no says nothing. What this does is make sure the question gets
   * asked at the earliest possible moment, so that every visitor whose browser
   * would say yes hears the song on load instead of on their first click.
   *
   * The frame itself still loads with `mute=1`. Muted autoplay is the one form
   * of autoplay that is always permitted, so the video is already playing and
   * buffered by the time any of this runs, and lifting the mute is instant
   * whenever it is finally allowed. Asking for unmuted autoplay up front would
   * trade that for a player sitting paused whenever the answer was no.
   */
  const onFrameLoad = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: VIDEO_ID, channel: "widget" }),
      ORIGIN,
    );
    unpromptedTries.current += 1;
    start();
  }, [start]);

  /**
   * Scrolling is the interaction. Reading a letter means scrolling it, so the
   * song arrives while the reader is already in the middle of the thing it is
   * scored to, rather than as a demand made before they have read a word.
   *
   * The list below is in two halves, and the split is the whole trick.
   *
   * `scroll` and `wheel` are what the page is about, and neither grants audio
   * permission by itself: the spec's "activation triggering input event" list
   * is pointer, mouse, touch-end, key and click, and no scrolling event of any
   * kind is on it. They are still worth firing, because the attempt is free and
   * because the document may already hold activation from something earlier.
   *
   * The rest ARE on that list, which is what makes a scroll work in practice.
   * On a phone a scroll is touchstart, then touchmove, then touchend, and only
   * the last of the three activates: lifting the finger is the gesture, not
   * putting it down. This listened for `touchstart` before, so on a phone every
   * scroll asked for the unmute at the one moment in the sequence the browser
   * was guaranteed to refuse it, and the song never started. `touchend` is the
   * fix.
   *
   * Desktop keeps one genuine gap. A trackpad or wheel scroll fires nothing on
   * the activation list at all, so there the song waits for the first click or
   * keypress, which is what the control beside this is for. Scrolling by
   * keyboard (space, arrows, page-down) does start it, because that is a
   * `keydown`.
   *
   * Everything keeps listening until the player reports itself unmuted, so a
   * refused attempt costs nothing but the next gesture.
   */
  useEffect(() => {
    if (playing) return;
    const events = [
      "scroll",
      "wheel",
      "pointerdown",
      "pointerup",
      "touchend",
      "keydown",
      "click",
    ] as const;

    const onGesture = (event: Event) => {
      // Only a real gesture, never a dispatched one. `isTrusted` is the same
      // test the browser applies before it will let audio play, so a synthetic
      // event cannot lift the mute however convincing it looks.
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
    <div className="flex items-center gap-4 font-mono text-2xs uppercase tracking-label">
      {/* Fixed, so the picture stays still while the letter scrolls over it,
          and `-z-10` so it sits behind the page without leaving the layout
          layer the rest of the route lives in.

          No scrim over it any more. Dimming the whole viewport and then
          putting the letter on its own paper was doing the same job twice,
          and the half of it that was visible was the half spent flattening
          the video in the margins, where there is nothing to protect. The
          panel carries the contrast now; the blur in `globals.css` is what
          keeps the lyrics from being readable. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <iframe
          ref={frame}
          title="Music"
          src={EMBED}
          onLoad={onFrameLoad}
          allow="autoplay; encrypted-media"
          aria-hidden="true"
          tabIndex={-1}
          className="embed-cover"
        />
      </div>

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
