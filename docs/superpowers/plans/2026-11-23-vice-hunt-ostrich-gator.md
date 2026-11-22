# Vice Hunt: roller ostrich and candy gator, implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two rares to Vice Hunt: the roller ostrich (trophy, 3 hits, faster per hit, plucked rush-off on skate fireworks) and the candy gator (hostile, 5 or 6 hits, angrier per hit, candy-gun sprays that stick to the glass and take shots, candy-pop finish).

**Architecture:** One registry record each in `games/vice-hunt/src/creatures.ts`, with new ids in the exhaustive module registries (moves `skate`/`swagger`, reaction `pluck`, finishes `plucked`/`candy-pop` plus gentle versions, threat `candy-gun`). The ostrich is SVG part images moved by canvas transforms; the gator is a canvas rig (pure maths in `rig/gator.ts`, drawing in `rig/drawGator.ts`); candies are canvas paths (`fx/candy.ts`) used by a new glass mark that `shoot` checks first.

**Tech Stack:** TypeScript, Canvas 2D, vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-23-vice-hunt-ostrich-gator-design.md` (and the motion references it names).

## Global Constraints

- `games/vice-hunt/` imports nothing from the app; the app reaches it only by dynamic import. `scripts/check-gta6-bundle.sh` must pass after `npm run build`.
- World logic, poses, threats and finish stepping are pure and tested; drawing takes a context and keeps no module-level mutable state.
- Every finish has a gentle version (`reduced`); no flying candies, sparks, shakes or spins under reduced motion.
- No sound in automated tests (`navigator.webdriver`); any browser test run is muted (`--mute-audio`).
- No em-dashes in user-facing copy. `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `scripts/verify-simplification.sh` pass.
- Numbers from the spec: ostrich 3 hits, +700, 0.4/min, size [96, 133], speed x1 / x1.7 / x2.6; gator 5 or 6 hits, +1200, 0.35/min, size [120, 152]; candies per spray `round(10 + 10 * anger)`, stuck 32 to 52 px at 1280, stick 4 s, fade 0.7 s; ½ heart per spray, 1.5 cap; burst 100 candies.

## Review Focus

1. A click on a stuck candy that sits over the gator: the candy comes off and the gator is not hit (round spent).
2. Hits landing while the gator is mid-shot: each queues one more shot, none are lost, and a finishing hit cancels any queued shots (no shots from a dead gator), while candies already in flight still land.
3. The cap holds across shots and after his death: never more than 1.5 hearts from one gator.
4. Window resize mid-flight: candies and stuck candies stay on screen (positions are px; a resize does not crash or strand them off screen).
5. Gator and Bigfoot together: Bigfoot still shares the screen; the gator does not share with other non-boss rares; "ANGRY!" stays Bigfoot's.

---

### Task 1: Registry, rules and placeholders

**Files:**
- Modify: `games/vice-hunt/src/creatures.ts`, `games/vice-hunt/src/world.ts`, `games/vice-hunt/src/events.ts`, `games/vice-hunt/src/modules/index.ts`, `games/vice-hunt/src/modules/moves.ts`, `games/vice-hunt/src/modules/reactions.ts`, `games/vice-hunt/src/art/sprites.ts` (placeholder frames), `components/gta6/game/Hud.tsx` (NAMES)
- Test: `games/vice-hunt/src/creatures.test.ts`, `games/vice-hunt/src/world.test.ts`

