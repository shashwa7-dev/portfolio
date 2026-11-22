// Builds src/art/rares.ts from the owner-approved drawings in art-src/rares/.
// Run: node games/vice-hunt/art-src/build-rares.mjs
//
// The prototype (docs/superpowers/reference/vice-hunt-rares-motion.html)
// moves grouped parts with CSS: `transform-box: fill-box` plus a
// `transform-origin` in percent of the part's own box. A canvas image has no
// CSS, so each pose is baked here as a plain SVG `transform` about a pivot
// computed from the part's exact geometric bounding box (Bezier extrema
// included, stroke excluded, as fill-box does). Node built-ins only.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "rares");
const OUT = join(here, "..", "src", "art", "rares.ts");

const read = (name) => readFileSync(join(SRC, name), "utf8");

// --- tidy ------------------------------------------------------------------

function tidy(svg) {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

// Root tag with explicit size; the viewBox is kept as drawn.
function sized(svg, width, height) {
  return svg.replace(/^<svg\b([^>]*)>/, (_, attrs) => {
    const rest = attrs.replace(/\s(width|height)="[^"]*"/g, "");
    const vb = rest.match(/viewBox="([^"]*)"/)[1];
    const ns = 'xmlns="http://www.w3.org/2000/svg"';
    return `<svg ${ns} width="${width}" height="${height}" viewBox="${vb}">`;
  });
}

// --- geometry ----------------------------------------------------------------

function cubicExtrema(p0, p1, p2, p3) {
  // Roots of the derivative of a cubic Bezier in one axis, within (0, 1).
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  const ts = [];
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) ts.push(-c / b);
  } else {
    const d = b * b - 4 * a * c;
    if (d >= 0) {
      const s = Math.sqrt(d);
      ts.push((-b + s) / (2 * a), (-b - s) / (2 * a));
    }
  }
  return ts.filter((t) => t > 0 && t < 1);
}

const cubicAt = (p0, p1, p2, p3, t) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3;

function pathPoints(d) {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g);
  const pts = [];
  let i = 0;
  let cmd = "";
  let x = 0, y = 0, sx = 0, sy = 0;
  let lastC = null; // last cubic control point, for S
  let lastQ = null; // last quadratic control point, for T
  const num = () => parseFloat(tokens[i++]);
  const cubic = (x1, y1, x2, y2, ex, ey) => {
    for (const t of cubicExtrema(x, x1, x2, ex)) pts.push([cubicAt(x, x1, x2, ex, t), cubicAt(y, y1, y2, ey, t)]);
    for (const t of cubicExtrema(y, y1, y2, ey)) pts.push([cubicAt(x, x1, x2, ex, t), cubicAt(y, y1, y2, ey, t)]);
    pts.push([ex, ey]);
    lastC = [x2, y2];
    x = ex;
    y = ey;
  };
  const quad = (qx, qy, ex, ey) => {
    // Elevate to a cubic: exact same curve.
    const sx0 = x, sy0 = y;
    cubic(sx0 + (2 / 3) * (qx - sx0), sy0 + (2 / 3) * (qy - sy0), ex + (2 / 3) * (qx - ex), ey + (2 / 3) * (qy - ey), ex, ey);
    lastQ = [qx, qy];
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    const C = cmd.toUpperCase();
    if (C !== "C" && C !== "S") lastC = null;
    if (C !== "Q" && C !== "T") lastQ = null;
    switch (C) {
      case "M":
        x = ox + num(); y = oy + num(); sx = x; sy = y; pts.push([x, y]);
        cmd = rel ? "l" : "L";
        break;
      case "L": x = ox + num(); y = oy + num(); pts.push([x, y]); break;
      case "H": x = (rel ? x : 0) + num(); pts.push([x, y]); break;
      case "V": y = (rel ? y : 0) + num(); pts.push([x, y]); break;
      case "C": cubic(ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()); break;
      case "S": {
        const [cx, cy] = lastC ? [2 * x - lastC[0], 2 * y - lastC[1]] : [x, y];
        cubic(cx, cy, ox + num(), oy + num(), ox + num(), oy + num());
        break;
      }
      case "Q": quad(ox + num(), oy + num(), ox + num(), oy + num()); break;
      case "T": {
        const [qx, qy] = lastQ ? [2 * x - lastQ[0], 2 * y - lastQ[1]] : [x, y];
        quad(qx, qy, ox + num(), oy + num());
        break;
      }
      case "Z": x = sx; y = sy; break;
      default: throw new Error(`path command ${cmd} not handled`);
    }
  }
  return pts;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? parseFloat(m[1]) : 0;
};

