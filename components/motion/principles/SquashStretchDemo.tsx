"use client";

import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

/** A ball drops and squashes on impact. Mount-triggered, replayed by DemoCard's key remount. */
export default function SquashStretchDemo() {
  return (
    <div className="flex h-24 w-full flex-col items-center justify-end gap-2">
      <motion.div
        className="h-8 w-8 rounded-full bg-accent"
        style={{ transformOrigin: "bottom" }}
        initial={{ scaleY: 1, scaleX: 1, y: 0 }}
        animate={{
          scaleY: [1, 1, 0.6, 1.05, 1],
          scaleX: [1, 1, 1.4, 0.97, 1],
          y: [0, 64, 64, 64, 64],
        }}
        transition={{ duration: duration.hero, ease: ease.out, times: [0, 0.5, 0.65, 0.85, 1] }}
      />
      <div className="h-px w-16 bg-border" />
      <p className="font-mono text-[10px] text-subtle">squash on impact</p>
    </div>
  );
}
