"use client";

import { useCallback, useEffect, useState } from "react";
import { rollPair } from "@/lib/card/dice";
import { prefersReducedMotion } from "@/lib/card/reveal";
import { SETTLE_MS } from "@/lib/card/revealSequence";
import type { Roll, RollSet } from "@/lib/card/types";

/**
 * The roll logic shared by every dice skin.
 *
 * Not in lib/card/: that directory is DOM-free by rule (its pure modules
 * carry vitest coverage against exactly that constraint) and this is a
 * React hook. The three fixes below each cost a review round against the
 * single component this was extracted from, and a second skin duplicating
 * them would mean every future fix landing twice. A skin gets none of this
 * to reimplement: it owns only motion and markup.
 */

/**
 * A skin's animation. Receives the already-decided pair so it can land on
 * it. A skin owns its own displayed faces entirely (whatever "a face"
 * means for that skin's rendering) and keeps that as its own state; the
 * hook has no display to update and doesn't take a seam for one. Resolving
 * means the animation finished; rejecting or throwing means it did not,
 * which must never cost the visitor their roll — see `throwDice`'s inner
 * try/catch.
 */
export type Animate = (result: Roll) => Promise<void>;

export type DiceRollState = {
  /** Throws recorded so far, 0 to 3. */
  rolls: readonly Roll[];
  /** True while a throw is in flight. */
  throwing: boolean;
  /** 1, 2 or 3: which throw the button is about to make. */
  nextThrow: number;
  /** True once three throws are in. */
  done: boolean;
  /** Sum of every pip recorded so far. */
  runningTotal: number;
  /** The aria-live sentence for the current state. */
  status: string;
  /**
   * RollPill's caption while rolling is still in progress (0, 1, 2, or the
   * instant the 3rd throw lands but hasn't been handed to `onComplete` yet).
   * Once a card exists, the caller overrides this with the issue line
   * instead: this hook has no idea an issue, an odds table or a total-so-
   * far display even exist, it only knows the throws.
   */
  caption: string;
  /** True when the visitor has asked for reduced motion. */
  reducedMotion: boolean;
  /** Starts a throw. No-ops while a throw is in flight or once three are recorded. */
  throwDice: (animate: Animate) => void;
  /**
   * Clears every throw so far, ready for a fresh set. Used only when
   * rolling again after a card exists: separate from unmounting the skin,
   * so the pill's fill can drain with its own transition instead of a
   * remounted element jumping straight to empty.
   */
  reset: () => void;
};

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
] as const;
const TEENS = [
  "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
] as const;
const TENS = ["", "", "twenty", "thirty"] as const;

/** Spells out 0 to 39, which covers every number `status` ever says: single
 *  pips (1 to 6), a pair's sum (2 to 12), and the running total (2 to 36). */
function spellOut(n: number): string {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
}

function buildStatus(rolls: readonly Roll[]): string {
  if (rolls.length === 0) return "Three throws decide your issue.";
  const runningTotal = rolls.reduce((n, [a, b]) => n + a + b, 0);
  if (rolls.length === 3) return `Total ${spellOut(runningTotal)}.`;
  const [a, b] = rolls[rolls.length - 1];
  return `Roll ${rolls.length} of 3: ${spellOut(a)} and ${spellOut(b)}, ${spellOut(
    a + b
  )}. Running total ${spellOut(runningTotal)}.`;
}

/** RollPill's caption. See the field's doc on DiceRollState for why this
 *  stops at "rolled" once three are in rather than reaching for an issue. */
function buildCaption(rolls: readonly Roll[]): string {
  if (rolls.length === 0) return "roll 3 times to print your card";
  const total = rolls.reduce((n, [a, b]) => n + a + b, 0);
  if (rolls.length === 3) return `${total} rolled`;
  const remaining = 3 - rolls.length;
  return `${total} so far · ${remaining} more ${remaining === 1 ? "roll" : "rolls"}`;
}

export function useDiceRoll(onComplete: (set: RollSet) => void): DiceRollState {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [throwing, setThrowing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Read once, in an effect: prefersReducedMotion touches `window`, which
  // has no stable value during render (and none at all on the server).
  useEffect(() => {
    setReducedMotion(prefersReducedMotion(window));
  }, []);

  const throwDice = useCallback(
    (animate: Animate) => {
      if (throwing || rolls.length >= 3) return;
      setThrowing(true);

      /* Fix 3 of 3, first half: decided before anything animates. The odds
         printed on the card, and proved against all 46,656 outcomes in
         lib/card/dice.test.ts, rest on nothing downstream being able to
         influence this value: no skin's animate implementation ever
         chooses a result, it only receives one. */
      const result = rollPair(Math.random);

      void (async () => {
        try {
          try {
            await animate(result);
          } catch {
            /* Fix 3 of 3, second half: a failed or rejected animation must
               not cost the visitor their roll. `result` was decided above,
               so it is recorded regardless of whether the animation
               finished. */
          }
          setRolls((prev) => [...prev, result]);
        } finally {
          /* Fix 2 of 3: unconditional, so nothing above (including the
             swallowed failure just above) can leave the button disabled
             forever. `throwing` is the only thing that gates a throw. */
          setThrowing(false);
        }
      })();
    },
    [throwing, rolls.length]
  );

  /* Not one of the three fixes above, and deliberately independent of them:
     rolling again unmounts nothing, so a remount can't reset this for us
     the way it used to when the whole skin used to disappear behind the
     finished card. Only `rolls` clears; `throwing` is already false by the
     time a caller has any business calling this (the pill only reaches its
     "Roll again" state once three throws have landed and settled). */
  const reset = useCallback(() => setRolls([]), []);

  /* Fix 1 of 3: the handoff fires from its own effect,
     never inline with the third roll's own setRolls call. Calling
     onComplete synchronously there would let React 18 batch the third
     slot filling and this component's eventual unmount into a single
     commit, and the finished set would never paint or announce. */
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

  return {
    rolls,
    throwing,
    nextThrow,
    done,
    runningTotal,
    status: buildStatus(rolls),
    caption: buildCaption(rolls),
    reducedMotion,
    throwDice,
    reset,
  };
}
