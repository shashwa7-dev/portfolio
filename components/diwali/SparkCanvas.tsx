"use client";

import { useEffect, useRef, type RefObject } from "react";
import { chakriBox, type FlyerBox } from "@/lib/diwali/show";
import styles from "@/components/diwali/diwali.module.css";

/**
 * Spark physics, tuned per 60fps frame as in the flow prototype's `loop`.
 * These are physics constants, not UI durations.
 */
/** Seconds for the chakri to spin up to full power after lift-off. */
const SPIN_UP_S = 1.4;
/** Spin speed at full power, in radians per second (backwards, like the prototype). */
const SPIN_RAD_S = 26;
/** Sparks thrown per frame at full power, by the centre chakri on a 1280x800 screen. */
const JET_PER_FRAME = 70;
/** That reference chakri's side, in px: the jet's count scales from it. */
const JET_REF_SIZE = chakriBox("centre", 1280, 800).size;
/** The jet's count never drops below this share of the reference, nor exceeds it. */
const JET_MIN_SHARE = 0.35;
const MAX_DPR = 2;

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  hue: number;
};

type Props = {
  /** The flying chakri's box: the jet comes off its rim. */
  target: RefObject<HTMLElement | null>;
  /**
   * The chakri's box once it has landed (null while it is flying). At rest the
   * jet uses it as is; only in flight is `target` measured, once per frame and
   * before this frame's spin is written, so no layout is forced.
   */
  rest: RefObject<FlyerBox | null>;
  /** The element that spins (the jet's angle follows its rotation). */
  spin: RefObject<HTMLElement | null>;
  /** Whether the chakri is burning. When false, the last sparks die out and the loop stops. */
  emitting: boolean;
};

/**
 * A full-screen canvas for a ground chakri: one jet from a point on the rim,
 * sprayed backwards along the tangent and whipping round with the spin, plus
 * the ring of light a fast chakri leaves. It also turns `spin`, so the jet and
 * the drawing never drift apart. The spark count scales with the chakri's
 * size on screen against the 1280x800 centre chakri, so the corner chakri
 * and small phones draw fewer strokes; their speed scales with its size
 * against this screen's centre chakri, so they are also shorter in the corner.
 *
 * Only mounted when motion is allowed: under reduced motion the chakri sits
 * still and there is no jet.
 */
export default function SparkCanvas({ target, rest, spin, emitting }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const emittingRef = useRef(emitting);
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    emittingRef.current = emitting;
    if (emitting) wake.current();
  }, [emitting]);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    let dpr = 1;
    const size = () => {
      dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
    };
    size();
    window.addEventListener("resize", size);

    let sparks: Spark[] = [];
    let raf = 0;
    let rot = 0;
    let last = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? (now - last) / 1000 : 0;
      // Motion is tuned per 60fps frame, scaled so faster screens match.
      const f = Math.min(3, dt * 60);
      last = now;
      ctx.clearRect(0, 0, cv.width, cv.height);

      const el = target.current;
      if (emittingRef.current && el) {
        // Read first, write after: the box (measured only in flight), then the spin.
        let box = rest.current;
        if (!box) {
          const r = el.getBoundingClientRect();
          box = {
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
            size: r.width,
            rotate: 0,
          };
        }
        const age = (now - t0) / 1000;
        const power = age < SPIN_UP_S ? 0.3 + (age / SPIN_UP_S) * 0.7 : 1;
        rot -= dt * SPIN_RAD_S * power;
        if (spin.current) spin.current.style.transform = `rotate(${rot}rad)`;

        const cx = box.cx * dpr;
        const cy = box.cy * dpr;
        const R = (box.size / 2) * 0.99 * dpr;
        const centre = chakriBox("centre", window.innerWidth, window.innerHeight).size;
        const scale = centre > 0 ? box.size / centre : 1;

        // Like a real chakri: the jet fires from one point on the rim (the
        // fuse end), which whips round with the spin.
        const share = Math.min(1, Math.max(JET_MIN_SHARE, box.size / JET_REF_SIZE));
        const n = Math.round(JET_PER_FRAME * power * share * f);
        for (let i = 0; i < n; i++) {
          const a = rot + (Math.random() - 0.5) * 0.25;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          const v = (4 + Math.random() * 13) * dpr * Math.max(0.45, scale);
          // Sprayed backwards along the tangent, fanned outward.
          const tx = -Math.sin(a);
          const ty = Math.cos(a);
          const spread = (Math.random() - 0.3) * 0.9;
          const life = 22 + Math.random() * 30;
          sparks.push({
            x,
            y,
            vx: (tx + Math.cos(a) * spread) * v,
            vy: (ty + Math.sin(a) * spread) * v,
            life,
            max: life,
            hue: Math.random() < 0.25 ? 18 : 44,
          });
        }

        // The ring of light a fast chakri leaves behind.
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.6);
        g.addColorStop(0, `rgba(255,200,90,${0.35 * power})`);
        g.addColorStop(1, "rgba(255,140,40,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      const base = 2 * dpr;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.4 * base;
      const drag = Math.pow(0.975, f);
      for (const s of sparks) {
        const k = s.life / s.max;
        ctx.strokeStyle = `hsla(${s.hue},100%,${60 + 30 * k}%,${k})`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 2.5, s.y - s.vy * 2.5);
        ctx.stroke();
        s.x += s.vx * f;
        s.y += s.vy * f;
        s.vx *= drag;
        s.vy *= drag;
        s.vy += 0.035 * base * f;
        s.life -= f;
      }
      ctx.globalCompositeOperation = "source-over";
      sparks = sparks.filter((s) => s.life > 0);

      // Stop once the chakri is out and the last spark has died.
      if (emittingRef.current || sparks.length > 0) raf = requestAnimationFrame(frame);
      else {
        last = 0;
        ctx.clearRect(0, 0, cv.width, cv.height);
      }
    };

    wake.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    wake.current();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wake.current = () => {};
      window.removeEventListener("resize", size);
    };
  }, [target, rest, spin]);

  return <canvas ref={canvas} aria-hidden className={styles.showSparks} />;
}
