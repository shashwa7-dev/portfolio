// Generic stand-in finish for ids whose own module has not landed: the last
// frame fades out over FADE_TIME. Never throws.
import { type Body, bodyOf, drawSprite, enterSprite } from "../draw";
import type { FinishModule } from "../types";

export const FADE_TIME = 0.6;

export const fade: FinishModule<Body> = {
  start: (c, world) => bodyOf(c, world),
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
  },
  done: (s) => s.age >= FADE_TIME,
  draw(ctx, s, art, scratch) {
    const frames = art.sprites[s.kind];
    const alpha = 1 - Math.min(1, s.age / FADE_TIME);
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    enterSprite(ctx, s.x, s.y, s.w, s.dir);
    drawSprite(ctx, scratch, frames[s.frame], s.w, s.h, s.flash);
    ctx.restore();
  },
};
