import { DEATHS, deathPose, newPose, type Pose, type Puff } from "./death";
import type { Rng } from "./rng";
import type { Art } from "./sprites";
import type { Kind } from "./types";
import { GROUND_LINE, type Animal, type World } from "./world";

const FRAME_TIME = 0.18;
const BIGFOOT_FRAME_TIME = 0.3;
const FEATHERS = ["#f7b6cc", "#e8789f", "#fbd3e0"];
const DUST = ["#d9cbb3", "#bfae92", "#ece2d0"];

type Particle = { x: number; y: number; vx: number; vy: number; spin: number; size: number; color: string; feather: boolean };
// A puff of feathers or dust; it waits `delay` seconds before it shows.
type Poof = { age: number; delay: number; life: number; parts: Particle[] };
// An animal the world has already removed, playing its death animation.
type Corpse = {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  dir: number; // 1 faces right, -1 left
  frame: 0 | 1; // sprite frame at death
  fall: number; // px down to the ground line (flamingos)
  flash: number;
  age: number;
};

export type Scene = {
  poofs: Poof[];
  corpses: Corpse[];
  scratch: HTMLCanvasElement; // offscreen copy for white hit flashes
};

const pose = newPose(); // scratch pose, reused every frame

export const createScene = (): Scene => ({
  poofs: [],
  corpses: [],
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

// Starts `a`'s death animation (the world has just removed it) and schedules
// its feathers or dust.
export function addCorpse(scene: Scene, world: World, a: Animal, rng: Rng): void {
  const dir = a.vx < 0 ? -1 : 1;
  const c: Corpse = {
    kind: a.kind,
    x: a.x,
    y: a.y,
    w: a.w,
    h: a.h,
    dir,
    frame: frameOf(a),
    fall: Math.max(0, GROUND_LINE * world.height - (a.y + a.h)),
    flash: a.flash,
    age: 0,
  };
  scene.corpses.push(c);
  const { puff } = DEATHS[a.kind];
  deathPose(a.kind, puff.at, c.fall, pose);
  const cx = a.x + a.w / 2 + dir * pose.dx;
  if (a.kind === "flamingo") addPoof(scene, cx, a.y + a.h / 2 + pose.dy, puff, false, rng);
  else if (a.kind === "bigfoot") addPoof(scene, cx - dir * a.h * 0.5, a.y + a.h, puff, true, rng); // where its back lands
  else addPoof(scene, cx, a.y + a.h + pose.dy, puff, true, rng);
}

export function stepScene(scene: Scene, dt: number): void {
  for (const c of scene.corpses) {
    c.age += dt;
    c.flash = Math.max(0, c.flash - dt);
  }
  scene.corpses = scene.corpses.filter((c) => c.age < DEATHS[c.kind].duration);
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

function frameOf(a: Animal): 0 | 1 {
  if (a.pause > 0) return 0;
  const t = a.kind === "bigfoot" ? BIGFOOT_FRAME_TIME : FRAME_TIME;
  return (Math.floor(a.age / t) % 2) as 0 | 1;
}

function whiteSilhouette(scene: Scene, img: HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  const c = scene.scratch;
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  const s = c.getContext("2d")!;
  s.globalCompositeOperation = "source-over";
  s.clearRect(0, 0, w, h);
  s.drawImage(img, 0, 0, w, h);
  s.globalCompositeOperation = "source-atop";
  s.fillStyle = "#fff";
  s.fillRect(0, 0, w, h);
  return c;
}

// Sprites face right; mirror for leftward runs. Leaves ctx in sprite space.
function enterSprite(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, dir: number): void {
  if (dir < 0) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, y);
  }
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  img: HTMLImageElement,
  w: number,
  h: number,
  flash: number,
  dpr: number,
): void {
  ctx.drawImage(img, 0, 0, w, h);
  if (flash > 0) ctx.drawImage(whiteSilhouette(scene, img, Math.ceil(w * dpr), Math.ceil(h * dpr)), 0, 0, w, h);
}

function drawAnimal(ctx: CanvasRenderingContext2D, scene: Scene, art: Art, a: Animal, dpr: number): void {
  const frames = art.sprites[a.kind];
  if (!frames) return; // no decoded art for this kind: skip rather than crash
  ctx.save();
  enterSprite(ctx, a.x, a.y, a.w, a.vx < 0 ? -1 : 1);
  drawSprite(ctx, scene, frames[frameOf(a)], a.w, a.h, a.flash, dpr);
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

function drawCorpse(ctx: CanvasRenderingContext2D, scene: Scene, art: Art, c: Corpse, dpr: number): void {
  const frames = art.sprites[c.kind];
  const p: Pose = deathPose(c.kind, c.age, c.fall, pose);
  if (!frames || p.alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = p.alpha;
  enterSprite(ctx, c.x, c.y, c.w, c.dir);
  const ox = p.px * c.w;
  const oy = p.py * c.h;
  ctx.translate(p.dx + ox, p.dy + oy);
  ctx.rotate(p.rot);
  ctx.scale(1, p.sy);
  ctx.translate(-ox, -oy);
  drawSprite(ctx, scene, frames[p.frame < 0 ? c.frame : (p.frame as 0 | 1)], c.w, c.h, c.flash, dpr);
  ctx.restore();
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
  dpr: number,
): void {
  ctx.clearRect(0, 0, world.width, world.height);
  if (art) {
    for (const c of scene.corpses) drawCorpse(ctx, scene, art, c, dpr);
    for (const a of world.animals) drawAnimal(ctx, scene, art, a, dpr);
  }
  for (const p of scene.poofs) drawPoof(ctx, p);
}
