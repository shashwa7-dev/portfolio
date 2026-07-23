"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const states = ["Saving...", "Saved", "Synced to cloud"];

export default function TextSwapDemo() {
  const [i, setI] = useState(0);

  return (
    <button
      type="button"
      onClick={() => setI((n) => (n + 1) % states.length)}
      className="rounded-full border border-border-strong px-5 py-2 font-mono text-sm text-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
    >
      <span className="relative inline-grid overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={states[i]}
            initial={{ y: 6, opacity: 0, filter: "blur(2px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -6, opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: duration.fast, ease: ease.out }}
            className="whitespace-nowrap"
          >
            {states[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
