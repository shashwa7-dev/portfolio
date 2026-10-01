"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import {
  FACE,
  blinkPlan,
  lookAt,
  lookFor,
  pickMood,
  type ChatPhase,
  type Mood,
  type Point,
} from "@/lib/truffyFace";

/**
 * Truffy's face, drawn as an SVG so each eye and the smile can move on their
 * own. It is only the features: the white head is whatever it sits in (the
 * launcher button, the chat header's avatar), so the face stays ink on white
 * in every theme and the container owns the ring, outline and shadow.
 *
 * Behaviour lives in `lib/truffyFace.ts`. This file listens (pointer, scroll,
 * keys, tab visibility), keeps the latest readings in refs so a pointermove
 * never re-renders, and re-picks the mood on a short tick. The gaze runs on
 * springs, so the eyes chase the cursor with a little overshoot.
 *
 * Reduced motion: the gaze stays centred and nothing loops; expressions still
 * change, instantly, because they are state rather than movement.
 */

const INK = "#1a1a1a";
const TICK_MS = 150;
/** After a tap on a touch screen, how long it keeps looking at that spot. */
const TAP_HOLD_MS = 1_500;
/** How long a scroll glance holds on a device with no cursor. */
const GLANCE_MS = 600;
const BLINK_MS = 110;
const GAZE_SPRING = { stiffness: 170, damping: 14, mass: 0.6 };

/* Geometry, traced from the drawing: a small far eye low on the left, a big
   near eye high on the right, a hooked smile between them. ViewBox 0 0 100 100
   with the features centred a touch low, leaving room to look up. */
const LEFT = { cx: 28.3, cy: 62.8, rx: 7.8, ry: 10 };
const RIGHT = { cx: 68.5, cy: 43.5, rx: 11.1, ry: 12.4 };
const SMILE = "M42.2 56.3 Q45 62.6 48.6 61.3 Q51.7 60.1 50.8 52.7";

type Eye = typeof LEFT;

/** The ^ of a happy squint, sitting where the eye was. */
const squint = (e: Eye) =>
  `M${e.cx - e.rx} ${e.cy + 2} Q${e.cx} ${e.cy - e.ry * 1.15} ${e.cx + e.rx} ${e.cy + 2}`;

const centred = { transformBox: "fill-box", transformOrigin: "center" } as const;

