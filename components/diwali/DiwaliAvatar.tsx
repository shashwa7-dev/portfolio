"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  INITIAL,
  isOverlayOpen,
  reduce,
  type ShowState,
} from "@/lib/diwali/show";
import { duration } from "@/lib/motionVariants";
import { Matchstick } from "@/components/diwali/art/Matchstick";
import { createDiwaliSound, type DiwaliSound } from "@/components/diwali/sound";
import styles from "@/components/diwali/diwali.module.css";

/**
 * The show is heavy (video, fireworks, finale art), so it is its own chunk,
 * warmed on hover or focus and only mounted once the fuse is lit.
 */
const loadShow = () => import("@/components/diwali/DiwaliShow");
const DiwaliShow = dynamic(loadShow, { ssr: false });

/**
 * Fuse geometry, in the fuse SVG's own units (viewBox 0 0 120 120, the photo
 * sitting 14 units in from each edge). The spark canvas is a 400 unit square
 * reaching 140 units out past the fuse box on every side, as in the prototype.
 */
const RING = { cx: 60, cy: 60, r: 53 };
const TAIL_FROM = { x: 118, y: 112 };
const TAIL_TO = { x: 97, y: 97 };
const FX_BOX = 400;
const FX_PAD = 140;
/** The share of the burn spent running up the tail before the ring. */
const TAIL_SHARE = 0.25;
const SPARKS_PER_FRAME = 6;

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
};

type Props = Omit<ComponentProps<"button">, "children">;

