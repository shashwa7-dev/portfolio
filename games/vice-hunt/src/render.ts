import { DEATHS, deathPose, newPose, type Puff } from "./death";
import { CREATURES } from "./creatures";
import { HIT_REACTIONS, MOVES, resolveFinish } from "./modules";
import { drawSprite, enterSprite } from "./modules/draw";
import { drawParticles, emit, stepParticles, type Particle } from "./fx/particles";
import type { Rng } from "./rng";
import type { Art } from "./sprites";
import { GROUND_LINE } from "./config";
import type { Animal, World } from "./world";

const FEATHERS = ["#f7b6cc", "#e8789f", "#fbd3e0"];
const DUST = ["#d9cbb3", "#bfae92", "#ece2d0"];

export type Scene = {
  poofs: Particle[]; // feathers and dust from the `falls` finish
  scratch: HTMLCanvasElement; // offscreen copy for white hit flashes
};

const pose = newPose(); // scratch pose, only written and read inside addPuff

export const createScene = (): Scene => ({
  poofs: [],
  scratch: document.createElement("canvas"),
});

// A puff of feathers or dust; it waits `puff.at` seconds before it shows.
function addPoof(scene: Scene, x: number, y: number, puff: Puff, ground: boolean, rng: Rng): void {
  const feather = puff.style === "feather";
  const colors = feather ? FEATHERS : DUST;
  for (let i = 0; i < puff.count; i++) {
    const ang = rng() * Math.PI * 2;
    const speed = 40 + rng() * 90;
    // Dust kicked up from the ground only goes up and out.
    const vy = ground ? -Math.abs(Math.sin(ang)) * speed * 0.6 - 10 : Math.sin(ang) * speed - (feather ? 20 : 30);
    const spin = (rng() - 0.5) * 12;
    emit(scene.poofs, {
      kind: "dot",
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy,
      spin: feather ? spin || 0.01 : 0, // a spinning dot is a feather
      size: feather ? 5 + rng() * 4 : 4 + rng() * 6,
      color: colors[Math.floor(rng() * colors.length)],
      life: puff.life,
      delay: puff.at,
      drag: 3, // both slow down
      g: feather ? 60 : 10, // feathers drift down, dust hangs
      grow: feather ? 1 : 2,
    });
  }
}

// Schedules the feathers or dust of `a`'s `falls` finish (the world has just
// moved it into world.finishing; the finish itself draws the body).
export function addPuff(scene: Scene, world: World, a: Animal, rng: Rng): void {
  const dir = a.vx < 0 ? -1 : 1;
  const fall = Math.max(0, GROUND_LINE * world.height - (a.y + a.h));
  const { puff } = DEATHS[a.kind];
  deathPose(a.kind, puff.at, fall, pose);
  const cx = a.x + a.w / 2 + dir * pose.dx;
  if (a.kind === "flamingo") addPoof(scene, cx, a.y + a.h / 2 + pose.dy, puff, false, rng);
  else if (a.kind === "bigfoot") addPoof(scene, cx - dir * a.h * 0.5, a.y + a.h, puff, true, rng); // where its back lands
  else addPoof(scene, cx, a.y + a.h + pose.dy, puff, true, rng);
}

export function stepScene(scene: Scene, dt: number): void {
  stepParticles(scene.poofs, dt, 0);
}

function drawAnimal(ctx: CanvasRenderingContext2D, scene: Scene, world: World, art: Art, a: Animal): void {
  const frames = art.sprites[a.kind];
  const cfg = CREATURES[a.kind];
  const move = MOVES[cfg.move];
  move.draw?.(ctx, a, world);
  ctx.save();
  const react = HIT_REACTIONS[cfg.hit];
  enterSprite(ctx, a.x, a.y, a.w, a.vx < 0 ? -1 : 1);
  const jolt = a.reaction != null ? react.pose?.(a.reaction) : undefined;
  if (jolt) ctx.translate(jolt.dx, jolt.dy);
  const tilt = move.tilt?.(a) ?? 0;
  if (tilt) {
    ctx.translate(a.w / 2, a.h / 2);
    ctx.rotate(tilt);
    ctx.translate(-a.w / 2, -a.h / 2);
  }
  drawSprite(ctx, scene.scratch, frames[move.frame(a)], a.w, a.h, a.flash);
  if (a.reaction != null) react.draw(ctx, a.reaction, art);
  ctx.restore();

  if (a.kind === "bigfoot") {
    const bw = a.w * 0.8;
    const bx = a.x + (a.w - bw) / 2;
    const by = a.y - 12;
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(bx - 1, by - 1, bw + 2, 7);
    ctx.fillStyle = "#ff3d5a";
    ctx.fillRect(bx, by, bw * Math.max(0, (a.hp - a.hits) / a.hp), 5);
  }
}

// Draws one frame in CSS px; the caller has already scaled ctx by dpr.
export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  world: World,
  art: Art | null,
  reduced: boolean,
): void {
  ctx.clearRect(0, 0, world.width, world.height);
  if (art) {
    for (const f of world.finishing) resolveFinish(f.id, reduced).draw(ctx, f.state, art, scene.scratch);
    for (const a of world.animals) drawAnimal(ctx, scene, world, art, a);
  }
  drawParticles(ctx, scene.poofs);
}
