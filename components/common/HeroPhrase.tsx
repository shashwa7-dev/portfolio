"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HERO_PHRASES, nextPhrase, phraseWords } from "@/lib/heroPhrases";
import {
  duration,
  ease,
  phraseExitSeconds,
  phraseSwapVariants,
  phraseWordVariants,
} from "@/lib/motionVariants";

/**
 * The emphasised phrase in the intro headline. Renders "ship and scale" on the
 * server and under reduced motion; otherwise, once the intro is on screen, it
 * cycles through `HERO_PHRASES`.
 *
 * The swap is word by word: the outgoing words blur away one after another,
 * then the incoming ones resolve the same way.
 *
 * The width is animated, not just the words. Every phrase is measured in a
 * hidden copy (re-read on resize and once fonts load, since the headline's
 * size is a clamp), and the slot eases between those widths, so " to millions"
 * glides instead of jumping when a shorter or longer phrase comes in.
 *
 * It only runs while it can be seen: an IntersectionObserver plus the page's
 * visibility state, so a backgrounded tab or a scrolled-away hero does not
 * keep swapping. Screen readers get the first phrase once, as plain text; the
 * moving copy is hidden from them so the sentence is not re-announced.
 */
export default function HeroPhrase({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[] | null>(null);
  const [active, setActive] = useState(false);
  const cycled = useRef(false);
  const prev = useRef(0);
  const slotRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = measureRef.current;
    if (!box) return;
    const read = () =>
      setWidths(Array.from(box.children, (c) => (c as HTMLElement).getBoundingClientRect().width));
    read();
    document.fonts?.ready.then(read);
    const ro = new ResizeObserver(read);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    let inView = false;
    const update = () => setActive(inView && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (reduce || !active || !widths) return;
    const wait = cycled.current ? duration.phraseHold : duration.phraseStart;
    const t = setTimeout(() => {
      cycled.current = true;
      setIndex((i) => {
        prev.current = i;
        return nextPhrase(i);
      });
    }, wait * 1000);
    return () => clearTimeout(t);
  }, [reduce, active, widths, index]);

  return (
    <span className="relative inline-block">
      <span className="sr-only">{HERO_PHRASES[0]}</span>
      <motion.span
        ref={slotRef}
        aria-hidden
        className="inline-block whitespace-nowrap"
        initial={false}
        animate={widths ? { width: widths[index] } : undefined}
        // Starts once the last outgoing word has gone; see phraseSwapVariants.
        transition={{
          duration: duration.med,
          ease: ease.out,
          delay: phraseExitSeconds(phraseWords(HERO_PHRASES[prev.current]).length),
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className={`inline-block ${className ?? ""}`}
            variants={phraseSwapVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {phraseWords(HERO_PHRASES[index]).map((word, i) => (
              <motion.span key={i} className="inline-block" variants={phraseWordVariants}>
                {i > 0 && "\u00a0"}
                {word}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <span
        ref={measureRef}
        aria-hidden
        className={`pointer-events-none invisible absolute left-0 top-0 flex flex-col items-start whitespace-nowrap ${className ?? ""}`}
      >
        {HERO_PHRASES.map((p) => (
          <span key={p}>{p}</span>
        ))}
      </span>
    </span>
  );
}
