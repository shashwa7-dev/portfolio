import { useId } from "react";

/**
 * The goggles that slide onto the hero portrait on hover (see AvatarHover).
 * Drawn after the Oakley Over The Top: two horns that sweep up over the head,
 * a strap between them, riveted rims and mirrored lenses.
 *
 * Four looks, each a fixed shape and colour, shown in this order, one per
 * hover. Every shape keeps its lens centres at (62, 134) and (138, 134) in the
 * 200 x 176 drawing, which is what lines them all up on the portrait's glasses.
 */
export const GOGGLES = [
  { shape: "round", colour: "gold" },
  { shape: "oval", colour: "chrome" },
  { shape: "visor", colour: "stealth" },
  { shape: "hex", colour: "volt" },
] as const;

type Shape = (typeof GOGGLES)[number]["shape"];
type Colour = (typeof GOGGLES)[number]["colour"];

type Palette = {
  frame: [string, string, string];
  edge: string;
  rim: [string, string, string];
  rimEdge: string;
  lens: [string, string, string];
  lensEdge: string;
};

const PALETTES: Record<Colour, Palette> = {
  gold: { frame: ["#fbe7a1", "#d9a842", "#a9802f"], edge: "#8b6a2a", rim: ["#f4f3ef", "#bdbab3", "#8d8a84"], rimEdge: "#6f6c66", lens: ["#ffe680", "#f5ad12", "#c46a00"], lensEdge: "#5a3a08" },
  chrome: { frame: ["#ffffff", "#c9ced3", "#8b939b"], edge: "#6c737a", rim: ["#9aa1a8", "#5d646b", "#3a3f44"], rimEdge: "#2c3034", lens: ["#d9f6ff", "#49aee8", "#14538f"], lensEdge: "#0d3354" },
  stealth: { frame: ["#5a5a5a", "#2b2b2b", "#111111"], edge: "#000000", rim: ["#6b6b6b", "#3b3b3b", "#1e1e1e"], rimEdge: "#000000", lens: ["#ffd27a", "#ff5a1f", "#a8120a"], lensEdge: "#4a0805" },
  volt: { frame: ["#eef0ee", "#b5bab6", "#7d827e"], edge: "#5f6460", rim: ["#dfe2df", "#a3a8a4", "#6e736f"], rimEdge: "#4d524e", lens: ["#f7ffb0", "#c9f02a", "#6f9600"], lensEdge: "#3d5200" },
};

const LEFT = 62;
const RIGHT = 138;

/** Points around an ellipse, clockwise from the top. */
function ring(cx: number, cy: number, rx: number, ry: number, n: number, offset = 0): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (i * 2 * Math.PI) / n;
    return [cx + rx * Math.sin(a), cy - ry * Math.cos(a)];
  });
}

function hexPoints(cx: number, cy: number, r: number): string {
  return ring(cx, cy, r, r, 6, Math.PI / 6)
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
}

const VISOR_RIM = "M26 118 Q100 104 174 118 Q178 146 162 160 Q140 168 118 156 Q100 146 82 156 Q60 168 38 160 Q22 146 26 118 Z";
const VISOR_LENS = "M33 123 Q100 111 167 123 Q170 143 157 154 Q140 160 120 150 Q100 140 80 150 Q60 160 43 154 Q30 143 33 123 Z";

/** The rim, or the lens when `inset`, for one eye (or the whole visor). */
function LensShape({ shape, cx, inset }: { shape: Shape; cx: number; inset: boolean }) {
  switch (shape) {
    case "round":
      return <circle cx={cx} cy={134} r={inset ? 24 : 30} />;
    case "oval":
      return <ellipse cx={cx} cy={136} rx={inset ? 29 : 35} ry={inset ? 17.5 : 23} />;
    case "hex":
      return <polygon points={hexPoints(cx, 134, inset ? 25.5 : 32)} />;
    case "visor":
      return <path d={inset ? VISOR_LENS : VISOR_RIM} />;
  }
}

