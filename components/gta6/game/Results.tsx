"use client";

import { useEffect, useId, useRef } from "react";
import type { Kind } from "@games/vice-hunt";
import { accuracy, type Tally } from "@/lib/gta6/streak";
import { KINDS } from "@/components/gta6/game/Hud";
import s from "@/components/gta6/game/game.module.css";

type Props = {
  tally: Tally;
  icons: Record<Kind, string>;
  onAgain(): void;
  onBack(): void;
};

/**
 * The card Esc brings up: kills per animal, accuracy (hits over shots) and
 * the best streak, then Play again or Back to site. A modal dialog: focus
 * lands on Play again, Tab stays between its two buttons, Esc goes back to
 * the site.
 */
export default function Results({ tally, icons, onAgain, onBack }: Props) {
  const title = useId();
  const again = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    again.current?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onBack();
    } else if (e.key === "Tab") {
      // Two buttons: Tab and Shift+Tab simply swap between them.
      e.preventDefault();
      (document.activeElement === again.current ? back : again).current?.focus();
    }
  };

  return (
    <div className={s.results}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title}
        onKeyDown={onKeyDown}
        className={`${s.card} ${s.glass}`}
      >
        <div className={`${s.sub} ${s.mono}`}>LEONIDA WILDLIFE REPORT</div>
        <h2 id={title} className={s.display}>
          HUNT OVER
        </h2>
        <dl className={s.table}>
          {KINDS.map(({ kind, name }) => (
            <div key={kind} className="contents">
              <dt>
                {/* eslint-disable-next-line @next/next/no-img-element -- a sprite data URL from the game package */}
                <img src={icons[kind]} alt="" />
                {name}
              </dt>
              <dd className={s.display}>{tally.kills[kind]}</dd>
            </div>
          ))}
          <dt data-rule="">Accuracy</dt>
          <dd data-rule="" className={s.display}>{accuracy(tally.hits, tally.shots)}%</dd>
          <dt>Best streak</dt>
          <dd className={s.display}>{tally.bestStreak}</dd>
        </dl>
        <div className={s.buttons}>
          <button ref={again} type="button" className={s.primary} onClick={onAgain}>
            Play again
          </button>
          <button ref={back} type="button" onClick={onBack}>
            Back to site
          </button>
        </div>
      </div>
    </div>
  );
}
