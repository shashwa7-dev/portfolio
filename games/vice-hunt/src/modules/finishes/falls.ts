// Today's prey deaths (rabbit, iguana, flamingo; Bigfoot's topple until his
// own finish lands): wraps deathPose/DEATHS unchanged.
import { DEATHS, deathPose, newPose } from "../../death";
import { type Body, bodyOf, drawSprite, enterSprite } from "../draw";
import type { FinishModule } from "../types";

export const falls: FinishModule<Body> = {
  start: (c, world) => bodyOf(c, world),
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
  },
  done: (s) => s.age >= DEATHS[s.kind].duration,
  draw(ctx, s, art, scratch) {
    const frames = art.sprites[s.kind];
    const p = deathPose(s.kind, s.age, s.fall, newPose());
    if (!frames || p.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    enterSprite(ctx, s.x, s.y, s.w, s.dir);
    const ox = p.px * s.w;
    const oy = p.py * s.h;
    ctx.translate(p.dx + ox, p.dy + oy);
    ctx.rotate(p.rot);
    ctx.scale(1, p.sy);
    ctx.translate(-ox, -oy);
    drawSprite(ctx, scratch, frames[p.frame < 0 ? s.frame : (p.frame as 0 | 1)], s.w, s.h, s.flash);
    ctx.restore();
  },
};
