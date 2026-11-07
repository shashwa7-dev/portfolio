"use client";

import { useEffect, useRef, useState } from "react";
import { burstTier, emberCount, TIER_SIZE } from "@/lib/diwali/fireworks";
import type { DiwaliSound } from "@/components/diwali/sound";
import styles from "@/components/diwali/diwali.module.css";

/**
 * Firework physics, tuned per 60fps frame as in the flow prototype's
 * `fwLoop`. These are physics constants, not UI durations.
 */
const MAX_DPR = 2;
/** Gold, marigold, pink, purple, teal, white, as [hue, saturation]. */
const PALETTE: ReadonlyArray<readonly [number, number]> = [
  [45, 100],
  [18, 100],
  [330, 90],
  [275, 85],
  [190, 90],
  [0, 0],
];
/** Each frame, trails fade by this much instead of being cleared. */
const TRAIL_FADE = 0.18;
/** Milliseconds between launches: at least this, plus up to `LAUNCH_JITTER_MS`. */
const LAUNCH_GAP_MS = 350;
const LAUNCH_JITTER_MS = 700;
const DOUBLE_LAUNCH_CHANCE = 0.35;
const WHISTLE_CHANCE = 0.45;

type Rocket = {
  x: number;
  y: number;
  ty: number;
  vx: number;
  vy: number;
  col: readonly [number, number];
};

type Ember = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  col: readonly [number, number];
  tw: boolean;
  w: number;
};

type Props = {
  /** While true, rockets keep launching. When false, the sky empties and the loop stops. */
  running: boolean;
  sound: DiwaliSound;
};

const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
/** The sound's pan for a point across the screen, as in the prototype. */
const panAt = (x: number, w: number) => (w > 0 ? (x / w) * 1.6 - 0.8 : 0);

/**
 * The finale's fireworks: rockets rise and burst at random sizes (huge,
 * medium, small and distant), as rings, peonies or two-tone bursts, leaving
 * trails that fade rather than clear. About half the rockets whistle; every
 * burst booms. Ported from the flow prototype's `fwLoop`, `launch`, `burst`.
 *
 * Renders nothing under reduced motion.
 */
export default function FireworksCanvas({ running, sound }: Props) {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const canvas = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(running);
  const soundRef = useRef(sound);
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    runningRef.current = running;
    if (running) wake.current();
  }, [running]);

  useEffect(() => {
    if (reduced) return;
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

    let rockets: Rocket[] = [];
    let embers: Ember[] = [];
    let next = 0;
    let raf = 0;
    let last = 0;

    const launch = () => {
      const W = cv.width;
      const H = cv.height;
      const x = W * (0.12 + Math.random() * 0.76);
      const ty = H * (0.12 + Math.random() * 0.35);
      rockets.push({
        x,
        y: H + 10 * dpr,
        ty,
        vx: (Math.random() - 0.5) * 1.2 * dpr,
        vy: -(H - ty) / 48,
        col: pick(),
      });
      if (Math.random() < WHISTLE_CHANCE) soundRef.current.whistle(panAt(x, W));
    };

    const burst = (r: Rocket) => {
      // Size tier: some fill the screen, some are distant pops.
      const s = TIER_SIZE[burstTier(Math.random())];
      const H = cv.height;
      const kind = Math.random();
      const n = emberCount(s, Math.random());
      // Embers travel about 30 times their start speed.
      const sp = (H * 0.42 * s * (0.85 + Math.random() * 0.3)) / 30;
      const life = 55 + 70 * s;
      soundRef.current.boom(s, panAt(r.x, cv.width), kind < 0.25 || Math.random() < 0.4);
      const c2 = pick();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.05;
        // Ring (all at one speed) or peony (a filled ball).
        const v = kind < 0.25 ? sp : sp * (0.35 + Math.random() * 0.65);
        // Some bursts are two-tone.
        const col = kind > 0.75 && i % 2 ? c2 : r.col;
        embers.push({
          x: r.x,
          y: r.y,
          px: r.x,
          py: r.y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: life * (0.75 + Math.random() * 0.4),
          max: life * 1.15,
          col,
          tw: Math.random() < 0.4,
          w: 0.9 + s * 1.6,
        });
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? (now - last) / 1000 : 1 / 60;
      // Motion is tuned per 60fps frame, scaled so faster screens match.
      const f = Math.min(3, dt * 60);
      last = now;
      const W = cv.width;
      const H = cv.height;

      // Fading trails instead of clearing.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${1 - Math.pow(1 - TRAIL_FADE, f)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      if (runningRef.current && now > next) {
        launch();
        if (Math.random() < DOUBLE_LAUNCH_CHANCE) launch();
        next = now + LAUNCH_GAP_MS + Math.random() * LAUNCH_JITTER_MS;
      }

      const climb = Math.pow(0.985, f);
      rockets = rockets.filter((r) => {
        r.x += r.vx * f;
        r.y += r.vy * f;
        r.vy *= climb;
        ctx.fillStyle = "hsla(40,100%,75%,1)";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
        // The rocket's own short spark trail.
        embers.push({
          x: r.x,
          y: r.y,
          px: r.x,
          py: r.y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.6 * dpr,
          life: 14,
          max: 14,
          col: [35, 100],
          tw: false,
          w: 1.2,
        });
        if (r.y <= r.ty || r.vy > -1) {
          burst(r);
          return false;
        }
        return true;
      });

      const dragX = Math.pow(0.965, f);
      const dragY = Math.pow(0.967, f);
      embers = embers.filter((p) => {
        p.px = p.x;
        p.py = p.y;
        p.x += p.vx * f;
        p.y += p.vy * f;
        p.vx *= dragX;
        p.vy = p.vy * dragY + 0.04 * dpr * f;
        p.life -= f;
        const k = Math.max(0, p.life / p.max);
        const flick = p.tw && Math.random() < 0.3 ? 0.2 : 1;
        const light = p.col[1] ? 60 + 25 * k : 90;
        ctx.strokeStyle = `hsla(${p.col[0]},${p.col[1]}%,${light}%,${k * flick})`;
        ctx.lineWidth = p.w * dpr;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        return p.life > 0;
      });
      ctx.globalCompositeOperation = "source-over";

      // Stop once launching has ended and the last ember has died.
      if (runningRef.current || rockets.length > 0 || embers.length > 0) {
        raf = requestAnimationFrame(frame);
      } else {
        last = 0;
        ctx.clearRect(0, 0, W, H);
      }
    };

    wake.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    if (runningRef.current) wake.current();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wake.current = () => {};
      window.removeEventListener("resize", size);
    };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={canvas} aria-hidden className={styles.fireworks} />;
}
