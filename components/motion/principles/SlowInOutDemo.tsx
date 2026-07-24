"use client";

import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

const rows = [
  { name: "linear", value: "linear" },
  { name: "ease.out", value: ease.out },
  { name: "ease.expo", value: ease.expo },
] as const;

/** Same dot, three tracks, three easings, same duration. Slow in / slow out compared side by side. */
export default function SlowInOutDemo() {
  return (
    <div className="w-full space-y-3">
      {rows.map((r) => (
        <div key={r.name} className="space-y-1">
          <div className="relative h-6 rounded-full bg-muted">
            <motion.div
              className="absolute top-1 h-4 w-4 rounded-full bg-accent"
              initial={{ left: "0%" }}
              animate={{ left: "calc(100% - 16px)" }}
              transition={{ duration: duration.hero, ease: r.value }}
            />
          </div>
          <p className="font-mono text-[10px] text-subtle">{r.name}</p>
        </div>
      ))}
    </div>
  );
}
