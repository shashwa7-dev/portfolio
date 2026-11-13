"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ballsAtRest, createBalls, frameGravity, poke, stepBalls, type Ball } from "@/lib/starter-pack/bubbles";
import { starterPack } from "@/lib/starter-pack/config";
import {
  cardPose,
  createLanyard,
  lanyardAtRest,
  setAnchor,
  stepLanyard,
  toLocal,
  type LanyardState,
  type Vec,
} from "@/lib/starter-pack/lanyard";
import { advance, STEP } from "@/lib/starter-pack/loop";
import { playBloop } from "./bloopSound";

/** The bubbles' inner box, in card pixels: the 222 x 150 pod less its 7px inset. */
const BOX = { w: 208, h: 136 };
/** Card pixels from the card's top left to the clip's hole. */
const HOLE = { x: 235, y: 8 };
/** How far (card px) the card starts off-centre, so it arrives with a gentle swing, away from the screen edge. */
const OPENING_SWING = -50;
const TILT = { y: -14, x: 4, rangeY: 24, rangeX: 12 };

export type SimRefs = {
  root: RefObject<HTMLDivElement | null>;
  world: RefObject<HTMLDivElement | null>;
  hang: RefObject<HTMLDivElement | null>;
  tilt: RefObject<HTMLElement | null>;
  balls: RefObject<HTMLDivElement | null>;
  edge: RefObject<SVGPathElement | null>;
  fill: RefObject<SVGPathElement | null>;
  stitch: RefObject<SVGPathElement | null>;
  clip: RefObject<SVGGElement | null>;
};

/**
 * Runs the lanyard and the bubbles in one requestAnimationFrame loop and
 * writes transforms straight to the DOM (never React state). The loop only
 * runs while the card is on screen and the tab is visible, and sleeps once
 * everything is at rest; any press, drag or resize wakes it.
 */
