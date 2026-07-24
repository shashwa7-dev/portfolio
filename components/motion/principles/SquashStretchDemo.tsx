"use client";

import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

/** A ball drops and squashes on impact. Mount-triggered, replayed by DemoCard's key remount. */
export default function SquashStretchDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="relative h-24 w-full">
        {/* ball starts at the top of the box and falls onto the floor line */}
        <motion.div
          className="absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 rounded-full bg-accent"
          style={{ transformOrigin: "bottom" }}
          initial={{ scaleY: 1, scaleX: 1, y: 0 }}
          animate={{
            scaleY: [1, 1, 0.6, 1.05, 1],
            scaleX: [1, 1, 1.4, 0.97, 1],
            y: [0, 64, 64, 64, 64],
          }}
          transition={{ duration: duration.hero, ease: ease.out, times: [0, 0.5, 0.65, 0.85, 1] }}
        />
        <div className="absolute bottom-0 left-1/2 h-px w-16 -translate-x-1/2 bg-border" />
      </div>
      <p className="font-mono text-[10px] text-subtle">squash on impact</p>
    </div>
  );
}
