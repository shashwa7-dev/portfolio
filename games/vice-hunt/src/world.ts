import {
  GROUND_LINE,
  HEARTS,
  IGUANA_PAUSE,
  MAX_ALIVE,
  MAX_DT,
  SEA_LINE,
  SPAWN_INTERVAL,
  STREAK_WINDOW,
} from "./config";
import { CREATURES, KINDS, type Creature, isRare, kindsWhere, penaltyFor, streaks, type Kind } from "./creatures";
import type { GameEvent } from "./events";
import { FINISHES } from "./modules";
import type { Finishing } from "./modules/types";
import type { Rng } from "./rng";
import { type Surface, SURFACE_OUT, dive, duck, newSurface, sinkOffset, stepSurface, surfaceX } from "./surface";
import type { Kills } from "./types";

export type Animal = {
  id: number;
  kind: Kind;
  x: number; // sprite top-left
  y: number;
  vx: number; // sign is the facing direction
  w: number;
  h: number;
  hp: number; // hits to finish, rolled at spawn
  hits: number; // hits taken so far (the merman's count can reset)
  firstHitAt: number; // world.time of the first hit of the current count
  provoked: boolean; // Bigfoot fights back once hit
  surface?: Surface; // merman only
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
  finishing: Finishing[]; // finished animals playing out their finish
  kills: Kills;
  nextId: number;
  streak: number; // kills in a row, each within STREAK_WINDOW of the last
  lastKill: number; // world.time of the last kill
  events: GameEvent[]; // taken by the host each frame with drain()
  hearts: number;
  wasted: boolean; // out of hearts: the world stops
  met: Set<Kind>; // rares hit at least once
};

const TOP_BAND: [number, number] = [0.12, 0.3];
export { GROUND_LINE };
const HIT_INSET = 0.15;
const FLASH = 0.12;
const KNOCKBACK = 6;
const FLAMINGO_BOB = 10;
const RABBIT_HOP = 14;
// Per-second chance a dashing iguana stops, giving irregular dash lengths.
const IGUANA_STOP_RATE = 1.2;

const between = (rng: Rng, [lo, hi]: readonly [number, number]) => lo + rng() * (hi - lo);
const intBetween = (rng: Rng, [lo, hi]: readonly [number, number]) => lo + Math.floor(rng() * (hi - lo + 1));

export function emptyKills(): Kills {
  return Object.fromEntries(KINDS.map((k) => [k, 0])) as Kills;
}

const table: Record<Kind, Creature> = CREATURES;
const RARES = KINDS.filter(isRare);
// Hostile rares (Bigfoot) may share the screen with one other rare.
const sharesScreen = (k: Kind) => table[k].role === "hostile";

// Vertical offset from the lane's resting y, a pure function of the animal's
// age (or the merman's surface state) so the resting y can be recovered by
// subtracting it.
function bob(a: Animal): number {
  if (a.surface) return sinkOffset(a.surface, a.h);
  if (a.kind === "flamingo") return Math.sin(a.age * 2.2) * FLAMINGO_BOB;
  if (a.kind === "rabbit") return -Math.abs(Math.sin(a.age * 7)) * RABBIT_HOP;
  return 0;
}

function restingY(world: World, a: Animal, topFraction: number): number {
  switch (table[a.kind].lane) {
    case "sky":
      return topFraction * world.height;
    case "ground":
      return GROUND_LINE * world.height - a.h;
    case "sea":
      return SEA_LINE * world.height - a.h * SURFACE_OUT; // fully up
  }
}

const centre = (a: Animal) => ({ x: a.x + a.w / 2, y: a.y + a.h / 2 });

export function createWorld(width: number, height: number, rng: Rng): World {
  return {
    width,
    height,
    time: 0,
    nextSpawn: between(rng, SPAWN_INTERVAL),
    animals: [],
    finishing: [],
    kills: emptyKills(),
    nextId: 1,
    streak: 0,
    lastKill: -Infinity,
    events: [],
    hearts: HEARTS,
    wasted: false,
    met: new Set(),
  };
}

