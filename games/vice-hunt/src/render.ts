import { DEATHS, deathPose, newPose, type Puff } from "./death";
import { CREATURES } from "./creatures";
import { HIT_REACTIONS, MOVES, resolveFinish } from "./modules";
import { drawSprite, enterSprite } from "./modules/draw";
import { drawParticles, emit, stepParticles, type Particle } from "./fx/particles";
import type { Rng } from "./rng";
import type { Art } from "./sprites";
import { GROUND_LINE } from "./config";
import { drawBossBar, drawRig } from "./rig/drawRig";
import { RIG, rigTop, throwArm, walkPose } from "./rig/rig";
import type { Animal, World } from "./world";
import { OST_BOX, OST_HIP, OST_WHEELS, drawOstrich, legPoint, ostrichParts, skatePose } from "./modules/ostrich";

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

// Feathers knocked off a roller ostrich by a hit: the tail on the first, the
// wing and neck fluff on the second. They drift down, swaying, and fade;
// under reduced motion they fall straight.
const OSTRICH_FEATHERS = ["#ff8a1f", "#ff3d8b", "#1fe0c4", "#9b5cff"];
const FEATHER_BOXES: Record<number, { n: number; box: [number, number, number, number] }> = {
  1: { n: 14, box: [0, 58, 30, 104] },
  2: { n: 16, box: [26, 62, 92, 92] },
};

/** Box units (130 x 180, facing right) to world px for a live ostrich. */
function ostrichAt(a: Animal, bx: number, by: number): [number, number] {
  const s = a.w / OST_BOX[0];
  return [a.x + (a.vx < 0 ? OST_BOX[0] - bx : bx) * s, a.y + by * s];
}

export function addHitFeathers(scene: Scene, a: Animal, rng: Rng, reduced: boolean): void {
  const spec = FEATHER_BOXES[a.hits];
  if (!spec) return;
  const [x0, y0, x1, y1] = spec.box;
  const k = a.w / 96;
  for (let i = 0; i < spec.n; i++) {
    const [x, y] = ostrichAt(a, x0 + rng() * (x1 - x0), y0 + rng() * (y1 - y0));
    const ang = -Math.PI / 2 + (rng() - 0.5) * Math.PI * 1.6;
    const sp = reduced ? 0 : (90 + rng() * 160) * k;
    emit(scene.poofs, {
      kind: "dot",
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      drag: 2.6,
      g: 70 * k,
      life: 2.2 + rng() * 1.2,
      size: (4 + rng() * 3) * k,
      spin: reduced ? 0.01 : (rng() - 0.5) * 8 || 0.01, // a spinning dot is a feather
      color: OSTRICH_FEATHERS[Math.floor(rng() * OSTRICH_FEATHERS.length)],
    });
  }
}

const SPARK = ["#fff3c4", "#f7c46c", "#f49ea3", "#5ad1d6", "#ffffff", "#f7a01c", "#8bff3a", "#ff2d55"];

/** Fireworks off a skater's wheels, sprayed backwards: `strength` dots per
 *  wheel on average, plus the odd star burst. Shared with the plucked finish
 *  through `emitSkateSparks`. */
export function emitSkateSparks(
  list: Particle[],
  wheel: (bx: number, by: number) => [number, number],
  back: 1 | -1, // the direction sparks fly: opposite the facing
  legAngles: readonly number[],
  strength: number,
  k: number,
  rng: Rng,
): void {
  for (const deg of legAngles) {
    for (const w of OST_WHEELS) {
      const [bx, by] = legPoint(w, deg);
      const [x, y] = wheel(bx, by);
      const n = Math.round(strength * (0.6 + rng()));
      for (let i = 0; i < n; i++) {
        emit(list, {
          kind: "dot",
          x,
          y,
          vx: back * (80 + rng() * 260) * k,
          vy: -(40 + rng() * 200) * k,
          g: 520 * k,
          life: 0.4 + rng() * 0.35,
          size: (1.4 + rng() * 2.2) * k,
          color: SPARK[Math.floor(rng() * SPARK.length)],
        });
      }
    }
  }
  if (rng() < 0.16 * strength) {
    const [bx, by] = wheel(OST_HIP[0] - (20 + rng() * 80), 120 + rng() * 40);
    const color = SPARK[Math.floor(rng() * SPARK.length)];
    for (let j = 0; j < 10; j++) {
      const a = (j / 10) * Math.PI * 2;
      emit(list, { kind: "star", x: bx, y: by, vx: Math.cos(a) * 70 * k, vy: Math.sin(a) * 70 * k, drag: 3, g: 60 * k, life: 0.55, size: 2.2 * k, color });
    }
  }
}

