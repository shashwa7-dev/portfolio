import { DEATHS, deathPose, newPose, type Puff } from "./death";
import { FINISHES } from "./modules";
import { drawSprite, enterSprite, frameOf } from "./modules/draw";
import type { Rng } from "./rng";
import type { Art } from "./sprites";
import { GROUND_LINE } from "./config";
import type { Animal, World } from "./world";

const FEATHERS = ["#f7b6cc", "#e8789f", "#fbd3e0"];
const DUST = ["#d9cbb3", "#bfae92", "#ece2d0"];

type Particle = { x: number; y: number; vx: number; vy: number; spin: number; size: number; color: string; feather: boolean };
// A puff of feathers or dust; it waits `delay` seconds before it shows.
type Poof = { age: number; delay: number; life: number; parts: Particle[] };
export type Scene = {
  poofs: Poof[];
  scratch: HTMLCanvasElement; // offscreen copy for white hit flashes
};

const pose = newPose(); // scratch pose, only written and read inside addPuff

export const createScene = (): Scene => ({
  poofs: [],
  scratch: document.createElement("canvas"),
});

function addPoof(scene: Scene, x: number, y: number, puff: Puff, ground: boolean, rng: Rng): void {
  const feather = puff.style === "feather";
  const colors = feather ? FEATHERS : DUST;
  const parts: Particle[] = [];
  for (let i = 0; i < puff.count; i++) {
    const ang = rng() * Math.PI * 2;
    const speed = 40 + rng() * 90;
    // Dust kicked up from the ground only goes up and out.
    const vy = ground ? -Math.abs(Math.sin(ang)) * speed * 0.6 - 10 : Math.sin(ang) * speed - (feather ? 20 : 30);
    parts.push({
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy,
      spin: (rng() - 0.5) * 12,
      size: feather ? 5 + rng() * 4 : 4 + rng() * 6,
      color: colors[Math.floor(rng() * colors.length)],
      feather,
    });
  }
  scene.poofs.push({ age: 0, delay: puff.at, life: puff.life, parts });
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
  for (const p of scene.poofs) {
    if (p.delay > 0) {
      p.delay -= dt;
      continue;
    }
    p.age += dt;
    for (const q of p.parts) {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      // Feathers drift down and slow; dust slows and hangs.
      q.vx *= 1 - 3 * dt;
      q.vy = q.vy * (1 - 3 * dt) + (q.feather ? 60 : 10) * dt;
    }
  }
  scene.poofs = scene.poofs.filter((p) => p.age < p.life);
}

function drawAnimal(ctx: CanvasRenderingContext2D, scene: Scene, art: Art, a: Animal): void {
  const frames = art.sprites[a.kind];
  if (!frames) return; // no decoded art for this kind: skip rather than crash
  ctx.save();
  enterSprite(ctx, a.x, a.y, a.w, a.vx < 0 ? -1 : 1);
  drawSprite(ctx, scene.scratch, frames[frameOf(a)], a.w, a.h, a.flash);
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

function drawPoof(ctx: CanvasRenderingContext2D, p: Poof): void {
  if (p.delay > 0) return;
  const k = p.age / p.life;
  ctx.globalAlpha = Math.max(0, 1 - k);
  for (const q of p.parts) {
    ctx.fillStyle = q.color;
    ctx.beginPath();
    if (q.feather) {
      ctx.ellipse(q.x, q.y, q.size, q.size * 0.35, q.spin * p.age, 0, Math.PI * 2);
    } else {
      ctx.arc(q.x, q.y, q.size * (1 + k), 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Draws one frame in CSS px; the caller has already scaled ctx by dpr.
export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  world: World,
  art: Art | null,
): void {
  ctx.clearRect(0, 0, world.width, world.height);
  if (art) {
    for (const f of world.finishing) FINISHES[f.id].draw(ctx, f.state, art, scene.scratch);
    for (const a of world.animals) drawAnimal(ctx, scene, art, a);
  }
  for (const p of scene.poofs) drawPoof(ctx, p);
}
