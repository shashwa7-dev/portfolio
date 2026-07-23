"use client";

import { useReducedMotion } from "motion/react";
import { wordCycle } from "@/lib/motionVariants";
import { useHeadingCycle } from "@/lib/useHeadingCycle";

// Each phrase completes "I build interfaces that ___ to millions."
// All are 3 words and 14-15 chars so the line never visibly shifts;
// the invisible sizers below lock the box to the widest one.
const phrases = ["ship and scale", "sell with ease", "feel like magic", "bring AI closer"];

const H1_CLASS =
  "font-serif text-[clamp(2.2rem,5.5vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground";

export default function HeroTitle() {
  const reduce = useReducedMotion();
  const { words, visibleWords, exitWords, phase } = useHeadingCycle(phrases, !!reduce);

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
      I build interfaces that{" "}
      <span className="inline-grid overflow-hidden align-bottom py-[0.06em] -my-[0.06em] italic text-accent-hover">
        {/* Invisible sizers: lock the box to the widest phrase so the
            sentence never reflows when phrases swap. Mirror the animated
            span's structure exactly so widths match to the pixel. */}
        {phrases.map((p) => (
          <span
            key={p}
            aria-hidden
            className="invisible col-start-1 row-start-1 inline-flex gap-x-[0.28em] whitespace-nowrap"
          >
            {p.split(" ").map((w, i) => (
              <span key={`${w}-${i}`}>{w}</span>
            ))}
          </span>
        ))}
        <span className="col-start-1 row-start-1 inline-flex justify-center gap-x-[0.28em] whitespace-nowrap">
          {words.map((word, i) => {
            const entered = i < visibleWords;
            const exited = (phase === "exiting" && i < exitWords) || phase === "waiting";
            const shown = entered && !exited;
            return (
              <span
                key={`${word}-${i}`}
                className="inline-block"
                style={{
                  opacity: shown ? 1 : 0,
                  transform: shown
                    ? "translateY(0)"
                    : exited
                      ? "translateY(-100%)"
                      : "translateY(100%)",
                  transition: wordCycle.transition,
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      </span>{" "}
      to millions.
    </h1>
  );
}
