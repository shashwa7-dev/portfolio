"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { audioNow, playSpinSound, routeThroughGain } from "@/components/common/spinSound";

/**
 * The hero photo as a fidget spinner.
 *
 * A click (or the F key, see below) flicks the photo into a spin; more flicks add
 * speed. It behaves like a spinner with a weight at the bottom: upright is the
 * rest position, and the weight pulls it back there all the time. Fast, it
 * sails over the top and only slows a touch upside down. As friction bleeds
 * speed off, there comes a turn it can no longer finish: it stalls on the way
 * up, swings back, rocks once or twice, and settles upright. No full extra
 * lap to reach upright, and no snap.
 *
 * It is a button and nothing else: the photo used to link to /offcod8, and
 * that link was removed on purpose. Enter and Space on the focused button
 * spin it like a click.
 *
 * F (for fidget) spins it from anywhere on the page while the photo is on
 * screen, unless you are typing in a field. F because it is free: Space
 * scrolls the page, and S is already the second key of "g s" (Shelf).
 *
 * Sound (spinSound.ts) is minimal: a flick per spin, a bearing tick every half
 * turn while it is going round, and a click when it drops back to upright.
 * Keep it spinning fast (three turns a second or more, which takes steady
 * clicking) for 2.5 seconds and the photo dissolves into the "You Spin Me
 * Round" video, sound and all, turning with the spinner like a record. When
 * the spinner settles, or the 8 second clip ends, the video and its sound
 * fade out together and the photo comes back. It never restarts while it is
 * on screen or fading. Under reduced motion there is no spin, so no clip.
 *
 * The video costs nothing until the first flick: `preload="none"`, then that
 * first flick (a real user gesture) starts loading it, routes its sound
 * through a gain node (so the fade works on iOS), and plays and pauses it
 * once at zero gain, which is what unlocks sound for a later play() that
 * does not come straight from a gesture in Safari.
 *
 * The physics runs in a rAF loop and writes the transform straight to the
 * element, not through React state, so a spin never re-renders the hero.
 * The numbers below are physics constants, not animation durations.
 */
const RAD = Math.PI / 180;
const TURN = 2 * Math.PI;
const IMPULSE = 900 * RAD; // rad/s added per flick
const MAX_SPEED = 3600 * RAD; // rad/s, ten turns a second
const DRAG = 0.85; // bearing friction while it goes round, per second
const WEIGHT = 4.5; // pull toward upright: the rocking frequency, rad/s
const ROCK_DRAG = 5; // friction once it can no longer get over the top
const STEP = 1 / 240; // fixed physics step, seconds
const TICK_EVERY = Math.PI; // a bearing tick every half turn
const SONG_SPEED = 1080 * RAD; // rad/s, three turns a second
const SONG_AFTER = 2.5; // seconds held above SONG_SPEED before the clip plays
const CLIP_GAIN = 0.35; // the clip's volume

/** The clip's fade time, read from its CSS transition so sound and picture
 *  share one number (--duration-spin-clip). */
function fadeSeconds(el: HTMLElement): number {
  const d = getComputedStyle(el).transitionDuration.split(",")[0].trim();
  return d.endsWith("ms") ? parseFloat(d) / 1000 : parseFloat(d) || 0;
}

type Props = Omit<ComponentProps<"button">, "children"> & {
  photo: ReactNode;
  children?: ReactNode;
};

/** Typing in a field, where F is just a letter. */
function isTyping(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || el.closest("input, textarea, select") !== null;
}

/** Signed distance from the nearest upright turn, in radians. */
const offUpright = (angle: number) => angle - Math.round(angle / TURN) * TURN;

/** True once it no longer has the energy to get over the top. */
const trapped = (angle: number, speed: number) =>
  (speed * speed) / 2 + WEIGHT * WEIGHT * (1 - Math.cos(angle)) < 2 * WEIGHT * WEIGHT;

