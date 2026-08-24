"use client";

import { useCallback, useEffect, useState } from "react";
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
 * Reused for every face of the live cube and for the small static icons in
 * the results row, so the pip layout is stated once.
 */
function Pips({ value, className }: { value: Die; className?: string }) {
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="27"
        height="27"
        rx="6"
        className="fill-[var(--dice-stock)] stroke-[var(--dice-ink)]"
        strokeWidth="2"
      />
      {PIPS[value].map((slot) => (
        <circle
          key={slot}
          cx={8 + (slot % 3) * 7}
          cy={8 + Math.floor(slot / 3) * 7}
          r="2.1"
          className="fill-[var(--dice-ink)]"
        />
      ))}
    </svg>
  );
}

/** The cube's edge, and half of it. Every face sits `HALF` out from the
 *  centre, derived from `EDGE` rather than typed twice, so the box cannot
 *  come apart if the size ever changes. */
const EDGE = 40;
const HALF = EDGE / 2;

/** Enough depth that a 40px cube reads as a box, not a fisheye. */
const PERSPECTIVE = 480;

/**
 * Each face's placement on the cube: geometry, not a result. Opposite
 * faces sum to 7, as on a real die. The side and top faces get a slight
 * `brightness` filter so the cube reads as a volume instead of six
 * identical cards in flight; no new colours, just tonal separation on
 * `--dice-stock`.
 */
const FACES: readonly { value: Die; transform: string; shade?: string }[] = [
  { value: 1, transform: `translateZ(${HALF}px)` },
  { value: 6, transform: `rotateY(180deg) translateZ(${HALF}px)` },
  { value: 2, transform: `rotateY(90deg) translateZ(${HALF}px)`, shade: "brightness(0.94)" },
  { value: 5, transform: `rotateY(-90deg) translateZ(${HALF}px)`, shade: "brightness(0.94)" },
  { value: 3, transform: `rotateX(90deg) translateZ(${HALF}px)`, shade: "brightness(0.88)" },
  { value: 4, transform: `rotateX(-90deg) translateZ(${HALF}px)`, shade: "brightness(0.88)" },
];

/**
 * A real cube: six absolutely positioned faces inside a `preserve-3d` box.
 * `controls` drives its rotation entirely; the cube itself holds no state
 * and reads no roll, so it cannot be the thing that leaks one.
 */
function Cube({ controls }: { controls: ReturnType<typeof useAnimationControls> }) {
  return (
    <motion.div
      initial={{ rotateX: 0, rotateY: 0, y: 0 }}
      animate={controls}
      className="relative"
      style={{ width: EDGE, height: EDGE, transformStyle: "preserve-3d" }}
    >
      {FACES.map((face) => (
        <div
          key={face.value}
          className="absolute inset-0"
          style={{ transform: face.transform, backfaceVisibility: "hidden", filter: face.shade }}
        >
          <Pips value={face.value} className="h-full w-full" />
        </div>
      ))}
    </motion.div>
  );
}

export default function DiceRoller({
  onComplete,
}: {
  onComplete: (set: RollSet) => void;
}) {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [throwing, setThrowing] = useState(false);
  const controlsA = useAnimationControls();
  const controlsB = useAnimationControls();

  const throwDice = useCallback(async () => {
    if (throwing || rolls.length >= 3) return;
    setThrowing(true);

    /* Decided before anything animates. Everything below only rotates a
       cube to match `result`; nothing here can change it. */
    const result = rollPair(Math.random);

    try {
      const poseA = diceThrowVariants(result[0], 0);
      const poseB = diceThrowVariants(result[1], 1);

      if (prefersReducedMotion(window)) {
        controlsA.set(poseA.rest);
        controlsB.set(poseB.rest);
      } else {
        try {
          await Promise.all([controlsA.start(poseA.airborne), controlsB.start(poseB.airborne)]);
        } catch {
          /* A failed spin must not cost the visitor their roll: the pair
             was decided before the animation started, so fall through and
             record it unanimated rather than dropping it. */
        } finally {
          controlsA.set(poseA.rest);
          controlsB.set(poseB.rest);
        }
      }

      setRolls((prev) => [...prev, result]);
    } finally {
      /* Unconditional: a throw anywhere above must never leave the button
         disabled, since `throwing` is what gates it. */
      setThrowing(false);
    }
  }, [controlsA, controlsB, rolls.length, throwing]);

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
      {/* All meaning lives in text: the cube graphics are aria-hidden, and
          this status carries the same information out loud. */}
      <p className="sr-only" aria-live="polite">
        {rolls.length === 0
          ? "Three throws decide your issue."
          : done
            ? `Total ${runningTotal}.`
            : `Roll ${rolls.length} of 3: ${rolls[rolls.length - 1][0]} and ${
                rolls[rolls.length - 1][1]
              }. Running total ${runningTotal}.`}
      </p>

      {!done && (
        <button
          type="button"
          onClick={throwDice}
          disabled={throwing}
          aria-label={`Throw the dice, roll ${nextThrow} of 3`}
          className="group flex flex-col items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
        >
          <div className="transition-transform duration-fast ease-out group-hover:-translate-y-0.5">
            <motion.div
              aria-hidden="true"
              whileTap={tapPress}
              className="flex items-center gap-3"
              style={{ perspective: PERSPECTIVE }}
            >
              <Cube controls={controlsA} />
              <Cube controls={controlsB} />
            </motion.div>
          </div>
          <span className="font-mono text-2xs uppercase tracking-label text-subtle">
            tap to throw · {nextThrow} of 3
          </span>
        </button>
      )}

      {rolls.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <ul className="flex flex-wrap items-center gap-4">
            {rolls.map((roll, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  <Pips value={roll[0]} className="h-5 w-5" />
                  <Pips value={roll[1]} className="h-5 w-5" />
                </span>
                <span className="font-mono text-2xs text-subtle">{roll[0] + roll[1]}</span>
              </li>
            ))}
          </ul>
          {done && (
            <p className="mt-2 font-mono text-2xs uppercase tracking-label text-subtle">
              Total {runningTotal}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
