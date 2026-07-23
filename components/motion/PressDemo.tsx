"use client";

import { motion } from "motion/react";
import { tapPress, spring } from "@/lib/motionVariants";

export default function PressDemo() {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-full bg-accent px-5 py-2 text-sm text-accent-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
      >
        CSS active
      </button>
      <motion.button whileTap={tapPress} transition={spring.hoverIn} className="rounded-full border border-border-strong px-5 py-2 text-sm text-foreground">
        whileTap
      </motion.button>
    </div>
  );
}
