import { useId } from "react";

/**
 * The goggles that slide onto the hero portrait on hover (see AvatarHover).
 * Drawn after the Oakley Over The Top in matte black: two horns that sweep up
 * into the hair, a strap between them, and one riveted visor with a fire-red
 * mirror lens across both eyes.
 *
 * The visor is centred on (100, 134) in the 200 x 176 drawing, between lens
 * centres at x 62 and 138, which is what lines it up on the portrait's glasses.
 */

// Horns stop at y32, which lands inside the portrait's hair rather than
// poking above the head.
const HORN = "M38 114 C26 90.3 28 58.8 41 32 C43 28.1 48 28.9 48 32.8 C46 60.4 52 87.2 74 109.3 C62 106.1 48 106.1 38 114 Z";
const RIM = "M26 118 Q100 104 174 118 Q178 146 162 160 Q140 168 118 156 Q100 146 82 156 Q60 168 38 160 Q22 146 26 118 Z";
const LENS = "M33 123 Q100 111 167 123 Q170 143 157 154 Q140 160 120 150 Q100 140 80 150 Q60 160 43 154 Q30 143 33 123 Z";
const RIVETS = [[40, 121], [70, 115], [100, 112], [130, 115], [160, 121]];

export default function Goggles({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 200 176" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a5a5a" />
          <stop offset=".5" stopColor="#2b2b2b" />
          <stop offset="1" stopColor="#111111" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b6b6b" />
          <stop offset=".55" stopColor="#3b3b3b" />
          <stop offset="1" stopColor="#1e1e1e" />
        </linearGradient>
        <radialGradient id={`${id}l`} cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset=".5" stopColor="#ff5a1f" />
          <stop offset="1" stopColor="#a8120a" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <path d={LENS} />
        </clipPath>
      </defs>

      <path d="M57 38 C60 80 82 110 100 112 C118 110 140 80 143 38" fill="none" stroke={`url(#${id}f)`} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
      {[false, true].map((mirrored) => (
        <g key={String(mirrored)} transform={mirrored ? "translate(200 0) scale(-1 1)" : undefined}>
          <path d={HORN} fill={`url(#${id}f)`} stroke="#000" strokeWidth={1.2} />
          <path d="M38 59 l0 4 M34 89 l0 4" stroke="#000" strokeWidth={2} strokeLinecap="round" />
        </g>
      ))}
      <path d={RIM} fill={`url(#${id}r)`} stroke="#000" strokeWidth={1.2} />
      <g fill="#000" opacity={0.8}>
        {RIVETS.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={1.6} />
        ))}
      </g>
      <path d={LENS} fill={`url(#${id}l)`} stroke="#4a0805" strokeWidth={1.2} />
      <ellipse cx={62} cy={126} rx={20} ry={3.6} transform="rotate(-6 62 126)" fill="#fff" opacity={0.38} />
      {/* One glint across the lens once it lands; `.goggles-glint` in globals.css. */}
      <g clipPath={`url(#${id}c)`}>
        <rect className="goggles-glint" x={0} y={96} width={20} height={80} fill="#fff" opacity={0.55} transform="skewX(-20)" />
      </g>
    </svg>
  );
}
