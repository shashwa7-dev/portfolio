"use client";

import { useReducedMotion } from "motion/react";
import { wordCycle } from "@/lib/motionVariants";
import { useHeadingCycle } from "@/lib/useHeadingCycle";

const phrases = ["enters word by word", "holds for a beat", "exits and loops"];

export default function WordCycleDemo() {
  const reduce = useReducedMotion();
  const { words, visibleWords, exitWords, phase } = useHeadingCycle(phrases, !!reduce);

  return (
    <p className="font-serif text-2xl italic text-accent-hover">
      <span className="inline-flex gap-x-[0.28em] overflow-hidden py-[0.06em] -my-[0.06em] align-bottom">
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
                transform: shown ? "translateY(0)" : exited ? "translateY(-100%)" : "translateY(100%)",
                transition: wordCycle.transition,
              }}
            >
              {word}
            </span>
          );
        })}
      </span>
    </p>
  );
}
