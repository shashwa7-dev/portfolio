"use client";

import { Clock, Moon, Sun, SunHorizon } from "@phosphor-icons/react/ssr";
import type { Kills, Kind } from "@games/vice-hunt";
import type { TimeOfDay } from "@/lib/gta6/timeOfDay";
import Hearts from "@/components/gta6/game/Hearts";
import HudRadio from "@/components/gta6/game/HudRadio";
import RareMenu from "@/components/gta6/game/RareMenu";
import s from "@/components/gta6/game/game.module.css";

export type TimeChoice = TimeOfDay | "auto";

const TIMES: { value: TimeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "morning", label: "Morning", Icon: Sun },
  { value: "evening", label: "Evening", Icon: SunHorizon },
  { value: "night", label: "Night", Icon: Moon },
  { value: "auto", label: "Auto (your local time)", Icon: Clock },
];

/** Every creature's name in the HUD and on the results card. A record, so a
 *  new kind in the game's registry does not compile until it has one. */
export const NAMES: Record<Kind, string> = {
  rabbit: "Rabbits",
  iguana: "Iguanas",
  flamingo: "Flamingos",
  cow: "Flying cow",
  tiger: "Flying tiger",
  shark: "Walking shark",
  merman: "Merman",
  ufo: "UFO",
  bigfoot: "Bigfoot",
  ostrich: "Roller ostrich",
  gator: "Candy gator",
};

/** One creature as the HUD and the results card list it, built by GameMode
 *  from the game's registry (enabled kinds only, in its order). `byDowned`: it
 *  cannot be killed (the cow), so its count is how many were brought down
 *  (one cow is one, whatever its hits). */
export type Row = { kind: Kind; name: string; rare: boolean; byDowned: boolean };

/** Chamber centres round the cylinder, in percent of its box, from the top. */
function chambers(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    return { left: `${50 + Math.cos(a) * 34}%`, top: `${50 + Math.sin(a) * 34}%` };
  });
}

type Props = {
  /** Slid in from the edges (play and results); out of view for the entry. */
  shown: boolean;
  /** Every creature in the game, commons (the chips) and rares (the menu). */
  rows: readonly Row[];
  kills: Kills;
  downed: Record<Kind, number>;
  /** Kinds hit at least once this round. */
  met: readonly Kind[];
  /** 0 to 3, in halves. */
  hearts: number;
  /** Bumped on every rare that comes on or is first hit. */
  rareFlash: number;
  /** Shown big on the billboard (BeachScene); here only for readers. */
  score: number;
  /** The latest kill and how many kills there have been, so the same animal
   *  killed again still lights its chip afresh. */
  latest: { kind: Kind; count: number } | null;
  rounds: number;
  /** The revolver's chambers (the package's `ROUNDS`). */
  capacity: number;
  reloading: boolean;
  time: TimeChoice;
  onTime(choice: TimeChoice): void;
  icons: Record<Kind, string>;
};

/**
 * Layout L1, classic GTA corners (spec, revision 3), with the owner's
 * changes of 2026-11-21: the top is one header row spread edge to edge.
 * Left: the hearts, the icon-only time switch and the radio (a minimised
 * controller that drops the full card on hover). Right (layout C of the
 * rares spec): the hunt count per common animal (a glass chip each; the
 * latest kill's glows pink for a moment), a thin divider, then the RARE
 * menu. The score itself is on the billboard in the scene. Bottom right:
 * the six-round cylinder. Bottom centre: a faint key hint. The middle of
 * the screen stays clear. Only the switch, the radio and the RARE menu take
 * the pointer; the rest lets shots through to the game.
 */
export default function Hud({
  shown,
  rows,
  kills,
  downed,
  met,
  hearts,
  rareFlash,
  score,
  latest,
  rounds,
  capacity,
  reloading,
  time,
  onTime,
  icons,
}: Props) {
  return (
    <div className={s.hud} data-in={shown ? "" : undefined}>
      <div className={s.top}>
        <div className={s.corner}>
          <Hearts hearts={hearts} />
          <div role="group" aria-label="Time of day" className={`${s.time} ${s.glass}`}>
            {TIMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={time === value}
                onClick={() => onTime(value)}
              >
                <Icon aria-hidden weight={time === value ? "fill" : "bold"} />
              </button>
            ))}
          </div>
          <HudRadio />
        </div>

        <div className={s.score}>
          <span className="sr-only">Score: {score.toLocaleString("en-US")}</span>
          <div className={`${s.chips} ${s.display}`}>
            {rows.filter((r) => !r.rare).map(({ kind, name }) => {
              const hot = latest?.kind === kind;
              return (
                <span
                  // A new key restarts the glow on every kill.
                  key={hot ? `${kind}-${latest.count}` : kind}
                  className={`${s.chip} ${s.glass}`}
                  data-hot={hot ? "" : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a sprite data URL from the game package */}
                  <img src={icons[kind]} alt="" />
                  <b aria-label={`${name}: ${kills[kind]}`}>{kills[kind]}</b>
                </span>
              );
            })}
          </div>
          <span aria-hidden className={s.divider} />
          <RareMenu
            rows={rows.filter((r) => r.rare)}
            met={met}
            downed={downed}
            kills={kills}
            icons={icons}
            flash={rareFlash}
          />
        </div>
      </div>

      <div
        role="img"
        aria-label={reloading ? "Reloading" : `${rounds} of ${capacity} rounds`}
        className={`${s.ammo} ${s.glass}`}
      >
        <div className={s.cylinder} data-reloading={reloading ? "" : undefined}>
          {chambers(capacity).map((c, i) => (
            <i key={i} style={c} data-empty={i >= rounds ? "" : undefined} />
          ))}
        </div>
        <span className={`${s.count} ${s.display}`}>
          {rounds}
          <span> / {capacity}</span>
        </span>
      </div>

      <div className={`${s.hint} ${s.mono}`}>ESC PAUSE · R RELOAD</div>
    </div>
  );
}
