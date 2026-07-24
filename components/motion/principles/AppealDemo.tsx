"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Check } from "lucide-react";
import { duration, ease, tapPress, wordCycle } from "@/lib/motionVariants";

const toastVariants: Variants = {
  hidden: { y: 16, opacity: 0, filter: "blur(2px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: duration.med, ease: ease.out } },
  exit: { y: 16, opacity: 0, filter: "blur(2px)", transition: { duration: duration.fast, ease: ease.out } },
};

/** Save spawns one clean toast bottom-center that dismisses itself. Restraint is the point. */
export default function AppealDemo() {
  const [visible, setVisible] = useState(false);

  const save = () => {
    setVisible(true);
    // token-derived: reuse the hero word-cycle hold so the toast is readable before it leaves
    setTimeout(() => setVisible(false), wordCycle.holdMs);
  };

  return (
    <div className="relative flex h-24 w-full items-end justify-center">
      <motion.button
        type="button"
        onClick={save}
        whileTap={tapPress}
        className="rounded-full bg-accent px-4 py-1.5 font-mono text-[10px] text-accent-foreground"
      >
        Save
      </motion.button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <AnimatePresence>
          {visible && (
            <motion.div
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm"
            >
              <Check className="h-3.5 w-3.5 text-accent" />
              Saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