/** Takes the events since the last drain. */
export function drain(world: World): GameEvent[] {
  const out = world.events;
  world.events = [];
  return out;
}

/** Hearts lost to `source`; clamps at 0, ignored once at 0, which ends the round. */
export function damage(world: World, hearts: number, source: Kind, x: number, y: number): void {
  if (world.hearts <= 0) return;
  world.hearts = Math.max(0, world.hearts - hearts);
  world.events.push({ type: "damage", hearts: world.hearts, source, x, y });
  if (world.hearts === 0) {
    world.wasted = true;
    world.events.push({ type: "wasted" });
  }
}

// Commons by weight; rares roll on their own (spawnRares).
function pickKind(rng: Rng): Kind {
  let r = rng();
  for (const k of kindsWhere("prey")) {
    const spawn = CREATURES[k].spawn;
    r -= "weight" in spawn ? spawn.weight : 0;
    if (r < 0) return k;
  }
  return "rabbit";
}

export function spawn(world: World, rng: Rng, kind?: Kind): Animal {
  const k = kind ?? pickKind(rng);
  const cfg = CREATURES[k];
  const [w, h] = cfg.size;
  const dir = rng() < 0.5 ? -1 : 1;
  const hp = intBetween(rng, cfg.rule.hits);
  const a: Animal = {
    id: world.nextId++,
    kind: k,
    x: dir > 0 ? -w : world.width,
    y: 0,
    vx: dir * between(rng, cfg.speed) * world.width,
    w,
    h,
    hp,
    hits: 0,
    firstHitAt: -Infinity,
    provoked: false,
    age: 0,
    pause: 0,
    flash: 0,
  };
  if (cfg.lane === "sea") {
    // He surfaces rather than travels.
    a.surface = newSurface();
    a.vx = 0;
    a.x = surfaceX(rng, world.width, w);
  }
  a.y = restingY(world, a, between(rng, TOP_BAND)) + bob(a);
  // Protected kinds stay at the front of the list: drawn first, hit last.
  if (cfg.role === "protected") {
    const i = world.animals.findIndex((b) => table[b.kind].role !== "protected");
    world.animals.splice(i < 0 ? world.animals.length : i, 0, a);
  } else {
    world.animals.push(a);
  }
  if (isRare(k)) world.events.push({ type: "rare", kind: k, event: "appeared" });
  return a;
}

// Each rare not alive rolls its per-second chance; at most one rare on screen
// besides a hostile one.
function spawnRares(world: World, dt: number, rng: Rng): void {
  for (const k of RARES) {
    const sp = table[k].spawn;
    if (!("perMinute" in sp) || world.time < (sp.after ?? 0)) continue;
    if (world.animals.some((a) => a.kind === k)) continue;
    if (!sharesScreen(k) && world.animals.some((a) => isRare(a.kind) && !sharesScreen(a.kind))) continue;
    if (rng() < (sp.perMinute / 60) * dt) spawn(world, rng, k);
  }
}

// The merman's cycle; false when he has left.
function stepMerman(world: World, a: Animal, s: Surface, dt: number, rng: Rng): boolean {
  const within = table[a.kind].rule.within ?? Infinity;
  if (a.hits > 0 && world.time - a.firstHitAt > within) {
    a.hits = 0;
    dive(s);
    world.events.push({ type: "escaped", kind: a.kind, ...centre(a) });
  }
  const next = stepSurface(s, dt);
  if (next === "moved") a.x = surfaceX(rng, world.width, a.w);
  return next !== "gone";
}

