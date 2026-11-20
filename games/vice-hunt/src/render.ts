import { MAX_HOLES } from "./config";
import { crackPath } from "./cracks";
import type { Rng } from "./rng";
import type { Art } from "./sprites";
import type { Animal, World } from "./world";

const FRAME_TIME = 0.18;
const BIGFOOT_FRAME_TIME = 0.3;
const POOF_COUNT = 10;
const POOF_LIFE = 0.4;
const FEATHERS = ["#f7b6cc", "#e8789f", "#fbd3e0"];
const DUST = ["#d9cbb3", "#bfae92", "#ece2d0"];

type Hole = { x: number; y: number; cracks: Path2D };
type Particle = { x: number; y: number; vx: number; vy: number; spin: number; size: number; color: string; feather: boolean };
type Poof = { age: number; parts: Particle[] };

export type Scene = {
  holes: Hole[];
  poofs: Poof[];
  scratch: HTMLCanvasElement; // offscreen copy for white hit flashes
};

export const createScene = (): Scene => ({ holes: [], poofs: [], scratch: document.createElement("canvas") });

export function addHole(scene: Scene, x: number, y: number, rng: Rng): void {
  scene.holes.push({ x, y, cracks: new Path2D(crackPath(x, y, rng)) });
  if (scene.holes.length > MAX_HOLES) scene.holes.shift();
}

export function addPoof(scene: Scene, a: Animal, rng: Rng): void {
  const feather = a.kind === "flamingo";
  const colors = feather ? FEATHERS : DUST;
  const parts: Particle[] = [];
  for (let i = 0; i < POOF_COUNT; i++) {
    const ang = rng() * Math.PI * 2;
    const speed = 40 + rng() * 90;
    parts.push({
      x: a.x + a.w / 2,
      y: a.y + a.h / 2,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - (feather ? 20 : 30),
      spin: (rng() - 0.5) * 12,
      size: feather ? 5 + rng() * 4 : 4 + rng() * 6,
      color: colors[Math.floor(rng() * colors.length)],
      feather,
    });
  }
  scene.poofs.push({ age: 0, parts });
}

export function stepScene(scene: Scene, dt: number): void {
  for (const p of scene.poofs) {
    p.age += dt;
    for (const q of p.parts) {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      // Feathers drift down and slow; dust slows and hangs.
      q.vx *= 1 - 3 * dt;
      q.vy = q.vy * (1 - 3 * dt) + (q.feather ? 60 : 10) * dt;
    }
  }
  scene.poofs = scene.poofs.filter((p) => p.age < POOF_LIFE);
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

function drawAnimal(ctx: CanvasRenderingContext2D, scene: Scene, art: Art, a: Animal, dpr: number): void {
  const img = art.sprites[a.kind][frameOf(a)];
  ctx.save();
  // Sprites face right; mirror for leftward runs.
  if (a.vx < 0) {
    ctx.translate(a.x + a.w, a.y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(a.x, a.y);
  }
  ctx.drawImage(img, 0, 0, a.w, a.h);
  if (a.flash > 0) {
    ctx.drawImage(whiteSilhouette(scene, img, Math.ceil(a.w * dpr), Math.ceil(a.h * dpr)), 0, 0, a.w, a.h);
  }
  ctx.restore();

  if (a.kind === "bigfoot") {
    const bw = a.w * 0.8;
    const bx = a.x + (a.w - bw) / 2;
    const by = a.y - 12;
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(bx - 1, by - 1, bw + 2, 7);
    ctx.fillStyle = "#ff3d5a";
    ctx.fillRect(bx, by, bw * Math.max(0, a.hp / a.maxHp), 5);
  }
}

function drawPoof(ctx: CanvasRenderingContext2D, p: Poof): void {
  const k = p.age / POOF_LIFE;
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

function drawHole(ctx: CanvasRenderingContext2D, h: Hole): void {
  ctx.lineCap = "round";
  ctx.save();
  ctx.translate(0.6, 0.8);
  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.lineWidth = 1.6;
  ctx.stroke(h.cracks);
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 0.9;
  ctx.stroke(h.cracks);

  const circle = (x: number, y: number, r: number, fill: string, stroke?: string, lw = 1) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  };
  circle(h.x, h.y, 9, "rgba(255,255,255,.18)", "rgba(255,255,255,.6)");
  circle(h.x, h.y, 4.2, "#0b0a0a", "rgba(255,255,255,.9)", 1.1);
  circle(h.x - 1, h.y - 1, 1.4, "rgba(255,255,255,.35)");
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
  if (art) for (const a of world.animals) drawAnimal(ctx, scene, art, a, dpr);
  for (const p of scene.poofs) drawPoof(ctx, p);
  for (const h of scene.holes) drawHole(ctx, h);
}
