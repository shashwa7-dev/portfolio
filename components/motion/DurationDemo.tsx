"use client";

import { motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const steps = (["fast", "base", "med", "slow", "hero"] as const).map((k) => ({
  name: `duration.${k}`,
  s: duration[k],
}));

export default function DurationDemo() {
  return (
    <div className="w-full space-y-2">
      {steps.map((d) => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="w-28 shrink-0 font-mono text-[10px] text-subtle">{d.name}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full origin-left rounded-full bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: d.s, ease: ease.out }}
            />
          </div>
          <span className="w-12 text-right font-mono text-[10px] text-subtle">{d.s * 1000}ms</span>
        </div>
      ))}
    </div>
  );
}
