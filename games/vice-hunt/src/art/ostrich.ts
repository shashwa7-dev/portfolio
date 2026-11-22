/**
 * The roller ostrich's art: look B, "Sunset Leopard" (owner, 2026-11-22),
 * from docs/superpowers/reference/vice-hunt-ostrich-motion.html. Every part
 * is a complete SVG document in the bird's 130 x 180 box (facing right), so
 * the parts stack exactly; the drawing code turns the legs about the hip and
 * the neck about its base. Two whole frames serve the HUD icon.
 */

const O = "#2b2234";
const C = {
  body: "#ff8a1f",
  body2: "#ff3d8b",
  spot: "#4b1d6e",
  spot2: "#b05cff",
  plume: "#1fe0c4",
  plume2: "#9b5cff",
  wing: "#d63a7a",
  neck: "#ffd23f",
  ring: "#ff8a1f",
  head: "#ffd23f",
  fuzz: "#9b5cff",
  beak: "#ff5a3d",
  leg: "#ffd23f",
  legF: "#d9ad2a",
  skate: "#9b5cff",
  skateF: "#7340c9",
  wheel: "#1fe0c4",
  wheelF: "#17ad98",
  bare: "#f6bcae",
  bareShade: "#d98a7d",
} as const;

export type OstrichPart =
  | "ostLegF"
  | "ostLegN"
  | "ostTail"
  | "ostBody"
  | "ostBare"
  | "ostWing"
  | "ostNeck"
  | "ostCollar"
  | "ostNeckShock";

const doc = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="156" height="216" viewBox="0 0 130 180">${inner}</svg>`;

const BODY = "M22 84 C22 66 40 58 60 60 C80 62 92 72 92 86 C92 102 76 112 56 112 C36 112 22 102 22 84 Z";
const NECK = "M80 74 C90 60 90 44 95 28";

const skate = (far: boolean) =>
  `<g stroke="${O}" stroke-width="1.8" stroke-linejoin="round">` +
  `<path d="M52 152 C52 144 58 141 64 143 L67 151 L79 153 C84 154 84 161 79 161 L52 161 Z" fill="${far ? C.skateF : C.skate}"/>` +
  `<path d="M53 156.5 L82 156.5" stroke="#fff" stroke-width="2"/>` +
  `<rect x="50" y="161" width="34" height="3.5" rx="1.5" fill="#3a2f3f"/>` +
  `<circle cx="56" cy="168" r="5" fill="${far ? C.wheelF : C.wheel}"/><circle cx="77" cy="168" r="5" fill="${far ? C.wheelF : C.wheel}"/>` +
  `</g><circle cx="56" cy="168" r="1.8" fill="#fff"/><circle cx="77" cy="168" r="1.8" fill="#fff"/>`;

const leg = (far: boolean) =>
  `<path d="M58 100 L52 128 L62 150" fill="none" stroke="${O}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M58 100 L52 128 L62 150" fill="none" stroke="${far ? C.legF : C.leg}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>` +
  skate(far);

const TAIL =
  `<path d="M28 70 C14 54 0 62 6 72 C-4 74 -2 88 10 86 C2 96 12 104 26 94 Z" fill="${C.plume2}" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/>` +
  `<path d="M27 74 C15 64 6 70 11 78 C4 82 6 92 15 89 C10 96 18 100 28 92 Z" fill="${C.plume}" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/>`;

const ROSETTES: readonly [number, number][] = [
  [32, 74], [44, 66], [58, 66], [72, 70], [84, 80], [38, 90], [52, 82], [66, 84], [80, 94], [46, 102], [62, 100], [30, 100],
];

const BODY_PART =
  `<defs><linearGradient id="ostG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.body}"/><stop offset="1" stop-color="${C.body2}"/></linearGradient>` +
  `<clipPath id="ostC"><path d="${BODY}"/></clipPath></defs>` +
  `<path d="${BODY}" fill="url(#ostG)"/>` +
  `<g clip-path="url(#ostC)">` +
  ROSETTES.map(
    ([x, y], i) =>
      `<ellipse cx="${x}" cy="${y}" rx="${3.6 + (i % 3) * 0.6}" ry="${2.8 + (i % 2) * 0.6}" fill="${C.spot2}" stroke="${C.spot}" stroke-width="1.8" stroke-dasharray="5 2.5" transform="rotate(${i * 23} ${x} ${y})"/>`,
  ).join("") +
  `</g><path d="${BODY}" fill="none" stroke="${O}" stroke-width="2"/>`;

const BUMPS: readonly [number, number][] = [
  [36, 78], [44, 72], [52, 70], [62, 70], [72, 74], [80, 80], [40, 92], [50, 96], [62, 98], [74, 94], [84, 88], [32, 88], [56, 84], [68, 86], [46, 84],
];

