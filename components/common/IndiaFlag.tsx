import { SVGProps } from "react";

/**
 * The Indian flag, drawn rather than fetched.
 *
 * Not in `components/SVGS`: everything in that collection is a single path
 * filled with `currentColor`, which is what lets those marks take the theme's
 * ink. This one is four fixed colours and would be the only member that ignores
 * the prop the rest are built around.
 *
 * Inline SVG rather than an image. It renders at 10px beside a 10px label, and
 * at that size a raster thumbnail is a smudge, while this stays crisp at any
 * zoom and costs no request.
 *
 * Official proportions: 3:2, three equal bands, and a chakra whose diameter is
 * three quarters of the white band's height.
 */

const SAFFRON = "#FF9933";
const GREEN = "#138808";
const NAVY = "#000080";

const W = 36;
const H = 24;
const BAND = H / 3;
const CX = W / 2;
const CY = H / 2;
const CHAKRA_R = (BAND * 3) / 4 / 2;

/**
 * Twenty-four spokes, kept even though almost nobody will resolve them.
 *
 * At the size this renders, each spoke is about a tenth of a pixel wide and
 * antialiases into a wash rather than a line. That is not a reason to drop
 * them: the wash is what makes the chakra read as a wheel with weight in it
 * instead of a flat navy dot, and it is the same thing that happens to a real
 * flag seen from across a room. They also come back properly if this is ever
 * rendered larger.
 */
const SPOKES = Array.from({ length: 24 }, (_, i) => i * 15);

const IndiaFlag = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} {...props}>
    <rect x={0} y={0} width={W} height={BAND} fill={SAFFRON} />
    <rect x={0} y={BAND} width={W} height={BAND} fill="#FFFFFF" />
    <rect x={0} y={BAND * 2} width={W} height={BAND} fill={GREEN} />

    <g stroke={NAVY} fill="none">
      <circle cx={CX} cy={CY} r={CHAKRA_R} strokeWidth={0.55} />
      {SPOKES.map((deg) => (
        <line
          key={deg}
          x1={CX}
          y1={CY - 0.6}
          x2={CX}
          y2={CY - CHAKRA_R + 0.3}
          strokeWidth={0.25}
          transform={`rotate(${deg} ${CX} ${CY})`}
        />
      ))}
    </g>
    <circle cx={CX} cy={CY} r={0.6} fill={NAVY} />

    {/* A hairline, because the middle band is white and the surfaces this sits
        on are white or near it. Without an edge the flag loses its centre in
        light mode and reads as two disconnected bars. `currentColor` rather
        than a token so it inherits whatever the label beside it is using, which
        is how it stays right in both themes. Inset by half the stroke, since a
        stroke straddles the path and the outer half would be clipped. */}
    <rect
      x={0.5}
      y={0.5}
      width={W - 1}
      height={H - 1}
      fill="none"
      stroke="currentColor"
      strokeOpacity={0.2}
      strokeWidth={1}
    />
  </svg>
);

export default IndiaFlag;
