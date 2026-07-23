"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const tabs = ["Images", "Videos", "Stores"];

export default function SlidingTabsDemo() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex rounded-full bg-muted p-1">
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => setActive(i)}
          className={`relative rounded-full px-4 py-1.5 font-mono text-xs transition-colors duration-150 ${i === active ? "text-foreground" : "text-muted-foreground"}`}
        >
          {i === active && (
            <motion.span
              layoutId="tab-pill"
              transition={{ duration: duration.base, ease: ease.out }}
              className="absolute inset-0 rounded-full bg-card shadow-sm"
            />
          )}
          <span className="relative">{t}</span>
        </button>
      ))}
    </div>
  );
}
