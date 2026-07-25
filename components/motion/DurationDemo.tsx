"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const steps = (["fast", "base", "med", "slow", "hero"] as const).map((k) => ({
  name: `duration.${k}`,
  s: duration[k],
}));

/**
 * A race: every dot travels the same track, each over its own token duration,
 * so the ordering (fast arrives first, hero last) is the visible lesson. The
 * user drives it with race / reset instead of watching a passive loop.
 */
export default function DurationDemo() {
  const reduce = useReducedMotion();
  const [racing, setRacing] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="space-y-3.5">
        {steps.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[10px] text-subtle">{d.name}</span>
            <div
              className={`relative flex h-2 flex-1 items-center ${
                racing ? "justify-end" : "justify-start"
              }`}
            >
              {/* race lane + finish line */}
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
              <span className="absolute right-0 top-1/2 h-2.5 w-px -translate-y-1/2 bg-border-strong" />
              <motion.div
                layout
                transition={reduce ? { duration: 0 } : { duration: d.s, ease: ease.out }}
                className="relative h-2 w-2 rounded-full bg-accent"
              />
            </div>
            <span className="w-11 shrink-0 text-right font-mono text-[10px] text-subtle">
              {d.s * 1000}ms
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRacing((r) => !r)}
        className="self-center rounded-full border border-border-strong px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-[color,background-color,transform] duration-150 ease-[--ease-out] hover:bg-muted hover:text-foreground active:scale-[0.97]"
      >
        {racing ? "reset" : "race"}
      </button>
    </div>
  );
}
