import {
  ANIMALS,
  BIGFOOT_AFTER,
  BIGFOOT_CHANCE,
  IGUANA_PAUSE,
  MAX_ALIVE,
  MAX_DT,
  SPAWN_INTERVAL,
  STREAK_WINDOW,
} from "./config";
import type { Rng } from "./rng";
import type { Kills, Kind } from "./types";

export type Animal = {
  id: number;
  kind: Kind;
  x: number; // sprite top-left
  y: number;
  vx: number; // sign is the facing direction
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  age: number;
  pause: number; // > 0: iguana is standing still
  flash: number;
};

export type World = {
  width: number;
  height: number;
  time: number;
  nextSpawn: number;
  animals: Animal[];
  kills: Kills;
  nextId: number;
  streak: number; // kills in a row, each within STREAK_WINDOW of the last
  lastKill: number; // world.time of the last kill
};

const TOP_BAND: [number, number] = [0.12, 0.3];
export const GROUND_LINE = 0.94;
const HIT_INSET = 0.15;
const FLASH = 0.12;
const KNOCKBACK = 6;
const FLAMINGO_BOB = 10;
const RABBIT_HOP = 14;
// Per-second chance a dashing iguana stops, giving irregular dash lengths.
const IGUANA_STOP_RATE = 1.2;
const KINDS: Kind[] = ["rabbit", "iguana", "flamingo"];

const between = (rng: Rng, [lo, hi]: [number, number]) => lo + rng() * (hi - lo);
const intBetween = (rng: Rng, [lo, hi]: [number, number]) => lo + Math.floor(rng() * (hi - lo + 1));

export function emptyKills(): Kills {
  return { rabbit: 0, iguana: 0, flamingo: 0, bigfoot: 0 };
}

// Vertical offset from the lane's resting y, a pure function of age so the
// resting y can be recovered by subtracting it.
function bob(kind: Kind, age: number): number {
  if (kind === "flamingo") return Math.sin(age * 2.2) * FLAMINGO_BOB;
  if (kind === "rabbit") return -Math.abs(Math.sin(age * 7)) * RABBIT_HOP;
  return 0;
}

function restingY(world: World, a: Animal, topFraction: number): number {
  return ANIMALS[a.kind].lane === "top" ? topFraction * world.height : GROUND_LINE * world.height - a.h;
}

export function createWorld(width: number, height: number, rng: Rng): World {
  return {
    width,
    height,
    time: 0,
    nextSpawn: between(rng, SPAWN_INTERVAL),
    animals: [],
    kills: emptyKills(),
    nextId: 1,
    streak: 0,
    lastKill: -Infinity,
  };
}

function pickKind(world: World, rng: Rng): Kind {
  const bigfootAlive = world.animals.some((a) => a.kind === "bigfoot");
  if (world.time >= BIGFOOT_AFTER && !bigfootAlive && rng() < BIGFOOT_CHANCE) return "bigfoot";
  let r = rng();
  for (const k of KINDS) {
    r -= ANIMALS[k].weight;
    if (r < 0) return k;
  }
  return "rabbit";
}

export function spawn(world: World, rng: Rng, kind?: Kind): Animal {
  const k = kind ?? pickKind(world, rng);
  const cfg = ANIMALS[k];
  const [w, h] = cfg.size;
  const dir = rng() < 0.5 ? -1 : 1;
  const hp = intBetween(rng, cfg.hits);
  const a: Animal = {
    id: world.nextId++,
    kind: k,
    x: dir > 0 ? -w : world.width,
    y: 0,
    vx: dir * between(rng, cfg.speed) * world.width,
    w,
    h,
    hp,
    maxHp: hp,
    age: 0,
    pause: 0,
    flash: 0,
  };
  a.y = restingY(world, a, between(rng, TOP_BAND)) + bob(k, 0);
  world.animals.push(a);
  return a;
}

export function step(world: World, dt: number, rng: Rng): void {
  dt = Math.min(Math.max(dt, 0), MAX_DT);
  world.time += dt;

  if (world.time >= world.nextSpawn) {
    if (world.animals.length < MAX_ALIVE) spawn(world, rng);
    world.nextSpawn = world.time + between(rng, SPAWN_INTERVAL);
  }

  for (const a of world.animals) {
    const rest = a.y - bob(a.kind, a.age);
    a.age += dt;
    a.y = rest + bob(a.kind, a.age);
    a.flash = Math.max(0, a.flash - dt);

    if (a.kind === "iguana") {
      if (a.pause > 0) {
        a.pause = Math.max(0, a.pause - dt);
        continue;
      }
      if (rng() < IGUANA_STOP_RATE * dt) {
        a.pause = between(rng, IGUANA_PAUSE);
        continue;
      }
    }
    a.x += a.vx * dt;
  }

  world.animals = world.animals.filter((a) => (a.vx > 0 ? a.x <= world.width : a.x + a.w >= 0));
}

export function shoot(world: World, x: number, y: number): { hit: Animal | null; killed: boolean } {
  for (let i = world.animals.length - 1; i >= 0; i--) {
    const a = world.animals[i];
    const ix = a.w * HIT_INSET;
    const iy = a.h * HIT_INSET;
    if (x < a.x + ix || x > a.x + a.w - ix || y < a.y + iy || y > a.y + a.h - iy) continue;
    a.hp -= 1;
    a.flash = FLASH;
    a.x -= Math.sign(a.vx) * KNOCKBACK;
    const killed = a.hp <= 0;
    if (killed) {
      world.animals.splice(i, 1);
      world.kills[a.kind] += 1;
      world.streak = world.time - world.lastKill <= STREAK_WINDOW ? world.streak + 1 : 1;
      world.lastKill = world.time;
    }
    return { hit: a, killed };
  }
  return { hit: null, killed: false };
}

export function resize(world: World, width: number, height: number): void {
  const rx = width / world.width;
  const oldHeight = world.height;
  for (const a of world.animals) {
    const rest = a.y - bob(a.kind, a.age);
    a.x *= rx;
    a.vx *= rx;
    a.y = restingY({ ...world, height }, a, rest / oldHeight) + bob(a.kind, a.age);
  }
  world.width = width;
  world.height = height;
}
