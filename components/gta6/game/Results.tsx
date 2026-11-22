"use client";

import { useEffect, useId, useRef } from "react";
import type { Kind } from "@games/vice-hunt";
import { accuracy, hitCount, type Tally } from "@/lib/gta6/streak";
import { breakdown, totalScore } from "@/lib/gta6/score";
import type { Row } from "@/components/gta6/game/Hud";
import s from "@/components/gta6/game/game.module.css";

type Props = {
  tally: Tally;
  /** Every creature in the game, in the registry's order (GameMode's). */
  rows: readonly Row[];
  icons: Record<Kind, string>;
  /** A kind's lone-kill points (the game package's `pointsFor`). */
  pointsFor(kind: Kind): number;
  /** A protected kind's penalty (the game package's `penaltyFor`). */
  penaltyFor(kind: Kind, hitNumber: number, finishing: boolean): number;
  onAgain(): void;
  onBack(): void;
};

/**
 * The card End round (or WASTED) brings up: "Hunt over" in cyan script and
 * the score in pink neon (the clamped fold), then how it was made, one line
 * each: every common animal (kills, "100 each", points), the rares together
 * (named once met), a protected kind once hit (how many brought down and
 * what they cost, in red), the streak bonus and, if a penalty hit the zero
 * floor, what the floor kept; the lines add up to the score
 * (`lib/gta6/score.ts` `breakdown`). Then accuracy and the best streak, then
 * Play again or Back to site. The card is capped at the window's height and
 * the lines scroll inside it, so the buttons never leave the card.
 * A modal dialog: focus lands on Play again, Tab stays between its two
 * buttons, Esc goes back to the site. A press anywhere else on it (the
 * backdrop, the card's text) keeps focus where it is, so focus is never
 * stranded outside the two buttons.
 */
type Line = {
  key: string;
  icon?: string;
  name: string;
  note: string;
  count?: number;
  points: number;
  tone?: "penalty" | "bonus";
};

/** "+1,275", "-1,000", "0". */
function signed(n: number): string {
  const s = Math.abs(n).toLocaleString("en-US");
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : "0";
}

export default function Results({ tally, rows, icons, pointsFor, penaltyFor, onAgain, onBack }: Props) {
  const title = useId();
  const again = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    again.current?.focus();
  }, []);

  const total = totalScore(tally);
  const b = breakdown(tally, pointsFor);
  const earned = (kind: Kind) => b.earned[kind] ?? 0;
  const common = rows.filter((r) => !r.rare && !r.byDowned);
  const rares = rows.filter((r) => r.rare && !r.byDowned);
  const metRares = rares.filter((r) => tally.met.includes(r.kind));
  const lines: Line[] = [
    ...common.map((r) => ({
      key: r.kind,
      icon: icons[r.kind],
      name: r.name,
      note: `${pointsFor(r.kind).toLocaleString("en-US")} each`,
      count: tally.kills[r.kind],
      points: earned(r.kind),
    })),
    {
      key: "rares",
      icon: metRares[0] ? icons[metRares[0].kind] : undefined,
      // The rares' names and points stay a surprise until met.
      name: metRares.length ? metRares.map((r) => r.name).join(" · ") : "???",
      note: "rares",
      count: rares.reduce((n, r) => n + tally.kills[r.kind], 0),
      points: rares.reduce((n, r) => n + earned(r.kind), 0),
    },
    ...rows
      .filter((r) => r.byDowned && tally.met.includes(r.kind))
      .map((r): Line => {
        const perHit = penaltyFor(r.kind, 1, false);
        return {
          key: r.kind,
          icon: icons[r.kind],
          name: r.name,
          note: perHit ? `${perHit.toLocaleString("en-US")} a hit` : "penalty",
          count: tally.downed[r.kind],
          points: earned(r.kind),
          tone: "penalty",
        };
      }),
  ];
  if (b.streakBonus > 0) {
    lines.push({ key: "streak", name: "Streak bonus", note: "double +50% · triple +100%", points: b.streakBonus, tone: "bonus" });
  }
  if (b.floor > 0) {
    lines.push({ key: "floor", name: "Kept at zero", note: "the score never goes below 0", points: b.floor, tone: "bonus" });
  }

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
        className={s.report}
      >
        <div className={s.reportEyebrow}>LEONIDA WILDLIFE REPORT</div>
        <h2 id={title} className={`${s.reportTitle} ${s.neonCyan}`}>
          Hunt over
        </h2>
        <div data-score="" className={`${s.reportScore} ${s.neonPink}`}>
          {total.toLocaleString("en-US")}
          <small>SCORE</small>
        </div>
        <ul className={s.lines}>
          {lines.map((l) => (
            <li key={l.key} className={s.line} data-tone={l.tone}>
              {/* eslint-disable-next-line @next/next/no-img-element -- a sprite data URL from the game package */}
              {l.icon ? <img src={l.icon} alt="" /> : <i aria-hidden />}
              <span>
                {l.name}
                <small>{l.note}</small>
              </span>
              <b>{l.count ?? ""}</b>
              <em>{signed(l.points)}</em>
            </li>
          ))}
        </ul>
        <div className={s.reportFoot}>
          <span>
            Accuracy<b>{accuracy(hitCount(tally), tally.shots)}%</b>
          </span>
          <span>
            Best streak<b>{tally.bestStreak}</b>
          </span>
        </div>
        <div className={s.reportButtons}>
          <button ref={again} type="button" className={`${s.chrome} ${s.chromePink}`} onClick={onAgain}>
            <span>PLAY AGAIN</span>
          </button>
          <button ref={back} type="button" className={`${s.chrome} ${s.chromeDark}`} onClick={onBack}>
            <span>BACK TO SITE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