// The geometric bounding box of every shape in a fragment.
function bbox(fragment) {
  const pts = [];
  for (const tag of fragment.match(/<(path|ellipse|circle|rect)\b[^>]*>/g) ?? []) {
    if (tag.startsWith("<path")) pts.push(...pathPoints(tag.match(/\sd="([^"]*)"/)[1]));
    else if (tag.startsWith("<rect")) {
      const x = attr(tag, "x"), y = attr(tag, "y");
      pts.push([x, y], [x + attr(tag, "width"), y + attr(tag, "height")]);
    } else {
      const cx = attr(tag, "cx"), cy = attr(tag, "cy");
      const rx = tag.startsWith("<circle") ? attr(tag, "r") : attr(tag, "rx");
      const ry = tag.startsWith("<circle") ? attr(tag, "r") : attr(tag, "ry");
      pts.push([cx - rx, cy - ry], [cx + rx, cy + ry]);
    }
  }
  if (!pts.length) throw new Error("empty part");
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

// --- parts -----------------------------------------------------------------

const groupRe = (cls) => new RegExp(`<g class="${cls}"([^>]*)>([\\s\\S]*?)</g>`);

function part(svg, cls) {
  const m = svg.match(groupRe(cls));
  if (!m) throw new Error(`no .${cls}`);
  return m;
}

const r2 = (n) => Math.round(n * 100) / 100;

// Rotates (and optionally squashes vertically, as the flap keyframes do) a
// part about the point at `origin` percent of its box, like CSS
// `transform-origin` with `transform-box: fill-box`.
function pose(svg, cls, origin, deg, scaleY = 1) {
  const [whole, attrs, body] = part(svg, cls);
  const b = bbox(body);
  const cx = r2(b.x0 + (origin[0] / 100) * (b.x1 - b.x0));
  const cy = r2(b.y0 + (origin[1] / 100) * (b.y1 - b.y0));
  let t = "";
  if (scaleY !== 1) t = `translate(${cx} ${cy}) rotate(${deg}) scale(1 ${scaleY}) translate(${-cx} ${-cy})`;
  else if (deg !== 0) t = `rotate(${deg} ${cx} ${cy})`;
  return svg.replace(whole, `<g${attrs}${t ? ` transform="${t}"` : ""}>${body}</g>`);
}

const drop = (svg, cls) => svg.replace(part(svg, cls)[0], "");
const show = (svg, cls) => {
  const [whole, attrs, body] = part(svg, cls);
  return svg.replace(whole, `<g${attrs}>${body}</g>`);
};
// Groups left without attributes are unwrapped; no classes survive.
const finish = (svg) => {
  const out = svg.replace(/<g>([\s\S]*?)<\/g>/g, "$1").replace(/\sclass="[^"]*"/g, "");
  if (/class=|<!--/.test(out)) throw new Error("leftover class or comment");
  return out;
};

// --- creatures -----------------------------------------------------------------

// Sizes follow the sp-* sheets (about 1.1x to 1.2x the viewBox).
const SIZE = {
  cow: [190, 134],
  tiger: [230, 127],
  shark: [138, 200],
  merman: [150, 118],
  ufo: [168, 110],
};

function cowFrame(i, garland) {
  let s = tidy(read("anim-cow.svg"));
  const [deg, sy] = i === 0 ? [0, 1] : [-24, 0.82];
  s = pose(s, "wn", [75, 100], deg, sy);
  s = pose(s, "wf", [30, 100], deg, sy);
  s = garland ? show(s, "garland") : drop(s, "garland");
  return finish(sized(s, ...SIZE.cow));
}

function tigerFrame(i) {
  let s = tidy(read("anim-tiger.svg"));
  const [deg, sy, tail] = i === 0 ? [4, 1, 0] : [-30, 0.7, -14];
  s = pose(s, "wn", [55, 100], deg, sy);
  s = pose(s, "wf", [40, 100], deg, sy);
  s = pose(s, "tail", [100, 100], tail);
  return finish(sized(s, ...SIZE.tiger));
}

// The rocket: the body's own outline is redrawn so its flat bottom becomes a
// rounded nozzle in the body colour (tangents matched to the sides, so there
// is no seam or kink), and the white belly and its divider run on down the
// nozzle's front. One smooth shape, same outline and stroke widths.
const NOZZLE = "C70 120 66 126 60 126 C54 126 48.7 120 46 116";
const ROCKET = [
  ["C89 92 83 108 74 116 L46 116 C38 104", `C89 92 83 108 74 116 ${NOZZLE} C38 104`],
  ["C85 104 80 112 74 116 L66 116 C73 100", "C85 104 80 112 74 116 C70 120 66 126 60 126 C63 124 64.6 119.2 66 116 C73 100"],
  ['d="M82 30 C79 70 73 100 66 116"', 'd="M82 30 C79 70 73 100 66 116 C64.6 119.2 63 124 60 126"'],
];

function sharkFrame(i, rocket) {
  let s = tidy(read("anim-shark.svg"));
  const k = i === 0 ? 0 : 1;
  if (rocket) {
    s = drop(s, "lf");
    s = drop(s, "ln");
    for (const [from, to] of ROCKET) {
      if (!s.includes(from)) throw new Error(`rocket: no ${from}`);
      s = s.replace(from, to);
    }
  } else {
    s = pose(s, "lf", [50, 0], [-16, 20][k]);
    s = pose(s, "ln", [50, 0], [18, -18][k]);
  }
  s = pose(s, "an", [0, 0], [-14, 16][k]);
  s = pose(s, "af", [100, 0], [14, -12][k]);
  s = pose(s, "tail", [100, 0], [0, -14][k]);
  return finish(sized(s, ...SIZE.shark));
}

function mermanFrame(i) {
  let s = tidy(read("anim-merman.svg"));
  s = pose(s, "arm", [0, 100], i === 0 ? -10 : 16);
  s = pose(s, "tail", [80, 100], 0);
  s = drop(s, "splash");
  return finish(sized(s, ...SIZE.merman));
}

function ufoFrame(i, empty) {
  let s = tidy(read("anim-ufo.svg"));
  s = drop(s, "beam");
  if (empty) s = drop(s, "pilot");
  // Rim lights chase: odd and even lamps take turns at full and dimmed.
  s = s.replace(/<circle class="lamp l(\d)"/g, (_, n) =>
    (Number(n) % 2 === 1) === (i === 0) ? "<circle" : '<circle opacity=".25"',
  );
  return finish(sized(s, ...SIZE.ufo));
}

// The prototype's fountain fish, in the first fountain colour.
const fishSvg = (c) =>
  `<svg viewBox="0 0 26 12"><path d="M2 6 C6 0 14 0 19 6 C14 12 6 12 2 6 Z" fill="${c}" stroke="#2b2234" stroke-width="1.3" stroke-linejoin="round"/><path d="M18 6 L25 1 L23.5 6 L25 11 Z" fill="${c}" stroke="#2b2234" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 3 Q11 6 9 9" fill="none" stroke="#2b2234" stroke-width=".9"/><circle cx="5.6" cy="5" r="1.1" fill="#2b2234"/></svg>`;

const copy = (name, w, h) => finish(sized(tidy(read(name)), w, h));

const RARE_FRAMES = {
  cow: [cowFrame(0, false), cowFrame(1, false)],
  tiger: [tigerFrame(0), tigerFrame(1)],
  shark: [sharkFrame(0, false), sharkFrame(1, false)],
  merman: [mermanFrame(0), mermanFrame(1)],
  ufo: [ufoFrame(0, false), ufoFrame(1, false)],
};

// The garland group alone, in the cow's own viewBox and size, so it lines up exactly over her.
function garlandOnly() {
  const s = tidy(read("anim-cow.svg"));
  const root = s.match(/<svg[^>]*>/)[0];
  return finish(sized(`${root}${part(s, "garland")[0]}</svg>`, ...SIZE.cow));
}

const EXTRA = {
  cowGarland: cowFrame(0, true),
  garland: garlandOnly(),
  sharkRocket: sharkFrame(0, true),
  ufoEmpty: ufoFrame(0, true),
  alienChute: copy("sp-alien-chute.svg", 110, 150),
  tigerFace: copy("anim-tiger-face.svg", 400, 340),
  tigerPaw: copy("anim-tiger-paw.svg", 180, 220),
  pile: copy("anim-poop.svg", 120, 104),
  fish: finish(sized(fishSvg("#f49ea3"), 52, 24)),
};

// --- write -----------------------------------------------------------------

const list = (frames) => `[\n${frames.map((f) => `    ${JSON.stringify(f)},`).join("\n")}\n  ]`;
const ts = `/**
 * Vice Hunt rare creature art, from the owner-approved drawings in
 * art-src/rares/ with the prototype's part poses baked in. Generated by
 * art-src/build-rares.mjs; edit the art or the script, not this file.
 * Each entry is a complete SVG document with explicit width, height and viewBox.
 */

export type RareKind = "cow" | "tiger" | "shark" | "merman" | "ufo";

export type ExtraId =
  | "cowGarland"
  | "garland"
  | "sharkRocket"
  | "ufoEmpty"
  | "alienChute"
  | "tigerFace"
  | "tigerPaw"
  | "pile"
  | "fish";

export const RARE_FRAMES: Record<RareKind, readonly string[]> = {
${Object.entries(RARE_FRAMES).map(([k, f]) => `  ${k}: ${list(f)},`).join("\n")}
};

/** Special states and props. \`fish\` is drawn in #f49ea3; other fountain
 *  colours are tinted at draw time. */
export const EXTRA: Record<ExtraId, string> = {
${Object.entries(EXTRA).map(([k, s]) => `  ${k}: ${JSON.stringify(s)},`).join("\n")}
};
`;
writeFileSync(OUT, ts);
console.log(`wrote ${OUT} (${ts.length} bytes)`);
