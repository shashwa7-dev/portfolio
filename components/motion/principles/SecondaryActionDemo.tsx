"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { duration, ease, spring } from "@/lib/motionVariants";

const PARTICLES = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * 60 * Math.PI) / 180;
  return { x: Math.cos(angle) * 20, y: Math.sin(angle) * 20 };
});

/** Like button: heart pops and fills, six particles burst outward. Unlike stays quiet. */
export default function SecondaryActionDemo() {
  const [liked, setLiked] = useState(false);
  const [burstId, setBurstId] = useState(0);

  const toggle = () => {
    setLiked((v) => !v);
    if (!liked) setBurstId((n) => n + 1);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      className="flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm text-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <motion.span
          key={liked ? "liked" : "unliked"}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={spring.pop}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-accent text-accent" : "text-muted-foreground"}`} />
        </motion.span>
        <AnimatePresence>
          {liked && (
            <span key={burstId} className="absolute inset-0">
              {PARTICLES.map((p, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-accent"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: p.x, y: p.y, scale: [0, 1, 0], opacity: [1, 1, 0] }}
                  transition={{ duration: duration.hero, ease: ease.out }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </span>
      Like
    </button>
  );
}
