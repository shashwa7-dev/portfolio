"use client";

import { motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const curves = [
  { name: "ease.out", value: ease.out },
  { name: "ease.modal", value: ease.modal },
  { name: "ease.expo", value: ease.expo },
] as const;

export default function EasingDemo() {
  return (
    <div className="w-full space-y-3">
      {curves.map((c) => (
        <div key={c.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-[10px] text-subtle">{c.name}</span>
          <div className="relative h-2 flex-1 rounded-full bg-muted">
            <motion.div
              className="absolute -top-1 h-4 w-4 rounded-full bg-accent"
              initial={{ left: "0%" }}
              animate={{ left: ["0%", "calc(100% - 16px)", "0%"] }}
              transition={{
                duration: duration.hero * 2,
                ease: c.value,
                repeat: Infinity,
                repeatDelay: duration.med,
                times: [0, 0.5, 1],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
