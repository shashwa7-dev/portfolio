"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

const cards = ["A", "B", "C"];

/** Clicking a card spotlights it by dimming and blurring the other two. Click again to clear. */
export default function StagingDemo() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex w-full items-center justify-center gap-3">
      {cards.map((c) => {
        const dimmed = active !== null && active !== c;
        return (
          <motion.button
            key={c}
            type="button"
            onClick={() => setActive(active === c ? null : c)}
            className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-elevated font-mono text-sm text-foreground"
            animate={{ opacity: dimmed ? 0.3 : 1, filter: dimmed ? "blur(2px)" : "blur(0px)" }}
            transition={{ duration: duration.base, ease: ease.out }}
          >
            {c}
          </motion.button>
        );
      })}
    </div>
  );
}
