"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { diceThrowVariants, tapPress } from "@/lib/motionVariants";
import { rollPair } from "@/lib/card/dice";
import { prefersReducedMotion } from "@/lib/card/reveal";
import { SETTLE_MS } from "@/lib/card/revealSequence";
import type { Die, Roll, RollSet } from "@/lib/card/types";

/** Pip layout per face, on a 3x3 grid indexed 0 to 8. */
const PIPS: Record<Die, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Drawn as circles rather than set as the unicode dice characters, which
 * render at wildly different weights and baselines across platforms. This
 * is the same reason the card prints its roll as text rather than glyphs.
 */
function DieFace({ value }: { value: Die }) {
  return (
    <svg viewBox="0 0 30 30" className="h-7 w-7" aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="27"
        height="27"
        rx="6"
        className="fill-background stroke-foreground"
        strokeWidth="2"
      />
      {PIPS[value].map((slot) => (
        <circle
          key={slot}
          cx={8 + (slot % 3) * 7}
          cy={8 + Math.floor(slot / 3) * 7}
          r="2.1"
          className="fill-foreground"
        />
      ))}
    </svg>
  );
}

const randomDie = (): Die => (Math.floor(Math.random() * 6) + 1) as Die;

export default function DiceRoller({
  onComplete,
}: {
  onComplete: (set: RollSet) => void;
}) {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [face, setFace] = useState<Roll>([1, 1]);
  const [throwing, setThrowing] = useState(false);
  const controls = useAnimationControls();
  const flickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* The flicker interval outlives a fast unmount otherwise: this component
     is replaced by the card the moment the third roll lands, and a visitor
     navigating away mid-throw would leave it running. */
  useEffect(
    () => () => {
      if (flickerRef.current) clearInterval(flickerRef.current);
    },
    []
  );

  const throwDice = useCallback(async () => {
    if (throwing || rolls.length >= 3) return;
    setThrowing(true);

    const result = rollPair(Math.random);
    const reduced = prefersReducedMotion(window);

    if (!reduced) {
      /* The faces churn while the dice are in the air so the result cannot
         be read mid-flight. It is cosmetic: `result` was decided before the
         animation started and nothing here can change it. Wrapped in
         try/finally: if `controls.start` ever rejects instead of resolving,
         the interval must still clear and the button must still re-enable,
         or a single failed throw wedges it shut for good. */
      flickerRef.current = setInterval(() => setFace([randomDie(), randomDie()]), 60);
      try {
        await controls.start("airborne");
      } finally {
        if (flickerRef.current) clearInterval(flickerRef.current);
        flickerRef.current = null;
        controls.set("rest");
      }
    }

    setFace(result);
    setRolls((prev) => [...prev, result]);
    setThrowing(false);
  }, [controls, rolls.length, throwing]);

  /* The handoff waits for a separate commit, and then a beat.
     onComplete is the parent's setRoll: calling it inline batched the third
     slot filling and this component unmounting into one React 18 commit, so
     the finished set never painted and the total was never announced. */
  useEffect(() => {
    if (rolls.length !== 3) return;
    const settle = setTimeout(() => {
      onComplete([rolls[0], rolls[1], rolls[2]] as const);
    }, SETTLE_MS);
    return () => clearTimeout(settle);
  }, [rolls, onComplete]);

  const runningTotal = rolls.reduce((n, [a, b]) => n + a + b, 0);
  const nextThrow = Math.min(rolls.length + 1, 3);
  const done = rolls.length === 3;

  return (
    <div className="mt-8">
      <ul className="flex gap-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex h-14 w-[4.5rem] items-center justify-center gap-1 rounded-md border border-border"
          >
            {rolls[i] ? (
              <>
                <DieFace value={rolls[i][0]} />
                <DieFace value={rolls[i][1]} />
              </>
            ) : (
              <span className="font-mono text-2xs uppercase tracking-label text-subtle">
                {i + 1}
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 font-mono text-2xs uppercase tracking-label text-subtle" aria-live="polite">
        {rolls.length === 0
          ? "Three throws decide your issue."
          : done
            ? `Total ${runningTotal}.`
            : `Roll ${rolls.length} of 3: ${rolls[rolls.length - 1][0]} and ${
                rolls[rolls.length - 1][1]
              }. Running total ${runningTotal}.`}
      </p>

      <div className="mt-4 flex items-center gap-3">
        {!done && (
          <motion.button
            type="button"
            onClick={throwDice}
            disabled={throwing}
            whileTap={tapPress}
            aria-label={`Throw the dice, roll ${nextThrow} of 3`}
            className="relative flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-base font-medium text-accent-foreground transition-colors duration-base ease-out hover:bg-accent-hover disabled:opacity-70"
          >
            <span>Roll</span>
            <motion.span
              className="flex gap-1"
              variants={diceThrowVariants}
              initial="rest"
              animate={controls}
            >
              <DieFace value={face[0]} />
              <DieFace value={face[1]} />
            </motion.span>
          </motion.button>
        )}

      </div>
    </div>
  );
}
