import s from "@/components/gta6/game/game.module.css";

/** The site dock's side shapes, copied from `components/Navbar.tsx` so the
 *  game's controls sit in the same notch. Keep them in step with it. */
const OUTER_SIDE = "M 0 54 A 14 14 0 0 0 12.98 45.24 L 25.2 15.01 A 24 24 0 0 1 47.45 0 H 48.45 V 54 H 0 Z";
const INNER_SIDE = "M 0 48 L 14.85 11.26 A 18 18 0 0 1 31.53 0 H 32.53 V 48 H 0 Z";
const INNER_EDGE = "M 0 48.5 A 0.5 0.5 0 0 0 0.46 48.19 L 15.31 11.44 A 17.5 17.5 0 0 1 31.53 0.5 H 32.53";

export type Control = { key: "mouse" | string; label: string };

function MouseIcon() {
  return (
    <svg className={s.mouseIcon} viewBox="0 0 22 32">
      <rect x="1" y="1" width="20" height="30" rx="10" fill="#fff" stroke="#1a0b33" strokeWidth="2" />
      {/* the left button, the one that shoots */}
      <path d="M1 12h10V1" fill="#ff3ea5" stroke="#1a0b33" strokeWidth="2" />
    </svg>
  );
}

function Sides({ outer }: { outer: boolean }) {
  const side = (cls: string) =>
    outer ? (
      <svg className={cls} width="48.45" height="54" viewBox="0 0 48.45 54">
        <path d={OUTER_SIDE} fill="currentColor" />
      </svg>
    ) : (
      <svg className={cls} width="32.53" height="48" viewBox="0 0 32.53 48">
        <path d={INNER_SIDE} fill="currentColor" />
        <path d={INNER_EDGE} className={s.notchEdge} />
      </svg>
    );
  return (
    <div className={`${s.notchLayer} ${outer ? s.notchOuter : s.notchInner}`}>
      {side(s.notchLeft)}
      <div className={s.notchStrip} />
      {side(s.notchRight)}
    </div>
  );
}

/**
 * The controls hint on the title screen and the pause menu: a dark tab out of
 * the bottom edge in the site dock's shape, with keycaps and a mouse icon.
 * Decoration only (`aria-hidden`): the buttons above it carry their names.
 */
export default function ControlsNotch({ items }: { items: Control[] }) {
  return (
    <div aria-hidden className={s.notch}>
      <Sides outer />
      <Sides outer={false} />
      <div className={s.notchItems}>
        {items.map((c) => (
          <span key={c.label} className={s.notchItem}>
            {c.key === "mouse" ? <MouseIcon /> : <span className={s.keycap}>{c.key}</span>}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
