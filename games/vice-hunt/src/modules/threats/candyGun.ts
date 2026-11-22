// The candy gator's gun: one threat per provoked gator, started by
// stepThreats. Every hit that does not finish him earns one shot back; hits
// landing while he shoots queue more, fired one after another. A shot: he
// stops, draws (twirling the gun while he is still calm), aims, squints and
// fires a spray of round(10 + 10 * anger) candies ("FWUMP!") that tumble at
// the camera and stick to the glass, where they take shots (fx/glass.ts).
// Each spray costs `perShot` hearts when its first candy lands, at most `max`
// from one gator. Once he is gone no new shot starts; candies in flight still
// land. The threat ends when he is gone and every candy and puff is done.
// Gentle: the candies appear on the glass at once (fading in), no flight.
import { CREATURES, type Kind } from "../../creatures";
import { GATOR_LINES } from "../../events";
import { type CandyLook, CANDY_COLORS, drawCandy, randomCandy } from "../../fx/candy";
import { addCandy, shake } from "../../fx/glass";
import { drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import { GATOR, angerOf, clamp01, gatorPoints, gatorToWorld, gatorTop, liveGator } from "../../rig/gator";
import { easeIO, easeOut } from "../../rig/rig";
import type { Rng } from "../../rng";
import { damage, type Animal, type World } from "../../world";
import type { Origin, ThreatModule } from "../types";

export const CANDY_FLIGHT = 0.42; // seconds from the muzzle to the glass
export const SPRAY_STAGGER = 0.025; // between candies of one spray
const STAGE = 1280;
const LOWER = 0.3; // seconds to put the gun down
const DEG = Math.PI / 180;

/** A shot's timeline in seconds (start of the raise, gun up, trigger, end),
 *  quicker as he gets angrier; a calm gator also twirls and blows the smoke. */
export function shotTimeline(anger: number): { raise: number; aim: number; fire: number; end: number; twirl: boolean } {
  const sp = 1 + 0.9 * anger;
  const fire = 0.62 / sp;
  return { raise: 0.12 / sp, aim: 0.4 / sp, fire, end: fire + (anger < 0.5 ? 0.95 : 0.45) / sp, twirl: anger < 0.5 };
}

type Spray = { hurt: boolean };
export type Flight = {
  t: number; // 0..1 of the flight; negative while it waits its turn
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  size: number;
  rot: number; // radians, as it lands
  spin: number; // radians turned over the flight
  look: CandyLook;
  spray: Spray;
};

export type CandyGunState = {
  kind: Kind;
  from: number;
  perShot: number;
  max: number;
  dealt: number;
  answered: number; // hits already answered with a shot
  shotT: number; // seconds into the current shot, or -1
  shot: ReturnType<typeof shotTimeline>;
  sprayed: boolean;
  reduced: boolean;
  gone: boolean;
  flights: Flight[];
  parts: Particle[];
};

type ReturnsFire = { kind: "returns-fire"; perShot: number; max: number };

// Started the frame after the hit that provoked him: that hit is the first
// to answer, any before it (none in play) are not.
function start(at: Origin, world: World, _rng: Rng, reduced: boolean): CandyGunState {
  const t = (CREATURES[at.kind] as { threat?: ReturnsFire }).threat;
  const a = world.animals.find((b) => b.id === at.id);
  return {
    kind: at.kind,
    from: at.id ?? -1,
    perShot: t?.perShot ?? 0,
    max: t?.max ?? 0,
    dealt: 0,
    answered: Math.max(0, (a?.hits ?? 1) - 1),
    shotT: -1,
    shot: shotTimeline(0),
    sprayed: false,
    reduced,
    gone: false,
    flights: [],
    parts: [],
  };
}

const facing = (a: Animal) => (a.vx < 0 ? -1 : 1);
const toWorld = (a: Animal, p: [number, number]) => gatorToWorld(p, a.x, gatorTop(a), a.w / GATOR.W, facing(a));

function land(s: CandyGunState, world: World, f: Flight): void {
  // Aimed at the screen as it was: kept on it if the window shrank since.
  f.x1 = Math.min(world.width - f.size / 2, Math.max(f.size / 2, f.x1));
  f.y1 = Math.min(world.height - f.size / 2, Math.max(f.size / 2, f.y1));
  addCandy(world.glass, f.x1, f.y1, f.size, f.rot, f.look, s.reduced);
  if (f.spray.hurt) return;
  f.spray.hurt = true;
  if (!s.reduced) shake(world.glass, 3, 0.18);
  const n = Math.min(s.perShot, s.max - s.dealt);
  if (n > 0) {
    s.dealt += n;
    damage(world, n, s.kind, f.x1, f.y1 - 0.08 * world.height);
  }
}

// The trigger: a pink sugar puff and sparkles at the tip, then the candies.
function spray(s: CandyGunState, world: World, rng: Rng, a: Animal, out: World["events"]): void {
  const W = world.width;
  const H = world.height;
  const k = W / STAGE;
  const anger = angerOf(a.hits, a.hp);
  const { pose, look } = liveGator(a);
  const [mx, my] = toWorld(a, gatorPoints(pose, look).muzzle);
  out.push({ type: "callout", text: "FWUMP!", x: mx + 30 * k * facing(a), y: my - 30 * k });
  if (!s.reduced) {
    for (let i = 0; i < 12; i++) {
      const ang = (facing(a) < 0 ? Math.PI : 0) + (rng() - 0.5) * 1.6;
      const sp = (60 + rng() * 200) * k;
      emit(s.parts, { kind: "dot", x: mx, y: my, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, drag: 4, life: 0.35, size: (2 + rng() * 3) * k, color: CANDY_COLORS[i % CANDY_COLORS.length] });
    }
    emit(s.parts, { kind: "smoke", x: mx, y: my, vx: 30 * k * facing(a), vy: -20 * k, life: 0.8, size: 9 * k, grow: 3, alpha: 0.85, color: "rgba(255,190,220,.9)" });
  }
  const n = Math.round(10 + anger * 10);
  const spread = 0.28 + n / 100;
  const sp: Spray = { hurt: false };
  for (let i = 0; i < n; i++) {
    const size = (32 + rng() * 20) * k;
    const x1 = Math.min(W - size, Math.max(size, W * (0.5 + (rng() - 0.5) * 2 * spread)));
    const y1 = Math.min(H - size, Math.max(size, H * (0.45 + (rng() - 0.5) * 1.2 * spread)));
    const f: Flight = { t: -i * SPRAY_STAGGER / CANDY_FLIGHT, x0: mx, y0: my, x1, y1, size, rot: (rng() - 0.5) * 50 * DEG, spin: (rng() - 0.5) * 720 * DEG, look: randomCandy(rng), spray: sp };
    if (s.reduced) land(s, world, f);
    else s.flights.push(f);
  }
}

// Writes the shot's pose onto the animal for the renderer (aim, twirl, eyes).
function pose(s: CandyGunState, a: Animal): void {
  const { raise, aim, fire, end, twirl } = s.shot;
  const t = s.shotT;
  const up = easeIO(clamp01((t - raise) / (aim - raise)));
  const down = easeIO(clamp01((t - (end - LOWER)) / LOWER));
  const kick = t > fire && t < fire + 0.16 ? Math.sin(((t - fire) / 0.16) * Math.PI) * 0.18 : 0;
  a.shootK = clamp01(t / end);
  a.aim = up * (1 - down) * (1 - kick);
  const draw = twirl ? 720 * (1 - easeOut(clamp01((t - raise) / (fire - raise)))) : 0;
  const blow = twirl && t > fire + 0.53 && t < fire + 0.88 ? 360 * easeIO((t - fire - 0.53) / 0.35) : 0;
  a.spin = draw + blow;
  a.eyes = t < raise ? "shock" : t < end - LOWER ? "squint" : twirl ? "wink" : "squint";
}

function stopShot(s: CandyGunState, a: Animal | undefined): void {
  s.shotT = -1;
  if (!a) return;
  a.shootK = undefined;
  a.aim = 0;
  a.spin = 0;
  a.eyes = undefined;
}

export const candyGun: ThreatModule<CandyGunState> = {
  start,
  step(s, dt, world, rng, out) {
    const a = s.gone ? undefined : world.animals.find((b) => b.id === s.from);
    if (!a) {
      s.gone = true;
      s.shotT = -1;
    } else {
      if (s.shotT < 0 && a.hits > s.answered) {
        s.answered += 1;
        s.shotT = 0;
        s.sprayed = false;
        s.shot = shotTimeline(angerOf(a.hits, a.hp));
        const live = liveGator(a);
        const [hx, hy] = toWorld(a, gatorPoints(live.pose, live.look).headTop);
        out.push({ type: "callout", text: GATOR_LINES[Math.min(GATOR_LINES.length - 1, s.answered - 1)], x: hx, y: hy });
      }
      if (s.shotT >= 0) {
        s.shotT += dt;
        pose(s, a);
        if (!s.sprayed && s.shotT >= s.shot.fire) {
          s.sprayed = true;
          spray(s, world, rng, a, out);
        }
        if (s.shotT >= s.shot.end) stopShot(s, a);
      }
    }
    let n = 0;
    for (const f of s.flights) {
      f.t += dt / CANDY_FLIGHT;
      if (f.t >= 1) land(s, world, f);
      else s.flights[n++] = f;
    }
    s.flights.length = n;
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => s.gone && s.flights.length === 0 && s.parts.length === 0,
  // On the glass layer: the candies tumbling at the camera, growing, on a
  // small arc, and the sugar puff at the muzzle.
  draw(ctx, s) {
    drawParticles(ctx, s.parts);
    for (const f of s.flights) {
      if (f.t < 0) continue;
      const k = f.t;
      const x = f.x0 + (f.x1 - f.x0) * k;
      const y = f.y0 + (f.y1 - f.y0) * k - Math.sin(k * Math.PI) * 40 * (f.size / 42);
      drawCandy(ctx, f.look, x, y, f.size * (0.12 + k * k * 0.98), f.rot + f.spin * (1 - k));
    }
  },
};