export function step(world: World, dt: number, rng: Rng): void {
  if (world.wasted) return;
  dt = Math.min(Math.max(dt, 0), MAX_DT);
  world.time += dt;

  if (world.time >= world.nextSpawn) {
    if (world.animals.length < MAX_ALIVE) spawn(world, rng);
    world.nextSpawn = world.time + between(rng, SPAWN_INTERVAL);
  }
  spawnRares(world, dt, rng);

  const left = new Set<Animal>();
  for (const a of world.animals) {
    const rest = a.y - bob(a);
    a.age += dt;
    if (a.surface && !stepMerman(world, a, a.surface, dt, rng)) left.add(a);
    a.y = rest + bob(a);
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

  world.animals = world.animals.filter(
    (a) => !left.has(a) && (a.vx > 0 ? a.x <= world.width : a.x + a.w >= 0),
  );
}

function inBox(world: World, a: Animal, x: number, y: number): boolean {
  const ix = a.w * HIT_INSET;
  const iy = a.h * HIT_INSET;
  if (x < a.x + ix || x > a.x + a.w - ix || y < a.y + iy || y > a.y + a.h - iy) return false;
  // Only the part above the water is hittable.
  return table[a.kind].lane !== "sea" || y < SEA_LINE * world.height;
}

// Front-most first: the list's end is drawn last, so it is on top.
export function shoot(world: World, x: number, y: number, rng: Rng): { hit: Animal | null; finished: boolean } {
  if (world.wasted) return { hit: null, finished: false };
  for (let i = world.animals.length - 1; i >= 0; i--) {
    const a = world.animals[i];
    if (!inBox(world, a, x, y)) continue;
    const finished = registerHit(world, a);
    if (finished) {
      world.animals.splice(i, 1);
      const id = table[a.kind].finish;
      world.finishing.push({
        kind: a.kind,
        id,
        state: FINISHES[id].start(a, world, rng),
        x: a.x,
        y: a.y,
        w: a.w,
        h: a.h,
        dir: a.vx < 0 ? -1 : 1,
      });
    }
    return { hit: a, finished };
  }
  return { hit: null, finished: false };
}

// Counts a hit and emits its events; true when it was the finishing hit.
function registerHit(world: World, a: Animal): boolean {
  const cfg = table[a.kind];
  const within = cfg.rule.within;
  if (within !== undefined && a.hits > 0 && world.time - a.firstHitAt > within) a.hits = 0; // a new count
  a.hits += 1;
  if (a.hits === 1) a.firstHitAt = world.time;
  a.flash = FLASH;
  a.x -= Math.sign(a.vx) * KNOCKBACK;
  const at = centre(a);
  const finished = a.hits >= a.hp;
  const secret = a.kind === "ufo" || cfg.role === "hostile"; // UFO's total is secret; Bigfoot has a bar
  world.events.push(
    secret
      ? { type: "hit", kind: a.kind, n: a.hits, ...at }
      : { type: "hit", kind: a.kind, n: a.hits, of: a.hp, ...at },
  );

  if (isRare(a.kind) && !world.met.has(a.kind)) {
    world.met.add(a.kind);
    world.events.push({ type: "rare", kind: a.kind, event: "met" });
  }
  if (cfg.role === "hostile" && !a.provoked) {
    a.provoked = true;
    world.events.push({ type: "callout", text: "ANGRY!", x: at.x, y: a.y });
  }
  if (a.surface && a.hits === 1 && !finished) duck(a.surface);

  if (cfg.role === "protected") {
    const points = penaltyFor(a.kind, a.hits, finished);
    if (points !== 0) world.events.push({ type: "penalty", kind: a.kind, points, ...at });
    world.streak = 0;
    world.lastKill = -Infinity;
  } else if (finished) {
    world.kills[a.kind] += 1;
    if (streaks(a.kind)) {
      world.streak = world.time - world.lastKill <= STREAK_WINDOW ? world.streak + 1 : 1;
      world.lastKill = world.time;
    }
    // A kill that builds no streak (Bigfoot) reports a lone kill.
    world.events.push({ type: "kill", kind: a.kind, ...at, streak: streaks(a.kind) ? world.streak : 1 });
  }
  return finished;
}

export function resize(world: World, width: number, height: number): void {
  const rx = width / world.width;
  const oldHeight = world.height;
  for (const a of world.animals) {
    const rest = a.y - bob(a);
    a.x *= rx;
    a.vx *= rx;
    a.y = restingY({ ...world, height }, a, rest / oldHeight) + bob(a);
  }
  world.width = width;
  world.height = height;
}
