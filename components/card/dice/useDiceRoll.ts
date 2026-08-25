"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
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
 *
 * Haptics live here for the same reason: one press trigger, one pair of
 * landing taps and one completion trigger, rather than the old hand-rolled
 * `buzz()` pasted into every skin that wants a throw to feel physical.
 */

type Trigger = ReturnType<typeof useWebHaptics>["trigger"];

/** Two dice land `HAPTIC_LANDING_STAGGER_MS` apart on the cube skin (see
 *  `LANDING_STAGGER_S` in lib/motionVariants.ts, 0.04s). That constant
 *  isn't exported and this task must not touch lib/, so the same value is
 *  mirrored here rather than imported, purely to keep the two landing taps
 *  reading like the same throw the visuals already depict. */
const HAPTIC_LANDING_STAGGER_MS = 40;

/**
 * Wraps a `web-haptics` trigger the way the old hand-rolled `buzz()`
 * wrapped `navigator.vibrate`: a missing implementation, a thrown error, or
 * a rejected promise (the package itself, an unsupported browser, or a
 * visitor who has toggled the feature off) must never interrupt a throw.
 */
function safeHaptic(trigger: Trigger, input: Parameters<Trigger>[0]) {
  try {
    trigger(input)?.catch(() => {
      /* unsupported, or declined */
    });
  } catch {
    /* unsupported */
  }
}

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

/**
 * What a skin (and, through it, RollPill) actually reads. `throwDice` and
 * `reset` are not part of this: both exist only to be called from inside
 * `handleClick` below, and no skin calls either of them directly. `throwing`,
 * `nextThrow`, `done` and `runningTotal` were returned once too, but nothing
 * outside this hook read them; `done` still backs `disabled` internally.
 */
export type DiceRollState = {
  /** Throws recorded so far, 0 to 3. Read by RollPill to derive its fill
   *  progress. */
  rolls: readonly Roll[];
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
  /** True when the visitor has asked for reduced motion. Read directly by a
   *  skin's own `animate` (to decide whether to play its throw animation at
   *  all) and by RollPill (to gate the caption's blur-swap). */
  reducedMotion: boolean;
  /**
   * Whether RollPill's button should be inert right now: mid-throw, or the
   * gap between the third roll landing and `revealed` (passed into the
   * hook) turning true, during which `handleClick` would only silently
   * no-op a tap rather than doing anything visible.
   */
  disabled: boolean;
  /**
   * The pill's whole click contract: guards against a throw already in
   * flight, branches to "start a fresh set" when `revealed` is true
   * (clearing the throws and calling `onRollAgain`), and otherwise starts a
   * throw with the skin's own `animate`. This branch is new logic this task
   * introduced, not something carried over from before the pill existed, so
   * it lives here once rather than being pasted into every skin the way
   * Pips.tsx's markup once was.
   */
  handleClick: (animate: Animate) => void;
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

/**
 * @param revealed Whether a card currently exists (the caller's own
 *   `issueCaption !== null`, threaded in rather than recomputed here, since
 *   the hook has no idea what an issue or a caption are). Governs both
 *   `handleClick`'s branch and `disabled`'s trailing window.
 * @param onRollAgain Called from `handleClick`'s revealed branch, after this
 *   hook's own `rolls` have already been cleared.
 * @param onRollsChange Optional. Mirrors `rolls` up to the caller on every
 *   change, so CardMinter's history strip can read the throws recorded so
 *   far without a second copy of them. Lives here, in one effect, rather
 *   than as a copy-pasted effect in every skin that calls this hook.
 */
export function useDiceRoll(
  onComplete: (set: RollSet) => void,
  revealed: boolean,
  onRollAgain: () => void,
  onRollsChange?: (rolls: readonly Roll[]) => void
): DiceRollState {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [throwing, setThrowing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { trigger } = useWebHaptics();

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

      // Decided now, same as `result`: whether this throw is the one that
      // completes the set of three, which decides the weight of its
      // landing haptic below.
      const completesSet = rolls.length === 2;

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
          // The landing: both dice have now settled, whether or not the
          // skin's own animation finished cleanly. The third roll gets the
          // heavier `success` preset instead of the usual two light taps,
          // since it is the moment the set actually completes.
          if (completesSet) {
            safeHaptic(trigger, "success");
          } else {
            safeHaptic(trigger, "light");
            window.setTimeout(() => safeHaptic(trigger, "light"), HAPTIC_LANDING_STAGGER_MS);
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
    [throwing, rolls.length, trigger]
  );

  /* Not one of the three fixes above, and deliberately independent of them:
     rolling again unmounts nothing, so a remount can't reset this for us
     the way it used to when the whole skin used to disappear behind the
     finished card. Only `rolls` clears; `throwing` is already false by the
     time a caller has any business calling this (the pill only reaches its
     "Roll again" state once three throws have landed and settled). */
  const reset = useCallback(() => setRolls([]), []);

  /* The shared click branch: guard, then "start fresh" vs "throw". Moved
     here (rather than pasted into CubeDice and TossDice) because it is new
     logic this task added, not code carried over from before RollPill
     existed, and a review already flagged this exact shape of duplication
     once over Pips.tsx. */
  const handleClick = useCallback(
    (animate: Animate) => {
      if (throwing) return;
      // The lightest tap available, on every press this branch actually
      // acts on ("selection": 8ms at 0.3 intensity, lighter than the
      // "light" preset used for a die's own landing below) so a throw
      // reads as three distinct weights rather than one repeated buzz.
      safeHaptic(trigger, "selection");
      if (revealed) {
        reset();
        onRollAgain();
        return;
      }
      throwDice(animate);
    },
    [throwing, revealed, reset, onRollAgain, throwDice, trigger]
  );

  /* Mirrors `rolls` up to the caller, if it wants them, on every change.
     Moved here from being pasted into both CubeDice and TossDice: the
     effect, and the four-line comment explaining it, used to exist twice. */
  useEffect(() => {
    onRollsChange?.(rolls);
  }, [rolls, onRollsChange]);

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

  // Backs `disabled` below only; not part of the returned contract since
  // nothing outside this hook reads it.
  const done = rolls.length === 3;

  return {
    rolls,
    status: buildStatus(rolls),
    caption: buildCaption(rolls),
    reducedMotion,
    // Mid-throw, or the gap between the third roll landing and `revealed`
    // turning true: a tap in that gap would reach `handleClick`, find
    // `revealed` still false, and fall into `throwDice`, which itself
    // no-ops once `rolls.length >= 3`. The pill should look inert for that
    // whole window rather than inviting a tap it silently ignores.
    disabled: throwing || (done && !revealed),
    handleClick,
  };
}
