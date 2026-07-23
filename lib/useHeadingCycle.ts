"use client";

import { useEffect, useState } from "react";
import { wordCycle } from "@/lib/motionVariants";

type Phase = "entering" | "visible" | "exiting" | "waiting";

/**
 * Drives the hero accent-phrase word cycle (ShopOS landing hero mechanic):
 * words slide in one by one, hold, slide out one by one, then the next
 * phrase enters. Unlike the ShopOS original, a single phrase still loops
 * so the effect stays alive with one phrase. First paint shows the full
 * phrase (SSR-safe); pass `paused` to freeze it (reduced motion).
 */
export function useHeadingCycle(phrases: string[], paused = false) {
  const list = phrases.length > 0 ? phrases : [""];
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("visible");
  const words = list[index].split(" ");
  const [visibleWords, setVisibleWords] = useState(words.length);
  const [exitWords, setExitWords] = useState(0);

  const wordCount = words.length;
  const phraseCount = list.length;

  useEffect(() => {
    if (paused) return;

    if (phase === "entering") {
      if (visibleWords < wordCount) {
        const t = setTimeout(() => setVisibleWords((n) => n + 1), wordCycle.enterStaggerMs);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("visible"), 0);
      return () => clearTimeout(t);
    }

    if (phase === "visible") {
      const t = setTimeout(() => {
        setExitWords(0);
        setPhase("exiting");
      }, wordCycle.holdMs);
      return () => clearTimeout(t);
    }

    if (phase === "exiting") {
      if (exitWords < wordCount) {
        const t = setTimeout(() => setExitWords((n) => n + 1), wordCycle.exitStaggerMs);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("waiting"), wordCycle.settleMs);
      return () => clearTimeout(t);
    }

    // waiting: advance to the next phrase and re-enter
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % phraseCount);
      setVisibleWords(0);
      setExitWords(0);
      setPhase("entering");
    }, 0);
    return () => clearTimeout(t);
  }, [paused, phase, visibleWords, exitWords, wordCount, phraseCount]);

  return { words, visibleWords, exitWords, phase };
}
