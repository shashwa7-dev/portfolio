"use client";

import { motion } from "motion/react";
import { duration, ease, spring } from "@/lib/motionVariants";

/** Two dots travel the same track: one tweened pose-to-pose, one spring-driven straight ahead. */
export default function StraightAheadPoseDemo() {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <div className="relative h-6 rounded-full bg-muted">
          <motion.div
            className="absolute top-1 h-4 w-4 rounded-full bg-accent"
            initial={{ left: "0%" }}
            animate={{ left: "calc(100% - 16px)" }}
            transition={{ duration: duration.slow, ease: ease.out }}
          />
        </div>
        <p className="font-mono text-[10px] text-subtle">pose to pose</p>
      </div>
      <div className="space-y-1">
        <div className="relative h-6 rounded-full bg-muted">
          <motion.div
            className="absolute top-1 h-4 w-4 rounded-full bg-accent"
            initial={{ left: "0%" }}
            animate={{ left: "calc(100% - 16px)" }}
            transition={spring.pop}
          />
        </div>
        <p className="font-mono text-[10px] text-subtle">straight ahead</p>
      </div>
    </div>
  );
}
