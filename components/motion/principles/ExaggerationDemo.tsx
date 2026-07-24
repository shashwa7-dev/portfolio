"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";

/** Fake PIN field. A wrong submit shakes with overshoot, flips to an error border, then reverts. */
export default function ExaggerationDemo() {
  const [error, setError] = useState(false);
  const [shakeId, setShakeId] = useState(0);

  const submit = () => {
    setError(true);
    setShakeId((n) => n + 1);
    // token-derived: one "hero" beat is long enough to read the error before it clears
    setTimeout(() => setError(false), duration.hero * 1000);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <motion.div
        key={shakeId}
        animate={shakeId > 0 ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: duration.slow, ease: ease.out }}
        className={`flex items-center gap-2 rounded-lg border bg-elevated px-4 py-3 ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
        ))}
      </motion.div>
      <div className="h-4">
        {error && <p className="text-center font-mono text-[10px] text-destructive">Incorrect PIN, try again</p>}
      </div>
      <button
        type="button"
        onClick={submit}
        className="rounded-full border border-border-strong px-4 py-1.5 font-mono text-[10px] text-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
      >
        Submit
      </button>
    </div>
  );
}
