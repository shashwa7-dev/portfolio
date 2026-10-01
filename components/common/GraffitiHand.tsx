"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useAnimationControls, useInView, useReducedMotion } from "motion/react";
import { handRiseVariants } from "@/lib/motionVariants";

/**
 * The graffiti cyborg hand, rising out of the closing section's bottom edge.
 * An open palm, so it says hello where the page asks you to get in touch.
 *
 * The parent must be `relative overflow-hidden`: the forearm in the artwork is
 * cut off flat, and that edge only works hidden below the section. The
 * observer watches a full-size wrapper rather than the hand, because the hand
 * starts clipped out of sight and a clipped element never reports as
 * intersecting.
 *
 * Rises once, the first time the section is in view, then sways gently. The
 * sway stops while the section is off screen and picks up again when it
 * returns. Under reduced motion the hand is simply there. Decorative, so
 * hidden from assistive tech.
 */
export default function GraffitiHand({ className }: { className?: string }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(zoneRef, { amount: 0.5 });
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const risen = useRef(false);

  useEffect(() => {
    if (reduce) return;
    if (!inView) {
      if (risen.current) controls.start("visible");
      return;
    }
    let live = true;
    const rise = risen.current ? Promise.resolve() : controls.start("visible");
    rise.then(() => {
      if (!live) return;
      risen.current = true;
      controls.start("sway");
    });
    return () => {
      live = false;
    };
  }, [inView, reduce, controls]);

  return (
    <div ref={zoneRef} aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        className={`absolute origin-[35%_100%] ${className ?? ""}`}
        variants={handRiseVariants}
        initial={reduce ? "visible" : "hidden"}
        animate={controls}
      >
        <Image
          src="/graffiti-hand.webp"
          alt=""
          width={671}
          height={1000}
          sizes="200px"
          className="h-full w-auto select-none drop-shadow-[0_14px_22px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_14px_22px_rgba(0,0,0,0.6)]"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
