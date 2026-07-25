"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/motionVariants";

const springs = [
  { name: "spring.soft", t: spring.soft },
  { name: "spring.pop", t: spring.pop },
  { name: "spring.hoverIn", t: spring.hoverIn },
] as const;

export default function SpringDemo() {
  const [right, setRight] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRight((r) => !r)}
      className="w-full max-w-sm space-y-3"
      aria-label="Toggle springs"
    >
      {springs.map((s) => (
        <div key={s.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-left font-mono text-[10px] text-subtle">{s.name}</span>
          <div className={`flex h-8 flex-1 rounded-full bg-muted p-1 ${right ? "justify-end" : "justify-start"}`}>
            <motion.div layout transition={s.t} className="h-6 w-6 rounded-full bg-accent" />
          </div>
        </div>
      ))}
      <span className="block pt-1 text-center font-mono text-[10px] text-subtle">tap to move</span>
    </button>
  );
}
