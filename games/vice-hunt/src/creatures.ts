// The creature registry: every creature is one typed record. Roles are a
// discriminated union, so a prey with a threat or a protected creature with
// positive points does not compile. Speeds are hero widths per second, hits
// are an inclusive integer range, sizes are the sprite box in px at a 1x hero
// (heights match each sprite's SVG viewBox aspect).

export type Lane = "sky" | "ground" | "sea";
/** Inclusive hit range; `within`: seconds for the rest after the first, else the count resets. */
export type HitRule = { hits: readonly [number, number]; within?: number };
export type Spawn = { weight: number } | { perMinute: number; after?: number };

export type MoveId = "hop" | "dash" | "glide" | "float" | "swoop" | "strut" | "surface" | "hover" | "stomp";
export type HitReactionId = "none" | "flinch" | "garland";
export type FinishId = "falls" | "deflates" | "pounces" | "rocket" | "fountain" | "crashes" | "jet";
export type ThreatId = "claw-swipe" | "throw";

export type Retaliates = { kind: "retaliates"; damage: number; attack: ThreatId };
export type Throws = {
  kind: "throws";
  perHit: number;
  max: number;
  every: number;
  attack: ThreatId;
  provokedBy: "first-hit";
};

export type Base = {
  lane: Lane;
  size: readonly [number, number];
  speed: readonly [number, number];
  spawn: Spawn;
  rule: HitRule;
  move: MoveId;
  hit: HitReactionId;
  finish: FinishId;
};
export type Prey = Base & { role: "prey"; points: number };
export type Trophy = Base & { role: "trophy"; points: number };
export type Protected = Base & {
  role: "protected";
  penalty: { perHit: number } | { onFinish: number };
  threat?: Retaliates;
};
export type Hostile = Base & { role: "hostile"; points: number; threat: Throws; boss?: { bar: true } };
export type Creature = Prey | Trophy | Protected | Hostile;

export const CREATURES = {
  rabbit: {
    role: "prey", lane: "ground", size: [84, 58], speed: [0.33, 0.45], spawn: { weight: 0.4 },
    rule: { hits: [1, 1] }, move: "hop", hit: "none", finish: "falls", points: 100,
  },
  iguana: {
    role: "prey", lane: "ground", size: [120, 40], speed: [0.15, 0.36], spawn: { weight: 0.33 },
    rule: { hits: [1, 1] }, move: "dash", hit: "none", finish: "falls", points: 150,
  },
  flamingo: {
    role: "prey", lane: "sky", size: [104, 55], speed: [0.12, 0.18], spawn: { weight: 0.27 },
    rule: { hits: [1, 1] }, move: "glide", hit: "none", finish: "falls", points: 200,
  },
  cow: {
    role: "protected", lane: "sky", size: [118, 83], speed: [0.05, 0.065], spawn: { perMinute: 0.4 },
    rule: { hits: [2, 2] }, move: "float", hit: "garland", finish: "deflates", penalty: { perHit: -500 },
  },
  tiger: {
    role: "protected", lane: "sky", size: [136, 75], speed: [0.16, 0.19], spawn: { perMinute: 0.4 },
    rule: { hits: [3, 3] }, move: "swoop", hit: "flinch", finish: "pounces", penalty: { onFinish: -250 },
    threat: { kind: "retaliates", damage: 1.5, attack: "claw-swipe" },
  },
  shark: {
    role: "trophy", lane: "ground", size: [84, 121], speed: [0.07, 0.08], spawn: { perMinute: 0.4 },
    rule: { hits: [3, 3] }, move: "strut", hit: "flinch", finish: "rocket", points: 600,
  },
  merman: {
    // He surfaces rather than travels (see the world's sea-lane movement).
    role: "trophy", lane: "sea", size: [96, 75], speed: [0, 0], spawn: { perMinute: 0.4 },
    rule: { hits: [3, 3], within: 1.1 }, move: "surface", hit: "flinch", finish: "fountain", points: 600,
  },
  ufo: {
    role: "trophy", lane: "sky", size: [132, 87], speed: [0.04, 0.05], spawn: { perMinute: 1 / 3 },
    rule: { hits: [6, 7] }, move: "hover", hit: "flinch", finish: "crashes", points: 1000,
  },
  bigfoot: {
    role: "hostile", lane: "ground", size: [109, 153], speed: [0.05, 0.075], spawn: { perMinute: 0.22, after: 30 },
    rule: { hits: [20, 20] }, move: "stomp", hit: "flinch", finish: "jet", points: 3000,
    threat: { kind: "throws", perHit: 0.5, max: 1.5, every: 1.5, attack: "throw", provokedBy: "first-hit" },
    boss: { bar: true },
  },
} as const satisfies Record<string, Creature>;

export type Kind = keyof typeof CREATURES;

const table: Record<Kind, Creature> = CREATURES;

export const KINDS = Object.keys(CREATURES) as readonly Kind[];

export function kindsWhere(role: Creature["role"]): Kind[] {
  return KINDS.filter((k) => table[k].role === role);
}

export function isRare(kind: Kind): boolean {
  return "perMinute" in table[kind].spawn;
}

export function streaks(kind: Kind): boolean {
  const role = table[kind].role;
  return role === "prey" || role === "trophy";
}

export function pointsFor(kind: Kind): number {
  const c = table[kind];
  return c.role === "protected" ? 0 : c.points;
}

export function penaltyFor(kind: Kind, hitNumber: number, finishing: boolean): number {
  const c = table[kind];
  if (c.role !== "protected") return 0;
  if ("perHit" in c.penalty) return c.penalty.perHit;
  return finishing ? c.penalty.onFinish : 0;
}