**Interfaces:**
- Produces: kinds `"ostrich"` and `"gator"`; `MoveId` + `"skate" | "swagger"`; `HitReactionId` + `"pluck"`; `FinishId` + `"plucked" | "plucked-gentle" | "candy-pop" | "candy-pop-gentle"`; `ThreatId` + `"candy-gun"`; `type ReturnsFire = { kind: "returns-fire"; perShot: number; max: number; attack: ThreatId }`; `Hostile.threat: Throws | ReturnsFire`; `Animal.shootK?: number` (0..1 into a gator's shot, written by the threat) and `Animal.aim?: number` (0..1 arm up); Callout union + `"!!" | "FWUMP!" | "POP!" | "YO!?" | "BACK OFF!" | "THAT'S IT!" | "GRRRR!" | "AAARGH!!"`.

- [ ] **Step 1: Write the failing tests**

```ts
// creatures.test.ts
it("has the ostrich and the gator", () => {
  expect(CREATURES.ostrich).toMatchObject({ role: "trophy", lane: "ground", rule: { hits: [3, 3] }, points: 700, spawn: { perMinute: 0.4 }, size: [96, 133], move: "skate", hit: "pluck", finish: "plucked" });
  expect(CREATURES.gator).toMatchObject({ role: "hostile", lane: "ground", rule: { hits: [5, 6] }, points: 1200, spawn: { perMinute: 0.35 }, size: [120, 152], move: "swagger", finish: "candy-pop",
    threat: { kind: "returns-fire", perShot: 0.5, max: 1.5, attack: "candy-gun" } });
  expect(kindsWhere("hostile")).toEqual(["bigfoot", "gator"]);
  expect(isRare("ostrich") && isRare("gator")).toBe(true);
});
// world.test.ts
it("shows the gator's hit total and only Bigfoot gets ANGRY!", () => { /* spawn gator, shoot it: hit event has of = a.hp; no "callout" ANGRY! */ });
it("lets only a boss share the screen with another rare", () => { /* gator alive: shark never spawns over many seconds of steps; bigfoot still can */ });
```

- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/creatures.test.ts games/vice-hunt/src/world.test.ts`. Expected: FAIL (no such kinds).
- [ ] **Step 3: Implement.** Records as in the test (ostrich speed `[0.095, 0.105]`, gator `[0.065, 0.065]`, both `enabled: true`). In `world.ts`: `sharesScreen = (k) => "boss" in table[k]`; the `secret` hit flag becomes `a.kind === "ufo" || "boss" in cfg`; the "ANGRY!" provoke callout only when `cfg.threat.kind === "throws"` (a hostile is still `provoked` on its first hit). Placeholders so the registries compile: `skate`/`swagger` = the `strut` module, `pluck` = `flinch`, the four finishes = `rocket`/`rocketGentle`, `candy-gun` = a no-op threat (`done: () => true`). Sprite frames: temporary copies of the shark's for both kinds. `NAMES`: `ostrich: "Roller ostrich"`, `gator: "Candy gator"`.
- [ ] **Step 4: Run** the vitest command above plus `npx tsc --noEmit`. Expected: PASS, no type errors.
- [ ] **Step 5: Commit** `Vice Hunt: register the roller ostrich and the candy gator`.

### Task 2: Candies and the glass that takes shots

**Files:**
- Create: `games/vice-hunt/src/fx/candy.ts`, `games/vice-hunt/src/fx/candy.test.ts`
- Modify: `games/vice-hunt/src/fx/glass.ts`, `games/vice-hunt/src/fx/glass.test.ts`, `games/vice-hunt/src/world.ts` (`shoot`), `games/vice-hunt/src/world.test.ts`

**Interfaces:**
- Produces: `CANDY_COLORS: readonly string[]` (the reference's seven); `type CandyLook = { shape: 0 | 1 | 2 | 3 | 4; color: string; color2: string }`; `randomCandy(rng): CandyLook`; `drawCandy(ctx, look, x, y, size, rot)` (size = px across, centred). Glass: `type Candy = Base & { kind: "candy"; x; y; size; rot; look: CandyLook; off: boolean; vx; vy; vr }`; `addCandy(glass, x, y, size, rot, look, gentle): Candy` (fadeAt `CANDY_STICK = 4`, fadeFor `CANDY_FADE = 0.7`); `candyAt(glass, x, y): Candy | null` (topmost stuck, not off, not fading, within `size * 0.45`); `knockCandy(c, rng)` (off, upward kick, spin; falls under gravity 1400 px/s² scaled by width/1280 and is dropped after 0.7 s). `shoot()` returns `{ hit, finished, blocked: boolean }`: a candy under the point is knocked and nothing else is hit.

- [ ] **Step 1: Failing tests:** `candyAt` finds the topmost of two overlapping candies and ignores knocked or fading ones; a knocked candy falls (y grows) and is gone after 0.7 s; a stuck candy slides down after 4 s and is gone after 4.7 s; `shoot` at a candy over a spawned gator returns `{ hit: null, finished: false, blocked: true }` and the gator's `hits` stay 0; a second shot at the same spot hits the gator.
- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/fx games/vice-hunt/src/world.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** Candy shapes are canvas ports of the reference's five `candySVG` kinds (wrapped, lollipop, peppermint, gumdrop, heart; outline `#2b2234`, white highlights, a 3 px drop shadow). Stuck candy draw: squash `1 + sin(k*pi) * 0.22 * (1-k)` over the first 0.25 s (none when gentle; gentle fades in over 0.3 s), slide `(age - 4) * 30 * width/1280` px while fading.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `Vice Hunt: candies on the glass, and they take shots`.

### Task 3: The ostrich alive (art, skate, feathers)

**Files:**
- Create: `games/vice-hunt/src/art/ostrich.ts`, `games/vice-hunt/src/art/ostrich.test.ts`, `games/vice-hunt/src/modules/ostrich.ts` (draw helpers shared with the finish)
- Modify: `games/vice-hunt/src/art/sprites.ts`, `games/vice-hunt/src/sprites.ts` (extras merged: `ExtraId` = rare ids + ostrich ids), `games/vice-hunt/src/modules/moves.ts`, `games/vice-hunt/src/modules/moves.test.ts`, `games/vice-hunt/src/render.ts`, `games/vice-hunt/src/index.ts` (hit feathers)

**Interfaces:**
- Produces: `OSTRICH_FRAMES: readonly [string, string]`; `OSTRICH_EXTRA: Record<OstrichPart, string>` with `OstrichPart = "ostLegF" | "ostLegN" | "ostTail" | "ostBody" | "ostBare" | "ostWing" | "ostNeck" | "ostCollar" | "ostNeckShock"` (each a 130 x 180 box SVG document); `OST_HIP = [58, 100]`, `OST_NECK = [80, 74]`; `SKATE_SPEED = [1, 1.7, 2.6]`; `skateMul(a): number` (eases toward `SKATE_SPEED[min(hits,2)]`, stored on the animal as `a.speedMul`); `type OstrichPose = { lN: number; lF: number; neck: number; tilt: number; bob: number; parts: { tail: boolean; wing: boolean; collar: boolean; bare: boolean; shock: boolean }; sq?: number }`; `skatePose(age, mul): OstrichPose`; `drawOstrich(ctx, art, x, y, w, h, dir, pose, flash, scratch)`; `addHitFeathers(scene, a, rng)` in `render.ts`.

- [ ] **Step 1: Failing tests:** every `OSTRICH_FRAMES`/`OSTRICH_EXTRA` entry passes the shared SVG-document check (reuse `expectSvgDocument` from `rares.test.ts` by exporting it); `skate.advance` moves an unhit ostrich by `vx * dt` total and one with `hits = 2` by `2.6 * vx * dt` once eased (after 1 s of steps); feathered parts per hits: 0 → all, 1 → no tail, 2 → no tail, wing or collar.
- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/art games/vice-hunt/src/modules/moves.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** Art strings from the reference's `birdSVG("leopard")` split into the part list (gradient and clip ids prefixed per part so they never collide). `skate.advance` adds `vx * (mul - 1) * dt` and returns true; the walk cadence and lean scale with `mul` as in the reference (`t += dt * mul^0.8`, leg amplitude `26 + (mul-1)*6`, tilt `+ (mul-1)*3` degrees, sparks only when not reduced). `render.ts` draws a live ostrich through `drawOstrich` (legs rotate about `OST_HIP`, neck and collar about `OST_NECK`). Hit feathers: `index.ts` calls `addHitFeathers` after a non-finishing hit on a kind whose `hit` is `"pluck"` (shot and dev paths); 14 feathers on hit 1 from the tail box (0, 58)-(30, 104), 16 on hit 2 from (26, 62)-(92, 92), colours `#ff8a1f #ff3d8b #1fe0c4 #9b5cff`, drifting with sway (reduced: fall straight, fade).
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit** `Vice Hunt: the roller ostrich skates and sheds feathers`.

### Task 4: The ostrich's `plucked` finish

**Files:**
- Create: `games/vice-hunt/src/modules/finishes/plucked.ts`, `games/vice-hunt/src/modules/finishes/plucked.test.ts`
- Modify: `games/vice-hunt/src/modules/index.ts`, `games/vice-hunt/src/events.ts` if needed

**Interfaces:**
- Consumes: `drawOstrich`, `OstrichPose`, particles (`emit`, `stepParticles`, `drawParticles`).
- Produces: `plucked`, `pluckedGentle: FinishModule<PluckedState>`; constants `SHOCK_TIME = 0.5`, `CROUCH_TIME = 0.16`, `RUSH_ACCEL = 3.6` (widths/s²), `GENTLE_FADE = 0.7`.

- [ ] **Step 1: Failing tests** (testkit `begin`/`runToEnd`): pushes a `"!!"` callout at start; stays in place through `SHOCK_TIME + CROUCH_TIME`; then x moves in the facing direction, accelerating; done only once off screen and particles are empty; a left-facing one leaves through the left edge; gentle never moves x and is done after `GENTLE_FADE` with alpha 0.
- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/modules/finishes/plucked.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** from the reference's `shock` / `crouch` / `rush` states: 40 feathers burst from (8, 60)-(100, 112) plus 5 crest bits at start; skate fireworks per wheel (wheels at (56, 168) and (77, 168), rotated with each leg about `OST_HIP`) sprayed backwards against the facing direction, star bursts at 0.16 x strength per step, smoke; counted per 60 Hz step like `rocket.ts`. Replace the Task 1 placeholders.
- [ ] **Step 4: Run** the test and `npx vitest run games/vice-hunt`. Expected: PASS.
- [ ] **Step 5: Commit** `Vice Hunt: the plucked ostrich rushes off on fireworks`.

### Task 5: The gator rig (pure) and drawing him alive

**Files:**
- Create: `games/vice-hunt/src/rig/gator.ts`, `games/vice-hunt/src/rig/gator.test.ts`, `games/vice-hunt/src/rig/drawGator.ts`, `games/vice-hunt/src/art/gator.ts` (two static HUD frames)
- Modify: `games/vice-hunt/src/modules/moves.ts` (`swagger`), `games/vice-hunt/src/modules/moves.test.ts`, `games/vice-hunt/src/render.ts`, `games/vice-hunt/src/art/sprites.ts`

**Interfaces:**
- Produces: `GATOR = { W: 170, H: 215, GROUND: 208, THIGH: 30, SHIN: 30, UPPER: 26, FORE: 25, HEAD: 0.82 }`; `type GatorPose = { rx; ry; torso; head; fF: Vec; fN: Vec; uF; fFo; uN; fNo }`; `G_POSES: { stand; aim; puffed }` (the reference's numbers after its widening edit); `angerOf(hits, hp): number` = `clamp01(hits / (hp - 1))`; `gatorColors(anger): { skin; far; dark; belly }` (HSL, hue 135 to 2, sat 58 to 82, light `50 + 6 sin(pi a)`); `gatorWalk(t, anger): GatorPose`; `aimBlend(k): GatorPose`; `type GatorLook = { anger; puff?; extra?; gun?; spin?; flex?; eyes?: "cool" | "squint" | "shock" | "wink"; mouth?: "grin" | "o"; flap?; noWatch? }`; `gatorPoints(pose, look): { muzzle: Vec; headTop: Vec; torso(l: Vec): Vec; neck: Vec }` (sprite space; the muzzle is the gun frame's (67, -8.5)); `drawGator(ctx, pose, look, x, y, scale, mirrored, opt?: { alpha?; white? })`; `swagger.advance` returns false while `a.shootK !== undefined`, otherwise adds `vx * (gatorSpeed(anger)/0.065 - 1) * dt`, `gatorSpeed(a) = 0.065 + 0.06 a` widths/s.
- [ ] **Step 1: Failing tests:** `angerOf(0,6)=0`, `angerOf(5,6)=1`, `angerOf(2,5)=0.5`; `gatorColors(0).skin` has hue 135 and `(1)` hue 2; walk feet stay within 16 px of their stand x and never go below y 200; aim pose's near forearm points forward (muzzle x > 140 at k = 1, facing right); `swagger` stands still while `shootK` is set and moves faster at anger 1 than 0.
- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/rig games/vice-hunt/src/modules/moves.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the reference's `makeGator` as canvas drawing: head shapes as `Path2D` from the reference's path data (fills from `gatorColors`), torso/tank/shorts paths scaled by `(sx, sy) = (1 + 1.55 puff + extra, 1 + 0.7 puff + extra)`, limbs as outline + fill strokes, bicep ellipses, watch, sneakers, gun (candy-cane barrel). HUD frames: the reference's calm still serialised with fixed colours. `render.ts` draws a live gator from `gatorWalk(age, anger)` blended into `aimBlend(a.aim)` while shooting, with the hit flash as a white silhouette and steam puffs into the scene's particles from anger 0.45 up (not reduced).
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit** `Vice Hunt: the candy gator's rig`.

### Task 6: The candy gun threat

**Files:**
- Create: `games/vice-hunt/src/modules/threats/candyGun.ts`, `games/vice-hunt/src/modules/threats/candyGun.test.ts`
- Modify: `games/vice-hunt/src/modules/index.ts` (start returners: one `candy-gun` per provoked gator, like `startThrowers`), `games/vice-hunt/src/index.ts` (draw flying candies on the glass layer via the threat's `draw`)

**Interfaces:**
- Consumes: `addCandy`, `randomCandy`, `drawCandy`, `angerOf`, `gatorPoints`, `damage`.
- Produces: `candyGun: ThreatModule<CandyGunState>`; `shotTimeline(anger): { raise; aim; fire; end; twirl: boolean }` (raise `0.12/sp`, aim `0.4/sp`, fire `0.62/sp`, end `fire + (a < 0.5 ? 0.95 : 0.45)/sp`, `sp = 1 + 0.9 a`); `CANDY_FLIGHT = 0.42`; `SPRAY_STAGGER = 0.025`.

- [ ] **Step 1: Failing tests:** one shot per non-finishing hit (hit twice quickly: two sprays, the second straight after the first); spray size 10 at anger 0 and 20 at anger 1; shout callouts in order "YO!?", "BACK OFF!" and a "FWUMP!" per spray; the first candy of a spray costs 0.5 hearts, never more than 1.5 per gator across 5 sprays; `a.shootK` is set during a shot and cleared after; when the gator is finished mid-shot no further spray starts, in-flight candies still land, then `done` is true; gentle: candies land at once (no flight).
- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/modules/threats/candyGun.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** The threat tracks `answered` hits against `a.hits` and queues `a.hits - answered` shots; writes `a.shootK`, `a.aim` (ease of raise/lower) and the look flags the renderer needs (`a.gunSpin`, `a.eyes`) as plain numbers/strings on the animal. Candy target: `x = W (0.5 + (r-0.5) 2 spread)`, `y = H (0.45 + (r-0.5) 1.2 spread)`, `spread = 0.28 + n/100`; size `(32 + 20 r) * W/1280`. Flight drawing: grows `0.12 + k² 0.98`, tumbles, arcs 40 px. A "FWUMP!" callout at the muzzle; the sugar puff and sparkles go into the threat's own particles.
- [ ] **Step 4: Run** `npx vitest run games/vice-hunt`. Expected: PASS.
- [ ] **Step 5: Commit** `Vice Hunt: the gator shoots back with candy`.

### Task 7: The gator's `candy-pop` finish

**Files:**
- Create: `games/vice-hunt/src/modules/finishes/candyPop.ts`, `games/vice-hunt/src/modules/finishes/candyPop.test.ts`
- Modify: `games/vice-hunt/src/modules/index.ts`, `games/vice-hunt/src/fx/particles.ts` (a `"candy"` particle kind drawn with `drawCandy`; `look` on the particle)

**Interfaces:**
- Produces: `candyPop`, `candyPopGentle: FinishModule<CandyPopState>`; `puffCurve(t): number` (three gulps at 0.3, 0.72, 1.12 of 0.3, 0.33, 0.37, 0.28 s each, overshoot, capped 1.04); `POP_AT = 1.85`; `BURST = 100`.

- [ ] **Step 1: Failing tests:** `puffCurve(0) = 0`, `puffCurve(2) ≈ 1`; the body rises (y decreases) after 0.5 s; a "POP!" callout at `POP_AT`, after which 100 candy particles exist and the body is not drawn; candies squeeze out between 0.3 puff and the pop; done once every particle is gone; gentle: no "POP!", fades out by 0.6 s, at most 6 particles.
- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/modules/finishes/candyPop.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** from the reference's `puff` state and `burst()` (white flash and ring drawn by the finish; bandana and watch as two falling items drawn from paths).
- [ ] **Step 4: Run** `npx vitest run games/vice-hunt`. Expected: PASS.
- [ ] **Step 5: Commit** `Vice Hunt: the gator pops into candy`.

### Task 8: Host, docs and the real-game check

**Files:**
- Modify: `games/vice-hunt/src/index.ts` (blocked shots: a soft "hit" click, no `onShot` hit kind), `games/vice-hunt/README.md`, `CLAUDE.md` (the GTA 6 paragraph: the two new rares, candies take shots), `docs/superpowers/HANDOFF-vice-hunt-rares.md` if it lists creatures

- [ ] **Step 1:** Run the whole gate: `npx vitest run && npx tsc --noEmit && npm run lint && bash scripts/verify-simplification.sh`. Expected: all pass.
- [ ] **Step 2:** `npm run build && bash scripts/check-gta6-bundle.sh`. Expected: pass.
- [ ] **Step 3:** Look at it in the real game, muted (headless Chromium `--mute-audio`, dev server on 3001, `/vice-hunt?spawn=ostrich,gator`, then `?shoot=ostrich`, `?shoot=gator`, `?hit=gator`): screenshots of skating, a feather burst, the rush-off, the gator walking, a candy spray stuck on the glass, the pop. Fix anything that looks off against the references.
- [ ] **Step 4:** Commit `Vice Hunt: docs for the ostrich and the gator`.
