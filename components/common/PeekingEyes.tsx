"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The 404 tear: a ripped hole in the page with a stack of $100 bills looking
 * out, and the eyes follow the pointer.
 *
 * The eyes are part of a photograph, so they are separated out of it. The base
 * image has both irises painted over (lid shadow above, the eye's own cream
 * below), and each iris is its own sprite, positioned over its eye inside an
 * elliptical clip the shape of the eye opening. Moving a sprite reveals the
 * painted white of the eye on the other side, and the clip lets the lids cover
 * the iris when it looks up or down.
 *
 * Geometry is in the trimmed source's pixels (1632x592), so it scales with the
 * rendered width. Pointer work is one requestAnimationFrame pass per frame,
 * the follow is a short ease toward the target, and frames stop being
 * scheduled once the eyes settle. No React state: transforms are written to
 * the two sprites directly. Under reduced motion the eyes stay centred.
 */
const SRC_W = 1632;
const SRC_H = 592;

/** Iris centres and radii, in source pixels. */
const EYES = [
  { id: "l", x: 727, y: 313, r: 28 },
  { id: "r", x: 1006, y: 318, r: 27 },
] as const;

/** How far an iris travels, in source pixels, at full deflection. */
const MAX_DX = 18;
const MAX_DY = 7;
/** Pointer distance (CSS px) from an eye at which it is fully deflected. */
const REACH = 420;
/** Share of the remaining distance covered each frame. */
const FOLLOW = 0.18;

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export default function PeekingEyes({ className }: { className?: string }) {
  const reduce = useReducedMotion() ?? false;
  const boxRef = useRef<HTMLDivElement>(null);
  const irisRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    if (reduce) return;
    const box = boxRef.current;
    if (!box) return;

    let pointer: { x: number; y: number } | null = null;
    const current = EYES.map(() => ({ x: 0, y: 0 }));
    let frame = 0;

    const step = () => {
      frame = 0;
      const rect = box.getBoundingClientRect();
      const scale = rect.width / SRC_W;
      let moving = false;
      EYES.forEach((eye, i) => {
        let tx = 0;
        let ty = 0;
        if (pointer) {
          const cx = rect.left + eye.x * scale;
          const cy = rect.top + eye.y * scale;
          const dx = pointer.x - cx;
          const dy = pointer.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = Math.min(1, dist / REACH);
          tx = (dx / dist) * reach * MAX_DX;
          ty = (dy / dist) * reach * MAX_DY;
        }
        const c = current[i];
        c.x += (tx - c.x) * FOLLOW;
        c.y += (ty - c.y) * FOLLOW;
        if (Math.abs(tx - c.x) > 0.05 || Math.abs(ty - c.y) > 0.05) moving = true;
        const el = irisRefs.current[i];
        if (el) el.style.transform = `translate3d(${c.x * scale}px, ${c.y * scale}px, 0)`;
      });
      if (moving) frame = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      kick();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      pointer = null;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("scroll", kick);
      cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <div ref={boxRef} aria-hidden className={cn("pointer-events-none relative select-none", className)}>
      <Image
        src="/images/404-tear.webp"
        alt=""
        width={1280}
        height={464}
        sizes="(min-width: 768px) 720px, 100vw"
        priority
        draggable={false}
        className="block h-auto w-full"
      />
      {EYES.map((eye, i) => {
        // The clip is the eye opening, an ellipse wider than it is tall.
        const cw = eye.r * 3.8;
        const ch = eye.r * 2.1;
        const sprite = (eye.r + 2) * 2;
        return (
          <span
            key={eye.id}
            className="absolute overflow-hidden rounded-[50%]"
            style={{
              left: pct(eye.x - cw / 2, SRC_W),
              top: pct(eye.y - ch / 2, SRC_H),
              width: pct(cw, SRC_W),
              height: pct(ch, SRC_H),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                irisRefs.current[i] = el;
              }}
              src={`/images/404-iris-${eye.id}.webp`}
              alt=""
              draggable={false}
              className="absolute max-w-none will-change-transform"
              style={{
                left: pct(cw / 2 - sprite / 2, cw),
                top: pct(ch / 2 - sprite / 2, ch),
                width: pct(sprite, cw),
                height: pct(sprite, ch),
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
