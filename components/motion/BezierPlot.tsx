"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { duration } from "@/lib/motionVariants";

const S = 76; // plot size in px (also the SVG coordinate space)

// Cubic bezier component at parameter s, with P0 fixed at 0 and P3 at 1.
function comp(s: number, p1: number, p2: number) {
  const mt = 1 - s;
  return 3 * mt * mt * s * p1 + 3 * mt * s * s * p2 + s * s * s;
}

/**
 * Plots a cubic-bezier easing curve as an SVG and rides a dot along it. The dot
 * advances linearly in the curve parameter, so it visibly speeds up and slows
 * down exactly where the easing does. Reusable across easing demos.
 */
export default function BezierPlot({
  name,
  curve,
}: {
  name: string;
  curve: readonly [number, number, number, number];
}) {
  const [x1, y1, x2, y2] = curve;
  const reduce = useReducedMotion();
  const s = useMotionValue(reduce ? 1 : 0);
  const cx = useTransform(s, (v) => comp(v, x1, x2) * S);
  const cy = useTransform(s, (v) => (1 - comp(v, y1, y2)) * S);

  useEffect(() => {
    if (reduce) {
      s.set(1);
      return;
    }
    const controls = animate(s, 1, {
      duration: duration.hero * 2,
      ease: "linear",
      repeat: Infinity,
      repeatDelay: duration.med,
    });
    return () => controls.stop();
  }, [s, reduce]);

  // y is flipped so progress reads upward
  const path = `M 0 ${S} C ${x1 * S} ${S - y1 * S} ${x2 * S} ${S - y2 * S} ${S} 0`;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="overflow-visible">
        <line x1="0" y1="0" x2="0" y2={S} className="stroke-border" strokeWidth="1" />
        <line x1="0" y1={S} x2={S} y2={S} className="stroke-border" strokeWidth="1" />
        <path d={`M 0 ${S} L ${S} 0`} className="stroke-border/60" strokeWidth="1" strokeDasharray="3 3" />
        <path d={path} fill="none" className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
        <motion.circle cx={cx} cy={cy} r="4" className="fill-accent" />
      </svg>
      <span className="font-mono text-[10px] text-subtle">{name}</span>
    </div>
  );
}
