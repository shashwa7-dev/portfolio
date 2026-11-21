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

type Garland = { t: number; w: number; h: number };
export const garland: HitReactionModule<Garland> = {
  start: (a: Animal) => ({ t: 0, w: a.w, h: a.h }),
  step: (s, dt) => void (s.t += dt),
  // Sprite space: the garlanded cow pops in over her plain frame.
  draw(ctx, s, art: Art) {
    const k = garlandScale(s.t);
    ctx.save();
    ctx.globalAlpha = Math.min(1, Math.max(0, k / 0.6));
    ctx.translate(s.w / 2, s.h * 0.4);
    ctx.scale(k, k);
    ctx.drawImage(art.extra.cowGarland, -s.w / 2, -s.h * 0.4, s.w, s.h);
    ctx.restore();
  },
};
