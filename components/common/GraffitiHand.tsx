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
 * Plays once per page load. Under reduced motion the hand is simply there, and
 * hover does nothing. Decorative, so hidden from assistive tech.
 */
export default function GraffitiHand({ className }: { className?: string }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(zoneRef, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const settled = useRef(false);

  useEffect(() => {
    if (!inView || reduce) return;
    let live = true;
    controls.start("visible").then(() => {
      if (!live) return;
      return controls.start("wave").then(() => {
        settled.current = true;
      });
    });
    return () => {
      live = false;
    };
  }, [inView, reduce, controls]);

  return (
    <div ref={zoneRef} aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        className={`pointer-events-auto absolute origin-[35%_100%] ${className ?? ""}`}
        variants={handRiseVariants}
        initial={reduce ? "visible" : "hidden"}
        animate={controls}
        onHoverStart={() => {
          if (!reduce && settled.current) controls.start("wave");
        }}
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
