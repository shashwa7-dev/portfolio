"use client";

import s from "@/components/gta6/game/game.module.css";

type Props = {
  /** The title has played out (`--duration-gta-entry`): start the hunt. */
  onDone(): void;
};

/**
 * The cinematic entry's title card. The letterbox bars and the push-in are
 * the overlay's own (`data-phase="entry"`); this is the "VICE HUNT" slam,
 * whose animation end hands over to play. Under reduced motion it is a plain
 * fade of the same length, so the hand-over still comes.
 */
export default function Entry({ onDone }: Props) {
  return (
    <div className={s.title} onAnimationEnd={(e) => e.target === e.currentTarget && onDone()}>
      <div>
        <h1 className={s.display}>
          VICE <span>HUNT</span>
        </h1>
        <p className={s.mono}>LEONIDA · OPEN SEASON</p>
      </div>
    </div>
  );
}
