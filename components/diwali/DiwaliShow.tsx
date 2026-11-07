"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FastForward } from "@phosphor-icons/react/ssr";
import {
  chakriBox,
  flyerTransform,
  isOverlayOpen,
  toFlyerBox,
  shouldPlayVideo,
  videoReachedEnd,
  type FlyerBox,
  type Phase,
  type ShowEvent,
  type ShowState,
} from "@/lib/diwali/show";
import { duration } from "@/lib/motionVariants";
import { Chakri } from "@/components/diwali/art/Chakri";
import { Toran } from "@/components/diwali/art/Toran";
import SparkCanvas from "@/components/diwali/SparkCanvas";
import FireworksCanvas from "@/components/diwali/FireworksCanvas";
import Finale from "@/components/diwali/Finale";
import Plate from "@/components/diwali/Plate";
import { rozha, tiro } from "@/components/diwali/fonts";
import type { DiwaliSound } from "@/components/diwali/sound";
import {
  createPlayer,
  primeYouTube,
  type DiwaliPlayer,
} from "@/components/diwali/youtube";
import styles from "@/components/diwali/diwali.module.css";

export type DiwaliShowProps = {
  state: ShowState;
  dispatch: (e: ShowEvent) => void;
  /** The hero photo's own box and tilt: where the flyer lifts off and lands. */
  photoBox: () => FlyerBox;
  sound: DiwaliSound;
};

/** How often the song's clock is read, as a backup for `end=67` not firing. */
const POLL_MS = 250;
/** The song's fade-in, in this many volume steps. */
const SONG_FADE_STEPS = 20;
/** The chakri's spin sound under the song, as a share of its full level. */
const SPIN_UNDER_SONG = 0.33;
/** The chakri's spin sound once it has moved to the corner, as a share of its level before. */
const SPIN_IN_CORNER = 0.7;

const IDOLS = "/images/diwali/lakshmi-ganesh.webp";
const LADDOO_ICON = "/images/diwali/laddoo-icon.webp";
/** Samples that make the browser fetch each face's Devanagari and Latin files. */
const HI_SAMPLE = "शुभ दीपावली प्रसाद";
const EN_SAMPLE = "Wishing you";

/**
 * Lays the flyer out once at the centre box (its largest size) and moves it
 * with a transform only: translate and scale onto `box`, turned to its tilt.
 */
function place(el: HTMLElement, box: FlyerBox) {
  const base = chakriBox("centre", window.innerWidth, window.innerHeight);
  el.style.left = `${base.x}px`;
  el.style.top = `${base.y}px`;
  el.style.width = `${base.size}px`;
  el.style.height = `${base.size}px`;
  el.style.transform = flyerTransform(box, base);
}

/**
 * The Diwali show, mounted by `DiwaliAvatar` once the fuse is lit and drawn
 * through a portal on `document.body` (it is rendered inside the hero h1).
 *
 * When the fuse has burnt (`centre`): the screen goes black, the toran drops
 * in, and a copy of the photo lifts out of the headline, flips into the
 * chakri and flies to the centre, spinning with its spark jet while the Diwali
 * Song plays behind it. Five seconds after arriving it moves to the corner
 * (`corner`). At 1:07, or on Skip or Esc, the finale takes over (`finale`):
 * the song pauses and fades, the chakri fades, the शुभ दीपावली card rises in
 * and the fireworks start; they keep going under the plate (`plate`, `picked`).
 * On the way out (`returning`) it all lifts away and the chakri flips back
 * into the photo as it flies home; the page stays dimmed with the landed
 * photo above it for a beat, then the dim lifts and the show ends.
 *
 * Positions and the flip are written to the DOM, not React state; the CSS
 * module carries the transitions, keyed on `data-phase` and `data-on`.
 */
