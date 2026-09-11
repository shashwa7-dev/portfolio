"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, MusicNotes } from "@phosphor-icons/react/ssr";
import Curtain from "@/components/offcod8/Curtain";
import { duration } from "@/lib/motionVariants";

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
const VIDEO_ID = "_Lo2gPHqfnI";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const TRACK = "Home Again";
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
 * How many follow-up asks go out before the page has been touched, at 500ms
 * each.
 *
 * Some browsers will just say yes. Chrome keeps a Media Engagement score per
 * origin and grants autoplay outright once a visitor has played enough media
 * here, and any browser will grant it if the visitor has allowed sound for the
 * site in their own settings. In those cases the song starts with no gesture at
 * all, which is the whole point of asking.
 *
 * Retries are needed because the early asks land nowhere rather than being
 * refused: a postMessage to a frame that has not finished loading is dropped,
 * not queued. Eight covers about four seconds, which is enough for the player
 * to come up on a slow connection.
 *
 * The budget exists because a genuine refusal is silent and indistinguishable
 * from a dropped message. Without a limit, a page whose browser simply says no
 * would keep asking for as long as it was open.
 */
const UNPROMPTED_TRIES = 8;

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
  /**
   * Whether the reader has silenced it on purpose.
   *
   * Without this the page argues with them: the gesture listeners below re-arm
   * the moment the song stops, so the very next scroll would start it again and
   * the pause button would look broken. Turning the music off is a decision,
   * and only the button can undo it.
   */
  const [dismissed, setDismissed] = useState(false);
  /**
   * Whether the reader has crossed the threshold in front of the letter.
   *
   * This decides what is on screen and nothing else. The song is not held back
   * for it: the video is already playing behind the curtain, and a browser that
   * would let the sound out should let it out then rather than wait to be asked
   * a second time. Where the browser refuses, the click on the curtain is the
   * activation that changes its mind, which is what the curtain is for.
   */
  const [entered, setEntered] = useState(false);
  /** The curtain is on its way out. Still mounted, mid-fade. */
  const [leaving, setLeaving] = useState(false);

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

  /** The note beside the track name, which also takes back a dismissal. */
  const play = useCallback(() => {
    setDismissed(false);
    start();
  }, [start]);

  /**
   * Crossing the threshold.
   *
   * The ask has been going out on a timer since the frame loaded, so on a
   * browser that allows autoplay the song is already audible by the time this
   * runs and this changes only what is on screen. Where it was refused, this is
   * the one gesture the page can count on: a real click, so the unmute runs
   * with activation behind it rather than hoping for it.
   */
  const enter = useCallback(() => {
    // First, and synchronously. The browser grants audio for the length of the
    // click's own call stack, so anything that defers this hands the permission
    // back before it is used.
    start();
    setLeaving(true);
  }, [start]);

  /**
   * If the sound is already out, the curtain has nothing left to ask for.
   *
   * The page keeps asking for audio from the moment the frame loads, and some
   * browsers say yes: Chrome grants autoplay outright once its Media Engagement
   * score for an origin is high enough, and any browser grants it if the visitor
   * has allowed sound for the site. When that happens the reader is looking at a
   * door they have already walked through, so it opens itself.
   */
  useEffect(() => {
    if (playing) setLeaving(true);
  }, [playing]);

  /**
   * Unmount once the fade has had its time.
   *
   * The delay is `duration.curtain` from lib/motionVariants, the same token the
   * `duration-curtain` classes on the curtain resolve to through
   * `--duration-curtain`. Reading the token rather than writing 3000 twice is
   * what stops the unmount landing mid-fade if the value is ever tuned: a
   * shorter timer than transition tears the curtain away, a longer one leaves a
   * dead invisible layer on the page.
   */
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(
      () => setEntered(true),
      duration.curtain * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [leaving]);

  /**
   * Silence it again.
   *
   * Mute rather than pause, so the picture behind the letter keeps moving: the
   * video is the page's background, and freezing it would look like a fault
   * rather than like a choice the reader made. What they hear stops either
   * way, which is what the control is about.
   *
   * This is not optional politeness. The page starts audio without being
   * asked wherever the browser allows it, and audio that plays by itself for
   * more than a few seconds has to come with a way to stop it.
   */
  const silence = useCallback(() => {
    send("mute");
    setAttempted(false);
    setDismissed(true);
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

  /**
   * Open the channel, and ask for sound without waiting to be touched.
   *
   * `onLoad` alone was not enough, and that is why the song was not starting
   * by itself. The iframe is server-rendered with its `src` already set, so the
   * browser begins fetching it with the rest of the document and it can finish
   * before React has hydrated: the `load` event fires while nothing is
   * listening, React attaches its handler afterwards, and a handler attached
   * after the event is a handler that never runs. So this also runs on mount
   * and keeps asking on a timer.
   *
   * The timer is not impatience. A postMessage sent to a frame that has not
   * finished loading is dropped on the floor rather than queued, so the first
   * ask usually lands nowhere, and the player only starts reporting its state
   * once the `listening` handshake has got through. Both go out together, every
   * 500ms, until the player says it is unmuted or the budget runs out.
   *
   * There is no trick available beyond that and no way to force it: an unmute
   * with no user activation behind it is decided entirely by the browser, and a
   * browser that says no says nothing. What this does is make sure the question
   * is actually asked, so that every visitor whose browser would say yes hears
   * the song on load rather than on their first click.
   *
   * The frame itself still loads with `mute=1`. Muted autoplay is the one form
   * of autoplay that is always permitted, so the video is already playing and
   * buffered by the time any of this runs, and lifting the mute is instant
   * whenever it is finally allowed. Asking for unmuted autoplay up front would
   * trade that for a player sitting paused whenever the answer was no.
   */
  const ask = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: VIDEO_ID, channel: "widget" }),
      ORIGIN,
    );
    start();
  }, [start]);

  useEffect(() => {
    if (playing || dismissed) return;

    ask();
    let left = UNPROMPTED_TRIES;
    const timer = window.setInterval(() => {
      if (left <= 0) {
        window.clearInterval(timer);
        return;
      }
      left -= 1;
      ask();
    }, 500);

    return () => window.clearInterval(timer);
  }, [ask, playing, dismissed]);

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
   * All of it is a safety net now rather than the way in. The curtain's click
   * is the gesture that starts the song, and it is a click, so it always
   * carries activation. This stays because the click can still land before the
   * player has finished loading, and a command sent to a frame that is not
   * ready is dropped rather than refused: the next scroll or tap asks again,
   * and by then the browser has been interacted with, so the ask is allowed.
   *
   * Everything keeps listening until the player reports itself unmuted, so a
   * refused attempt costs nothing but the next gesture.
   */
  useEffect(() => {
    if (playing || dismissed) return;
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
  }, [playing, dismissed, start]);

  return (
    <div className="flex items-center gap-4">
      {/* The curtain lives here rather than in the page because this component
          owns the player. The page is a server component, so it cannot hand a
          click handler to a client one, and `enter` has to be the same function
          that talks to the frame: the unmute only carries activation if it runs
          inside the click's own call stack. */}
      {!entered && <Curtain leaving={leaving} onEnter={enter} />}

      {/* Fixed, so the picture stays still while the letter scrolls over it,
          and `-z-10` so it sits behind the page without leaving the layout
          layer the rest of the route lives in.

          The scrim is the only thing between the letter and the video now
          that the panel behind the text is gone, so it carries the contrast
          on its own: 90% of the page background, the value the panel used to
          hold. Being the page's own token is what lets one number serve both
          themes, dimming towards paper in light and towards ink in dark. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <iframe
          ref={frame}
          title="Music"
          src={EMBED}
          onLoad={ask}
          allow="autoplay; encrypted-media"
          aria-hidden="true"
          tabIndex={-1}
          className="embed-cover"
        />
        <span className="absolute inset-0 bg-background/90" />
      </div>

      {/* One glyph, and it never changes. The music is meant to arrive on its
          own, so a play triangle would be advertising a job nobody has to do:
          what the reader wants to know is that the sound is the page's doing
          and where to make it stop. A note says both. State is carried by
          colour instead, lit while it is sounding and subtle while it is not.

          Deliberately tiny, 12px, barely larger than the text beside it. It is
          there for the reader who wants the music off, not to be the first
          thing they see on a page whose first thing is a letter.

          Small to look at, not small to hit. `-m-2 p-2` grows the target to
          28px without moving anything: the padding takes the clicks and the
          negative margin gives the layout back the space it took.

          The label has to live in `aria-label`, since a button with no text
          has no accessible name and "button" is all a screen reader would
          otherwise have to announce. It is also the part that changes, because
          the glyph deliberately does not. */}
      <button
        type="button"
        onClick={playing ? silence : play}
        aria-label={playing ? "Turn the music off" : "Turn the music on"}
        className={`-m-2 flex shrink-0 p-2 transition-colors duration-fast ease-out hover:text-foreground ${
          playing ? "text-foreground" : "text-subtle"
        }`}
      >
        <MusicNotes aria-hidden="true" className="h-3 w-3" />
      </button>

      {/* The song's own name, set the way a name is set: the page's sans face,
          the case it is actually written in. It was in the mono label style
          this site uses for eyebrows and coordinates, which is right for
          "[ 02 / 06 ]" and wrong for "Home Again". A title is not a label, and
          putting it in small caps made the one human thing in this row read as
          part of the furniture. */}
      <a
        href={WATCH_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-sm text-subtle transition-colors duration-fast ease-out hover:text-foreground"
      >
        {TRACK}
        <ArrowUpRight aria-hidden="true" className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}
