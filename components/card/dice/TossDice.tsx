"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ARCS, tossKeyframes } from "@/lib/card/toss";
import { duration, TOSS_EASE, TOSS_SHUFFLE_MS } from "@/lib/motionVariants";
import { useDiceRoll, type Animate } from "@/components/card/dice/useDiceRoll";
import RollPill from "@/components/card/dice/RollPill";
import type { Die, Roll, RollSet } from "@/lib/card/types";

/**
 * The reference "toss" skin (.superpowers/sdd/2026-08-24-visitor-card-dice/
 * reference-toss.jsx), rebuilt on useDiceRoll. It decides nothing: `animate`
 * receives the already-decided pair, shuffles the displayed faces while
 * airborne, and resolves once both dice land on the real result.
 */

// ---- die face geometry, carried across from the reference exactly -------
const SLOTS: Record<string, readonly [number, number]> = {
  TL: [30, 30], TC: [50, 30], TR: [70, 30],
  ML: [30, 50], MC: [50, 50], MR: [70, 50],
  BL: [30, 70], BC: [50, 70], BR: [70, 70],
};
const FACES: Record<Die, readonly string[]> = {
  1: ["MC"],
  2: ["TL", "BR"],
  3: ["TL", "MC", "BR"],
  4: ["TL", "TR", "BL", "BR"],
  5: ["TL", "TR", "MC", "BL", "BR"],
  6: ["TL", "TR", "ML", "MR", "BL", "BR"],
};

/** A face for the visual shuffle only, never the decided result: the real
 *  roll comes from rollPair(Math.random) inside useDiceRoll, before any
 *  animation runs. This just picks what flickers past while airborne. */
const shuffleFace = (): Die => (1 + Math.floor(Math.random() * 6)) as Die;

/** Feature-detected and wrapped so an absent or throwing implementation
 *  (iOS Safari has no navigator.vibrate at all) never interrupts a throw. */
function buzz(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}

const DIE_SIZE = 34;

function Die({
  value,
  wobbleId,
  faceGradId,
  pipGradId,
}: {
  value: Die;
  wobbleId: string;
  faceGradId: string;
  pipGradId: string;
}) {
  return (
    <svg
      width={DIE_SIZE}
      height={DIE_SIZE}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 3px 3px rgba(20,18,10,.22))", overflow: "visible" }}
    >
      <g style={{ filter: `url(#${wobbleId})` }}>
        {/* body: subtly lit face + soft charcoal edge */}
        <rect
          x="7" y="7" width="86" height="86" rx="24"
          fill={`url(#${faceGradId})`} stroke="#1c1a17" strokeWidth="5"
        />
        {/* faint inner rim for a rounded, tactile edge */}
        <rect
          x="12" y="12" width="76" height="76" rx="20"
          fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7"
        />
        {/* glossy top highlight */}
        <rect x="16" y="13" width="68" height="26" rx="13" fill="#ffffff" opacity="0.35" />
        {FACES[value].map((slot) => {
          const [cx, cy] = SLOTS[slot];
          return <circle key={slot} cx={cx} cy={cy} r="8" fill={`url(#${pipGradId})`} />;
        })}
      </g>
    </svg>
  );
}

