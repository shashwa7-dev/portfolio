import type { Kind } from "./types";

// Death animations as pure functions of age. A pose is in the sprite's own
// facing-right space (the renderer mirrors leftward corpses), relative to the
// sprite's top-left at the moment of death:
//   dx, dy  offset in px (dx > 0 is the running direction, dy > 0 is down)
//   rot     radians about the pivot (negative tips backwards)
//   sy      vertical scale about the pivot (-1 is on its back)
//   px, py  pivot as a fraction of the sprite box
//   alpha   opacity
//   frame   which sprite frame to show, or -1 to keep the frame at death
export type Pose = {
  dx: number;
  dy: number;
  rot: number;
  sy: number;
  px: number;
  py: number;
  alpha: number;
  frame: number;
};

export type Puff = { at: number; style: "dust" | "feather"; count: number; life: number };

export const DEATHS: Record<Kind, { duration: number; puff: Puff }> = {
  rabbit: { duration: 0.8, puff: { at: 0.45, style: "dust", count: 6, life: 0.35 } },
  iguana: { duration: 0.8, puff: { at: 0, style: "dust", count: 5, life: 0.35 } },
  flamingo: { duration: 1.1, puff: { at: 0, style: "feather", count: 7, life: 1.1 } },
  bigfoot: { duration: 1.4, puff: { at: 0.8, style: "dust", count: 12, life: 0.5 } },
  // Placeholders: the rares get their own finishes in later tasks.
  cow: { duration: 1.1, puff: { at: 0, style: "feather", count: 7, life: 1.1 } },
  tiger: { duration: 1.1, puff: { at: 0, style: "feather", count: 7, life: 1.1 } },
  shark: { duration: 0.8, puff: { at: 0, style: "dust", count: 5, life: 0.35 } },
  merman: { duration: 0.8, puff: { at: 0, style: "dust", count: 5, life: 0.35 } },
  ufo: { duration: 0.8, puff: { at: 0, style: "dust", count: 5, life: 0.35 } },
};

const RABBIT = { air: 0.45, hop: 36, drift: 20, bounce: 6, bounceTime: 0.15, fadeFrom: 0.55 };
const IGUANA = { flip: 0.15, hop: 8, slide: 30, slideTime: 0.5, fadeFrom: 0.5 };
const FLAMINGO = { fallTime: 0.9, drift: 40, turns: 1.5, fadeFrom: 0.8 };
const BIGFOOT = { stagger: 0.35, back: 14, impact: 0.8, settle: 0.15, rebound: 0.08, fadeFrom: 1.0 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const fade = (t: number, from: number, to: number) => 1 - clamp01((t - from) / (to - from));

export const newPose = (): Pose => ({ dx: 0, dy: 0, rot: 0, sy: 1, px: 0.5, py: 0.5, alpha: 1, frame: -1 });

// Writes the pose for `kind` at `age` seconds into `out` (no allocation).
// `fall` is how far a flamingo drops to reach the ground line, in px.
export function deathPose(kind: Kind, age: number, fall: number, out: Pose): Pose {
  const d = DEATHS[kind].duration;
  const t = Math.min(Math.max(age, 0), d);
  out.dx = 0;
  out.dy = 0;
  out.rot = 0;
  out.sy = 1;
  out.px = 0.5;
  out.py = 0.5;
  out.frame = -1;

  if (kind === "rabbit") {
    // One hop, a backflip in the air, a landing on its back, a small bounce.
    const u = clamp01(t / RABBIT.air);
    out.dx = RABBIT.drift * u;
    out.rot = -Math.PI * (u * u * (3 - 2 * u));
    if (t < RABBIT.air) out.dy = -RABBIT.hop * Math.sin(Math.PI * u);
    else if (t < RABBIT.air + RABBIT.bounceTime) {
      out.dy = -RABBIT.bounce * Math.sin((Math.PI * (t - RABBIT.air)) / RABBIT.bounceTime);
    }
    out.alpha = fade(t, RABBIT.fadeFrom, d);
  } else if (kind === "iguana") {
    // Flips onto its back with a little pop, slides on with friction,
    // and its legs twitch more and more slowly.
    const f = clamp01(t / IGUANA.flip);
    out.sy = Math.cos(Math.PI * f);
    out.dy = -IGUANA.hop * Math.sin(Math.PI * f);
    const s = clamp01(t / IGUANA.slideTime);
    out.dx = IGUANA.slide * (1 - (1 - s) * (1 - s));
    out.frame = Math.floor(14 * t - 9 * t * t) % 2;
    out.alpha = fade(t, IGUANA.fadeFrom, d);
  } else if (kind === "flamingo") {
    // Wings freeze; it spirals down to the ground under gravity.
    const u = clamp01(t / FLAMINGO.fallTime);
    out.dy = fall * u * u;
    out.dx = FLAMINGO.drift * u;
    out.rot = -2 * Math.PI * FLAMINGO.turns * u;
    out.alpha = fade(t, FLAMINGO.fadeFrom, d);
  } else {
    // Staggers back, then topples backwards about its feet and thuds down.
    out.px = 0.4;
    out.py = 1;
    const s = clamp01(t / BIGFOOT.stagger);
    out.dx = -BIGFOOT.back * (1 - (1 - s) * (1 - s));
    const v = clamp01((t - BIGFOOT.stagger) / (BIGFOOT.impact - BIGFOOT.stagger));
    out.rot = -(Math.PI / 2) * v * v;
    if (t > BIGFOOT.impact && t < BIGFOOT.impact + BIGFOOT.settle) {
      out.rot += BIGFOOT.rebound * Math.sin((Math.PI * (t - BIGFOOT.impact)) / BIGFOOT.settle);
    }
    out.alpha = fade(t, BIGFOOT.fadeFrom, d);
  }
  return out;
}
