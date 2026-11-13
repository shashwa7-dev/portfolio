"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createBalls, frameGravity, poke, stepBalls, type Ball } from "@/lib/starter-pack/bubbles";
import { BUBBLE_BOX, starterPack } from "@/lib/starter-pack/config";
import {
  breeze,
  armAngle,
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
import { playClack, primeClack } from "./clackSound";

const BOX = BUBBLE_BOX;
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
 * writes transforms straight to the DOM (never React state). The card never
 * settles (a breeze keeps it dangling), so the loop runs whenever the card is
 * on screen and the tab is visible, and stops when it is off screen, in a
 * hidden tab, or under reduced motion. The physics steps allocate nothing.
 */
/** `bounds` is the world size: a drag can never pull the card outside it. */
export function useStarterPackSim(
  scale: number,
  anchor: Vec,
  bounds: { w: number; h: number },
  ready: boolean,
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
  // Read live, so a resize that changes the scale never restarts the simulation.
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
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
    if (!ready || !rootEl || !worldEl || !hangEl || !tiltEl || !host || !edgeEl || !fillEl || !stitchEl || !clipEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const ballEls = new Map<string, HTMLElement>();
    host.querySelectorAll<HTMLElement>("[data-ball]").forEach((el) => ballEls.set(el.dataset.ball ?? "", el));

    const start = anchorRef.current;
    // Starts above the page: the anchor drops in on first view and the card follows it down.
    let lanyard: LanyardState = createLanyard({ x: start.x, y: start.y - ENTRANCE.drop }, OPENING_SWING);
    let entered = false;
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

    // Last values written for each bubble.
    const drawn = new Map<string, { x: number; y: number; a: number; q: number }>();
    // The strap's SVG covers only a padded box around the strap, not the whole
    // world, so each frame repaints a strip instead of a screenful. The box is
    // refitted only when the strap (or the clip drawn around its
    // ends, which reach about 26px out) comes within MARGIN of its edge; a bigger PAD
    // refits less but repaints more area every frame, so keep it tight. It is
    // placed with a transform; only a change of size costs a layout.
    const svgEl = edgeEl.ownerSVGElement;
    const PAD = 80;
    const MARGIN = 30;
    let box = { x: 0, y: 0, w: 0, h: 0 };
    const fitRope = (c: Vec) => {
      if (!svgEl) return;
      let x0 = c.x, y0 = c.y, x1 = c.x, y1 = c.y;
      for (const q of lanyard.points) {
        if (q.x < x0) x0 = q.x;
        if (q.y < y0) y0 = q.y;
        if (q.x > x1) x1 = q.x;
        if (q.y > y1) y1 = q.y;
      }
      const inside =
        box.w > 0 && x0 >= box.x + MARGIN && y0 >= box.y + MARGIN && x1 <= box.x + box.w - MARGIN && y1 <= box.y + box.h - MARGIN;
      if (inside) return;
      const w = Math.ceil(x1 - x0 + PAD * 2);
      const h = Math.ceil(y1 - y0 + PAD * 2);
      if (w !== box.w || h !== box.h) {
        svgEl.style.width = `${w}px`;
        svgEl.style.height = `${h}px`;
      }
      box = { x: x0 - PAD, y: y0 - PAD, w, h };
      // translateZ(0) keeps the strap on its own layer above the card in WebKit.
      svgEl.style.transform = `translate(${box.x}px, ${box.y}px) translateZ(0)`;
      svgEl.setAttribute("viewBox", `${box.x} ${box.y} ${box.w} ${box.h}`);
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
      fitRope(c);
      clipEl.setAttribute("transform", `translate(${c.x} ${c.y}) rotate(${(angle * 180) / Math.PI})`);
      for (const b of state) {
        const el = ballEls.get(b.id);
        if (!el) continue;
        // Most frames the bubbles sit still while the card sways: skip writes
        // that would change nothing, so the browser has nothing to redo.
        let last = drawn.get(b.id);
        if (!last) {
          last = { x: NaN, y: NaN, a: NaN, q: 1 };
          drawn.set(b.id, last);
        }
        if (Math.abs(last.x - b.x) < 0.05 && Math.abs(last.y - b.y) < 0.05 && Math.abs(last.a - b.angle) < 0.002 && b.squash < 0.002 && last.q < 0.002) continue;
        const q = b.squash * 0.22;
        el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px) scale(${1 + q}, ${1 - q})`;
        (el.firstElementChild as HTMLElement | null)?.style.setProperty("transform", `rotate(${b.angle}rad)`);
        // Reuse the one record per bubble: no allocation in the frame.
        last.x = b.x;
        last.y = b.y;
        last.a = b.angle;
        last.q = b.squash;
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
        const hits = stepBalls(state, BOX, STEP, frameGravity(armAngle(lanyard), lanyard.acc));
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
      return toLocal({ x: e.clientX, y: e.clientY }, rect, scaleRef.current);
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-ticket]")) return;
      // Main button or a touch only: a right-click must not start a drag
      // whose release goes to the context menu.
      if (e.button !== 0) return;
      // Every press (and release) unlocks sound; nothing sounds before the first.
      primeClack();
      const ballEl = target.closest<HTMLElement>("[data-ball]");
      e.preventDefault();
      if (ballEl) {
        const b = state.find((x) => x.id === ballEl.dataset.ball);
        if (!b || reduce.matches) return;
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
      primeClack();
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
    // Capture can be taken away (a system gesture, a menu): always let go then.
    hangEl.addEventListener("lostpointercapture", onUp);
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
      hangEl.removeEventListener("lostpointercapture", onUp);
      rootEl.removeEventListener("pointermove", onTilt);
      rootEl.removeEventListener("pointerleave", onTiltEnd);
      rootEl.removeEventListener("selectstart", cancel);
      rootEl.removeEventListener("dragstart", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onReduce);
    };
  }, [ready]);

  return { root, world, hang, tilt, balls, edge, fill, stitch, clip };
}
