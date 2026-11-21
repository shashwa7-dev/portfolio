"use client";

import { Clock, Moon, Star, Sun, SunHorizon } from "@phosphor-icons/react/ssr";
import type { Kills, Kind } from "@games/vice-hunt";
import type { TimeOfDay } from "@/lib/gta6/timeOfDay";
import HudRadio from "@/components/gta6/game/HudRadio";
import s from "@/components/gta6/game/game.module.css";

export type TimeChoice = TimeOfDay | "auto";

const TIMES: { value: TimeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "morning", label: "Morning", Icon: Sun },
  { value: "evening", label: "Evening", Icon: SunHorizon },
  { value: "night", label: "Night", Icon: Moon },
  { value: "auto", label: "Auto (your local time)", Icon: Clock },
];

export const KINDS: { kind: Kind; name: string }[] = [
  { kind: "rabbit", name: "Rabbits" },
  { kind: "iguana", name: "Iguanas" },
  { kind: "flamingo", name: "Flamingos" },
  { kind: "bigfoot", name: "Bigfoot" },
];

const STARS = [0, 1, 2, 3, 4];

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
  kills: Kills;
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
 * changes of 2026-11-21: the top is one header row spread edge to edge, the
 * icon-only time switch and the radio (a minimised controller that drops
 * the full card on hover) on the left, the hunt count per animal (a glass
 * chip each; the latest kill's glows pink for a moment) and the wanted stars
 * on the right. The score itself is on the billboard in the scene. Bottom
 * right: the six-round cylinder. Bottom centre: a faint key hint. The
 * middle of the screen stays clear. Only the switch and the radio take the
 * pointer; the rest lets shots through to the game.
 */
export default function Hud({ shown, kills, score, latest, rounds, capacity, reloading, time, onTime, icons }: Props) {
  return (
    <div className={s.hud} data-in={shown ? "" : undefined}>
      <div className={s.top}>
        <div className={s.corner}>
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
            {KINDS.map(({ kind, name }) => {
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
          <div role="img" aria-label="Wanted: five stars" className={s.stars}>
            {STARS.map((n) => (
              <Star key={n} aria-hidden weight="fill" />
            ))}
          </div>
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

      <div className={`${s.hint} ${s.mono}`}>ESC EXIT · R RELOAD</div>
    </div>
  );
}
