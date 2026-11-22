# Handoff: Vice Hunt rares (2026-11-22)

Read this first, then the plan. Branch `vice-hunt-rares`, stacked on `gta6-mod` (PR #82). **Not pushed since Task 3** (local commits up to `e23f99e`).

- Spec (binding, "Edge cases and rules" especially): `docs/superpowers/specs/2026-11-21-vice-hunt-rares-design.md`
- Plan (12 tasks): `docs/superpowers/plans/2026-11-21-vice-hunt-rares.md`
- Motion reference (copy feel and numbers, not code): `docs/superpowers/reference/vice-hunt-rares-motion.html`
- Execution: inline in the session (no subagents), one commit per task, owner reviews by eye between tasks.

## Where it stands

| Task | State | Commit |
|---|---|---|
| 1–6 registry, tally, world rules, module registries, art, moves and reactions | done | `cea8ff2` … `0e9a39f` |
| 7 finishes: deflates, rocket, fountain, crashes (+ gentle versions) | done | `890a080`, `1b81a9c` |
| 8 the glass, the tiger's pounce and claw | done | `5df3c21` |
| Owner fixes: merman in the water, per-creature `enabled` (tiger off), dev `?spawn=` | done | `3f1d211`, `e23f99e` |
| 9 Bigfoot: rig, throws, jet | done | see `git log` |
| 10 host wiring: events to callbacks | **next** (partly done, see below) | |
| 11 app: hearts, RARE menu, pop-ups, WASTED, results | todo | |
| 12 verify in the real app, docs, bundle, PR | todo | |

The owner said "we will fix the issues by far": they may bring more issues from play-testing before Task 9. Ask what they found before starting Task 9.

Gates last run on `e23f99e`: `npx tsc --noEmit -p .` clean; `npm test` 427 passed; `npm run lint` 0 errors (20 warnings, all in untouched files); `./scripts/verify-simplification.sh` exit 0. Build and bundle checks not run since before this work (Task 12).

## Decisions made while building (not in the plan)

- **Threats.** `ThreatModule` is `start(at: Origin, world, rng, reduced)`, `step(s, dt, world, rng, out)`, `done(s)`, `draw(ctx, s, art)`. Threats run from `stepThreats(world, dt, rng)` in `modules/index.ts` and live in `world.threats`. They may change the world (`damage`, `world.glass`); finishes may not. Their `draw` paints on the glass canvas, above the gun.
- **Retaliation.** A creature whose `threat.kind` is `"retaliates"` starts its attack when its finish ends: `stepFinishing(world, dt, reduced, rng)` hands the finish's final body (an `Origin`) to `startThreat`. The tiger: `pounces` (arc to the sand, squash, beat, crouch; 1.27 s) then `claw-swipe` (leap, "HSSSS!", paw rake, three scratches + 1.5 hearts at 0.89 s, face drops; 1.21 s). Gentle versions: `pounces-gentle` fades in place; the threat fades the face in at full size, no paw or shake.
- **Bigfoot's `throw` (Task 9)** should plug into the same runner: start it from the live animal when provoked (`Animal` satisfies `Origin` except `dir`; derive it from `vx`), use `addSplat` and `shake` from `fx/glass.ts`, and keep `dealt` so the 1.5 cap holds after he dies (Review Focus 5).
- **WASTED freeze.** `stepFinishing` and `stepThreats` both return early when `world.wasted` (tests in `modules/threats/clawSwipe.test.ts`).
- **The glass.** `fx/glass.ts`: `createGlass`, `addScratches(glass, W, H, gentle)`, `addSplat(glass, x, y, r, main, rng, gentle)` (14-lobe blob, 5 flecks, 1 or 3 drips, fades at 3.5 s over 0.9 s), `shake(glass, amp, dur)`, `shakeOffset`, `stepGlass`, `drawGlass`. `world.glass` holds it. In `index.ts` a second canvas sits after the gun (`pointer-events:none`); both canvases are cleared untransformed, then drawn with the shake offset.
- **Easing.** `modules/ease.ts`: `cubicBezier(x1, y1, x2, y2)` and `keyframes(keys, p)` reproduce the prototype's Web Animations timings (easing over the whole run, linear between keyframes).
- **Particles.** `fx/particles.ts` is the one particle system; the `falls` poofs (feathers, dust) now use it too.
- **Sea line.** `world.sea` (px) replaces `SEA_LINE * height` everywhere. The host passes `seaLine(width, height)`; the app passes `beachSeaLine` from `lib/gta6/sea.ts`, which follows BeachScene's `inset:-2%`, `center bottom / cover` 16:9 art (water line at 0.665 of the art's height; the sand's highest point is 0.694). The old fixed 0.69 put the merman on the sand on wide windows. The merman is also clipped at the water line while alive (`render.ts`). Plan Task 12's "adjust `SEA_LINE` once" is now moot: checked at 1440x900, 1920x900, 2560x1080.
- **Enable flags.** Every creature in `creatures.ts` has `enabled`; the **tiger is off** (owner, 2026-11-22, to be re-enabled later). Disabled kinds never spawn on their own; an explicit `spawn(world, rng, kind)` still works. `isEnabled` is exported. **Task 11:** the RARE menu's "n / 6" and its rows must count only enabled rares (it would be 5 now).
- **Spawning for tests.** Package dev page: `?spawn=ufo&shoot=ufo` (`spawn`, and `finish`: lands the hits once the creature is fully on screen). The real app, under `npm run dev` only: `http://localhost:3001/?spawn=merman,cow` (`spawn` + `keep`: each comes back 1.5 s after it goes). This replaces the `window.__viceHunt` hook in plan Task 12, step 1.
- **Bigfoot (Task 9).** `rig/rig.ts` (pure: `ik`, `POSES`, `blend`, `walkPose`, `throwArm`, `finishPose`, `toWorld`, `rigTop`) and `rig/drawRig.ts` (`drawRig`, `drawBossBar`). The `throw` threat is one per provoked Bigfoot, started by `stepThreats` (which now takes `reduced`); `Threatening.from` names the animal. `dealt` and the globs live in the threat state (not on the animal, as the plan said), so the 1.5 cap holds after he dies. Throws are every 1.5 s start to start (the prototype waited 1.5 s after each 0.55 s throw). The threat writes `a.throwK` for the rig's arm. `FinishModule.step` gets the world's `glass` as an optional 4th argument and an optional `drawGlass` hook (drawn above the gun): the jet splats the glass but never deals damage. New `jet-gentle`. Dev page: `?hit=bigfoot` lands one hit once he is on screen (he starts throwing).

## Known gaps (spec items not built yet)

- The merman's foam line where he breaks the surface (spec, Merman) is not drawn.
- Task 10 is partly done: the frame loop already runs `stepFinishing`, `stepThreats` and `stepGlass` and draws the glass canvas; still `drain(world)` drops events (no callbacks yet), and `destroy()` needs no change (the glass canvas is inside the layer it removes).
- Nothing in the app shows hearts, WASTED, penalties or "1 / 3" yet (Task 11), so a tiger claw or Bigfoot splat costs hearts invisibly.

## How to check visually (silent)

The owner must never hear audio from automated checks: headless Chrome always with `--mute-audio` (the game is also silent when `navigator.webdriver`). Do not use `--virtual-time-budget` screenshots: virtual time starves `requestAnimationFrame` and world time lags far behind. Drive Chrome in real time over the DevTools protocol instead (Node 24 has `WebSocket` and `fetch` built in): launch `--headless=new --mute-audio --remote-debugging-port=<port> --user-data-dir=<scratch dir>`, connect to the page's `webSocketDebuggerUrl`, `Page.navigate`, then `Page.captureScreenshot` at chosen real times (and `Runtime.evaluate` to click `button[aria-label="Vice City mode"]`, then `[data-revolver]` once enabled; play starts about 9 s later). Combine frames into a contact sheet with Pillow (`python3 -I`). Dev server is on port 3001.

Rebuild the package dev page after changes: `npx esbuild games/vice-hunt/dev/main.ts --bundle --outfile=games/vice-hunt/dev/main.js`.

## Owner preferences that apply

- Discuss new ideas before editing docs or code; direct requests can go ahead.
- No em-dashes in app copy; durations and easings in the app come from tokens in `app/globals.css`.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push or open the PR only when asked (plan Task 12 step 5 is the agreed point).