export default function SpinAvatar({ photo, children, onClick, ref, ...rest }: Props) {
  const button = useRef<HTMLButtonElement | null>(null);
  // The tooltip trigger (Radix Slot) hands its own ref in. Spread over ours it
  // replaced it, leaving `button` null and the F key silently doing nothing,
  // so both get the element.
  const setButton = (el: HTMLButtonElement | null) => {
    button.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };
  const spinner = useRef<HTMLSpanElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const clip = useRef({
    primed: false,
    gain: null as GainNode | null,
    state: "idle" as "idle" | "on" | "fading",
    timer: 0,
  });

  /** On the first flick, inside the gesture: load, route and unlock. */
  function primeClip() {
    const v = video.current;
    const c = clip.current;
    if (!v || c.primed) return;
    c.primed = true;
    c.gain = routeThroughGain(v);
    if (c.gain) c.gain.gain.value = 0;
    else v.muted = true;
    v.preload = "auto";
    v.play()
      .then(() => {
        if (c.state === "idle") {
          v.pause();
          v.currentTime = 0;
        }
      })
      .catch(() => {});
  }

  function playClip() {
    const v = video.current;
    const c = clip.current;
    if (!v || c.state !== "idle") return;
    c.state = "on";
    v.currentTime = 0;
    const fade = fadeSeconds(v);
    if (c.gain) {
      const now = audioNow();
      c.gain.gain.cancelScheduledValues(now);
      c.gain.gain.setValueAtTime(0, now);
      c.gain.gain.linearRampToValueAtTime(CLIP_GAIN, now + fade);
    } else {
      v.muted = false;
      v.volume = CLIP_GAIN;
    }
    v.dataset.on = "";
    v.play().catch(() => stopClip());
  }

  function stopClip() {
    const v = video.current;
    const c = clip.current;
    if (!v || c.state !== "on") return;
    c.state = "fading";
    delete v.dataset.on;
    const fade = fadeSeconds(v);
    if (c.gain) {
      const now = audioNow();
      c.gain.gain.cancelScheduledValues(now);
      c.gain.gain.setValueAtTime(c.gain.gain.value, now);
      c.gain.gain.linearRampToValueAtTime(0, now + fade);
    }
    c.timer = window.setTimeout(() => {
      v.pause();
      v.currentTime = 0;
      c.state = "idle";
    }, fade * 1000);
  }
  const state = useRef({ angle: 0, speed: 0, frame: 0, last: 0, captured: false, clicked: false, fastFor: 0 });

  function step(dt: number) {
    const s = state.current;
    const before = s.angle;
    const drag = s.captured ? ROCK_DRAG : DRAG;
    s.speed += (-WEIGHT * WEIGHT * Math.sin(s.angle) - drag * s.speed) * dt;
    s.angle += s.speed * dt;

    if (!s.captured && trapped(s.angle, s.speed)) s.captured = true;

    if (!s.captured) {
      if (Math.floor(s.angle / TICK_EVERY) !== Math.floor(before / TICK_EVERY)) {
        playSpinSound("tick", Math.max(0.25, Math.min(Math.abs(s.speed) / (1800 * RAD), 1)));
      }
    } else if (!s.clicked && Math.sign(offUpright(before)) !== Math.sign(offUpright(s.angle))) {
      // The first pass back through upright after it stalls: the "detent".
      s.clicked = true;
      playSpinSound("settle", Math.max(0.4, Math.min(Math.abs(s.speed) / 6, 1)));
    }
  }

  function tick(now: number) {
    const s = state.current;
    // The first frame's timestamp can predate the flick's performance.now(),
    // so clamp at zero; cap long gaps (a background tab) at a few frames.
    let dt = Math.min(Math.max((now - s.last) / 1000, 0), 1 / 20);
    s.last = now;
    s.fastFor = Math.abs(s.speed) >= SONG_SPEED ? s.fastFor + dt : 0;
    if (s.fastFor >= SONG_AFTER) playClip();
    while (dt > 0) {
      step(Math.min(dt, STEP));
      dt -= STEP;
    }

    if (s.captured && Math.abs(offUpright(s.angle)) < 0.3 * RAD && Math.abs(s.speed) < RAD) {
      Object.assign(s, { angle: 0, speed: 0, frame: 0, captured: false, clicked: false, fastFor: 0 });
      stopClip();
      if (spinner.current) spinner.current.style.transform = "";
      return;
    }
    if (spinner.current) spinner.current.style.transform = `rotate(${s.angle / RAD}deg)`;
    s.frame = requestAnimationFrame(tick);
  }

  function flick() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const s = state.current;
    s.speed = Math.min(Math.max(s.speed, 0) + IMPULSE, MAX_SPEED);
    s.captured = trapped(s.angle, s.speed);
    s.clicked = false;
    playSpinSound("flick");
    primeClip();
    if (!s.frame) {
      s.last = performance.now();
      s.frame = requestAnimationFrame(tick);
    }
  }

  // F from anywhere, while the photo is on screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "f" || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      const r = button.current?.getBoundingClientRect();
      if (!r || r.bottom <= 0 || r.top >= window.innerHeight) return;
      e.preventDefault();
      flick();
    };
    window.addEventListener("keydown", onKey);
    const s = state.current;
    const c = clip.current;
    const v = video.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(s.frame);
      window.clearTimeout(c.timer);
      v?.pause();
    };
    // flick only reads refs, so the listener never needs rebinding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      type="button"
      aria-label="Spin the photo"
      aria-keyshortcuts="F"
      {...rest}
      ref={setButton}
      onClick={(e) => {
        onClick?.(e);
        flick();
      }}
    >
      <span ref={spinner} className="relative block will-change-transform">
        {photo}
        <video
          ref={video}
          aria-hidden
          tabIndex={-1}
          playsInline
          preload="none"
          onEnded={stopClip}
          className="spin-clip pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover"
        >
          <source src="/video/spin-me-round.webm" type="video/webm" />
          <source src="/video/spin-me-round.mp4" type="video/mp4" />
        </video>
      </span>
      {children}
    </button>
  );
}