export default function TossDice({
  onComplete,
  issueCaption,
  onRollAgain,
  onRollsChange,
}: {
  onComplete: (set: RollSet) => void;
  /** Set once the print reveal has finished; overrides the hook's own
   *  rolling caption and flips the pill's label to "Roll again". */
  issueCaption: string | null;
  /** Called when the pill is tapped while `issueCaption` is set. */
  onRollAgain: () => void;
  /** Mirrors useDiceRoll's `rolls` up to CardMinter's history strip. See
   *  DiceRoller.tsx's doc on the prop for why this lives here rather than
   *  in the hook itself. */
  onRollsChange: (rolls: readonly Roll[]) => void;
}) {
  // useId, not a literal string: <defs> ids are global to the document and
  // the issue gallery renders other SVG on the same page. Colons stripped
  // since an unquoted `url(#id)` treats them as a CSS token boundary.
  const uid = useId().replace(/:/g, "");
  const wobbleId = `toss-wobble-${uid}`;
  const faceGradId = `toss-face-${uid}`;
  const pipGradId = `toss-pip-${uid}`;

  const dieRefA = useRef<HTMLSpanElement>(null);
  const dieRefB = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [faces, setFaces] = useState<Roll>([5, 2]);

  // The most recent throw's own teardown: clears its shuffle interval,
  // cancels its animations, and resolves its promise. Reassigned every
  // throw; invoked (safely, more than once if needed) on unmount so a
  // throw mid-flight can't keep ticking after the component is gone.
  const teardownRef = useRef<() => void>(() => {});
  useEffect(() => () => teardownRef.current(), []);

  const revealed = issueCaption !== null;
  const { rolls, status, caption, reducedMotion, disabled, handleClick } =
    useDiceRoll(onComplete, revealed, onRollAgain);

  // Purely a hand-off: `rolls` already exists in the hook above, this just
  // reports it upward on every change so CardMinter's history strip can
  // read it without a parallel copy of the throws.
  useEffect(() => {
    onRollsChange(rolls);
  }, [rolls, onRollsChange]);

  const animate = useCallback<Animate>(
    (result) =>
      new Promise<void>((resolve) => {
        if (reducedMotion) {
          setFaces(result);
          resolve();
          return;
        }

        // Both skins honour reduced motion; the squash is otherwise pure
        // decoration on top of a throw that already works without it. Lives
        // here (the first thing `animate` does), not in the click handler:
        // `handleClick` now lives in useDiceRoll and runs `animate` as part
        // of `throwDice`'s own dispatch, at the same effective moment a
        // squash fired synchronously from the old inline click handler did.
        buttonRef.current?.animate(
          [{ transform: "scale(1)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }],
          { duration: duration.fast * 1000, easing: TOSS_EASE.press }
        );

        buzz(12);

        const shuffle = window.setInterval(() => {
          setFaces([shuffleFace(), shuffleFace()]);
        }, TOSS_SHUFFLE_MS);

        const refs = [dieRefA, dieRefB] as const;
        const animations = ARCS.map((arc, i) => {
          const el = refs[i].current;
          if (!el) return null;
          try {
            return el.animate(tossKeyframes(arc), {
              duration: duration.throw * 1000,
              easing: "linear",
              fill: "both",
            });
          } catch {
            return null;
          }
        });
        const live = animations.filter((a): a is Animation => a !== null);

        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          window.clearInterval(shuffle);
          live.forEach((a) => a.cancel());
          setFaces(result);
          buzz([0, 14, 45, 22]);
          resolve();
        };

        // Reassigned so an unmount mid-throw tears this exact throw down:
        // clears its interval, cancels its animations, and still resolves
        // rather than leaving the hook's awaited promise hanging (which
        // would never re-enable the button, and the hook's own `finally`
        // can't reach into a skin's WAAPI handles to save it).
        teardownRef.current = finish;

        // A die with no live ref (or one whose .animate() call itself
        // threw) must not hang the promise forever: settle the moment
        // every animation that DID start reports done, or immediately if
        // none did.
        if (live.length === 0) {
          finish();
          return;
        }

        let doneCount = 0;
        const onSettle = () => {
          if (++doneCount === live.length) finish();
        };
        live.forEach((anim) => {
          anim.onfinish = onSettle;
          // cancel() does not fire onfinish, only oncancel: without this a
          // programmatically cancelled animation (e.g. from teardown
          // itself, or a future skin change) would never count toward
          // doneCount and the promise would hang.
          anim.oncancel = onSettle;
        });
      }),
    [dieRefA, dieRefB, reducedMotion]
  );

  const onClick = useCallback(() => handleClick(animate), [handleClick, animate]);

  return (
    <div className="mt-8">
      {/* Shared defs: sketch wobble + tactile gradients, declared once for
          both dice. A lit object's material, not a themeable surface, so
          these are literal colours rather than palette tokens. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={wobbleId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
          </filter>
          <linearGradient id={faceGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#eceae4" />
          </linearGradient>
          <linearGradient id={pipGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3733" />
            <stop offset="1" stopColor="#111010" />
          </linearGradient>
        </defs>
      </svg>

      {/* All meaning lives in text: the dice graphics are aria-hidden, and
          this status carries the same information out loud. */}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      <RollPill
        ref={buttonRef}
        label={revealed ? "Roll again" : "Roll"}
        caption={issueCaption ?? caption}
        progress={rolls.length / 3}
        disabled={disabled}
        onClick={onClick}
        reducedMotion={reducedMotion}
        revealed={revealed}
      >
        {/* The dock: the dice live here at rest, and return here after
            the toss. */}
        <span className="relative inline-flex h-9 w-[74px] shrink-0 items-center" aria-hidden="true">
          <span ref={dieRefA} className="absolute left-0 z-[2] inline-flex will-change-transform">
            <Die value={faces[0]} wobbleId={wobbleId} faceGradId={faceGradId} pipGradId={pipGradId} />
          </span>
          <span ref={dieRefB} className="absolute left-10 z-[1] inline-flex will-change-transform">
            <Die value={faces[1]} wobbleId={wobbleId} faceGradId={faceGradId} pipGradId={pipGradId} />
          </span>
        </span>
      </RollPill>
    </div>
  );
}
