"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { duration } from "@/lib/motionVariants";
import { CornerMotif } from "@/components/diwali/art/CornerMotif";
import { Diya } from "@/components/diwali/art/Diya";
import { LotusDivider } from "@/components/diwali/art/LotusDivider";
import { Rangoli } from "@/components/diwali/art/Rangoli";
import { rozha, tiro } from "@/components/diwali/fonts";
import styles from "@/components/diwali/diwali.module.css";

type Props = {
  /** The prasad button: opens the plate of laddoos. */
  onOpenPlate: () => void;
  /** The plate is up: the words dim and blur, the idols only dim. */
  plating: boolean;
};

/** Petals and diyas rendered; the CSS hides the extras under 600px (16 and 5). */
const PETALS = 28;
const DIYAS = 7;
const PETAL_COLOURS = ["#f59f00", "#fd7e14", "#ffd43b", "#e8590c", "#c2255c"];
/**
 * Petal drift, per petal and random, as in the screens prototype: seconds to
 * fall (7 to 14), a negative start so the sky is already full, and sideways
 * drift. Physics of the drift, not UI durations.
 */
const PETAL_FALL_MIN_S = 7;
const PETAL_FALL_SPREAD_S = 7;
const PETAL_HEAD_START_S = 10;

const CORNERS = [
  ["tl", styles.cornerTl],
  ["tr", styles.cornerTr],
  ["bl", styles.cornerBl],
  ["br", styles.cornerBr],
] as const;

function makePetals(): CSSProperties[] {
  return Array.from({ length: PETALS }, (_, i) => {
    const sc = 0.7 + Math.random() * 0.8;
    return {
      left: `${Math.random() * 100}%`,
      width: `${10 * sc}px`,
      height: `${7 * sc}px`,
      background: PETAL_COLOURS[i % PETAL_COLOURS.length],
      "--d": `${PETAL_FALL_MIN_S + Math.random() * PETAL_FALL_SPREAD_S}s`,
      "--delay": `${-Math.random() * PETAL_HEAD_START_S}s`,
      "--dx": `${(Math.random() - 0.5) * 160}px`,
      "--r": `${Math.random() * 720 - 360}deg`,
    } as CSSProperties;
  });
}

/**
 * The शुभ दीपावली card, ported from the finale screens prototype (v5): a
 * kumkum-red wash, falling marigold and rose petals, a gold frame with four
 * paisley corners, Lakshmi and Ganesh with a breathing glow, the title, a
 * lotus divider, the blessing, an English line and the signature, then the
 * prasad button and its hint, over a rangoli and a row of diyas that light one
 * after another. No mandir arch.
 *
 * Laid out with container query units on its own box, so it fits a desktop,
 * tablet or phone without breakpoints on the window. The fireworks and the
 * toran are the show's, drawn behind and above it.
 *
 * Reduced motion: no petals, glow, shine, pulse or flicker; the entrance is
 * fades only and the diyas are lit from the start.
 */
export default function Finale({ onOpenPlate, plating }: Props) {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [petals] = useState(makePetals);
  const [litCount, setLitCount] = useState(() => (reduced ? DIYAS : 0));
  const cta = useRef<HTMLButtonElement>(null);
  const platingRef = useRef(plating);
  useEffect(() => {
    platingRef.current = plating;
  }, [plating]);

  // The diyas light one after another, from the idols' entrance on.
  useEffect(() => {
    if (reduced) return;
    const timers = Array.from({ length: DIYAS }, (_, i) =>
      window.setTimeout(
        () => setLitCount(i + 1),
        (duration.diwaliAtIdols + i * duration.diwaliDiyaStep) * 1000,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  // Focus moves to the prasad button as it appears.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!platingRef.current) cta.current?.focus({ preventScroll: true });
    }, duration.diwaliAtCta * 1000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`${styles.finale} ${rozha.variable} ${tiro.variable}`}
      data-plating={plating ? "" : undefined}
      inert={plating}
    >
      <div aria-hidden className={styles.wash} />
      {!reduced && (
        <div aria-hidden className={styles.petals}>
          {petals.map((style, i) => (
            <span key={i} className={styles.petal} style={style} />
          ))}
        </div>
      )}
      <div aria-hidden className={styles.frame}>
        {CORNERS.map(([corner, cls]) => (
          <CornerMotif
            key={corner}
            corner={corner}
            className={`${styles.corner} ${cls}`}
          />
        ))}
      </div>
      <div aria-hidden className={styles.rangoli}>
        <Rangoli />
      </div>
      <div aria-hidden className={styles.diyas}>
        {Array.from({ length: DIYAS }, (_, i) => (
          <div key={i} className={styles.finDiya}>
            <Diya
              idPrefix={`dwf-diya-${i}`}
              lit={i < litCount}
              flickerOffset={(i * 7) % 5}
            />
          </div>
        ))}
      </div>
      <div className={styles.col}>
        <div className={styles.shrine}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`${styles.idols} ${styles.seq}`}
            src="/images/diwali/lakshmi-ganesh.webp"
            alt="Lakshmi and Ganesh"
            width={1200}
            height={800}
            decoding="async"
          />
        </div>
        <div className={styles.words}>
          <h2 lang="hi" className={`${styles.hi} ${styles.seq}`}>
            शुभ दीपावली
          </h2>
          <LotusDivider className={`${styles.divider} ${styles.seq}`} />
          <p className={`${styles.bless} ${styles.seq}`}>
            <span lang="hi">
              {"माँ लक्ष्मी और श्री गणेश की कृपा से आपका घर सुख, समृद्धि और प्रकाश से भरा रहे।"}
            </span>
            <span className={styles.en}>
              Wishing you and your family a very happy Diwali.
            </span>
            <span lang="hi" className={styles.sig}>
              शाश्वत
            </span>
          </p>
          <div className={styles.prasadWrap}>
            <button
              ref={cta}
              type="button"
              lang="hi"
              className={`${styles.prasad} ${styles.seq}`}
              disabled={plating}
              onClick={onOpenPlate}
            >
              <span aria-hidden className={styles.ld} />
              प्रसाद लीजिए
              <ArrowRight
                aria-hidden
                weight="bold"
                className={styles.arr}
              />
            </button>
            <span className={`${styles.prasadHint} ${styles.seq}`}>
              Take a laddoo before you go
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