/**
 * The hero photo while `DIWALI_ENABLED` is on: in place of the fidget
 * spinner, goggles and status ring, the photo wears a chakri's fuse. On hover
 * devices a matchstick follows the pointer; a click (or Enter, or Space)
 * lights it, a spark runs up the tail and once round the ring, and when it has
 * burnt the show takes over (`DiwaliShow`, loaded on demand).
 *
 * It owns the show's state and its one `DiwaliSound`. When the show returns,
 * the fuse is restored and focus comes back here.
 *
 * Sized in `em` like `AvatarHover`, because the photo sits inside the h1.
 * Under reduced motion there is no matchstick and no spark: the ring simply
 * darkens over the fuse's duration.
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

  const button = useRef<HTMLButtonElement | null>(null);
  const photo = useRef<HTMLSpanElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const tail = useRef<SVGGElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const match = useRef<HTMLSpanElement>(null);
  const soundRef = useRef<DiwaliSound | null>(null);
  const phaseRef = useRef<ShowState["phase"]>(state.phase);
  const raf = useRef(0);
  const timer = useRef(0);

  // The tooltip trigger (Radix Slot) hands its own ref in, so both get the
  // element, as in SpinAvatar.
  const setButton = (el: HTMLButtonElement | null) => {
    button.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  const send = dispatch;

  const photoRect = useCallback(
    () => photo.current?.getBoundingClientRect() ?? new DOMRect(),
    [],
  );

  // Back at rest after the show: close the show's sound, put the fuse back
  // and return focus here. (The `sound` state is left as is: it is only read
  // while the phase is past idle, and the next light replaces it.)
  useEffect(() => {
    const previous = phaseRef.current;
    phaseRef.current = state.phase;
    if (state.phase === "idle" && previous !== "idle") {
      soundRef.current?.close();
      soundRef.current = null;
      ring.current?.style.removeProperty("stroke");
      tail.current?.style.removeProperty("opacity");
      button.current?.focus({ preventScroll: true });
    }
  }, [state.phase]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      window.clearTimeout(timer.current);
      soundRef.current?.close();
      soundRef.current = null;
    },
    [],
  );

  /** Runs the spark up the tail and round the ring, then hands over to the show. */
  function burn() {
    const ms = duration.diwaliFuse * 1000;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (reduced || !cv || !ctx) {
      // The ring darkens in CSS over the same duration (`data-phase="lit"`).
      timer.current = window.setTimeout(() => send({ type: "FUSE_BURNT" }), ms);
      return;
    }

    const box = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(box.width * dpr);
    cv.height = Math.round(box.height * dpr);
    // Canvas pixels per fuse unit.
    const k = cv.width / FX_BOX;
    let sparks: Spark[] = [];
    let burnt = false;
    const t0 = performance.now();
    let last = t0;

    const frame = (now: number) => {
      // Motion is tuned per 60fps frame, scaled so faster screens match.
      const f = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      ctx.clearRect(0, 0, cv.width, cv.height);

      if (!burnt) {
        const p = Math.min(1, (now - t0) / ms);
        let fx: number;
        let fy: number;
        if (p < TAIL_SHARE) {
          const q = p / TAIL_SHARE;
          if (tail.current) tail.current.style.opacity = String(1 - q * 0.8);
          fx = TAIL_FROM.x + (TAIL_TO.x - TAIL_FROM.x) * q;
          fy = TAIL_FROM.y + (TAIL_TO.y - TAIL_FROM.y) * q;
        } else {
          if (tail.current) tail.current.style.opacity = "0.2";
          ring.current?.style.setProperty("stroke", "var(--fuse-burnt)");
          const a =
            Math.PI / 4 + ((p - TAIL_SHARE) / (1 - TAIL_SHARE)) * Math.PI * 2;
          fx = RING.cx + RING.r * Math.cos(a);
          fy = RING.cy + RING.r * Math.sin(a);
        }
        const cx = (fx + FX_PAD) * k;
        const cy = (fy + FX_PAD) * k;
        for (let i = 0; i < SPARKS_PER_FRAME; i++) {
          const a = Math.random() * Math.PI * 2;
          const v = (0.5 + Math.random() * 1.5) * k;
          const life = 20 + Math.random() * 15;
          sparks.push({
            x: cx,
            y: cy,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v,
            life,
            max: life,
          });
        }
        if (p >= 1) {
          burnt = true;
          send({ type: "FUSE_BURNT" });
        }
      }

      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = k;
      const drag = Math.pow(0.975, f);
      for (const s of sparks) {
        const life = s.life / s.max;
        ctx.strokeStyle = `hsla(40,100%,${60 + 30 * life}%,${life})`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 2.5, s.y - s.vy * 2.5);
        ctx.stroke();
        s.x += s.vx * f;
        s.y += s.vy * f;
        s.vx *= drag;
        s.vy *= drag;
        s.vy += 0.035 * k * f;
        s.life -= f;
      }
      ctx.globalCompositeOperation = "source-over";
      sparks = sparks.filter((s) => s.life > 0);

      if (!burnt || sparks.length > 0)
        raf.current = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    };
    raf.current = requestAnimationFrame(frame);
  }

  function light() {
    if (phaseRef.current !== "idle") return;
    phaseRef.current = "lit";
    dispatch({ type: "LIGHT" });
    // Guard: never leave an earlier show's AudioContext open.
    soundRef.current?.close();
    const s = createDiwaliSound();
    s.unlock();
    s.strike();
    s.fuse(duration.diwaliFuse);
    soundRef.current = s;
    setSound(s);
    void loadShow();
    // Imported lazily so the IFrame API's URL stays out of the homepage's
    // initial JavaScript. It still starts from this click.
    void import("@/components/diwali/youtube").then((m) => m.primeYouTube());
    burn();
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
          void loadShow();
          follow(e);
        }}
        onPointerMove={(e) => {
          onPointerMove?.(e);
          follow(e);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          void loadShow();
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
        <span aria-hidden className={styles.fuseBox}>
          <canvas ref={canvas} className={styles.fuseSparks} />
          <svg viewBox="0 0 120 120" className={styles.fuseCord}>
            <circle
              ref={ring}
              className={styles.fuseRing}
              cx={RING.cx}
              cy={RING.cy}
              r={RING.r}
              fill="none"
              strokeWidth={5}
              strokeDasharray="3 2"
            />
            <g ref={tail} className={styles.fuseTail}>
              <path
                d="M97 97 Q108 110 118 112"
                fill="none"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <circle cx={118} cy={112} r={2.5} />
            </g>
          </svg>
        </span>
        <span
          aria-hidden
          className="absolute -bottom-[0.02em] -right-[0.04em] h-[0.28em] w-[0.28em] rounded-full bg-amber-700 ring-2 ring-background dark:bg-amber-300"
        />
        <span ref={match} aria-hidden className={styles.match}>
          <Matchstick className={styles.matchSvg} />
        </span>
      </button>
      {/* A sibling, not a child: the show has its own buttons, and a button
        inside a button is invalid. It renders through a portal (Task 7). */}
      {state.phase !== "idle" && sound && (
        <DiwaliShow
          state={state}
          dispatch={send}
          photoRect={photoRect}
          sound={sound}
        />
      )}
    </>
  );
}
