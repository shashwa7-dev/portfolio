"use client";

import { motion } from "motion/react";
import { duration, ease, spring, stagger } from "@/lib/motionVariants";

/** A card slides in on mount; a badge inside overshoots and settles after the parent stops. */
export default function FollowThroughDemo() {
  return (
    <motion.div
      className="flex w-56 items-center justify-between rounded-lg border border-border bg-elevated px-4 py-3"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: duration.med, ease: ease.out }}
    >
      <span className="text-sm text-foreground">New message</span>
      <motion.span
        className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] text-accent-foreground"
        initial={{ x: -12, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ...spring.pop, delay: stagger.loose }}
      >
        NEW
      </motion.span>
    </motion.div>
  );
}
