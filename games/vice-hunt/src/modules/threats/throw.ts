// A provoked Bigfoot's throws: one threat per Bigfoot, started by
// stepThreats once he is provoked. While he is alive, wholly on screen and
// not finishing, he starts an overarm throw every `every` seconds (start to
// start); at RELEASE of the throw a glob leaves his hand, tumbles at the
// camera and splats on the glass, costing `perHit` hearts until this Bigfoot
// has dealt `max`. `dealt` and the globs live here, not on the animal, so the
// cap holds for globs that land after he has died. The threat ends once he is
// gone and every glob has landed.
// Gentle: no flying globs; the splat appears in place at the release.
import { CREATURES, type Kind } from "../../creatures";
import { addSplat, shake } from "../../fx/glass";
import { HAND_AT_RELEASE, RELEASE, RIG, THROW_TIME, rigTop, toWorld } from "../../rig/rig";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import { damage, type World } from "../../world";
import type { Origin, ThreatModule } from "../types";
import { type Glob, drawGlobs, launchGlob, stepGlobs } from "./glob";

export const FIRST_THROW = 0.5; // after he is provoked

export type ThrowState = {
  kind: Kind;
  from: number; // the Bigfoot's animal id
  perHit: number;
  max: number;
  every: number;
  reduced: boolean;
  t: number;
  next: number; // t of the next throw's start
  throwT: number; // seconds into the current throw, or -1
  thrown: number;
  dealt: number;
  splats: number;
  gone: boolean; // he has died or walked off: no more throws
  globs: Glob[];
};

type Throws = { kind: "throws"; perHit: number; max: number; every: number };

function start(at: Origin, _world: World, _rng: Rng, reduced: boolean): ThrowState {
  const t = (CREATURES[at.kind] as { threat?: Throws }).threat;
  return {
    kind: at.kind,
    from: at.id ?? -1,
    perHit: t?.perHit ?? 0,
    max: t?.max ?? 0,
    every: t?.every ?? Infinity,
    reduced,
    t: 0,
    next: FIRST_THROW,
    throwT: -1,
    thrown: 0,
    dealt: 0,
    splats: 0,
    gone: false,
    globs: [],
  };
}

function land(s: ThrowState, world: World, rng: Rng, g: Glob): void {
  addSplat(world.glass, g.x1, g.y1, g.r, g.main, rng, s.reduced);
  if (!s.reduced) shake(world.glass, 5, 0.22);
  if (s.splats++ === 0) world.events.push({ type: "callout", text: "SPLAT!", x: g.x1, y: g.y1 - g.r * 1.6 });
  const n = Math.min(s.perHit, s.max - s.dealt);
  if (n > 0) {
    s.dealt += n;
    damage(world, n, s.kind, g.x1, g.y1 - 0.08 * world.height);
  }
}

function release(s: ThrowState, world: World, rng: Rng, a: World["animals"][number]): void {
  const W = world.width;
  const H = world.height;
  const scale = a.w / RIG.W;
  const [hx, hy] = toWorld(HAND_AT_RELEASE[0], HAND_AT_RELEASE[1], a.x, rigTop(a.y + a.h, scale), scale, a.vx < 0 ? -1 : 1);
  const tx = (0.2 + rng() * 0.6) * W;
  const ty = (0.18 + rng() * 0.55) * H;
  const r = (0.07 + rng() * 0.03) * Math.min(W, H);
  s.thrown += 1;
  const g = launchGlob(hx, hy, tx, ty, r, false, W, H);
  if (s.reduced) land(s, world, rng, g);
  else s.globs.push(g);
}

export const throwAt: ThreatModule<ThrowState> = {
  start,
  step(s, dt, world, rng) {
    const a = s.gone ? undefined : world.animals.find((b) => b.id === s.from);
    if (!a) {
      s.gone = true;
      s.throwT = -1;
    } else {
      s.t += dt;
      const onScreen = a.x >= 0 && a.x + a.w <= world.width;
      if (s.throwT < 0 && s.t >= s.next && onScreen) {
        s.throwT = 0;
        s.next = s.t + s.every;
      }
      if (s.throwT >= 0) {
        const before = s.throwT;
        s.throwT += dt;
        if (before < RELEASE * THROW_TIME && s.throwT >= RELEASE * THROW_TIME) release(s, world, rng, a);
        if (s.throwT >= THROW_TIME) s.throwT = -1;
      }
      a.throwK = s.throwT >= 0 ? s.throwT / THROW_TIME : undefined;
    }
    stepGlobs(s.globs, dt, (g) => land(s, world, rng, g));
  },
  done: (s) => s.gone && s.globs.length === 0,
  draw(ctx, s, art: Art) {
    drawGlobs(ctx, s.globs, art);
  },
};
