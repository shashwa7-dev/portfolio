"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import { blurInVariants } from "@/lib/motionVariants";

const segments: { text: string; accent?: boolean }[] = [
  { text: "I build interfaces that" },
  { text: "ship and scale", accent: true },
  { text: "to millions." },
];

const words = segments.flatMap((seg) =>
  seg.text.split(" ").map((w) => ({ w, accent: seg.accent }))
);

const H1_CLASS =
  "font-serif text-[clamp(2.2rem,5.5vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground";

export default function HeroTitle() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <h1 className={H1_CLASS}>
        I build interfaces that{" "}
        <span className="italic text-accent-hover">ship and scale</span> to
        millions.
      </h1>
    );
  }

  return (
    <h1 className={H1_CLASS}>
      {words.map((item, i) => (
        <Fragment key={i}>
          <motion.span
            variants={blurInVariants}
            initial="hidden"
            animate="visible"
            custom={i}
            className={`inline-block ${item.accent ? "italic text-accent-hover" : ""}`}
          >
            {item.w}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </h1>
  );
}
