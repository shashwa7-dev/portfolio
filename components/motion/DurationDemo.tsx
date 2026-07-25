"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const steps = (["fast", "base", "med", "slow", "hero"] as const).map((k) => ({
  name: `duration.${k}`,
  s: duration[k],
}));

export default function DurationDemo() {
  const reduce = useReducedMotion();

  return (
    <div className="w-full max-w-sm space-y-3">
      {steps.map((d) => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-[10px] text-subtle">{d.name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full origin-left rounded-full bg-accent"
              initial={{ scaleX: reduce ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              // grow over the token's real duration, then ebb back and repeat, so
              // each bar's pulse speed reads as its duration (fast snaps, hero drifts)
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: d.s,
                      ease: ease.out,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: duration.base,
                    }
              }
            />
          </div>
          <span className="w-11 shrink-0 text-right font-mono text-[10px] text-subtle">
            {d.s * 1000}ms
          </span>
        </div>
      ))}
    </div>
  );
}