function rivets(shape: Shape): [number, number][] {
  switch (shape) {
    case "round":
      return [...ring(LEFT, 134, 27.3, 27.3, 8), ...ring(RIGHT, 134, 27.3, 27.3, 8)];
    case "oval":
      return [...ring(LEFT, 136, 32, 20.3, 8), ...ring(RIGHT, 136, 32, 20.3, 8)];
    case "hex":
      return [...ring(LEFT, 134, 28.5, 28.5, 6, Math.PI / 6), ...ring(RIGHT, 134, 28.5, 28.5, 6, Math.PI / 6)];
    case "visor":
      return [[40, 121], [70, 115], [100, 112], [130, 115], [160, 121]];
  }
}

export default function Goggles({ shape, colour, className }: { shape: Shape; colour: Colour; className?: string }) {
  const id = useId().replace(/:/g, "");
  const p = PALETTES[colour];
  const visor = shape === "visor";
  // The visor is one piece across both eyes; every other shape is a pair.
  const eyes = (inset: boolean) =>
    visor ? (
      <LensShape shape={shape} cx={100} inset={inset} />
    ) : (
      <>
        <LensShape shape={shape} cx={LEFT} inset={inset} />
        <LensShape shape={shape} cx={RIGHT} inset={inset} />
      </>
    );
  // Horns stop at y32, which lands inside the portrait's hair rather than
  // poking above the head.
  const horn = "M38 114 C26 90.3 28 58.8 41 32 C43 28.1 48 28.9 48 32.8 C46 60.4 52 87.2 74 109.3 C62 106.1 48 106.1 38 114 Z";

  return (
    <svg viewBox="0 0 200 176" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.frame[0]} />
          <stop offset=".5" stopColor={p.frame[1]} />
          <stop offset="1" stopColor={p.frame[2]} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.rim[0]} />
          <stop offset=".55" stopColor={p.rim[1]} />
          <stop offset="1" stopColor={p.rim[2]} />
        </linearGradient>
        <radialGradient id={`${id}l`} cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor={p.lens[0]} />
          <stop offset=".5" stopColor={p.lens[1]} />
          <stop offset="1" stopColor={p.lens[2]} />
        </radialGradient>
        <clipPath id={`${id}c`}>{eyes(true)}</clipPath>
      </defs>

      <path d="M57 38 C60 80 82 110 100 112 C118 110 140 80 143 38" fill="none" stroke={`url(#${id}f)`} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
      {[false, true].map((mirrored) => (
        <g key={String(mirrored)} transform={mirrored ? "translate(200 0) scale(-1 1)" : undefined}>
          <path d={horn} fill={`url(#${id}f)`} stroke={p.edge} strokeWidth={1.2} />
          <path d="M38 59 l0 4 M34 89 l0 4" stroke={p.edge} strokeWidth={2} strokeLinecap="round" />
        </g>
      ))}
      {!visor && <rect x={86} y={125} width={28} height={16} rx={6} fill={`url(#${id}r)`} stroke={p.rimEdge} strokeWidth={1.2} />}
      <g fill={`url(#${id}r)`} stroke={p.rimEdge} strokeWidth={1.2}>{eyes(false)}</g>
      <g fill={p.rimEdge} opacity={0.8}>
        {rivets(shape).map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={1.6} />
        ))}
      </g>
      <g fill={`url(#${id}l)`} stroke={p.lensEdge} strokeWidth={1.2}>{eyes(true)}</g>
      <g fill="#fff" opacity={0.38}>
        {visor ? (
          <ellipse cx={62} cy={126} rx={20} ry={3.6} transform="rotate(-6 62 126)" />
        ) : (
          <>
            <ellipse cx={53} cy={125} rx={8.5} ry={4.2} transform="rotate(-35 53 125)" />
            <ellipse cx={129} cy={125} rx={8.5} ry={4.2} transform="rotate(-35 129 125)" />
          </>
        )}
      </g>
      {/* One glint across the lenses once they land; `.goggles-glint` in globals.css. */}
      <g clipPath={`url(#${id}c)`}>
        <rect className="goggles-glint" x={0} y={96} width={20} height={80} fill="#fff" opacity={0.55} transform="skewX(-20)" />
      </g>
    </svg>
  );
}
