# Vice Hunt Rares Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six rare creatures (flying cow, flying tiger, walking shark, merman, UFO, reworked Bigfoot), hearts and WASTED, penalties, and the RARE stats menu to Vice Hunt, on an extensible typed creature model.

**Architecture:** `games/vice-hunt` stays a zero-dependency package with a pure, tested world. Creatures become one typed registry (roles as a discriminated union, `Kind` derived from its keys). Behaviour lives in small keyed modules (moves, hit reactions, finishes, threats), all stepped from world time and drawn on the canvas. The world emits a `GameEvent` union; `index.ts` maps events to `HuntOptions` callbacks; the app (`components/gta6/game/*`, `lib/gta6/*`) draws hearts, pop-ups, the RARE menu, WASTED and results.

**Tech Stack:** TypeScript, canvas 2D, vitest, Next.js 16 / React 19 (app side), CSS modules.

**Spec:** `docs/superpowers/specs/2026-11-21-vice-hunt-rares-design.md` (read it first; the section "Edge cases and rules" is binding). Motion reference: `docs/superpowers/reference/vice-hunt-rares-motion.html` (open from disk; copy feel and numbers, not code). Art: `games/vice-hunt/art-src/rares/`.

**Branch:** `vice-hunt-rares` (stacked on `gta6-mod`, PR #82). Commit per task.

## Global Constraints

- `games/vice-hunt/` imports nothing from the app; the app reaches it only via `import("@games/vice-hunt")` (type-only imports are fine anywhere).
- Pure modules (world, rules, score, rig math, every module's `step`) have no DOM access; draw functions take `ctx` and keep no module-level mutable state.
- No `setTimeout`/`setInterval` for game sequences: everything advances from `dt` in the step loop (spec, "No wall-clock timers").
- Silent under automation: no sound when `navigator.webdriver` (existing `createSound` rule). Never play audio aloud in any check; headless Chrome always gets `--mute-audio`.
- No bullet holes, cracks or glass-break on a shot. Only claw scratches and poop splats mark the glass, and both fade.
- Values (verbatim from the spec): cow −500 per hit, 2 hits; tiger 3 hits, −250 on the 3rd, claw 1.5 hearts; shark 3 hits, +600; merman 3 hits within 1.1 s, +600; UFO 6 or 7 hits (rolled), +1000; Bigfoot 20 hits, +3000, throws every 1.5 s once provoked, ½ heart per splat, max 1.5 hearts per Bigfoot, full speed (do not slow him); hearts 3, halves allowed; score floor 0; rarity per minute: cow, tiger, shark, merman 0.4; UFO 1/3; Bigfoot 0.22 with `after: 30`.
- App copy: no em-dashes. Durations and easings in the app come from tokens in `app/globals.css` (`--duration-gta-*`, `--ease-out`); add new tokens there, never literals in components.
- Reduced motion: each finish uses its gentle variant (spec, "Reduced motion (per finish)").
- Gates before each commit that touches `app/`, `components/`, `lib/`: `npx tsc --noEmit -p .`, `npm run lint` (0 errors), `npm test`, `./scripts/verify-simplification.sh`. Package-only tasks: `npx vitest run games/` and `npx tsc --noEmit -p .`.
- Final gate: `npm run build && ./scripts/check-gta6-bundle.sh && ./scripts/check-diwali-bundle.sh --off && ./scripts/check-starter-pack-bundle.sh`.

## Review Focus

1. **A penalty landing when the score is low**: −500 at 200 must give 0, then +600 must give 600 (clamped fold, order-dependent). Test in Task 2.
2. **Shots and damage during WASTED**: no hits, no events, no further damage, no finishes advancing. Tests in Task 3 (`wasted freezes the world`) and Task 8 (`pounce during wasted does nothing further`); after `destroy()` nothing runs because nothing uses wall-clock timers (Global Constraints).
3. **Overlapping creatures**: a flamingo in front of the cow takes the shot; a shot on the water over a submerged merman misses. Tests in Task 3.
4. **A tab hidden mid-sequence**: sequences resume from where they were (dt clamped), never skip to the end or run twice. Test in Task 5 (step with `dt` larger than `MAX_DT`).
5. **Bigfoot's cap with globs in flight**: four globs landing after he dies still cost at most 1.5 hearts in total from him. Test in Task 9.

---

## File structure

Package (`games/vice-hunt/src/`):
- `creatures.ts` (new): types (`Creature`, roles, `Lane`, `HitRule`, `Spawn`, threats), `CREATURES`, `Kind`, helpers. Replaces `ANIMALS` in `config.ts` (config keeps global tunables).
- `types.ts`: re-exports `Kind` from `creatures.ts`; `Kills` becomes `Record<Kind, number>`.
- `events.ts` (new): `GameEvent` union.
- `world.ts`: hit rules, lanes (sky, ground, sea), spawning, health, threats state, events queue.
- `modules/` (new): `types.ts` (module interfaces and registries' types), `moves.ts`, `reactions.ts`, `finishes/*.ts` (one per finish), `threats/*.ts`, `index.ts` (registries).
- `rig/` (new): `rig.ts` (pure: `ik`, `blend`, `POSES`, `walkPose`, finish timeline), `drawRig.ts`.
- `fx/` (new): `glass.ts` (scratches and splats on the "glass", pure state plus draw), `particles.ts` (fireworks, fish, sparks, smoke, poop spray; generalises today's poofs).
- `art/rares.ts` (new, generated): frames for new creatures and extra frames; `art-src/build-rares.mjs` (new) generates it from `art-src/rares/anim-*.svg`.
- `render.ts`, `sprites.ts`, `index.ts`: wiring.

App:
- `lib/gta6/score.ts`, `lib/gta6/streak.ts`: tally and clamped score.
- `components/gta6/game/Hud.tsx` (+ `game.module.css`): hearts top-left, stars removed, `RareMenu`.
- `components/gta6/game/RareMenu.tsx` (new), `components/gta6/game/Wasted.tsx` (new).
- `components/gta6/game/GameMode.tsx`, `Results.tsx`.
- `app/globals.css`: new tokens.
- Docs: `games/vice-hunt/README.md`, `CLAUDE.md` (GTA 6 bullet).

---

### Task 1: Creature registry and types

**Files:**
- Create: `games/vice-hunt/src/creatures.ts`, `games/vice-hunt/src/creatures.test.ts`
- Modify: `games/vice-hunt/src/config.ts` (remove `ANIMALS`, `BIGFOOT_CHANCE`, `BIGFOOT_AFTER`; keep the rest), `games/vice-hunt/src/types.ts`, `games/vice-hunt/src/world.ts` (read `CREATURES`; lane `"top"` becomes `"sky"`), `games/vice-hunt/src/world.test.ts` (lane rename only)

**Interfaces:**
- Produces (exact, from the spec's "The creature types"): `Lane`, `HitRule`, `Spawn`, `Base`, `Prey`, `Trophy`, `Protected`, `Hostile`, `Creature`, `Retaliates`, `Throws`, `MoveId`, `HitReactionId`, `FinishId`, `ThreatId` (string-literal unions), `CREATURES` (`as const satisfies Record<string, Creature>`), `type Kind = keyof typeof CREATURES`, and helpers:
  - `KINDS: readonly Kind[]` (registry order: rabbit, iguana, flamingo, cow, tiger, shark, merman, ufo, bigfoot)
  - `kindsWhere(role: Creature["role"]): Kind[]`
  - `isRare(kind: Kind): boolean` (spawn has `perMinute`)
  - `streaks(kind: Kind): boolean` (prey and trophy)
  - `pointsFor(kind: Kind): number` (prey, trophy, hostile `points`; 0 for protected)
  - `penaltyFor(kind: Kind, hitNumber: number, finishing: boolean): number` (cow `perHit` on every hit; tiger `onFinish` only when `finishing`; 0 otherwise)
- Values: existing three prey keep today's speed, size, weight; flamingo lane `"sky"`. Bigfoot `rule.hits: [20, 20]`, size `[109, 153]`, speed `[0.05, 0.075]`, `spawn: { perMinute: 0.22, after: 30 }`, `threat: { kind: "throws", perHit: 0.5, max: 1.5, every: 1.5, attack: "throw", provokedBy: "first-hit" }`, `boss: { bar: true }`, `points: 3000`, `finish: "jet"`. Cow `rule.hits [2,2]`, `penalty: { perHit: -500 }`, `hit: "garland"`, `finish: "deflates"`, lane sky, size `[118, 83]`, speed `[0.05, 0.065]`. Tiger `[3,3]`, `penalty: { onFinish: -250 }`, `threat: { kind: "retaliates", damage: 1.5, attack: "claw-swipe" }`, `finish: "pounces"`, sky, size `[136, 75]`, speed `[0.16, 0.19]`. Shark `[3,3]`, 600, `finish: "rocket"`, ground, size `[84, 121]`, speed `[0.07, 0.08]`. Merman `{ hits: [3,3], within: 1.1 }`, 600, `finish: "fountain"`, lane sea, size `[96, 75]`, speed `[0, 0]` (he surfaces, see Task 3). UFO `[6,7]`, 1000, `finish: "crashes"`, sky, size `[132, 87]`, speed `[0.04, 0.05]`. Rares' spawn: cow, tiger, shark, merman `{ perMinute: 0.4 }`; UFO `{ perMinute: 1 / 3 }`. Prey keep `finish: "falls"`, `hit: "none"`; trophies and tiger `hit: "flinch"`; Bigfoot `hit: "flinch"`.

- [ ] **Step 1: Write the failing tests** in `creatures.test.ts`:
  - `every kind has a lane, a size with positive w and h, and hits[0] <= hits[1]`
  - `kindsWhere("prey")` equals `["rabbit","iguana","flamingo"]`; `kindsWhere("protected")` equals `["cow","tiger"]`; `kindsWhere("hostile")` equals `["bigfoot"]`
  - `isRare` is true for exactly cow, tiger, shark, merman, ufo, bigfoot
  - `streaks("cow") === false`, `streaks("tiger") === false`, `streaks("shark") === true`, `streaks("rabbit") === true`, `streaks("bigfoot") === false`
  - `pointsFor("ufo") === 1000`, `pointsFor("bigfoot") === 3000`, `pointsFor("cow") === 0`
  - `penaltyFor("cow", 1, false) === -500`, `penaltyFor("cow", 2, true) === -500`, `penaltyFor("tiger", 1, false) === 0`, `penaltyFor("tiger", 3, true) === -250`, `penaltyFor("shark", 3, true) === 0`
  - type-level (a `// @ts-expect-error` line each, compiled by `tsc`): a `Prey` with `threat`, and a `Protected` with `points`, do not type-check
- [ ] **Step 2:** `npx vitest run games/` → the new file FAILS (module missing).
- [ ] **Step 3: Implement** `creatures.ts`; migrate `world.ts` and `config.ts` to it (`spawn`, `restingY`, `pickKind` read `CREATURES`; `pickKind` keeps today's commons-by-weight path; rares are added in Task 3, so for now Bigfoot is not spawned by `pickKind`).
- [ ] **Step 4:** `npx vitest run games/` PASS (existing world tests adjusted only for the lane rename and Bigfoot's hits); `npx tsc --noEmit -p .` PASS (fix app compile errors from `Kind` growing by adding the new kinds to `KIND_ORDER`/`KINDS` maps as zero-count placeholders; the real HUD comes in Task 11).
- [ ] **Step 5: Commit** `Vice Hunt: typed creature registry`.

### Task 2: Tally, clamped score and penalties (app lib)

**Files:**
- Modify: `lib/gta6/score.ts`, `lib/gta6/score.test.ts`, `lib/gta6/streak.ts`, `lib/gta6/streak.test.ts`

**Interfaces:**
- Consumes: `Kind`, `pointsFor`, `penaltyFor`, `streaks` (type-only import of `Kind`; values arrive through the game module object passed to `GameMode`, see Task 11: `game.pointsFor`, so `lib/gta6/score.ts` takes a points function as a parameter instead of importing package values).
- Produces:
  - `type Entry = { kind: Kind; points: number }` (signed; already streak-weighted)
  - `Tally` gains `hits: Record<Kind, number>`, `met: readonly Kind[]`, `entries: readonly Entry[]`; keeps `shots`, `kills`, `bestStreak`, `log`
  - `recordHit(t, kind): Tally` (counts `hits[kind]`, adds to `met` once)
  - `recordKill(t, kind, streak, points: number): Tally` (points = `scoreFor(base, streak)`)
  - `recordPenalty(t, kind, points: number): Tally` (points negative)
  - `scoreFor(base: number, streak: number): number` (today's multiplier, now on a base number)
  - `totalScore(t: Pick<Tally, "entries">): number`: fold with `Math.max(0, acc + e.points)` at each step
  - `emptyTally(kinds: readonly Kind[]): Tally`
  - `POINTS` is removed.

- [ ] **Step 1: Write the failing tests:**
  - `totalScore` of entries `[+600, -500]` is 100; `[-500, +600]` is 600; `[+200, -500, +600]` is 600; `[]` is 0
  - `scoreFor(100, 1) === 100`, `scoreFor(100, 2) === 150`, `scoreFor(100, 3) === 200`, `scoreFor(3000, 5) === 6000`
  - `recordHit` twice on cow gives `hits.cow === 2` and `met` containing `"cow"` once
  - `recordPenalty(t, "cow", -500)` leaves `kills.cow === 0` and appends an entry of −500
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Implement.** Update every caller in `components/gta6/game/*` to the new signatures (GameMode passes `game.pointsFor(kind)`; temporary until Task 11 wires the events).
- [ ] **Step 4:** gates (Global Constraints) PASS.
- [ ] **Step 5: Commit** `GTA6: clamped score, hits and penalties in the tally`.

### Task 3: World rules: hits, lanes, spawning, hit boxes, events

**Files:**
- Create: `games/vice-hunt/src/events.ts`
- Modify: `games/vice-hunt/src/world.ts`, `games/vice-hunt/src/world.test.ts`, `games/vice-hunt/src/config.ts`

**Interfaces:**
- Produces:
  - `GameEvent` in `events.ts`: the spec's union ("Events, one union") plus two members the plan adds: `{ type: "escaped"; kind: Kind; x: number; y: number }` (the merman's window lapsed) and `{ type: "callout"; text: "PFFT!" | "SPLAT!" | "HSSSS!" | "ANGRY!"; x: number; y: number }` (words the app pops; the package draws no text)
  - `World` gains `events: GameEvent[]` (drained by the host each frame), `hearts: number` (starts 3), `wasted: boolean`, `met: Set<Kind>`. (`finishing` is added in Task 4; in this task a finishing hit still splices the animal out as today.)
  - `Animal` gains `hits: number`, `firstHitAt: number` (−Infinity until hit), `provoked: boolean`, `surface?: { phase: "wait" | "rise" | "up" | "dive" | "duck"; t: number }` (merman only)
  - `SEA_LINE = 0.69` exported from `config.ts` (fraction of height; verify against `BeachScene`'s sea and adjust once, by eye, in Task 12)
  - `shoot(world, x, y): { hit: Animal | null; finished: boolean }` (renamed from `killed`; a finishing hit moves the animal into `world.finishing` in Task 5 instead of only splicing)
  - `drain(world): GameEvent[]`

Rules to implement (spec, "Edge cases and rules"):
- Hit counting: `hits++`; `hit` event with `n` and `of` (omit `of` for UFO and Bigfoot). Merman: a hit after his window (`world.time - firstHitAt > within`) starts a new count at 1. If the window lapses with fewer than 3 hits, he dives (`surface.phase = "dive"`), `hits = 0`, and the world emits `escaped` at his position.
- Bigfoot's first hit also emits `callout` "ANGRY!" over his head.
- Penalties: `penaltyFor(kind, hits, finishing)` non-zero emits `penalty`; protected hits reset `streak = 0` and `lastKill = -Infinity`.
- Finishing hit: `hits >= hp`. Trophy, prey, hostile: `kill` event with streak (streak only if `streaks(kind)`). Protected finishing: no `kill`.
- `met`: first hit on a rare adds it and emits `rare` with `"met"`; a rare spawning emits `rare` with `"appeared"`.
- First hit on Bigfoot sets `provoked = true`.
- Draw/hit order: `world.animals` is kept sorted so protected kinds come first (drawn first, hit last); `shoot` walks from the end (front-most first) as today.
- Hit boxes: today's inset box; merman's box is clipped to `y < SEA_LINE * height`.
- Spawning: commons as today. Rares: each step, for each rare kind not alive and (`after` passed), roll `rng() < perMinute / 60 * dt`; at most one non-Bigfoot rare alive at a time (finishing ones do not count). Bigfoot follows the same roll (one at a time).
- Lanes: `restingY` handles `"sea"` as `SEA_LINE * height - h * 0.78` (his torso above the line when fully up). Merman does not move horizontally: `surface` cycle `wait 1.2 s → rise 0.55 s → up 2.6 s → dive 0.45 s`, then he picks a new x in `[0.15, 0.7] * width` and repeats; after 3 cycles he leaves the world. While ducking after a first hit (`phase: "duck"`, 1.1 s) he sinks as in the prototype.
- WASTED: when `wasted` is true, `step` returns immediately and `shoot` returns `{ hit: null, finished: false }` with no events.
- Damage API: `damage(world, hearts: number, source: Kind, x: number, y: number): void` clamps at 0, ignores when already 0, emits `damage`, and on reaching 0 sets `wasted` and emits `wasted`.

- [ ] **Step 1: Write the failing tests** (seeded `mulberry32(1)`, `dt = 1/60`, world 1000x400):
  - `cow two hits emit two penalty events of -500 and no kill event`
  - `a cow hit resets the streak` (kill rabbit, kill rabbit within 1.5 s → streak 2; hit cow; kill rabbit → streak 1)
  - `tiger: hits 1 and 2 emit hit events n=1,of=3 and n=2,of=3; hit 3 emits penalty -250 and no kill`
  - `ufo spawned with rng giving 7 takes 7 hits; hit events have no "of"`
  - `merman: three hits within 1.1 s finish him (kill event, 600 base)`; `merman: second hit after 1.2 s does not finish; an escaped event follows when the window lapses`
  - `a flamingo in front of the cow takes the shot` (spawn both overlapping; shoot the overlap; hit.kind === "flamingo")
  - `a shot at the water over a ducking merman misses` (shoot at `y = SEA_LINE*height + 10` inside his box)
  - `first hit on bigfoot sets provoked and emits rare met`
  - `damage clamps at 0 and emits wasted once` (damage 1.5 three times from 3 hearts: hearts 1.5, 0, then nothing; exactly one wasted event)
  - `wasted freezes the world` (after wasted, `step` leaves `time` unchanged and `shoot` returns null)
  - `rares respect one-at-a-time and bigfoot's 30 s floor` (force rng to 0: before 30 s no bigfoot; with a shark alive no cow spawns)
  - `resize keeps the merman on the sea line`
- [ ] **Step 2:** `npx vitest run games/` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** `npx vitest run games/` PASS; `npx tsc --noEmit -p .` PASS.
- [ ] **Step 5: Commit** `Vice Hunt: hit rules, sea lane, rare spawning, health and events`.

### Task 4: Module interfaces, registries and the "falls" finish

**Files:**
- Create: `games/vice-hunt/src/modules/types.ts`, `games/vice-hunt/src/modules/index.ts`, `games/vice-hunt/src/modules/finishes/falls.ts`, `games/vice-hunt/src/modules/modules.test.ts`
- Modify: `games/vice-hunt/src/render.ts` (corpses for prey go through `falls`), `games/vice-hunt/src/world.ts` (`Finishing`)

**Interfaces:**
- Produces:
  - `FinishModule<S>` exactly as in the spec (`start`, `step(s, dt, out)`, `done`, `draw`, `reduced?`), plus `MoveModule` (`y(a, world): number` offset and `frame(a): number`), `HitReactionModule` (`start(a): S`, `step`, `draw`), `ThreatModule<S>` (`start(a, world, rng): S`, `step(s, dt, world, rng, out)`, `draw`)
  - `type Finishing = { kind: Kind; id: FinishId; state: unknown; x: number; y: number; w: number; h: number; dir: 1 | -1 }`; `World` gains `finishing: Finishing[]`, and `shoot` now moves a finished animal into it (with its finish module's `start` state) instead of only splicing it out
  - Registries `FINISHES: Record<FinishId, FinishModule<any>>`, `MOVES`, `HIT_REACTIONS`, `THREATS` (exhaustive `Record`s; unimplemented ids point to a `todo` module that throws in tests only until their task lands; every id must be real by Task 9)
  - `stepFinishing(world, dt, reduced: boolean)`: steps every `world.finishing` entry (via its module or `reduced` variant), pushes its events into `world.events`, removes `done` ones
- `falls` wraps today's `deathPose`/`DEATHS` unchanged for rabbit, iguana, flamingo.

- [ ] **Step 1: Write the failing tests:**
  - `every FinishId, MoveId, HitReactionId and ThreatId used in CREATURES has a module` (iterate `CREATURES`)
  - `stepFinishing removes a falls entry after DEATHS[kind].duration`
  - `stepFinishing with dt 1.0 advances by MAX_DT only` (Review Focus 4)
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** `npx vitest run games/` PASS; dev page (`games/vice-hunt/README.md`, "Dev page") still shows prey dying as before (screenshot with headless Chrome `--mute-audio`).
- [ ] **Step 5: Commit** `Vice Hunt: behaviour module registries; falls`.

### Task 5: Art for the new creatures

**Files:**
- Create: `games/vice-hunt/art-src/build-rares.mjs`, `games/vice-hunt/src/art/rares.ts` (generated, committed)
- Modify: `games/vice-hunt/src/sprites.ts` (decode the new frames; `Art` gains `extra: Record<ExtraId, HTMLImageElement>`), `games/vice-hunt/src/index.ts` (`iconUrl` for all kinds)

**Interfaces:**
- Produces: `RARE_FRAMES: Record<"cow" | "tiger" | "shark" | "merman" | "ufo", readonly string[]>` and `EXTRA: Record<ExtraId, string>` with `type ExtraId = "cowGarland" | "sharkRocket" | "ufoEmpty" | "alienChute" | "tigerFace" | "tigerPaw" | "pile" | "fish"`. `Art.sprites` covers every `Kind` except bigfoot's rig (bigfoot keeps his two sprite frames for `iconUrl` and the reduced-motion fallback).
- Frames (from `art-src/rares/anim-*.svg`, rotating the grouped parts as the prototype's CSS does): cow 2 (wings `.wn`/`.wf` at 0° and −24°); tiger 2 (wings 4° and −30°, tail 0 and −14°); shark 2 (legs `.lf`/`.ln` at −16°/18° and 20°/−18°, fins mirrored); merman 2 (arm −10° and 16°); ufo 2 (lamps alternating opacity). Extras: `cowGarland` = cow frame 0 with `.garland` shown; `sharkRocket` = shark with both leg groups removed and the body's bottom closed with a rounded nozzle path in the body colour; `ufoEmpty` = ufo with `.pilot` removed; `tigerFace`, `tigerPaw`, `pile` copied; `fish` = the prototype's `fishSvg` in `#f49ea3`; other colours are tinted at draw time (`globalCompositeOperation = "source-atop"` on a small offscreen canvas per colour, made once).
- The script uses only Node built-ins (string transforms on the SVG text; `transform-box` is not available in a canvas image, so it bakes each rotation as `transform="rotate(a cx cy)"` with the pivot computed from the group's bbox corner named in the prototype's CSS (`transform-origin`)).

- [ ] **Step 1: Write the failing test** `art/rares.test.ts`: every `RARE_FRAMES` entry is a complete SVG document with `width`, `height` and `viewBox`; frame counts as above; every `ExtraId` exists.
- [ ] **Step 2:** FAIL. **Step 3:** Write the script, run `node games/vice-hunt/art-src/build-rares.mjs`, commit its output. **Step 4:** PASS; render each frame to PNG with headless Chrome (`--mute-audio`, a scratch HTML page in the scratchpad) and compare by eye with `docs/superpowers/reference/vice-hunt-rares-motion.html`.
- [ ] **Step 5: Commit** `Vice Hunt: art for the rares`.

### Task 6: Moves and hit reactions

**Files:**
- Create: `games/vice-hunt/src/modules/moves.ts`, `games/vice-hunt/src/modules/reactions.ts`, tests beside them
- Modify: `games/vice-hunt/src/render.ts` (`drawAnimal` uses `MOVES[c.move].frame` and transforms: bob, tilt, squash)

**Interfaces:**
- `MOVES`: `hop` (rabbit, today), `dash` (iguana, today), `glide` (flamingo, today), `float` (cow: bob amplitude `0.018 * height`, period `2π/2.4` s, tilt `5°`), `swoop` (tiger: amplitude `0.06 * height`, `ω 1.6`, tilt `−9°·cos`), `strut` (shark: step period 0.72 s, bounce `5 px`, tilt `±3°`), `surface` (merman: y from `surface.phase`), `hover` (ufo: bob `0.02 * height`, `ω 1.3`, tilt `5°·sin(2.1t)` growing by `1.5°` per hit), `stomp` (bigfoot: drawn by the rig, Task 9).
- `HIT_REACTIONS`: `flinch` (a 160 ms jolt of ±4 px; `flash` as today), `garland` (cow: switches her frame to `cowGarland` with a spring scale-in 0.2→1 over 450 ms using `backOut`), `none`.

- [ ] **Step 1: Tests:** `float` y offset at t=0 is 0 and at t=π/(2·2.4) is `0.018*height`; `hover` tilt amplitude grows by 1.5° per hit; `garland` scale at 0 is 0.2 and at 0.45 s is 1.
- [ ] **Step 2–4:** FAIL, implement, PASS; dev page screenshot shows all creatures moving (force-spawn via `spawn(world, rng, kind)` from the dev page with `?spawn=cow,tiger,shark,merman,ufo`).
- [ ] **Step 5: Commit** `Vice Hunt: moves and hit reactions`.

### Task 7: Finishes: deflates, rocket, fountain, crashes

**Files:**
- Create: `games/vice-hunt/src/fx/particles.ts`, `games/vice-hunt/src/modules/finishes/{deflates,rocket,fountain,crashes}.ts`, a test file per module
- Modify: `games/vice-hunt/src/render.ts` (draw finishing entries and particles)

**Interfaces:**
- `particles.ts`: `type Particle = { x; y; vx; vy; life; age; size; color; kind: "dot" | "star" | "smoke" | "fish" }`, `emit(list, spec)`, `stepParticles(list, dt, gravity)`, `drawParticles(ctx, list, art)`. Replaces today's poofs (keep their look for `falls`).
- Each finish follows the spec's behaviour paragraph and the prototype's numbers:
  - `deflates` (1.7 s): scale `1 − 0.62·min(1, 1.6k)`, wobble `sin(38k)(1−k)·0.18`, zigzag x `sin(15k)·70·(0.4+k) + 0.35k·width`, y `−k²(y0 + 0.4·height)`, white puffs behind.
  - `rocket`: crouch 0.45 s (switch to `sharkRocket` frame at 0.2 s), then `vy` from `−0.1·height` with `−2.2·height` per s², fireworks exhaust 6 dots per step plus a star burst with chance 0.4; done when off the top.
  - `fountain`: merman sinks 0.3 s; 26 fish with `vx ∈ ±0.16·width`, `vy ∈ −(0.75..1.2)·height`, gravity `1.45·height`, staggered over 0.55 s, each splashes on re-entry at `SEA_LINE`.
  - `crashes`: sputter 0.45 s, then fall 1.5 s along the prototype's spiral to `SEA_LINE·height − 0.06·height` with smoke; at 0.38 s spawn an `alien` sub-entry (frame `alienChute`, opens over 0.35 s, descends `0.075·height` per s, sways `±11°` at ω 2.2); switch the UFO to `ufoEmpty` at the same moment; splash rings at both landings.
  - Each has a `reduced` variant per the spec.
- [ ] **Step 1: Tests** (pure `step`): `deflates done after 1.7 s`; `rocket switches to the rocket frame before lift-off and is done once y < -h`; `fountain emits 26 fish and is done when the last one re-enters`; `crashes switches to ufoEmpty when the alien appears; both splash events land on SEA_LINE`; each `reduced` variant is done in at most 0.8 s.
- [ ] **Step 2–4:** FAIL, implement, PASS; dev page screenshots mid-finish for each (`?spawn=` and a `?shoot=kind` helper in `dev/main.ts` that lands the needed hits).
- [ ] **Step 5: Commit** `Vice Hunt: deflate, rocket, fountain and crash finishes`.

### Task 8: The glass, and the tiger's pounce and claw

**Files:**
- Create: `games/vice-hunt/src/fx/glass.ts`, `games/vice-hunt/src/modules/finishes/pounces.ts`, `games/vice-hunt/src/modules/threats/clawSwipe.ts`, tests
- Modify: `games/vice-hunt/src/index.ts` (a second canvas, `glass`, above the gun layer with `pointer-events:none`, drawn after the scene)

**Interfaces:**
- `glass.ts`: `type Mark = { kind: "scratch" | "splat"; ...; age: number; fadeAt: number; fadeFor: number }`, `addScratches(glass, width, height)`, `addSplat(glass, x, y, r, main: boolean, rng)` (irregular 14-lobe blob, 5 flecks, 1 or 3 drips drawn in over 1.8 s), `stepGlass(glass, dt)`, `drawGlass(ctx, glass)`. Marks never intercept shots (the canvas has `pointer-events:none`).
- `pounces` timeline (from the prototype): arc to the sand 0.6 s, squash and dust, 0.45 s beat, crouch 0.22 s, face leap 0.46 s (`tigerFace` grows from 0.16 to 1 at `0.8·height` wide, accelerating, to the centre at `0.46·height`), a jolt and a `callout` "HSSSS!" beside the face, paw rake 0.48 s from (0.76W, 1.02H) to (0.2W, 1.12H), scratches drawn in 150 ms each, staggered 35 ms, then `damage(world, 1.5, "tiger", ...)`, face drops away 0.26 s; marks fade after 1.5 s over 1.6 s. Done when the face is gone.
- [ ] **Step 1: Tests:** `pounce damages 1.5 exactly once, at the scratches`; `pounce during wasted does nothing further`; `scratches fade and are removed`; reduced variant: no leap, the face fades in, damage still 1.5.
- [ ] **Step 2–4:** FAIL, implement, PASS; screenshot the claw moment on the dev page.
- [ ] **Step 5: Commit** `Vice Hunt: the tiger's pounce and claw`.

### Task 9: Bigfoot: the rig, throws and the jet

**Files:**
- Create: `games/vice-hunt/src/rig/rig.ts`, `games/vice-hunt/src/rig/rig.test.ts`, `games/vice-hunt/src/rig/drawRig.ts`, `games/vice-hunt/src/modules/threats/throw.ts`, `games/vice-hunt/src/modules/finishes/jet.ts`, tests
- Modify: `games/vice-hunt/src/render.ts` (bigfoot alive and finishing drawn by `drawRig`), `games/vice-hunt/src/world.ts` (provoked Bigfoot runs his threat each step)

**Interfaces:**
- `rig.ts` (pure), matching the prototype's `RIG`, `ik`, `POSES` (`stand`, `squat`, `relief`, `jet`; the arm values are the tuned ones in the reference file), `blend(a, b, k)`, `walkPose(t, recoil)`, `throwArm(pose, k)` (wind-up `uN 8→−75, fNo 18→−125` over 0.6, release `→115, →95` ease-out), `finishPose(seq)` for the death timeline (`[0,0.14]` recoil, `[0.14,0.62]` stand→squat ease-in-out, settle, strain jitter 0.8–1.6, push at 1.6, `[1.62,1.86]` squat→jet).
- `drawRig(ctx, pose, x, y, scale, mirrored)` draws limbs as two strokes (outline `w+4.4`, fill `w`) with round caps; faces `calm`, `strain`, `relief`.
- Boss bar (package-drawn): once provoked, a rounded bar `70·scale` wide, 8 px tall, over his head, filled `1 − hits/20` with a red-to-gold gradient; gone during the finish.
- Callouts: the jet emits `callout` "PFFT!" when the pile drops and "SPLAT!" with the first (main) splat.
- `throw` threat: once `provoked`, every 1.5 s of world time while fully on screen and not finishing, a 0.55 s throw; at 62% a glob leaves the hand toward a random point in `[0.2,0.8]W × [0.18,0.73]H`, flies 460 ms (tumbling, growing to `2.2r`), then `addSplat` with `fadeAt 3.5 s` and `damage(min(0.5, 1.5 − dealt))` when positive. `dealt` lives on the animal; globs in flight carry their Bigfoot's id, so the cap holds after he dies.
- `jet` finish: `finishPose` to 1.86 s, a pile at 1.5 s (`pile` frame, squash-bounce), then flight: angle 32° above horizontal, heading his facing direction, speed from `0.06·width` plus `0.9·width` per s², tilt back to −22° over 0.25 s, brown spray 3 dots and green smoke per step, chunks falling, the pile flung as a central main splat (`0.13·min(W,H)`), then one glob every 0.35 s up to 3 more; done when off screen. Reduced: fade after the squat, splats appear in place.
- [ ] **Step 1: Tests:** `ik keeps the ankle at the target when reachable` (distance < 0.01); `ik bends the knee forward (knee.x > hip.x) for a lowered hip`; `blend at 0 and 1 returns the endpoints`; `walkPose feet alternate`; `throw cadence: provoked bigfoot throws at t≈0.5+0.34, then every 1.5 s`; `an unprovoked bigfoot never throws`; `damage from one bigfoot totals 1.5 even with 4 globs landing after he died` (Review Focus 5); `jet emits a kill event with 3000 base exactly once and is done off screen`.
- [ ] **Step 2–4:** FAIL, implement, PASS; screenshot squat, throw wind-up and mid-flight on the dev page; compare with the reference by eye.
- [ ] **Step 5: Commit** `Vice Hunt: Bigfoot's rig, throws and jet`.

### Task 10: Host wiring: events to callbacks, layers, reduced motion, destroy

**Files:**
- Modify: `games/vice-hunt/src/index.ts`, `games/vice-hunt/README.md`
- Create: `games/vice-hunt/src/index.test.ts` (jsdom-free: test the pure `toCallbacks` mapper only)

**Interfaces:**
- `HuntOptions` gains `onHit(kind, n, of, x, y)`, `onPenalty(kind, points, x, y)`, `onHealth(hearts)`, `onWasted()`, `onRare(kind, event)`, `onEscaped(kind, x, y)`, `onCallout(text, x, y)`; `onKill` unchanged in shape (new kinds). Exports for the app: `KINDS`, `isRare`, `kindsWhere`, `pointsFor`, `penaltyFor`, `type Kind`, `type GameEvent`.
- `toCallbacks(events: GameEvent[], options: HuntOptions, toHost: (x, y) => [number, number]): void`: one `switch` with a `never` check.
- Frame loop: `step` → `stepFinishing` → threats → `stepGlass` → particles → `drain` → `toCallbacks`; draw scene canvas, then glass canvas. `onBigfoot(present)` true while a live (not finishing) Bigfoot exists.
- `destroy()` also removes the glass canvas; after destroy and while `wasted`, `onDown` does nothing.
- [ ] **Step 1: Tests:** `toCallbacks maps each event type to its callback with host coordinates`; `an unknown event type is a compile error` (`// @ts-expect-error` on a fake event).
- [ ] **Step 2–4:** FAIL, implement, PASS. README: API list updated, balance paragraph replaced by a pointer to `creatures.ts` and the spec.
- [ ] **Step 5: Commit** `Vice Hunt: events to callbacks, glass layer, cleanup`.

### Task 11: The app: hearts, RARE menu, pop-ups, WASTED, results

**Files:**
- Create: `components/gta6/game/RareMenu.tsx`, `components/gta6/game/Hearts.tsx`, `components/gta6/game/Wasted.tsx`
- Modify: `components/gta6/game/Hud.tsx`, `components/gta6/game/GameMode.tsx`, `components/gta6/game/Results.tsx`, `components/gta6/game/game.module.css`, `app/globals.css`, `lib/gta6/streak.ts` (`callout` unchanged)

**Interfaces:**
- `Hearts({ hearts }: { hearts: number })`: three heart icons with halves (clip), `role="img"`, `aria-label="Health: {n} of 3"`; jumps on decrease (`--duration-gta-heart-hit: 350ms`); red edge flash on decrease (`--duration-gta-hurt: 520ms`). Placed first in the header's left group (`.corner`), before the time switch.
- Remove the wanted stars (`STARS`, `.stars`).
- `RareMenu({ met, hits, kills, icons, flash })`: button "RARE n / 6" (n = rares in `met`); hover (pointer: fine) or click (toggle, `aria-expanded`) shows a list of the six rares from `kindsWhere` order (cow, tiger, shark, merman, ufo, bigfoot): icon, name, count (`kills`, or `hits` in red for the cow); unmet rows show the icon as a dark silhouette (`filter: brightness(0)`), "???", 0. Click outside closes; Esc closes (marked handled). `flash` (a counter) replays a one-time glow (`--duration-gta-rare-flash: 900ms`) on `rare` events.
- Pop-ups (existing `pops` list): `onHit` with `of` shows "n / of"; `onPenalty` shows "−500" in the red pop style; `onEscaped` shows "TOO SLOW"; `onCallout` shows its text; damage (`onHealth` decreasing) shows "−½ ♥" or "−1.5 ♥" at the screen's upper middle (use "½" for 0.5). Bigfoot's boss bar is the package's (Task 9).
- `Wasted({ onDone })`: greys the stage (`filter: grayscale(1) brightness(.7)` on the overlay's stage, token `--duration-gta-wasted: 700ms`), shows "WASTED" in the display face, red; after `--duration-gta-wasted-hold: 2200ms` calls `onDone`, which opens the results card. Reduced motion: no scale.
- `GameMode`: holds `hearts` (3 on Play again), wires every new callback into the tally (`recordHit`, `recordKill(…, game.pointsFor(kind) scaled by scoreFor)`, `recordPenalty`), `onWasted` → `Wasted` → results.
- `Results`: score first (clamped), then every kind in `KINDS` order (unmet rares as "???"), the cow's line as hits, accuracy, best streak.
- [ ] **Step 1: Tests** (pure helpers only, in `lib/gta6/`): `rareCount(met) === met.filter(isRare).length`; `heartsLabel(1.5) === "Health: 1.5 of 3"`; `damageLabel(0.5) === "−½ ♥"`, `damageLabel(1.5) === "−1.5 ♥"`.
- [ ] **Step 2–4:** FAIL, implement, PASS; all gates PASS.
- [ ] **Step 5: Commit** `GTA6: hearts, RARE menu, pop-ups, WASTED and the full results card`.

### Task 12: Verify in the real app, docs, bundle

**Files:**
- Modify: `CLAUDE.md` (GTA 6 bullet: creatures registry, hearts, the glass layer, rig; keep it one bullet), `docs/superpowers/specs/2026-11-21-vice-hunt-rares-design.md` (only if a value was tuned: record it there)

- [ ] **Step 1:** Silent visual check: `npm run build && npm run start -- -p 3123` in the background; headless Chrome `--mute-audio` at 1440x900; open `/`, start the mode (footer palm `[aria-label="Vice City mode"]`), start the game, and use the dev hook `window.__viceHunt?.spawn(kind)` (exposed only when `navigator.webdriver` is true) to spawn each rare; screenshot each moving and mid-finish; check the merman sits on the scene's sea line (adjust `SEA_LINE` once if not, and its test). Stop the server.
- [ ] **Step 2:** Final gate (Global Constraints) PASS, including all three bundle checks.
- [ ] **Step 3:** Update `CLAUDE.md`. `./scripts/verify-simplification.sh` PASS.
- [ ] **Step 4: Commit** `Vice Hunt rares: verified, docs`.
- [ ] **Step 5:** Push and open the PR against `gta6-mod` (title "Vice Hunt: rare creatures, hearts and the RARE menu"), body summarising the creatures table and listing the calls from the spec's "Left to the builder".