export default function DiwaliShow({
  state,
  dispatch,
  photoBox,
  sound,
}: DiwaliShowProps) {
  const { phase } = state;
  const open = isOverlayOpen(phase);
  const wantVideo = shouldPlayVideo(phase);

  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [vw, setVw] = useState(() => window.innerWidth);
  const [playing, setPlaying] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const player = useRef<DiwaliPlayer | null>(null);
  const phaseRef = useRef<Phase>(phase);
  const ended = useRef(false);
  /** The song has started playing (its fade-in has begun). */
  const songOn = useRef(false);
  /** The song's fade-in interval, cleared with the song effect. */
  const songFade = useRef(0);
  /**
   * The chakri's box once it has landed, for the spark jet; null while the
   * flyer is in flight, when SparkCanvas measures it instead.
   */
  const rest = useRef<FlyerBox | null>(null);
  /** Where the current move ends; becomes `rest` when the flight lands. */
  const landing = useRef<FlyerBox | null>(null);
  const titleId = useId();
  const blessId = useId();

  // Latest props, for listeners and timers that outlive a render.
  const latest = useRef({ dispatch, photoBox, sound });
  useLayoutEffect(() => {
    latest.current = { dispatch, photoBox, sound };
  });

  /**
   * Puts the flyer where the phase wants it. `moving` is false when the
   * move jumps (a resize, or reduced motion), so the jet can use the box at once.
   */
  const applyBox = (p: Phase, moving: boolean) => {
    const el = flyer.current;
    if (!el) return;
    let box: FlyerBox | null = null;
    if (p === "centre" || p === "corner") {
      box = toFlyerBox(chakriBox(p, window.innerWidth, window.innerHeight));
    } else if (p === "returning") {
      box = latest.current.photoBox();
    }
    if (!box) return;
    place(el, box);
    landing.current = box;
    rest.current = moving && !reduced ? null : box;
  };
  const applyBoxRef = useRef(applyBox);
  useLayoutEffect(() => {
    applyBoxRef.current = applyBox;
  });

  // ---- Phase changes: written to the DOM before paint. ----
  useLayoutEffect(() => {
    phaseRef.current = phase;
    const el = root.current;
    const fly = flyer.current;
    const send = latest.current.dispatch;
    let timer = 0;

    switch (phase) {
      case "centre": {
        if (!el || !fly) break;
        // Lift-off: the flyer starts exactly on the hero photo (its size and
        // tilt), then the blackout, toran, flip and flight all start together.
        fly.style.transition = "none";
        place(fly, latest.current.photoBox());
        void fly.offsetWidth;
        fly.style.transition = "";
        el.dataset.on = "";
        fly.dataset.flipped = "";
        applyBoxRef.current("centre", true);
        skip.current?.focus({ preventScroll: true });
        // Five seconds of centre stage after arriving.
        timer = window.setTimeout(
          () => send({ type: "CENTRE_HOLD_DONE" }),
          (duration.diwaliFlight + duration.diwaliCentreHold) * 1000,
        );
        break;
      }
      case "corner":
        applyBoxRef.current("corner", true);
        // Further away: the spin sound drops as it moves.
        latest.current.sound.spinLevel(
          (songOn.current ? SPIN_UNDER_SONG : 1) * SPIN_IN_CORNER,
          duration.diwaliCorner,
        );
        break;
      case "finale":
        // The video pauses and fades (the song effect's cleanup) and the
        // chakri fades (CSS); Finale moves focus to its button once its
        // entrance has finished.
        break;
      case "plate":
      case "picked":
        // Plate moves focus to its first laddoo, plays the bite and sends
        // PICK_DONE itself.
        break;
      case "returning": {
        if (!el || !fly) break;
        // The flight home, over a page that stays dimmed (`data-dim`): the
        // landed photo sits above the dim for the hold, then the dim lifts,
        // and only then does the hero photo take over (RETURNED).
        el.dataset.dim = "";
        delete el.dataset.on;
        delete fly.dataset.flipped;
        if (spin.current) spin.current.style.transform = "";
        applyBoxRef.current("returning", true);
        const landed =
          (duration.diwaliReturn + duration.diwaliReturnHold) * 1000;
        timer = window.setTimeout(() => {
          delete el.dataset.dim;
          timer = window.setTimeout(
            () => send({ type: "RETURNED" }),
            duration.diwaliBlackout * 1000,
          );
        }, landed);
        break;
      }
    }
    return () => window.clearTimeout(timer);
  }, [phase]);

  // ---- The song. Created once the show wants it; never over the finale. ----
  useEffect(() => {
    if (!wantVideo) return;
    let cancelled = false;
    let poll = 0;

    const reachedEnd = () => {
      if (ended.current || !shouldPlayVideo(phaseRef.current)) return;
      ended.current = true;
      latest.current.dispatch({ type: "VIDEO_ENDED" });
    };
    const startPolling = () => {
      window.clearInterval(poll);
      poll = window.setInterval(() => {
        const p = player.current;
        if (p && videoReachedEnd(p.currentTime())) reachedEnd();
      }, POLL_MS);
    };

    if (player.current) {
      player.current.play();
      startPolling();
    } else {
      // Already started by the light click; usually resolved by now.
      void primeYouTube().then(() => {
        // Skipped (or gone) while the API loaded: never build the player.
        const host = vid.current;
        if (cancelled || !host || !shouldPlayVideo(phaseRef.current)) return;
        player.current = createPlayer(host, {
          onReady() {
            // The phase now, not the phase the player was made in.
            if (shouldPlayVideo(phaseRef.current)) player.current?.play();
            else player.current?.pause();
          },
          onPlaying() {
            // A backstop: hold it if the show has moved on since play().
            if (!shouldPlayVideo(phaseRef.current)) {
              player.current?.pause();
              return;
            }
            setPlaying(true);
            if (songOn.current) return;
            // The first time only: the song fades up from silence while the
            // chakri ducks under it.
            songOn.current = true;
            let step = 0;
            window.clearInterval(songFade.current);
            songFade.current = window.setInterval(() => {
              step += 1;
              player.current?.setVolume((100 * step) / SONG_FADE_STEPS);
              if (step >= SONG_FADE_STEPS) window.clearInterval(songFade.current);
            }, (duration.diwaliSongFadeIn * 1000) / SONG_FADE_STEPS);
            latest.current.sound.spinLevel(
              SPIN_UNDER_SONG *
                (phaseRef.current === "corner" ? SPIN_IN_CORNER : 1),
              duration.diwaliSongFadeIn,
            );
          },
          onEnded: reachedEnd,
          onError() {
            // No fallback beyond Skip: the chakri carries on over the dark.
          },
        });
        startPolling();
      });
    }

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(songFade.current);
      player.current?.pause();
      setPlaying(false);
    };
  }, [wantVideo]);

  // ---- The chakri's spin sound, while it spins (never under reduced motion,
  // where it does not); it fades out with the blackout when the show moves on
  // or unmounts. ----
  const spinVoice = !reduced && wantVideo;
  useEffect(() => {
    if (!spinVoice) return;
    const voice = latest.current.sound;
    voice.spinStart();
    return () => voice.spinStop(duration.diwaliBlackout);
  }, [spinVoice]);

  // ---- Keys: capture phase, so the site's shortcuts never see them. ----
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) latest.current.dispatch({ type: "ESCAPE" });
        return;
      }
      if (k === "Tab") {
        // Keep focus inside the dialog.
        const buttons = Array.from(
          root.current?.querySelectorAll<HTMLButtonElement>(
            "button:not([disabled])",
          ) ?? [],
        );
        e.preventDefault();
        if (buttons.length === 0) return;
        const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const step = e.shiftKey ? -1 : 1;
        const next =
          at === -1
            ? 0
            : (at + step + buttons.length) % buttons.length;
        buttons[next].focus({ preventScroll: true });
        return;
      }
      if (k === "Shift") return;
      // A held Enter or Space must not chain through the show's buttons.
      if ((k === "Enter" || k === " ") && e.repeat) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (k === "Enter" || k === " ") {
        const t = e.target;
        if (t instanceof HTMLButtonElement && root.current?.contains(t)) return;
        e.preventDefault();
      }
      e.stopImmediatePropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  // ---- Scroll lock while the overlay is up. ----
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    const previousGutter = html.style.scrollbarGutter;
    // Keep the scrollbar's space while it is hidden, so the page never shifts.
    html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
      html.style.scrollbarGutter = previousGutter;
    };
  }, [open]);

  // ---- Rotation and resize: keep the chakri centred (or cornered). ----
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      // A resize jumps: no flight, so the jet's box is known at once.
      const fly = flyer.current;
      if (fly) fly.style.transition = "none";
      applyBoxRef.current(phaseRef.current, false);
      if (fly) {
        void fly.offsetWidth;
        fly.style.transition = "";
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---- The flight has landed: hand the jet the box, so it stops measuring. ----
  useEffect(() => {
    const fly = flyer.current;
    if (!fly) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== fly || e.propertyName !== "transform") return;
      rest.current = landing.current;
    };
    fly.addEventListener("transitionend", onEnd);
    return () => fly.removeEventListener("transitionend", onEnd);
  }, [open]);

  // ---- Warm the finale: the idols and both faces, from the light on, so a
  // Skip on a slow connection never shows late idols or a fallback font. ----
  useEffect(() => {
    new Image().src = IDOLS;
    new Image().src = LADDOO_ICON;
    if (!("fonts" in document)) return;
    const faces = [
      `16px ${rozha.style.fontFamily}`,
      `16px ${tiro.style.fontFamily}`,
      `italic 16px ${tiro.style.fontFamily}`,
    ];
    for (const font of faces) {
      for (const text of [HI_SAMPLE, EN_SAMPLE]) {
        document.fonts.load(font, text).catch(() => {});
      }
    }
  }, []);

  // ---- Unmount: nothing may outlive the show. ----
  // (Timers, the poll, listeners and the scroll lock are each undone by their
  // own effect's cleanup above; the spark loop by SparkCanvas's.)
  // The sound is DiwaliAvatar's: it closes it on return to idle and on its
  // own unmount, so it is not closed here.
  useEffect(
    () => () => {
      player.current?.destroy();
      player.current = null;
    },
    [],
  );

  if (!open) return null;

  const showSkip = phase === "centre" || phase === "corner";
  const sparks =
    !reduced &&
    (phase === "centre" || phase === "corner" || phase === "finale");
  // The card (and the plate, once up) stays through the bite and fades out on
  // the way home; returning only ever follows a pick.
  const finale =
    phase === "finale" ||
    phase === "plate" ||
    phase === "picked" ||
    phase === "returning";
  // The card stays dimmed and blurred behind the plate on the way home too.
  const plating =
    phase === "plate" || phase === "picked" || phase === "returning";
  const finaleUp = phase === "finale" || phase === "plate" || phase === "picked";

  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Diwali celebration"
      aria-describedby={finaleUp ? `${titleId} ${blessId}` : undefined}
      data-phase={phase}
      className={styles.show}
    >
      <div aria-hidden className={styles.blackout}>
        <div
          ref={vid}
          className={styles.vid}
          data-on={playing ? "" : undefined}
        />
      </div>
      {sparks && (
        <SparkCanvas
          target={flyer}
          rest={rest}
          spin={spin}
          emitting={wantVideo}
        />
      )}
      <div ref={flyer} aria-hidden className={styles.flyer}>
        <div ref={spin} className={styles.spin}>
          <div className={styles.flip}>
            <div className={`${styles.face} ${styles.facePhoto}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/avatar.png" alt="" />
            </div>
            <div className={`${styles.face} ${styles.faceChakri}`}>
              <Chakri idPrefix="dws-chakri" />
            </div>
          </div>
        </div>
      </div>
      {finale && (
        <FireworksCanvas running={phase !== "returning"} sound={sound} />
      )}
      {finale && (
        <Finale
          titleId={titleId}
          blessId={blessId}
          plating={plating}
          onOpenPlate={() => dispatch({ type: "OPEN_PLATE" })}
        />
      )}
      <div aria-hidden className={styles.toran}>
        <Toran width={vw} idPrefix="dws-toran" />
      </div>
      {showSkip && (
        <div className={styles.ctrl}>
          <button
            ref={skip}
            type="button"
            className={styles.skip}
            aria-label="Skip"
            aria-keyshortcuts="Escape"
            onClick={() => dispatch({ type: "SKIP" })}
          >
            Skip
            <FastForward weight="fill" size={16} aria-hidden />
            <kbd>Esc</kbd>
          </button>
        </div>
      )}
      {plating && (
        <Plate
          phase={phase === "plate" ? "plate" : "picked"}
          sound={sound}
          onPick={(index) => dispatch({ type: "PICK", index })}
          onDone={() => dispatch({ type: "PICK_DONE" })}
        />
      )}
    </div>,
    document.body,
  );
}
