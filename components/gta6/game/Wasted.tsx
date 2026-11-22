"use client";

import s from "@/components/gta6/game/game.module.css";

/**
 * Out of hearts: WASTED in red neon over the scene, which GameMode greys at the
 * same moment (`data-wasted` on the overlay). The word comes in over
 * `--duration-gta-wasted` and holds for `--duration-gta-wasted-hold`; the
 * end of that hold (the wrapper's own animation, not the word's) calls
 * `onDone`, which brings up the results card. Under reduced motion the word
 * only fades, and the hold still ends.
 */
export default function Wasted({ onDone }: { onDone(): void }) {
  return (
    <div
      role="status"
      className={s.wasted}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
    >
      <b className={s.neonRed}>WASTED</b>
    </div>
  );
}