/** Per-frame effects of live creatures: sparks off a fast skater's wheels.
 *  Nothing under reduced motion. */
export function stepSceneFx(scene: Scene, world: World, dt: number, rng: Rng, reduced: boolean): void {
  if (reduced || world.wasted) return;
  for (const a of world.animals) {
    if (a.kind !== "ostrich") continue;
    const mul = a.speedMul ?? 1;
    if (mul < 1.3 || rng() > (mul - 1) * 30 * dt) continue;
    const pose = skatePose(a.phase ?? 0, mul);
    emitSkateSparks(scene.poofs, (bx, by) => ostrichAt(a, bx, by), a.vx < 0 ? 1 : -1, [pose.lN, pose.lF], 0.5, a.w / 96, rng);
  }
}

export function stepScene(scene: Scene, dt: number): void {
  stepParticles(scene.poofs, dt, 0);
}

const FLASH = 0.12; // world.ts's hit flash
const RECOIL_RATE = 5; // the rig's recoil falls from 1 to 0 over 0.2 s

// Bigfoot alive: the rig walking (recoiling from the latest hit, throwing
// once provoked), and his boss bar from the first hit.
function drawBigfoot(ctx: CanvasRenderingContext2D, world: World, a: Animal): void {
  const scale = a.w / RIG.W;
  const ground = a.y + a.h;
  const recoil = Math.max(0, 1 - (world.time - a.lastHitAt) * RECOIL_RATE);
  const pose = walkPose(a.age, recoil);
  if (a.provoked) pose.face = "strain";
  if (a.throwK !== undefined) throwArm(pose, a.throwK);
  const top = rigTop(ground, scale);
  const mirrored = a.vx < 0;
  drawRig(ctx, pose, a.x, top, scale, mirrored);
  if (a.flash > 0) drawRig(ctx, pose, a.x, top, scale, mirrored, { white: true, alpha: Math.min(1, a.flash / FLASH) });
  if (a.provoked) drawBossBar(ctx, a.x + a.w / 2, ground - 178 * scale, scale, 1 - a.hits / a.hp);
}

// The roller ostrich alive: its parts posed for the push phase and speed,
// minus the feathers its hits have knocked off.
function drawLiveOstrich(ctx: CanvasRenderingContext2D, scene: Scene, art: Art, a: Animal): void {
  const pose = skatePose(a.phase ?? 0, a.speedMul ?? 1);
  const jolt = a.reaction != null ? HIT_REACTIONS[CREATURES[a.kind].hit].pose?.(a.reaction) : undefined;
  const dir = a.vx < 0 ? -1 : 1;
  const box = { x: a.x + (jolt?.dx ?? 0) * dir, y: a.y, w: a.w, h: a.h, dir: dir as 1 | -1 };
  drawOstrich(ctx, art, scene.scratch, box, pose, { ...ostrichParts(a.hits), bare: false, shock: false }, a.flash);
}

function drawAnimal(ctx: CanvasRenderingContext2D, scene: Scene, world: World, art: Art, a: Animal): void {
  if (a.kind === "bigfoot") return drawBigfoot(ctx, world, a);
  if (a.kind === "ostrich") return drawLiveOstrich(ctx, scene, art, a);
  const frames = art.sprites[a.kind];
  const cfg = CREATURES[a.kind];
  const move = MOVES[cfg.move];
  move.draw?.(ctx, a, world);
  ctx.save();
  if (cfg.lane === "sea") {
    // Only what is above the water shows.
    ctx.beginPath();
    ctx.rect(0, 0, world.width, world.sea);
    ctx.clip();
  }
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
