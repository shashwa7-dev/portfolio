// Hit reactions: per-animal state started on a hit, stepped by world time.
import type { Animal } from "../world";
import type { Art } from "../sprites";
import type { HitReactionModule } from "./types";

const none = () => {};
export const noReaction: HitReactionModule<null> = { start: () => null, step: none, draw: none };

export const FLINCH_TIME = 0.16;
const FLINCH_PX = 4;
type Flinch = { t: number };
export const flinch: HitReactionModule<Flinch> = {
  start: () => ({ t: 0 }),
  step: (s, dt) => void (s.t += dt),
  pose(s) {
    const k = s.t / FLINCH_TIME;
    return { dx: k >= 1 ? 0 : FLINCH_PX * Math.sin(2 * Math.PI * k), dy: 0 };
  },
  draw: none,
};

export const GARLAND_TIME = 0.45;
const backOut = (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
/** Scale of the garland pop: 0.2 at 0, 1 at GARLAND_TIME, overshooting between. */
export const garlandScale = (t: number): number => 0.2 + 0.8 * backOut(Math.min(1, Math.max(0, t / GARLAND_TIME)));

// The garland's centre in the cow's viewBox (170 x 120), as fractions: marigolds span x 109 to 142, y 46 to 74.
const GARLAND_AT = [125.5 / 170, 60 / 120] as const;

type Garland = { t: number; w: number; h: number };
export const garland: HitReactionModule<Garland> = {
  start: (a: Animal) => ({ t: 0, w: a.w, h: a.h }),
  step: (s, dt) => void (s.t += dt),
  // Sprite space: the marigold garland alone, springing on about its own centre at her neck.
  draw(ctx, s, art: Art) {
    const k = garlandScale(s.t);
    const cx = s.w * GARLAND_AT[0];
    const cy = s.h * GARLAND_AT[1];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(k, k);
    ctx.drawImage(art.extra.garland, -cx, -cy, s.w, s.h);
    ctx.restore();
  },
};