const BARE =
  `<path d="M28 80 C20 75 15 80 20 84 C15 87 20 92 27 89" fill="${C.bare}" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/>` +
  `<path d="M23 80 C17 70 19 63 25 65 C25 71 25 76 23 80 Z" fill="${C.plume}" stroke="${O}" stroke-width="1.4"/>` +
  `<path d="M26 86 C24 70 40 62 58 63 C78 64 90 74 90 87 C90 101 76 109 57 109 C38 109 27 100 26 86 Z" fill="${C.bare}" stroke="${O}" stroke-width="2"/>` +
  BUMPS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${C.bareShade}"/>`).join("") +
  `<path d="M54 80 C62 76 72 78 74 84 C68 88 60 88 54 84 Z" fill="${C.bare}" stroke="${O}" stroke-width="1.8"/>`;

const WING =
  `<path d="M40 76 C52 70 72 72 80 82 C70 90 52 92 40 86 Z" fill="${C.wing}" stroke="${O}" stroke-width="1.8"/>` +
  `<path d="M40 76 C30 75 24 83 27 91 C34 93 40 90 42 86 Z" fill="${C.plume}" stroke="${O}" stroke-width="1.8"/>` +
  `<path d="M48 80 C56 78 66 79 72 83" fill="none" stroke="${C.plume2}" stroke-width="2" stroke-linecap="round"/>`;

const NECK_BASE =
  `<path d="${NECK}" fill="none" stroke="${O}" stroke-width="11" stroke-linecap="round"/>` +
  `<path d="${NECK}" fill="none" stroke="${C.neck}" stroke-width="8" stroke-linecap="round"/>` +
  `<path d="M84 63 l6 -1 M87 53 l6 -1 M89 43 l6 -1 M91 35 l5 -1" stroke="${C.ring}" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="98" cy="22" r="10" fill="${C.head}" stroke="${O}" stroke-width="2"/>`;

const COLLAR = `<path d="M70 72 C74 62 86 60 91 68 C88 77 76 80 70 72 Z" fill="${C.plume}" stroke="${O}" stroke-width="1.8"/>`;

const NECK_CALM =
  NECK_BASE +
  `<path d="M90 14 l2 -7 l2 6 l3 -8 l2 7 l3 -6 l1 6" fill="none" stroke="${C.fuzz}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M106 20 C112 20 120 22 124 25 C120 28 112 28 106 27 Z" fill="${C.beak}" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/>` +
  `<circle cx="101" cy="18" r="5" fill="#fff" stroke="${O}" stroke-width="1.6"/>` +
  `<circle cx="102.4" cy="18.2" r="2.6" fill="${O}"/><circle cx="103.2" cy="17.2" r=".9" fill="#fff"/>` +
  `<path d="M97 12.5 l-2 -3 M100.5 11.5 l0 -3.5 M104 12 l2 -3" stroke="${O}" stroke-width="1.4" stroke-linecap="round"/>`;

const NECK_SHOCK =
  NECK_BASE +
  `<path d="M106 19 C112 16 120 15 124 17 C118 21 112 22 106 23 Z" fill="${C.beak}" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/>` +
  `<path d="M106 25 C112 27 118 30 122 33 C116 34 110 31 106 29 Z" fill="${C.beak}" stroke="${O}" stroke-width="1.8" stroke-linejoin="round"/>` +
  `<circle cx="101" cy="17" r="7" fill="#fff" stroke="${O}" stroke-width="1.6"/>` +
  `<circle cx="102" cy="17" r="1.4" fill="${O}"/>` +
  `<ellipse cx="93" cy="27" rx="3" ry="1.6" fill="#ff7f8f" opacity=".8"/>`;

export const OSTRICH_EXTRA: Record<OstrichPart, string> = {
  ostLegF: doc(leg(true)),
  ostLegN: doc(leg(false)),
  ostTail: doc(TAIL),
  ostBody: doc(BODY_PART),
  ostBare: doc(BARE),
  ostWing: doc(WING),
  ostNeck: doc(NECK_CALM),
  ostCollar: doc(COLLAR),
  ostNeckShock: doc(NECK_SHOCK),
};

const whole = (nearLeg: number) =>
  doc(
    `<g transform="rotate(${-nearLeg} 58 100)">${leg(true)}</g>` +
      `<g transform="rotate(${nearLeg} 58 100)">${leg(false)}</g>` +
      TAIL +
      BODY_PART +
      WING +
      NECK_CALM +
      COLLAR,
  );

/** Two whole frames, the near leg back then the far one, for the HUD icon. */
export const OSTRICH_FRAMES: readonly [string, string] = [whole(18), whole(-18)];
