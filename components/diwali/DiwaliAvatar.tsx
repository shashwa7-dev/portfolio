"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  INITIAL,
  isOverlayOpen,
  reduce,
  type FlyerBox,
  type ShowState,
} from "@/lib/diwali/show";
import { duration } from "@/lib/motionVariants";
import { Matchstick } from "@/components/diwali/art/Matchstick";
import { createDiwaliSound, type DiwaliSound } from "@/components/diwali/sound";
import { createFuse, type Fuse } from "@/components/diwali/fuse";
import ShowBoundary from "@/components/diwali/ShowBoundary";
import type { DiwaliShowProps } from "@/components/diwali/DiwaliShow";
import styles from "@/components/diwali/fuse.module.css";

type ShowComponent = ComponentType<DiwaliShowProps>;

/**
 * The show is heavy (video, fireworks, finale art), so it is its own chunk,
 * warmed on hover or focus. It is a plain import, not `next/dynamic`, so the
 * avatar knows when it has arrived: the show is only mounted once it has, and
 * a failed import (a deploy skew, or offline) puts the photo back at rest
 * instead of dimming the page with no show over it.
 */
const loadShow = (): Promise<ShowComponent> =>
  import("@/components/diwali/DiwaliShow").then((m) => m.default);

type Props = Omit<ComponentProps<"button">, "children">;

