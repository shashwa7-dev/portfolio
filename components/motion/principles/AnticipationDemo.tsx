"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

type Phase = "idle" | "exiting" | "deleted";

/** Delete a list row: it nudges left (anticipation) before exiting right. Restore resets state. */
export default function AnticipationDemo() {
  const [phase, setPhase] = useState<Phase>("idle");

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="h-11 w-full overflow-hidden rounded-lg border border-border bg-elevated">
        {phase !== "deleted" && (
          <motion.div
            className="flex h-11 items-center justify-between px-3"
            initial={false}
            animate={phase === "exiting" ? { x: [0, -8, 80], opacity: [1, 1, 0] } : { x: 0, opacity: 1 }}
            transition={
              phase === "exiting"
                ? { duration: duration.med + duration.fast, ease: ease.out, times: [0, 0.3, 1] }
                : { duration: duration.fast, ease: ease.out }
            }
            onAnimationComplete={() => {
              if (phase === "exiting") setPhase("deleted");
            }}
          >
            <span className="text-sm text-foreground">List row</span>
            <button
              type="button"
              onClick={() => setPhase("exiting")}
              className="rounded-full border border-border-strong px-3 py-1 font-mono text-[10px] text-muted-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
            >
              Delete
            </button>
          </motion.div>
        )}
      </div>
      {phase === "deleted" && (
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] text-accent-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
        >
          Restore
        </button>
      )}
    </div>
  );
}
