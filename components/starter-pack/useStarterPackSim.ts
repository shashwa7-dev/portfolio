"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createBalls, frameGravity, poke, stepBalls, type Ball } from "@/lib/starter-pack/bubbles";
import { starterPack } from "@/lib/starter-pack/config";
import {
  breeze,
  cardPose,
  createLanyard,
  ENTRANCE,
  entranceY,
  setAnchor,
  stepLanyard,
  toLocal,
  type LanyardState,
  type Vec,
} from "@/lib/starter-pack/lanyard";
import { createFrameClock, STEP } from "@/lib/starter-pack/loop";
import { playBloop } from "./bloopSound";
import { playClack, primeClack } from "./clackSound";

/** The bubbles' inner box, in card pixels: the 222 x 150 pod less its 7px inset. */
const BOX = { w: 208, h: 136 };
/** Card pixels from the card's top left to the clip's hole. */
const HOLE = { x: 235, y: 8 };
/** How far (card px) the card starts off-centre. Zero: the drop and the breeze give it all the swing it needs. */
const OPENING_SWING = 0;
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
/**
 * `dropIn`: the card falls in from above the page on first view (desktop,
 * where the strap comes from the screen's top edge). Without it the card
 * starts hanging from its slit. `bounds` is the world size: a drag can never
 * pull the card outside it.
 */
export function useStarterPackSim(
  scale: number,
  anchor: Vec,
  dropIn: boolean,
  bounds: { w: number; h: number },
): SimRefs {
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
  const boundsRef = useRef(bounds);
  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);
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
    // Starts above the page: the anchor drops in on first view and the card follows it down.
    let lanyard: LanyardState = createLanyard(
      { x: start.x, y: dropIn ? start.y - ENTRANCE.drop : start.y },
      OPENING_SWING,
    );
    let entered = !dropIn;
    let entranceT = 0;
    let simT = 0;
    let state: Ball[] = createBalls(starterPack.bubbles.map((b) => ({ id: b.id, r: b.r })), BOX);
    let drag: Vec | null = null;
    let grab: Vec = { x: 0, y: 0 };
    let rect: DOMRect | null = null;
    let onScreen = false;
    let raf = 0;
    const clock = createFrameClock();

    const settleNow = () => {
      // Reduced motion: hang straight and let the bubbles fall before anything is shown.
      lanyard = createLanyard(anchorRef.current, 0);
      entered = true;
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
      const steps = clock.tick(t);
      let loudest = 0;
      for (let i = 0; i < steps; i++) {
        simT += STEP;
        if (!entered) {
          entranceT += STEP;
          setAnchor(lanyard, { x: anchorRef.current.x, y: entranceY(entranceT, anchorRef.current.y) });
          if (entranceT >= ENTRANCE.seconds) entered = true;
        }
        // Held cards stay where the hand puts them; otherwise the breeze keeps them dangling.
        stepLanyard(lanyard, STEP, drag, undefined, drag ? 0 : breeze(simT));
        const hits = stepBalls(state, BOX, STEP, frameGravity(cardPose(lanyard).angle, lanyard.acc));
        for (const v of hits) loudest = Math.max(loudest, v);
      }
      // One clack per frame at most: the hardest hit in it.
      if (loudest > 0) playClack(loudest);
      draw();
      // Never sleeps while seen: it dangles. Stops only off screen, in a hidden tab, or under reduced motion.
      if (onScreen && document.visibilityState === "visible" && !reduce.matches) {
        raf = requestAnimationFrame(frame);
      }
    };

    const schedule = () => {
      if (raf || !onScreen || document.visibilityState !== "visible" || reduce.matches) return;
      clock.wake(performance.now());
      raf = requestAnimationFrame(frame);
    };

    const local = (e: PointerEvent): Vec => {
      rect = rect ?? worldEl.getBoundingClientRect();
      return toLocal({ x: e.clientX, y: e.clientY }, rect, scale);
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-ticket]")) return;
      // The first touch unlocks sound and loads the clack; nothing sounds before it.
      primeClack();
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
      const b = boundsRef.current;
      drag = { x: Math.min(b.w, Math.max(0, p.x + grab.x)), y: Math.min(b.h, Math.max(0, p.y + grab.y)) };
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
    // Under reduced motion nothing steps, so a moved anchor must re-hang the card at once.
    const follow = () => {
      if (reduce.matches) {
        settleNow();
        draw();
      } else {
        schedule();
      }
    };
    live.current = { lanyard, wake: follow };
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
  }, [scale, dropIn]);

  return { root, world, hang, tilt, balls, edge, fill, stitch, clip };
}
