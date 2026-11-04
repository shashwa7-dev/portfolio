"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { BRAND_BOX_CLASS, BRAND_SIZE, dotsPath } from "@/components/common/brandBitmap";

/**
 * The hover layer of the background brand mark: every dot again, brighter and a
 * touch larger, seen only through a soft circular mask that trails the pointer
 * (`.brand-backdrop-fill`). So dots fill in as the pointer nears them and fade
 * back behind it.
 *
 * The backdrop sits behind the content and takes no pointer events, so the
 * pointer is read from the window: links and text above it keep working. Only
 * the mask's position changes per frame, written to CSS variables directly and
 * never through React state. The loop stops once the mask has caught up, and
 * nothing is measured while the mark is off screen.
 *
 * Not drawn without a mouse, so touch devices track nothing. Under reduced
 * motion the mask jumps to the pointer instead of trailing it.
 *
 * It also keeps the mark's load-in to once per page load (see below), which is
 * why that effect runs with or without a mouse.
 */
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
/** Share of the remaining distance the mask covers per 60Hz frame. */
const FOLLOW = 0.2;
const FRAME_MS = 1000 / 60;
/** Close enough, in px, to stop the loop. */
const SETTLED = 0.5;
/** The mask's radius (9rem in `.brand-backdrop-fill`): dots stay lit this far past the mark. */
const REACH_REM = 9;

const LIT_DOTS = dotsPath("#");
const UNLIT_DOTS = dotsPath(".");

/** Module scope, so it survives client navigation and resets on a full load. */
let hasDrawn = false;

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export default function BrandBackdropFill() {
  const hasMouse = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
  const ref = useRef<SVGSVGElement>(null);

  // The router remounts the homepage on every return to it, which would replay
  // the load-in. A layout effect, so the attribute lands before the first paint.
  // The flag is set on a timeout because Strict Mode runs this twice in a row,
  // and the second run must not mistake the first for an earlier visit.
  useLayoutEffect(() => {
    if (hasDrawn) document.querySelector(".brand-backdrop")?.setAttribute("data-drawn", "");
    const timer = setTimeout(() => {
      hasDrawn = true;
    });
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reach = REACH_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
    let raf = 0;
    let lastFrame = 0;
    let active = false;
    let onScreen = true;
    let hasPointer = false;
    let pointerX = 0;
    let pointerY = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    const write = () => {
      el.style.setProperty("--fill-x", `${x}px`);
      el.style.setProperty("--fill-y", `${y}px`);
    };
    const setActive = (next: boolean) => {
      if (next === active) return;
      active = next;
      el.toggleAttribute("data-active", next);
    };
    const tick = (now: number) => {
      // Scaled by elapsed time, so the trail feels the same at any refresh rate.
      // Clamped because a frame's timestamp is its start, which can come before
      // the performance.now() that started the loop.
      const step = 1 - Math.pow(1 - FOLLOW, Math.max(0, now - lastFrame) / FRAME_MS);
      lastFrame = now;
      x += (targetX - x) * step;
      y += (targetY - y) * step;
      write();
      const settled = Math.abs(targetX - x) < SETTLED && Math.abs(targetY - y) < SETTLED;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const update = () => {
      if (!onScreen || !hasPointer) {
        setActive(false);
        return;
      }
      const box = el.getBoundingClientRect();
      const inRange =
        pointerX >= box.left - reach &&
        pointerX <= box.right + reach &&
        pointerY >= box.top - reach &&
        pointerY <= box.bottom + reach;
      if (!inRange) {
        setActive(false);
        return;
      }
      targetX = pointerX - box.left;
      targetY = pointerY - box.top;
      // Entering starts at the pointer rather than sweeping in from its last spot.
      if (!active || reducedMotion.matches) {
        x = targetX;
        y = targetY;
        write();
      }
      setActive(true);
      if (!raf && !reducedMotion.matches) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      hasPointer = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      update();
    };
    const onLeave = () => {
      hasPointer = false;
      update();
    };
    // The mark moves under a still pointer on scroll and resize, so both count as moves.
    const onViewportChange = () => update();
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    observer.observe(el);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [hasMouse]);

  if (!hasMouse) return null;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${BRAND_SIZE} ${BRAND_SIZE}`}
      className={`brand-backdrop-fill ${BRAND_BOX_CLASS}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.74}
      strokeLinecap="round"
    >
      <path d={LIT_DOTS} />
      <path d={UNLIT_DOTS} opacity={0.45} />
    </svg>
  );
}
