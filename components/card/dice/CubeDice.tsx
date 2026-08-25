"use client";

import { useCallback } from "react";
import { motion, useAnimationControls } from "motion/react";
import { diceThrowVariants, tapPress } from "@/lib/motionVariants";
import { useDiceRoll, type Animate } from "@/components/card/dice/useDiceRoll";
import RollPill from "@/components/card/dice/RollPill";
import Pips from "@/components/card/dice/Pips";
import type { Die, RollSet } from "@/lib/card/types";

/**
 * The original DiceRoller's 3D cube skin, moved onto useDiceRoll unchanged
 * in look. The cube itself (its markup, geometry and colours) is carried
 * across verbatim; only its button chrome moved into the shared RollPill.
 */

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

export default function CubeDice({
  onComplete,
  issueCaption,
  onRollAgain,
}: {
  onComplete: (set: RollSet) => void;
  /** Set once the print reveal has finished; overrides the hook's own
   *  rolling caption and flips the pill's label to "Roll again". */
  issueCaption: string | null;
  /** Called when the pill is tapped while `issueCaption` is set. */
  onRollAgain: () => void;
}) {
  const controlsA = useAnimationControls();
  const controlsB = useAnimationControls();
  const revealed = issueCaption !== null;
  const { rolls, status, caption, reducedMotion, disabled, handleClick } =
    useDiceRoll(onComplete, revealed, onRollAgain);

  /* Spins each cube to the rotation for its decided face plus full turns.
     Decides nothing: `result` arrives already chosen by the hook. */
  const animate = useCallback<Animate>(
    async (result) => {
      const poseA = diceThrowVariants(result[0], 0);
      const poseB = diceThrowVariants(result[1], 1);

      if (reducedMotion) {
        controlsA.set(poseA.rest);
        controlsB.set(poseB.rest);
        return;
      }

      try {
        await Promise.all([controlsA.start(poseA.airborne), controlsB.start(poseB.airborne)]);
      } finally {
        /* Land on the decided face whether the spin finished cleanly or
           was interrupted: a cube must never rest mid-turn. */
        controlsA.set(poseA.rest);
        controlsB.set(poseB.rest);
      }
    },
    [controlsA, controlsB, reducedMotion]
  );

  const onClick = useCallback(() => handleClick(animate), [handleClick, animate]);

  return (
    <div className="mt-8">
      {/* All meaning lives in text: the cube graphics are aria-hidden, and
          this status carries the same information out loud. */}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      <RollPill
        label={revealed ? "Roll again" : "Roll"}
        caption={issueCaption ?? caption}
        progress={rolls.length / 3}
        disabled={disabled}
        onClick={onClick}
        reducedMotion={reducedMotion}
        revealed={revealed}
      >
        <motion.div
          aria-hidden="true"
          whileTap={tapPress}
          className="flex items-center gap-3"
          style={{ perspective: PERSPECTIVE }}
        >
          <Cube controls={controlsA} />
          <Cube controls={controlsB} />
        </motion.div>
      </RollPill>
    </div>
  );
}
