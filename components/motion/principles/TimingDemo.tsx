"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

const heroDoubled = duration.hero * 2; // 1000ms, deliberately sluggish for contrast

const panels = [
  { label: "150ms", transition: { duration: duration.fast, ease: ease.out } },
  { label: "1000ms", transition: { duration: heroDoubled, ease: ease.out } },
] as const;

/** Same dropdown panel, two speeds. 150ms reads as responsive, 1000ms reads as broken. */
export default function TimingDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-border-strong px-4 py-1.5 font-mono text-[10px] text-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
      >
        {open ? "Close both" : "Open both"}
      </button>
      <div className="grid w-full grid-cols-2 gap-4">
        {panels.map((panel) => (
          <div key={panel.label} className="space-y-1">
            <div className="rounded-md border border-border bg-elevated px-3 py-1.5 text-center text-xs text-muted-foreground">
              Menu
            </div>
            <motion.div
              className="overflow-hidden rounded-md border border-border bg-elevated"
              style={{ transformOrigin: "top" }}
              initial={false}
              animate={{ opacity: open ? 1 : 0, scaleY: open ? 1 : 0 }}
              transition={panel.transition}
            >
              <div className="h-12" />
            </motion.div>
            <p className="text-center font-mono text-[10px] text-subtle">{panel.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
