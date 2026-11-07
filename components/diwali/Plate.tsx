"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LADDOO_SPOTS, laddooImageBox, spotBox } from "@/lib/diwali/laddoos";
import { duration } from "@/lib/motionVariants";
import { rozha, tiro } from "@/components/diwali/fonts";
import type { DiwaliSound } from "@/components/diwali/sound";
import styles from "@/components/diwali/diwali.module.css";

type Props = {
  phase: "plate" | "picked";
  sound: DiwaliSound;
  onPick(index: number): void;
  onDone(): void;
};

const LADDOO = "/images/diwali/laddoo.webp";
const BITTEN = "/images/diwali/laddoo-bitten.webp";

/** Where the picked laddoo floats to, as a fraction of the viewport height. */
const FLOAT_Y = 0.38;
/** How much it grows on the way. */
const FLOAT_SCALE = 2.2;
const CRUMBS = 14;

/** Crumbs off the bitten side: the right edge, 40 to 60% down the ball. */
function crumbs(host: HTMLElement, cx: number, cy: number, size: number) {
  const r = size / 2;
  for (let i = 0; i < CRUMBS; i++) {
    const c = document.createElement("span");
    c.className = styles.crumb;
    if (Math.random() < 0.3) c.dataset.light = "";
    const s = Math.max(3, ((2 + Math.random() * 4) * size) / 200 * 3);
    c.style.width = `${s}px`;
    c.style.height = `${s}px`;
    c.style.left = `${cx + r * 0.9 + (Math.random() - 0.5) * size * 0.15}px`;
    c.style.top = `${cy - r + size * (0.4 + Math.random() * 0.2)}px`;
    c.style.setProperty("--dx", `${(Math.random() - 0.3) * size * 0.6}px`);
    c.style.setProperty("--dy", `${size * 0.6 + Math.random() * size * 0.9}px`);
    c.style.setProperty("--rot", `${Math.random() * 360}deg`);
    // Per-crumb fall time: physics, not a UI duration.
    c.style.setProperty("--d", `${0.6 + Math.random() * 0.5}s`);
    c.addEventListener("animationend", () => c.remove(), { once: true });
    host.appendChild(c);
  }
}

/**
 * The prasad plate, over the finale card once its button is pressed: a
 * heading, then the photographed plate rising in with one round button per
 * laddoo. Picking one lifts a cut-out of that laddoo off the plate, floats it
 * to the middle of the screen at about twice the size while the plate dims,
 * and takes one bite out of it (the image swaps to the bitten one, with a
 * squash, a crunch and a spray of crumbs). Then `वाह!`, and `onDone` hands
 * back to the show for the way home.
 *
 * Reduced motion: no rise, float, squash or crumbs; the laddoo appears in the
 * middle at its full size and the bite still happens.
 */
export default function Plate({ phase, sound, onPick, onDone }: Props) {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [chosen, setChosen] = useState<number | null>(null);
  const [bitten, setBitten] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const cutout = useRef<HTMLDivElement>(null);
  const wah = useRef<HTMLParagraphElement>(null);

  const latest = useRef({ sound, onDone });
  useLayoutEffect(() => {
    latest.current = { sound, onDone };
  });

  // Warm the two laddoo images, and hand focus to the first laddoo (the
  // finale's button behind is disabled and inert from now on).
  useEffect(() => {
    for (const src of [LADDOO, BITTEN]) new Image().src = src;
    buttons.current[0]?.focus({ preventScroll: true });
  }, []);

  // The pick: lay the cut-out over its laddoo, then float it up.
  useLayoutEffect(() => {
    if (chosen === null) return;
    const btn = buttons.current[chosen];
    const el = cutout.current;
    const host = stage.current;
    if (!btn || !el || !host) return;

    const r = btn.getBoundingClientRect();
    const d = r.width;
    const cx = r.left + d / 2;
    const cy = r.top + d / 2;
    const tx = window.innerWidth / 2;
    const ty = window.innerHeight * FLOAT_Y;
    const end = d * FLOAT_SCALE;

    const from = reduced
      ? laddooImageBox(tx, ty, end)
      : laddooImageBox(cx, cy, d);
    el.style.left = `${from.left}px`;
    el.style.top = `${from.top}px`;
    el.style.width = `${from.width}px`;
    el.style.height = `${from.height}px`;
    el.style.transformOrigin = `${from.originX * 100}% ${from.originY * 100}%`;
    if (!reduced) {
      el.style.transform = "none";
      void el.offsetWidth;
      el.style.transform = `translate(${tx - cx}px, ${ty - cy}px) scale(${FLOAT_SCALE})`;
    }
    el.dataset.on = "";

    if (wah.current) wah.current.style.top = `${ty + end / 2 + 16}px`;

    const bite = window.setTimeout(() => {
      setBitten(true);
      latest.current.sound.crunch();
      if (!reduced) crumbs(host, tx, ty, end);
    }, duration.diwaliBiteAt * 1000);
    const done = window.setTimeout(
      () => latest.current.onDone(),
      duration.diwaliPicked * 1000,
    );
    return () => {
      window.clearTimeout(bite);
      window.clearTimeout(done);
    };
  }, [chosen, reduced]);

  const pick = (i: number) => {
    if (phase !== "plate" || chosen !== null) return;
    setChosen(i);
    sound.pop();
    onPick(i);
  };

  const picking = chosen !== null || phase === "picked";

  return (
    <div
      ref={stage}
      className={`${styles.plateStage} ${rozha.variable} ${tiro.variable}`}
      data-picked={picking ? "" : undefined}
    >
      <div className={styles.plateCol}>
        <p className={styles.ask}>
          प्रसाद ग्रहण कीजिए
          <small>Take a laddoo before you go</small>
        </p>
        <div
          role="group"
          aria-label="Plate of laddoos"
          className={styles.plate}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/diwali/laddoo-plate.webp"
            alt=""
            className={styles.plateImg}
            draggable={false}
          />
          {LADDOO_SPOTS.map((spot, i) => {
            const b = spotBox(spot);
            return (
              <button
                key={i}
                ref={(node) => {
                  buttons.current[i] = node;
                }}
                type="button"
                aria-label={`Laddoo ${i + 1}`}
                className={styles.laddooBtn}
                disabled={picking}
                style={{
                  left: `${b.left}%`,
                  top: `${b.top}%`,
                  width: `${b.width}%`,
                  height: `${b.height}%`,
                }}
                onClick={() => pick(i)}
              />
            );
          })}
        </div>
      </div>
      <div ref={cutout} aria-hidden className={styles.cutout}>
        {chosen !== null && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bitten ? BITTEN : LADDOO}
            alt=""
            className={styles.cutoutImg}
            data-bitten={bitten ? "" : undefined}
            draggable={false}
          />
        )}
      </div>
      <p
        ref={wah}
        aria-live="polite"
        className={styles.wah}
        data-on={bitten ? "" : undefined}
      >
        {bitten && (
          <>
            वाह!
            <small>Happy Diwali. Enjoy the rest of it.</small>
          </>
        )}
      </p>
    </div>
  );
}