/** Keys that scroll the page; held off while the fuse burns (`lit`). */
const SCROLL_KEYS = new Set([
  " ",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

/**
 * The hero photo while `DIWALI_ENABLED` is on: in place of the fidget
 * spinner, goggles and status ring, the photo wears a chakri's fuse. On hover
 * devices a matchstick follows the pointer; a click (or Enter, or Space)
 * lights it, a flame runs up the rope's tail and once round the ring (drawn by
 * `fuse.ts`), and when it has burnt the show takes over (`DiwaliShow`, loaded
 * on demand).
 *
 * It owns the show's state and its one `DiwaliSound`, and locks the page's
 * scroll from the light until the show has returned. When the show returns,
 * the fuse is restored and focus comes back here, without opening the
 * tooltip (it opens again on the next hover).
 *
 * Sized in `em` like `AvatarHover`, because the photo sits inside the h1.
 * Under reduced motion there is no matchstick, flame, sparks or smoke: the
 * rope simply fades to ash over the fuse's duration (CSS). Sounds still play.
 */
export default function DiwaliAvatar({
  ref,
  onClick,
  onPointerEnter,
  onPointerMove,
  onFocus,
  className,
  ...rest
}: Props) {
  const [state, dispatch] = useReducer(reduce, INITIAL);
  const [sound, setSound] = useState<DiwaliSound | null>(null);
  const [Show, setShow] = useState<ShowComponent | null>(null);
  const showLoad = useRef<Promise<ShowComponent> | null>(null);

  const button = useRef<HTMLButtonElement | null>(null);
  const photo = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fuse = useRef<Fuse | null>(null);
  const match = useRef<HTMLSpanElement>(null);
  const soundRef = useRef<DiwaliSound | null>(null);
  const phaseRef = useRef<ShowState["phase"]>(state.phase);
  const timer = useRef(0);
  /** Set while focus is put back here after the show, so the tooltip stays shut. */
  const quietFocus = useRef(false);

  // The tooltip trigger (Radix Slot) hands its own ref in, so both get the
  // element, as in SpinAvatar.
  const setButton = (el: HTMLButtonElement | null) => {
    button.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  const send = dispatch;

  /**
   * Starts the show's import, or returns the one already under way. A failed
   * import is forgotten, so the next hover or light tries again.
   */
  const warmShow = useCallback((): Promise<ShowComponent> => {
    if (!showLoad.current) {
      const load = loadShow();
      showLoad.current = load;
      load.then(
        (C) => setShow(() => C),
        () => {
          if (showLoad.current === load) showLoad.current = null;
        },
      );
    }
    return showLoad.current;
  }, []);

  /**
   * The show could not load or threw while running: back to rest. The idle
   * effect below restores the rope and photo, closes the sound and returns
   * focus; `data-overlay` goes with the phase.
   */
  const abort = useCallback(() => {
    if (phaseRef.current === "idle") return;
    window.clearTimeout(timer.current);
    fuse.current?.rest();
    dispatch({ type: "ABORT" });
  }, []);

  /**
   * Where the flyer lifts off from and lands: the photo's own unrotated box
   * and the button's tilt (`-rotate-4`, upright on hover). The bounding rect
   * of a tilted element is larger than the photo, so only its centre is used;
   * the side is the photo's layout width.
   */
  const photoBox = useCallback((): FlyerBox => {
    const el = photo.current;
    if (!el) return { cx: 0, cy: 0, size: 0, rotate: 0 };
    const r = el.getBoundingClientRect();
    const tilt = button.current ? getComputedStyle(button.current).rotate : "";
    return {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      size: el.offsetWidth,
      rotate: Number.parseFloat(tilt) || 0,
    };
  }, []);

  // The rope: drawn once at rest, re-measured whenever the photo's size
  // changes (it is sized in em, inside a clamped h1).
  useEffect(() => {
    const cv = canvas.current;
    const el = photo.current;
    if (!cv || !el) return;
    const f = createFuse(cv, el);
    fuse.current = f;
    const ro = new ResizeObserver(() => f.measure());
    ro.observe(el);
    return () => {
      ro.disconnect();
      f.destroy();
      fuse.current = null;
    };
  }, []);

  // On the way home the rope is put back under the dimmed page, so it is
  // already there when the dim lifts. Back at rest: close the show's sound
  // and return focus here. (The `sound` state is left as is: it is only read
  // while the phase is past idle, and the next light replaces it.)
  useEffect(() => {
    const previous = phaseRef.current;
    phaseRef.current = state.phase;
    if (state.phase === "returning") fuse.current?.rest();
    if (state.phase === "idle" && previous !== "idle") {
      fuse.current?.rest();
      soundRef.current?.close();
      soundRef.current = null;
      quietFocus.current = true;
      button.current?.focus({ preventScroll: true });
      quietFocus.current = false;
    }
  }, [state.phase]);

  // ---- Scroll lock, from the light (the fuse's burn) until back at rest. ----
  const locked = state.phase !== "idle";
  useEffect(() => {
    if (!locked) return;
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
  }, [locked]);

  // While the fuse burns, the scroll keys do nothing; from `centre` on, the
  // show captures every key itself.
  const burning = state.phase === "lit";
  useEffect(() => {
    if (!burning) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      const typing =
        t instanceof HTMLElement &&
        (t.isContentEditable ||
          t instanceof HTMLInputElement ||
          t instanceof HTMLTextAreaElement);
      if (!typing && SCROLL_KEYS.has(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [burning]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      soundRef.current?.close();
      soundRef.current = null;
    },
    [],
  );

  /**
   * Burns the fuse, then hands over to the show: FUSE_BURNT, then the whoomp
   * and the chime. Under reduced motion the rope fades to ash in CSS
   * (`data-phase="lit"`) over the same duration and is then cleared.
   */
  function burn(ready: Promise<ShowComponent>) {
    const ms = duration.diwaliFuse * 1000;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // The show takes over only once its chunk is here (usually long before
    // the fuse has burnt). A failed import has already aborted the light.
    const done = () => {
      ready.then(
        () => {
          if (phaseRef.current !== "lit") return;
          send({ type: "FUSE_BURNT" });
          soundRef.current?.whoomp();
          soundRef.current?.chime();
        },
        () => {},
      );
    };
    const f = fuse.current;
    if (reduced || !f) {
      timer.current = window.setTimeout(() => {
        fuse.current?.clear();
        done();
      }, ms);
      return;
    }
    f.burn(ms, done);
  }

  function light() {
    if (phaseRef.current !== "idle") return;
    phaseRef.current = "lit";
    dispatch({ type: "LIGHT" });
    const ready = warmShow();
    ready.catch(abort);
    // Guard: never leave an earlier show's AudioContext open.
    soundRef.current?.close();
    const s = createDiwaliSound();
    soundRef.current = s;
    setSound(s);
    s.unlock();
    s.strike();
    s.fuse(duration.diwaliFuse);
    // Imported lazily so the IFrame API's URL stays out of the homepage's
    // initial JavaScript. It still starts from this click.
    void import("@/components/diwali/youtube")
      .then((m) => m.primeYouTube())
      .catch(() => {});
    burn(ready);
  }

  /** Puts the matchstick's head on the pointer. Written to the DOM, not state. */
  function follow(e: ReactPointerEvent<HTMLButtonElement>) {
    const el = match.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Light the chakri"
        {...rest}
        ref={setButton}
        data-phase={state.phase}
        data-overlay={isOverlayOpen(state.phase) ? "" : undefined}
        className={`${className ?? ""} ${styles.fuseButton}`}
        onPointerEnter={(e) => {
          onPointerEnter?.(e);
          void warmShow();
          fuse.current?.warm();
          follow(e);
        }}
        onPointerMove={(e) => {
          onPointerMove?.(e);
          follow(e);
        }}
        onFocus={(e) => {
          // Focus put back after the show: the tooltip's handler is skipped.
          if (!quietFocus.current) onFocus?.(e);
          void warmShow();
          fuse.current?.warm();
        }}
        onClick={(e) => {
          onClick?.(e);
          light();
        }}
      >
        <span ref={photo} className={styles.fusePhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/avatar.png"
            alt="Shashwat Tripathi"
            className={styles.fuseImg}
          />
        </span>
        <canvas ref={canvas} aria-hidden className={styles.fuseRope} />
        <span
          aria-hidden
          className="absolute -bottom-[0.02em] -right-[0.04em] h-[0.28em] w-[0.28em] rounded-full bg-amber-700 ring-2 ring-background dark:bg-amber-300"
        />
        <span ref={match} aria-hidden className={styles.match}>
          <Matchstick className={styles.matchSvg} />
        </span>
      </button>
      {/* A sibling, not a child: the show has its own buttons, and a button
        inside a button is invalid. It renders through a portal. The boundary
        keeps any error in the show from reaching the homepage. */}
      {state.phase !== "idle" && sound && Show && (
        <ShowBoundary onError={abort}>
          <Show
            state={state}
            dispatch={send}
            photoBox={photoBox}
            sound={sound}
          />
        </ShowBoundary>
      )}
    </>
  );
}