export function useStarterPackSim(scale: number, anchor: Vec): SimRefs {
  const root = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const hang = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLElement>(null);
  const balls = useRef<HTMLDivElement>(null);
  const edge = useRef<SVGPathElement>(null);
  const fill = useRef<SVGPathElement>(null);
  const stitch = useRef<SVGPathElement>(null);
  const clip = useRef<SVGGElement>(null);
  const { x: ax, y: ay } = anchor;
  // The anchor moves on resize; the running simulation follows it without restarting.
  const anchorRef = useRef<Vec>({ x: ax, y: ay });
  const live = useRef<{ lanyard: LanyardState | null; wake: () => void }>({ lanyard: null, wake: () => {} });
  useEffect(() => {
    anchorRef.current = { x: ax, y: ay };
    if (live.current.lanyard) {
      setAnchor(live.current.lanyard, { x: ax, y: ay });
      live.current.wake();
    }
  }, [ax, ay]);

  useEffect(() => {
    const rootEl = root.current;
    const worldEl = world.current;
    const hangEl = hang.current;
    const tiltEl = tilt.current;
    const host = balls.current;
    const edgeEl = edge.current;
    const fillEl = fill.current;
    const stitchEl = stitch.current;
    const clipEl = clip.current;
    if (!rootEl || !worldEl || !hangEl || !tiltEl || !host || !edgeEl || !fillEl || !stitchEl || !clipEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const ballEls = new Map<string, HTMLElement>();
    host.querySelectorAll<HTMLElement>("[data-ball]").forEach((el) => ballEls.set(el.dataset.ball ?? "", el));

    const start = anchorRef.current;
    let lanyard: LanyardState = createLanyard(start, OPENING_SWING);
    let state: Ball[] = createBalls(starterPack.bubbles.map((b) => ({ id: b.id, r: b.r })), BOX);
    let drag: Vec | null = null;
    let grab: Vec = { x: 0, y: 0 };
    let rect: DOMRect | null = null;
    let onScreen = false;
    let raf = 0;
    let last = 0;
    let acc = 0;

    const settleNow = () => {
      // Reduced motion: hang straight and let the bubbles fall before anything is shown.
      lanyard = createLanyard(anchorRef.current, 0);
      live.current.lanyard = lanyard;
      state = createBalls(starterPack.bubbles.map((b) => ({ id: b.id, r: b.r })), BOX);
      for (let i = 0; i < 120 * 20; i++) stepBalls(state, BOX, STEP, frameGravity(0, { x: 0, y: 0 }));
    };

    const draw = () => {
      const { clip: c, angle } = cardPose(lanyard);
      hangEl.style.transform = `translate(${c.x - HOLE.x}px, ${c.y - HOLE.y}px) rotate(${angle}rad)`;
      hangEl.style.visibility = "visible";
      const p = lanyard.points;
      let d = `M${p[0].x} ${p[0].y}`;
      for (let i = 1; i < p.length - 1; i++) {
        d += ` Q${p[i].x} ${p[i].y} ${(p[i].x + p[i + 1].x) / 2} ${(p[i].y + p[i + 1].y) / 2}`;
      }
      d += ` L${c.x} ${c.y - 14}`;
      edgeEl.setAttribute("d", d);
      fillEl.setAttribute("d", d);
      stitchEl.setAttribute("d", d);
      clipEl.setAttribute("transform", `translate(${c.x} ${c.y}) rotate(${(angle * 180) / Math.PI})`);
      for (const b of state) {
        const el = ballEls.get(b.id);
        if (!el) continue;
        const q = b.squash * 0.22;
        el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px) scale(${1 + q}, ${1 - q})`;
        (el.firstElementChild as HTMLElement | null)?.style.setProperty("transform", `rotate(${b.angle}rad)`);
      }
    };

    const frame = (t: number) => {
      raf = 0;
      const { steps, acc: rest } = advance(acc, t - last);
      last = t;
      acc = rest;
      for (let i = 0; i < steps; i++) {
        stepLanyard(lanyard, STEP, drag);
        stepBalls(state, BOX, STEP, frameGravity(cardPose(lanyard).angle, lanyard.acc));
      }
      draw();
      const asleep = !drag && lanyardAtRest(lanyard) && ballsAtRest(state);
      if (!asleep) schedule();
    };

    const schedule = () => {
      if (raf || !onScreen || document.visibilityState !== "visible" || reduce.matches) return;
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    };

    const local = (e: PointerEvent): Vec => {
      rect = rect ?? worldEl.getBoundingClientRect();
      return toLocal({ x: e.clientX, y: e.clientY }, rect, scale);
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-ticket]")) return;
      const ballEl = target.closest<HTMLElement>("[data-ball]");
      e.preventDefault();
      if (ballEl) {
        const b = state.find((x) => x.id === ballEl.dataset.ball);
        if (!b) return;
        playBloop(b.r);
        if (reduce.matches) return;
        poke(b);
        schedule();
        return;
      }
      if (reduce.matches) return;
      rect = worldEl.getBoundingClientRect();
      const p = local(e);
      grab = { x: lanyard.arm.x - p.x, y: lanyard.arm.y - p.y };
      drag = { x: lanyard.arm.x, y: lanyard.arm.y };
      hangEl.setPointerCapture(e.pointerId);
      hangEl.dataset.dragging = "true";
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const p = local(e);
      drag = { x: p.x + grab.x, y: p.y + grab.y };
      schedule();
    };
    const onUp = () => {
      drag = null;
      rect = null;
      delete hangEl.dataset.dragging;
      schedule();
    };

    const onTilt = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !finePointer.matches || reduce.matches) return;
      const r = rootEl.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform = `rotateY(${TILT.y + x * TILT.rangeY}deg) rotateX(${TILT.x - y * TILT.rangeX}deg)`;
    };
    const onTiltEnd = () => {
      tiltEl.style.transform = "";
    };

    const cancel = (e: Event) => e.preventDefault();
    const onVisibility = () => schedule();
    const onReduce = () => {
      if (reduce.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
        drag = null;
        settleNow();
        draw();
      } else {
        schedule();
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      schedule();
    });

    if (reduce.matches) settleNow();
    live.current = { lanyard, wake: schedule };
    draw();
    io.observe(rootEl);
    hangEl.addEventListener("pointerdown", onDown);
    hangEl.addEventListener("pointermove", onMove);
    hangEl.addEventListener("pointerup", onUp);
    hangEl.addEventListener("pointercancel", onUp);
    rootEl.addEventListener("pointermove", onTilt);
    rootEl.addEventListener("pointerleave", onTiltEnd);
    rootEl.addEventListener("selectstart", cancel);
    rootEl.addEventListener("dragstart", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onReduce);

    return () => {
      live.current = { lanyard: null, wake: () => {} };
      cancelAnimationFrame(raf);
      io.disconnect();
      hangEl.removeEventListener("pointerdown", onDown);
      hangEl.removeEventListener("pointermove", onMove);
      hangEl.removeEventListener("pointerup", onUp);
      hangEl.removeEventListener("pointercancel", onUp);
      rootEl.removeEventListener("pointermove", onTilt);
      rootEl.removeEventListener("pointerleave", onTiltEnd);
      rootEl.removeEventListener("selectstart", cancel);
      rootEl.removeEventListener("dragstart", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onReduce);
    };
  }, [scale]);

  return { root, world, hang, tilt, balls, edge, fill, stitch, clip };
}
