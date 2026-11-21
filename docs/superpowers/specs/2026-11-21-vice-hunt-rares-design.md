# Vice Hunt: rare creatures, health and the stats menu

Date: 2026-11-21. Owner: Shashwat. Builds on `docs/superpowers/specs/2026-11-20-gta6-mod-design.md` (revisions 1 to 3), which stays the authority for everything this document does not change.

Motion prototype (the reference for every animation below): `.superpowers/brainstorm/92060-1795271962/content/motion-v24.html`, with its art in the same folder (`anim-*.svg`, `sp-*.svg`). Open it through the brainstorm server or straight from disk (the SVGs are inlined in the page). It is throwaway code: copy the feel, not the code.

## Why

Vice Hunt is the easter-egg game inside the GTA 6 mode. Today it has three common animals and a Bigfoot who turns up every twenty seconds or so, so it runs out of surprises in a minute. The owner wants it to reward playing on: rare, funny creatures that each do something memorable when you hit them, a couple of animals you are not supposed to shoot, two that fight back, and a health bar so a round can end. It is personal and playful (crude humour is in, on purpose); it should feel like a small, polished game, not a demo.

## Goals

- Six rare creatures, each with its own movement, hit rule and finishing animation: flying cow, flying tiger, walking shark, merman, UFO, Bigfoot (reworked).
- Health: three hearts; only Bigfoot and the tiger can take them, and only after the player hits them first. Empty hearts end the round with a GTA-style WASTED, then the results card.
- Penalties: the cow and the tiger cost points when hit.
- A stats menu (layout C) for the kill counts; the wanted stars go.
- One creature model (roles, a typed record per creature) so adding a creature later is one record plus its art and finish.
- Smooth, game-quality motion: real joints where a body bends (Bigfoot's rig), never a flat sprite squashed to fake a pose.

## Non-goals

- New recorded sounds. The owner picks organic sounds by ear from real CC0 recordings; until then new events reuse the existing synthesised or recorded effects (or stay silent). Sound picks are a follow-up.
- Phones and tablets: the whole mode is desktop only already.
- Persisting anything between rounds (collections reset on Play again).

## Anti-goals (a failure even if it works)

- Bullet holes, cracks or a glass-break effect on a shot. Revision 3 removed them; the tiger's claw marks and the poop splats are the only marks on the "glass", and both fade.
- Any sound during automated tests (`navigator.webdriver`): silent as today.
- Anything from the game in the homepage's first load (`scripts/check-gta6-bundle.sh` must still pass).
- A creature breaking apart in motion (the prototype's first roll did; the rule is: a body that moves as one is drawn as one).

## Constraints

- `games/vice-hunt/` stays its own package with no app imports, reached only by dynamic import. World logic stays pure and tested (vitest); drawing takes a canvas context and keeps no module-level mutable state.
- The app's HUD shows state the package reports through `HuntOptions` callbacks (as it does for kills and ammo today).
- Reduced motion: every finish has a gentle version (fades and short moves, no spins, no screen shake, no flying globs; splats and scratches appear and fade in place).
- Repo rules: tokens for durations and easings (`app/globals.css`, `lib/motionVariants.ts`); no em-dashes in user-facing copy; `scripts/verify-simplification.sh`, lint, types and tests pass.

## Approaches considered

1. **One creature table plus a small module per finish (chosen).** Every creature is one typed record (below, "The creature types"); the world reads it; each special finish (deflate, pounce, rocket, fountain, crash, jet) is its own pure, testable step function plus a draw function. Matches the package as it is (pure world, separate render) and keeps the tests.
2. **A class per creature** (`class Tiger extends Creature`, own update, hit and draw). Reads nicely per creature, but tangles state with drawing and fights the package's tested shape; most tests would be rewritten.

The owner picked 1.

## The creatures

Roles: **prey** (common, points), **trophy** (rare, points), **protected** (penalty when hit), **hostile** (fights back once provoked).

| Creature | Role | Lane | Hits to finish | Points | Hurts you? | Finish |
|---|---|---|---|---|---|---|
| Rabbit | prey | ground | 1 | 100 | no | falls (today's) |
| Iguana | prey | ground | 1 | 150 | no | falls (today's) |
| Flamingo | prey | sky | 1 | 200 | no | falls (today's) |
| Flying cow | protected | sky | 2 | −500 per hit | no | deflates |
| Flying tiger | protected | sky | 3 | −250 (on the 3rd) | claw: −1.5 ♥ | pounces |
| Walking shark | trophy | ground | 3 | 600 | no | rocket |
| Merman | trophy | sea (new) | 3 within 1.1 s | 600 | no | fountain |
| UFO | trophy | sky | 6 or 7 (rolled) | 1000 | no | crashes |
| Bigfoot | hostile | ground | 20 | 3000 | throws: up to −1.5 ♥ | jet |

Rarity (per minute of play, rares only; commons keep today's weights): cow, tiger, shark and merman about once every 2.5 minutes each, UFO about once every 3 minutes, Bigfoot about once every 4 to 5 minutes and never before the first 30 s. Together a rare turns up about once a minute, so a short game still has a real chance. At most one of each rare alive at a time; at most one rare on screen at once except Bigfoot, who can share it.

Streaks (DOUBLE, TRIPLE): only prey and trophy kills build them. A cow or tiger hit breaks the current streak.

Score never drops below 0.

### Behaviour, hit by hit

**Flying cow** (sky, slow, bobbing, little white angel wings flapping, cowbell). Hit 1: a marigold garland pops onto her neck (springy scale-in), −500, a small jolt. Hit 2: −500; she deflates like a let-go balloon: shrinks as the air hisses out (white puffs from behind), wobbling, then an erratic zigzag up and off screen, garland still on (about 1.6 s). She cannot be killed; she counts in the rare collection as "seen" and her row counts hits (in red).

**Flying tiger** (sky, fast, quick wingbeats, swooping, tail swishing). Hits 1 and 2: a flinch and "1 / 3", "2 / 3", it keeps flying; no time limit; the count resets if it leaves. Hit 3: −250. It pounces down onto the sand in an arc (landing squash, dust), crouches, then leaps straight at the screen, the player's point of view: a front-on hissing face (art: `anim-tiger-face.svg`) grows from its spot on the sand to fill most of the screen, accelerating, a jolt and "HSSSS!" as it hits the glass. A paw (`anim-tiger-paw.svg`) rakes down-left across the screen and three claw scratches draw in as it passes (dark with a red inner line and a white glint), with a bigger shake; this costs 1.5 ♥. The face drops away out of view; the scratches are the last thing and fade over about 1.5 s. It does not fly off afterwards.

**Walking shark** (ground, upright on two legs in sneakers, nose to the sky, fins swinging like arms, a bounce per step; art `sp-shark-v2.svg`). Hits 1 and 2: a flinch, "1 / 3", "2 / 3". Hit 3: +600; it becomes a rocket: it stops and crouches, sparks spit out underneath, its legs pull up into its body so it becomes one smooth rocket shape, then it launches straight up, accelerating, on a shower of fireworks spraying down and out below it (cream, gold, pink, teal, orange sparks, small star bursts, a white smoke trail), and leaves through the top.

**Merman** (new sea lane along the water line; an old sea king: long wavy silver hair with a centre parting, a big white-and-grey Santa beard and moustache, pink sunglasses, shell necklace, teal tail; art `sp-merman-v2.svg`). He rises out of the water (masked by the water line, a foam line where he breaks the surface), waves, dives back after a few seconds and pops up somewhere else later. Three quick hits: the first makes him flinch, shows "1 / 3" and he starts ducking and slipping under; hits 2 and 3 must land within 1.1 s of the first, or he is gone ("TOO SLOW") and the count resets. Hit 3: +600; he drops under and the sea shoots up a fountain of about 26 small colourful fish that fan out, arc over and dive back in, each with a little splash.

**UFO** (sky, hovering and wobbling, rim lights chasing, now and then a tractor beam just for looks; a little green alien in the dome). Takes 6 or 7 hits, rolled per UFO; each hit sparks and jolts it and switches the beam off for a moment; smoke from its rim thickens and its wobble grows with damage. The last hit: +1000; it sputters in place (shake, tilt, smoke), then spirals down into the sea with a splash; as it starts to fall the alien bails out (the dome is empty from then on) and drifts down under a pink parachute, swaying, into the water with a small splash. Art: `sp-ufo.svg`, `sp-alien-chute.svg`.

**Bigfoot** (ground, walks across; drawn as a jointed rig, see below). Harmless until hit. The first hit provokes him ("ANGRY!", strain face) and a slim boss bar appears over his head, draining with each hit. Provoked, he keeps walking and throws his poop at the screen every 1.5 s, overarm (wind-up back, release forward) without breaking stride, until he walks off. Each glob tumbles at the camera, growing, and splats on the glass at a random spot (irregular blob, flecks, a drip), partly hiding the view for about 3.5 s before fading. Each splat costs ½ ♥, but one Bigfoot can take at most 1.5 ♥ in all; later throws still splat but cost nothing. He takes 20 hits. The 20th: +3000; he squats properly (hips drop, knees bend over planted feet, hands on knees, a small settle), strains (gritted teeth, squeezed eyes, red cheeks, a sweat drop, a tremble), one push, "PFFT!" and a pile drops out behind him (squash-bounce, green stink); he shifts into a launch pose (still squatting, arms flung back, a happy grin), leans back onto it and blasts off diagonally up and away, accelerating, with a brown spray and falling chunks behind him and green stink; the first pile is flung at the camera as a big central "SPLAT!", and three more globs splat the screen during the flight. All splats fade a few seconds after he is gone.

### Bigfoot's rig

Bigfoot is drawn from parts, not a sprite: torso and head (paths from today's sprite), two-part arms and legs drawn as thick round-capped strokes in fur colours with a dark outline, round hands, oval feet, and four faces (calm, strain, relief, dizzy unused now). Legs use two-bone IK from the hips to planted foot targets (knees bend forward); arms use forward kinematics from shoulders that follow the torso. Poses are named sets of numbers (pelvis position, torso and head angle, foot targets, arm angles, face) blended with a strong ease-in-out; the walk is procedural (feet step in turn and lift while swinging, hips bob, arms counter-swing). The prototype's `makeRig`, `ik`, `POSES` and timings are the reference. The IK, pose blending and the finish timeline are pure and get tests; drawing takes the context.

## Art on the canvas

The prototype animates SVG parts with CSS; the game draws on a canvas. My call: every creature except Bigfoot stays a set of pre-rendered frames in `games/vice-hunt/src/art/sprites.ts` (today's two-frame pattern, grown to as many frames as a cycle needs: wings up and down for the cow and tiger, a step cycle for the shark, a wave for the merman, lights for the UFO), plus extra frames for special states: the cow wearing her garland, the shark as a rocket (legs drawn pulled into its body), the empty UFO, the alien under its parachute, the tiger's face and paw. Movement, tilt, bob and squash come from transforms at draw time. Only Bigfoot is a rig (he bends). The sea lane's water line must match the beach scene's sea (about 0.69 of the scene height in the prototype; measure against `BeachScene`).

## Health

- Three hearts in the game HUD's top-left corner, before the time switch and radio; halves shown. A hit makes them jump, flashes red around the screen edges, and pops "−½ ♥" or "−1.5 ♥".
- Damage only from a provoked Bigfoot's splats and the tiger's claw.
- Zero hearts: the round ends. The scene greys out, a red WASTED fades in (GTA style; the Anton display face is fine), then the results card. Play again refills the hearts.
- Health is game state: the package owns it and reports it (`onHealth(hearts)`, `onWasted()`); the app draws hearts and WASTED.

## Stats menu (layout C) and HUD

- The wanted stars are removed from the header.
- Header right: the three common counts as today's glass chips (latest kill glows pink), a thin divider, then "RARE n / 6": how many of the six rares the player has met (shot at least once; the cow counts on her first hit). Hovering it, or clicking it (pins it open like the radio, so a keyboard can open it), drops the six rares as small glass rows: icon, name, count. Unmet ones show a dark silhouette, "???" and 0. The cow's row counts hits in red. When a rare appears, or is first met, the counter flashes once.
- Results card: the score first, then every creature (unmet rares as "???"), accuracy and best streak.
- Already built on `gta6-mod`, uncommitted at the time of writing, and assumed by this design: the radio as a minimised controller beside the time switch (full card on hover), the header as one row, the score on the billboard's bottom-left corner, rabbit and iguana 20% bigger and Bigfoot 30% bigger.

## The creature types (built to extend)

The owner asked for creature "classes" as types, not classes: a model where a new creature is one entry, invalid combinations do not compile, and every place that must handle a creature is forced to by the compiler.

**One registry, roles as a discriminated union.** Each role carries only the fields that make sense for it, so a prey with a threat, or a protected creature with positive points, is a type error.

```ts
type Lane = "sky" | "ground" | "sea";
type HitRule = { hits: readonly [number, number]; within?: number }; // inclusive; `within`: seconds for the rest after the first, else reset
type Spawn = { weight: number } | { perMinute: number; after?: number };

type Base = {
  lane: Lane;
  size: readonly [number, number];   // sprite box in px at a 1x hero
  speed: readonly [number, number];  // hero widths per second
  spawn: Spawn;
  rule: HitRule;
  move: MoveId;                      // keys of MOVES
  hit: HitReactionId;                // keys of HIT_REACTIONS (non-finishing hits)
  finish: FinishId;                  // keys of FINISHES
};
type Prey = Base & { role: "prey"; points: number };
type Trophy = Base & { role: "trophy"; points: number };
type Protected = Base & { role: "protected"; penalty: { perHit: number } | { onFinish: number }; threat?: Retaliates };
type Hostile = Base & { role: "hostile"; points: number; threat: Throws; boss?: { bar: true } };
type Creature = Prey | Trophy | Protected | Hostile;

type Retaliates = { kind: "retaliates"; damage: number; attack: ThreatId };
type Throws = { kind: "throws"; perHit: number; max: number; every: number; attack: ThreatId; provokedBy: "first-hit" };

export const CREATURES = {
  rabbit: { role: "prey", lane: "ground", /* ... */ points: 100 },
  // ...
  cow: { role: "protected", lane: "sky", /* ... */ penalty: { perHit: -500 } },
  tiger: { role: "protected", lane: "sky", /* ... */ penalty: { onFinish: -250 }, threat: { kind: "retaliates", damage: 1.5, attack: "claw-swipe" } },
  bigfoot: { role: "hostile", lane: "ground", /* ... */ points: 3000, threat: { kind: "throws", perHit: 0.5, max: 1.5, every: 1.5, attack: "throw", provokedBy: "first-hit" }, boss: { bar: true } },
} as const satisfies Record<string, Creature>;

export type Kind = keyof typeof CREATURES; // derived: adding an entry adds the kind everywhere
```

Derived helpers instead of hand-kept lists: `kindsWhere(role)`, `isRare(kind)` (spawn has `perMinute`), `streaks(kind)` (prey and trophy only), `points(kind)`. Nothing else in the package or the app lists kinds by hand; the HUD's common chips and the rare menu come from these. `POINTS` in `lib/gta6/score.ts` goes; the app's score reads `points(kind)` and penalties from the package (type-only and value imports through the existing dynamic `@games/vice-hunt` door, never a static import into the homepage).

**Behaviour modules, keyed and exhaustive.** Movement, hit reactions, finishes and attacks are small modules behind one interface each, in registries typed as `Record<Id, Module>`, so a new id with no module (or a module with no id) does not compile:

```ts
interface FinishModule<S> {
  start(c: Animal, world: World, rng: Rng): S;  // pure
  step(s: S, dt: number, out: GameEvent[]): void; // pure, world time only; pushes events
  done(s: S): boolean;
  draw(ctx: CanvasRenderingContext2D, s: S, art: Art): void; // no module state
  reduced?: FinishId;                              // the gentle version to use under reduced motion
}
```

Same shape for `MoveModule` (position over time for a lane), `HitReactionModule` (flinch, garland) and `ThreatModule` (claw-swipe, throw). Art is `Record<Kind, Frames>` plus the named extra frames, also exhaustive.

**Events, one union.** The package emits typed events from its step loop and turns them into the `HuntOptions` callbacks in one place:

```ts
type GameEvent =
  | { type: "hit"; kind: Kind; n: number; of?: number; x: number; y: number }
  | { type: "kill"; kind: Kind; x: number; y: number; streak: number }
  | { type: "penalty"; kind: Kind; points: number; x: number; y: number }
  | { type: "damage"; hearts: number; source: Kind; x: number; y: number }
  | { type: "rare"; kind: Kind; event: "appeared" | "met" }
  | { type: "wasted" };
```

A `switch` over `type` with a `never` check makes any new event a compile error until it is handled. Tests: one per module (pure `step`), the registry (every kind has art, a move, a finish; roles' invariants), the clamped score fold, and the event mapping.

## Callbacks added to `HuntOptions`

`onHit(kind, hitNumber, x, y)` (for "1 / 3" and flinch pop-ups the app draws), `onPenalty(kind, points, x, y)`, `onHealth(hearts)`, `onWasted()`, `onRare(kind, event: "appeared" | "met")`. Existing `onKill` carries the new kinds. The finishing animations, splats, scratches, fish, fireworks and parachute are drawn by the package on its own layers (they belong to the scene); pop-up text and hearts are the app's.

## Edge cases and rules (from the design review)

Timing and lifecycle
- **No wall-clock timers in the package.** The prototype used `setTimeout` for its sequences; the game must drive every sequence (finishes, throws, the merman's window, the tiger's leap, WASTED) from world time in the step loop. Then a hidden or throttled tab (which clamps `dt` to `MAX_DT`) pauses them all together, and `destroy()`, Exit, Esc and Play again leave nothing running. `destroy()` removes every overlay layer it added.
- **WASTED freezes the round.** At zero hearts the world stops stepping (no spawns, no throws, no finishes advancing, shots ignored), in-flight globs are dropped, and damage arriving later is ignored. Play again starts a fresh world, hearts and collection.
- **Damage never goes below 0** and is ignored once at 0 (a 1.5 claw at ½ heart leaves 0, not −1).

Hits and scoring
- **The running score is a clamped fold, not a sum.** With penalties and the floor at 0, the order matters (−500 then +600 is 600; +600 then −500 is 100). `totalScore` walks the log in order and clamps at each step; tests cover penalty-first, penalty-at-zero and mixed sequences.
- **A cow or tiger hit breaks the streak** (reset `streak` and `lastKill`), including the tiger's first two flinch hits. Non-finishing hits on trophies (shark 1 / 3, UFO, merman) neither build nor break a streak, as today.
- **Hit priority when creatures overlap.** `shoot()` takes the front-most creature. Protected creatures (cow, tiger) are drawn behind everything else in their lane, so a shot at a flamingo crossing in front of the cow hits the flamingo, not the cow. Everything else keeps today's order (newest on top).
- **Only the visible part is hittable.** The merman's hit box is clipped at the water line (a shot at the water over his submerged body misses). The tractor beam, the alien's parachute, the pile, splats, scratches, fish, fireworks and the tiger's face are never hittable: shots pass through them to whatever is behind.
- **Splats and scratches never block shots**, only the view.
- **Counts for the tally.** `Kills` grows to all nine kinds; the cow is never "killed", so the tally gets a separate `hits` count per kind (the cow's row and accuracy read it). The rare collection ("met") is a set filled on each rare's first hit (cow included; a merman who escapes with "TOO SLOW" still counts as met).
- **UFO shows no per-hit count** (its hit total is a secret 6 or 7); only sparks, smoke and wobble. Bigfoot shows his boss bar instead of numbers. Shark, tiger and merman show "1 / 3", "2 / 3".

Creatures
- **Merman and the revolver.** His window is 1.1 s for hits 2 and 3; a reload (1 s) inside it usually means he escapes. That is accepted as part of the challenge; his window does not pause for reloads.
- **Tiger count resets** if it leaves the screen between hits; its leap sequence plays even if another rare is mid-finish; while it plays the world keeps running and shots still work (the face is decoration).
- **Bigfoot throws only while fully on screen**, never during his finish; globs already in the air when he dies still land and count toward his 1.5 cap. He keeps today's `onBigfoot(true/false)` (BIGFOOT SPOTTED banner and the music duck): false when he jets off or walks off.
- **Bigfoot's 20 hits against the clock.** He crosses the screen in about 13 to 20 s at today's speed. Twenty hits is four cylinders and three 1 s reloads, plus aiming through his splats, so most players will not finish him: intended (see "Decided after the review"). Each hit's knockback (6 px) also pushes him back, which helps a little.
- **Spawning.** Rares roll a per-second chance (`perMinute / 60`) each step while their kind is not alive, using the seeded rng so tests are deterministic; finishes in progress do not count as alive. Bigfoot never in the first 30 s.
- **Resize.** New lanes (sea) are fractions of the height, like today's, so `resize()` keeps everyone on their lane; the existing resize test grows to cover the sea lane.

Reduced motion (per finish)
- Cow: the garland appears without the spring; the deflate is a fade and a short drift up. Tiger: no pounce or leap; the face fades in at full size, the scratches fade in, no shake. Shark: the rocket rises without sparks spraying, a short fade. Merman: he sinks, a few fish fade in and out above the water. UFO: it fades down into the sea, the alien drifts without swaying. Bigfoot: no jet; he fades out after the squat, splats appear and fade in place, no flying globs. The WASTED grey and word fade without scale.

## Decided after the review

- **Bigfoot keeps full speed once provoked** (owner, 2026-11-21: option B). Twenty hits before he walks off is meant to be a rare trophy most players never get; do not slow him down.

## Left to the builder (calls already made, and what is still open)

- My calls (owner can change): Bigfoot 3000 points; UFO 1000; at most one rare on screen besides Bigfoot; rarity numbers above; the reduced-motion versions; the cow's row counts hits in red; collections reset per round.
- Open, builder's choice: exact sprite sizes for the new creatures at game scale (prototype: cow 118, tiger 136, shark 84, merman 96, UFO 132 px wide at a 1280-wide stage); how the sea lane's masking is drawn on the canvas; splitting the work into commits.
