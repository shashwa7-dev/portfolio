"use client";

import { useEffect, useRef } from "react";
import s from "@/components/gta6/game/game.module.css";

type Props = {
  /** The title has played out (`--duration-gta-entry`): start the hunt. */
  onDone(): void;
};

/** A custom property's time in ms ("1500ms" or "1.5s"). */
function cssMs(el: Element, name: string): number {
  const d = getComputedStyle(el).getPropertyValue(name).trim();
  return d.endsWith("ms") ? parseFloat(d) : (parseFloat(d) || 0) * 1000;
}

/**
 * The cinematic entry's title card. The letterbox bars and the push-in are
 * the overlay's own (`data-phase="entry"`); this is the "VICE HUNT" slam,
 * whose animation end hands over to play. Under reduced motion it is a plain
 * fade of the same length, so the hand-over still comes. In case
 * `animationend` never fires (a throttled or hidden tab, animations off),
 * a timer a little past `--duration-gta-entry` hands over anyway; whichever
 * comes first wins.
 */
export default function Entry({ onDone }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  const fired = useRef(false);
  useEffect(() => {
    done.current = onDone;
  });
  const finish = () => {
    if (fired.current) return;
    fired.current = true;
    done.current();
  };

  useEffect(() => {
    if (!el.current) return;
    const t = window.setTimeout(finish, cssMs(el.current, "--duration-gta-entry") * 1.25);
    return () => window.clearTimeout(t);
    // finish only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={el} className={s.title} onAnimationEnd={(e) => e.target === e.currentTarget && finish()}>
      <div>
        <h1 className={s.display}>
          VICE <span>HUNT</span>
        </h1>
        <p className={s.mono}>LEONIDA · OPEN SEASON</p>
      </div>
    </div>
  );
}
