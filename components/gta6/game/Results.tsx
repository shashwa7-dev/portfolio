"use client";

import { useEffect, useId, useRef } from "react";
import type { Kind } from "@games/vice-hunt";
import { accuracy, hitCount, type Tally } from "@/lib/gta6/streak";
import { totalScore } from "@/lib/gta6/score";
import type { Row } from "@/components/gta6/game/Hud";
import s from "@/components/gta6/game/game.module.css";

type Props = {
  tally: Tally;
  /** Every creature in the game, in the registry's order (GameMode's). */
  rows: readonly Row[];
  icons: Record<Kind, string>;
  /** A kind's lone-kill points (the game package's `pointsFor`). */
  pointsFor(kind: Kind): number;
  onAgain(): void;
  onBack(): void;
};

/**
 * The card Esc (or WASTED) brings up: the score first (the clamped fold)
 * with the common animals' points under it, then every creature two to a
 * line (kills; how many were brought down, in red, for one that cannot be killed, the cow; a rare
 * not met this round is a silhouette and "???"), accuracy (hits over shots)
 * and the best streak, then Play again or Back to site.
 * A modal dialog: focus lands on Play again, Tab stays between its two
 * buttons, Esc goes back to the site. A press anywhere else on it (the
 * backdrop, the card's text) keeps focus where it is, so focus is never
 * stranded outside the two buttons.
 */
export default function Results({ tally, rows, icons, pointsFor, onAgain, onBack }: Props) {
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
    <div
      className={s.results}
      onMouseDown={(e) => {
        if (!(e.target instanceof Element && e.target.closest("button"))) e.preventDefault();
      }}
    >
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
        <div data-score="" className={`${s.finalScore} ${s.display}`}>
          {totalScore(tally).toLocaleString("en-US")}
          <small className={s.mono}>SCORE</small>
        </div>
        {/* The rares' points stay a surprise. */}
        <p className={`${s.points} ${s.mono}`}>
          <span>
            {rows
              .filter((r) => !r.rare)
              .map(({ kind }) => `${kind.toUpperCase()} ${pointsFor(kind)}`)
              .join(" · ")}
          </span>
          <span>DOUBLE +50% · TRIPLE +100%</span>
        </p>
        <dl className={s.table}>
          {rows.map(({ kind, name, rare, byDowned }, i) => {
            const seen = !rare || tally.met.includes(kind);
            return (
              <div key={kind} className="contents">
                <dt data-col={i % 2} data-unmet={seen ? undefined : ""}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a sprite data URL from the game package */}
                  <img src={icons[kind]} alt="" />
                  {seen ? name : "???"}
                </dt>
                <dd className={s.display} data-hits={seen && byDowned ? "" : undefined}>
                  {byDowned ? tally.downed[kind] : tally.kills[kind]}
                  {seen && byDowned && <span className="sr-only"> brought down</span>}
                </dd>
              </div>
            );
          })}
          <dt data-rule="" data-col={0}>
            Accuracy
          </dt>
          <dd data-rule="" className={s.display}>{accuracy(hitCount(tally), tally.shots)}%</dd>
          <dt data-rule="" data-col={1}>
            Best streak
          </dt>
          <dd data-rule="" className={s.display}>{tally.bestStreak}</dd>
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
