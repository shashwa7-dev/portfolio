"use client";

import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

/** Two dots move left to right on mount: one on a straight line, one arcing up and back down. */
export default function ArcsDemo() {
  return (
    <div className="w-full space-y-5">
      <div className="space-y-1">
        <div className="relative h-4 rounded-full bg-muted">
          <motion.div
            className="absolute top-0 h-4 w-4 rounded-full bg-accent"
            initial={{ left: "0%" }}
            animate={{ left: "calc(100% - 16px)" }}
            transition={{ duration: duration.slow, ease: ease.out }}
          />
        </div>
        <p className="font-mono text-[10px] text-subtle">straight</p>
      </div>
      <div className="space-y-1">
        <div className="relative h-4 rounded-full bg-muted">
          <motion.div
            className="absolute top-0 h-4 w-4 rounded-full bg-accent"
            initial={{ left: "0%", y: 0 }}
            animate={{ left: "calc(100% - 16px)", y: [0, -24, 0] }}
            transition={{ duration: duration.slow, ease: ease.out }}
          />
        </div>
        <p className="font-mono text-[10px] text-subtle">arc</p>
      </div>
    </div>
  );
}
