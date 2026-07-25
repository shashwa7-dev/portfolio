"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const max = duration.hero;
const steps = (["fast", "base", "med", "slow", "hero"] as const).map((k) => ({
  name: `duration.${k}`,
  s: duration[k],
  // bar length is proportional to duration, so the scale reads at rest
  pct: (duration[k] / max) * 100,
}));

/**
 * Each bar fills from empty over its own token duration, all starting together
 * on race. duration.fast reaches full while duration.hero is still filling, so
 * the speed difference is the visible lesson. The user drives it with the
 * button (remount replays the fill).
 */
export default function DurationDemo() {
  const reduce = useReducedMotion();
  const [runId, setRunId] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div key={runId} className="space-y-3.5">
        {steps.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[10px] text-subtle">{d.name}</span>
            <div className="flex h-1.5 flex-1 items-center">
              <div
                className="h-full overflow-hidden rounded-full bg-muted"
                style={{ width: `${d.pct}%` }}
              >
                <motion.div
                  className="h-full origin-left rounded-full bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={reduce ? { duration: 0 } : { duration: d.s, ease: ease.out }}
                />
              </div>
            </div>
            <span className="w-11 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle">
              {d.s * 1000}ms
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRunId((n) => n + 1)}
        className="self-center rounded-full border border-border-strong px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-[color,background-color,transform] duration-150 ease-[--ease-out] hover:bg-muted hover:text-foreground active:scale-[0.97]"
      >
        race again
      </button>
    </div>
  );
}
