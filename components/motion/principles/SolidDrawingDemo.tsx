"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motionVariants";

const MAX_DEG = 10;

/** Card tilts toward the pointer in 3D. Pointer is tracked on the flat outer wrapper, not the tilting card. */
export default function SolidDrawingDemo() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_DEG, MAX_DEG]), spring.soft);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_DEG, -MAX_DEG]), spring.soft);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (reduced) {
    return <div className="h-32 w-full rounded-xl bg-elevated" />;
  }

  return (
    <div
      ref={wrapRef}
      style={{ perspective: 1000 }}
      className="group w-full"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <motion.div style={{ rotateX, rotateY }} className="relative h-32 w-full overflow-hidden rounded-xl bg-elevated">
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.12), transparent 60%)" }}
        />
      </motion.div>
    </div>
  );
}