export default function TruffyFace({
  chat = "closed",
  className,
}: {
  chat?: ChatPhase;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [mood, setMood] = useState<Mood>("idle");
  const [blinking, setBlinking] = useState(false);

  // Read by the tick and the listeners, which are set up once.
  const chatRef = useRef(chat);
  const reduceRef = useRef(reduce);
  useEffect(() => {
    chatRef.current = chat;
    reduceRef.current = reduce;
  }, [chat, reduce]);

  const lookX = useSpring(0, GAZE_SPRING);
  const lookY = useSpring(0, GAZE_SPRING);

  // Depth: the head turns a little, the eyes shift, the smile shifts most.
  const headRotate = useTransform(lookX, (v) => v * 6);
  const eyesX = useTransform(lookX, (v) => v * 7);
  const eyesY = useTransform(lookY, (v) => v * 6);
  const farEyeX = useTransform(lookX, (v) => v * 1.5);
  const smileX = useTransform(lookX, (v) => v * 3);
  const smileY = useTransform(lookY, (v) => v * 2);

  useEffect(() => {
    let pointer: Point | null = null;
    let last: { x: number; y: number; t: number } | null = null;
    let lastActivity = performance.now();
    let lastFast = -Infinity;
    let backAt = -Infinity;
    let hidden = document.hidden;
    let currentMood: Mood = "idle";
    let glanceY: number | null = null;
    let lastScrollY = window.scrollY;
    let tapTimer: ReturnType<typeof setTimeout> | undefined;
    let glanceTimer: ReturnType<typeof setTimeout> | undefined;

    // The face sits in fixed-position UI (the launcher, the chat header), so
    // its centre only moves when the viewport or the element resizes. Reading
    // the rect once per resize, not once per pointer event, keeps the pointer
    // path free of layout reads that could force a reflow.
    let rect: Point | null = null;
    const measure = () => {
      const r = svgRef.current?.getBoundingClientRect();
      rect = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
    };
    const centre = (): Point | null => rect;
    measure();
    const resizeObserver = new ResizeObserver(measure);
    if (svgRef.current) resizeObserver.observe(svgRef.current);

    const aim = () => {
      if (reduceRef.current) {
        lookX.set(0);
        lookY.set(0);
        return;
      }
      const fixed = lookFor(currentMood);
      const c = centre();
      const gaze =
        fixed ??
        (pointer && c
          ? lookAt(pointer, c)
          : { x: 0, y: glanceY ?? 0 });
      lookX.set(gaze.x);
      lookY.set(gaze.y);
    };

    const tick = () => {
      const now = performance.now();
      // Re-measured here as well: a transform (the chat window scaling in)
      // moves the face without resizing it, which ResizeObserver cannot see.
      // At this clock's rate it stays well off the pointer path.
      measure();
      const c = centre();
      currentMood = pickMood({
        hidden,
        chat: chatRef.current,
        idleMs: now - lastActivity,
        distance: pointer && c ? Math.hypot(pointer.x - c.x, pointer.y - c.y) : Infinity,
        sinceFastMs: now - lastFast,
        sinceBackMs: now - backAt,
      });
      setMood(currentMood);
      aim();
    };

    // Pointer work is coalesced to one pass per frame: the handler only
    // records the latest position, and the frame callback does the maths. A
    // 1000Hz mouse costs the same as a 60Hz one.
    let moveFrame = 0;
    let pending: { x: number; y: number } | null = null;
    const applyMove = () => {
      moveFrame = 0;
      if (!pending) return;
      const now = performance.now();
      if (last) {
        const dt = now - last.t;
        const speed = dt > 0 ? Math.hypot(pending.x - last.x, pending.y - last.y) / dt : 0;
        if (dt < 100 && speed > FACE.fastPxPerMs) lastFast = now;
      }
      last = { x: pending.x, y: pending.y, t: now };
      pointer = pending;
      pending = null;
      lastActivity = now;
      aim();
    };
    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!moveFrame) moveFrame = requestAnimationFrame(applyMove);
    };

    const onDown = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      lastActivity = performance.now();
      aim();
      if (e.pointerType === "touch") {
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
          pointer = null;
          last = null;
          aim();
        }, TAP_HOLD_MS);
      }
    };

    const onScroll = () => {
      lastActivity = performance.now();
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      // With a cursor on screen the eyes stay on it; a phone has none, so it
      // glances the way the page is moving instead.
      if (pointer || dy === 0) return;
      glanceY = Math.sign(dy) * 0.6;
      aim();
      clearTimeout(glanceTimer);
      glanceTimer = setTimeout(() => {
        glanceY = null;
        aim();
      }, GLANCE_MS);
    };

    const onKey = () => {
      lastActivity = performance.now();
    };

    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      pointer = null;
      last = null;
      aim();
    };

    // The mood clock only runs while the tab is visible. One last tick on the
    // way out lets the face look down; the clock restarts on return.
    let interval: ReturnType<typeof setInterval> | undefined;
    const startClock = () => {
      if (!interval) interval = setInterval(tick, TICK_MS);
    };
    const stopClock = () => {
      clearInterval(interval);
      interval = undefined;
    };
    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden) {
        backAt = performance.now();
        lastActivity = backAt;
        measure();
        startClock();
      } else {
        stopClock();
      }
      tick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", measure, { passive: true });
    if (!hidden) startClock();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
      cancelAnimationFrame(moveFrame);
      stopClock();
      clearTimeout(tapTimer);
      clearTimeout(glanceTimer);
    };
  }, [lookX, lookY]);

  // Blinks, on their own random clock. A double is two in quick succession.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const plan = blinkPlan(Math.random(), Math.random());
      timer = setTimeout(() => {
        setBlinking(true);
        timer = setTimeout(() => {
          setBlinking(false);
          if (plan.double) {
            timer = setTimeout(() => {
              setBlinking(true);
              timer = setTimeout(() => {
                setBlinking(false);
                schedule();
              }, BLINK_MS);
            }, BLINK_MS * 1.4);
          } else {
            schedule();
          }
        }, BLINK_MS);
      }, plan.waitMs);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const squinting = mood === "happy";
  const eye = squinting
    ? { scaleY: 0.2, scale: 1, opacity: 0 }
    : mood === "sleepy"
      ? { scaleY: 0.14, scale: 1, opacity: 1 }
      : blinking
        ? { scaleY: 0.1, scale: 1, opacity: 1 }
        : mood === "startled"
          ? { scaleY: 1, scale: 1.18, opacity: 1 }
          : mood === "away"
            ? { scaleY: 0.72, scale: 1, opacity: 1 }
            : { scaleY: 1, scale: 1, opacity: 1 };

  const eyeTransition = reduce
    ? { duration: 0 }
    : blinking
      ? { duration: 0.07 }
      : { type: "spring" as const, stiffness: 320, damping: 18 };

  const talking = mood === "talking" && !reduce;
  const smile =
    mood === "startled"
      ? { opacity: 0, scale: 0.6, scaleY: 1 }
      : talking
        ? { opacity: 1, scale: 1, scaleY: [1, 0.45, 1.15, 0.6, 1] }
        : mood === "happy"
          ? { opacity: 1, scale: 1.15, scaleY: 1 }
          : mood === "away"
            ? { opacity: 1, scale: 1, scaleY: 0.45 }
            : mood === "sleepy" || mood === "thinking"
              ? { opacity: 1, scale: 0.85, scaleY: 1 }
              : { opacity: 1, scale: 1, scaleY: 1 };

  const smileTransition = reduce
    ? { duration: 0 }
    : talking
      ? { scaleY: { duration: 0.55, repeat: Infinity, ease: "easeInOut" as const } }
      : { type: "spring" as const, stiffness: 300, damping: 20 };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      aria-hidden
      data-mood={mood}
      className={cn("h-full w-full select-none", className)}
    >
      <motion.g style={{ ...centred, rotate: headRotate }}>
        <motion.g style={{ x: eyesX, y: eyesY }}>
          <motion.g style={{ x: farEyeX }}>
            <motion.ellipse
              {...LEFT}
              fill={INK}
              style={centred}
              animate={eye}
              transition={eyeTransition}
            />
            <motion.path
              d={squint(LEFT)}
              fill="none"
              stroke={INK}
              strokeWidth={3.6}
              strokeLinecap="round"
              animate={{ opacity: squinting ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.12 }}
            />
          </motion.g>
          <motion.ellipse
            {...RIGHT}
            fill={INK}
            style={centred}
            animate={eye}
            transition={eyeTransition}
          />
          <motion.path
            d={squint(RIGHT)}
            fill="none"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
            animate={{ opacity: squinting ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.12 }}
          />
        </motion.g>

        <motion.g style={{ x: smileX, y: smileY }}>
          <motion.path
            d={SMILE}
            fill="none"
            stroke={INK}
            strokeWidth={3.4}
            strokeLinecap="round"
            style={centred}
            animate={smile}
            transition={smileTransition}
          />
          {/* The startled "o", in the smile's place. */}
          <motion.ellipse
            cx={47.5}
            cy={58}
            rx={2.6}
            ry={3.2}
            fill="none"
            stroke={INK}
            strokeWidth={2.6}
            style={centred}
            animate={{ opacity: mood === "startled" ? 1 : 0, scale: mood === "startled" ? 1 : 0.4 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 16 }}
          />
        </motion.g>
      </motion.g>

      {mood === "sleepy" && (
        <motion.text
          x={76}
          y={28}
          fontSize={18}
          fontWeight={800}
          fill={INK}
          initial={{ opacity: 0, y: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0], y: [0, -10] }}
          transition={reduce ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        >
          z
        </motion.text>
      )}
    </svg>
  );
}
