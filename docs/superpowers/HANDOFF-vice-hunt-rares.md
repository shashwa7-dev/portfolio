# Handoff: Vice Hunt rares (2026-11-22)

Read this first, then the plan. Branch `vice-hunt-rares`, stacked on `gta6-mod` (PR #82). **Not pushed since Task 3**: every task's commit is local. All twelve tasks are done except plan Task 12 step 5 (push and open the PR against `gta6-mod`), which waits for the owner to ask.

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
| 9 Bigfoot: rig, throws, jet | done | `3c84c10` |
| 10 host wiring: events to callbacks | done | `0d8cda8` |
| 11 app: hearts, RARE menu, pop-ups, WASTED, results | done | `2e4543d` |
| 12 verify in the real app, docs, bundle | done; push and PR wait for the owner | see `git log` ("Vice Hunt rares: verified, docs") |
| Opening screen and pause (plan `docs/superpowers/plans/2026-11-22-vice-hunt-opening-pause.md`): neon title screen that waits for a click, Esc/right-click pause menu, neon WASTED, Monoton/Mr Dafoe/Audiowide self-hosted, controls in the dock's notch | done | `02a0fb2` … see `git log` |
| Final whole-branch review | done as a self-review (no subagent tool): no Critical or Important findings, nothing to fix; minors below | |

Gates last run on Task 11's commit `2e4543d`: `npx tsc --noEmit -p .` clean; `npm test` 455 passed (61 files); `npm run lint` 0 errors (20 warnings, all in untouched files); `./scripts/verify-simplification.sh` exit 0; `npm run build` exit 0 and `./scripts/check-gta6-bundle.sh`, `./scripts/check-diwali-bundle.sh --off`, `./scripts/check-starter-pack-bundle.sh` all exit 0. (The build also contained the owner's uncommitted `/vice-hunt` route, which is on disk.)

Verified by eye (muted headless Chrome, `--mute-audio --enable-automation`): the production build's real entry path at 1440x900 (homepage, footer palm, revolver, play; HUD and RARE menu; no console errors), and on the dev server every rare moving and mid-finish at 1440x900, the merman on the sea line, hits and penalties, Bigfoot's splats capped at 1.5 hearts, WASTED then the results card, Play again, and reduced motion.

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
- **Host wiring (Task 10).** `toCallbacks` maps every event to its callback; `startHunt` flushes after each shot and every frame; kills reach the host only from `kill` events (R8: a finished cow or tiger is a penalty, never a kill); WASTED ignores clicks and R; `onHealth` also fires once at the start.
- **The app (Task 11).** Hearts, the RARE menu ("RARE n / 5": enabled rares only), pop-ups, WASTED and the results card. Pure helpers in `lib/gta6/hud.ts`. Under reduced motion the pop-ups, the red edge flash and WASTED keep their durations (the site's global rule would cut them to nothing). Under `npm run dev`, `?shoot=cow` and `?hit=bigfoot` work in the app as on the package dev page (with `?spawn=`), e.g. `http://localhost:3001/vice-hunt?spawn=tiger,bigfoot&shoot=tiger&hit=bigfoot` reaches WASTED in about 8 s.

## Known gaps (deferred minors from the final review)

- The merman's foam line where he breaks the surface (spec, Merman) is not drawn.
- Dev helper only: `?shoot=ufo` stops shooting if a creature in front takes one of its shots and dies (it checks `finished`, not which animal finished). Re-run the page.
- Under reduced motion the RARE counter's glow does not show. The pop-ups, the red edge flash and WASTED do keep their time.
- Hand-listed kinds remain in three places: `world.ts` ("ufo" has a secret hit total), `index.ts` `SCORE_ORDER` (the package's own score strip, dev page only), and `render.ts` / `modules/draw.ts` ("bigfoot" for the rig).
- Pop-ups are `aria-hidden`; screen readers hear WASTED but not each hit taken.
- The tiger's face and paw keep the size they had when the claw began if the window is resized mid-claw.
- The spec's "Callbacks added to HuntOptions" still shows `onHit(kind, hitNumber, x, y)` (the code follows the plan: `onHit(kind, n, of, x, y)`), and its `FinishModule` sketch lacks the glass parameter.
- The "BIGFOOT SPOTTED" banner was removed (owner, 2026-11-22): players discover him. He is 25% bigger (`size: [136, 191]`).

## How to check visually (silent)

The owner must never hear audio from automated checks: headless Chrome always with `--mute-audio` (the game is also silent when `navigator.webdriver`). Do not use `--virtual-time-budget` screenshots: virtual time starves `requestAnimationFrame` and world time lags far behind. Drive Chrome in real time over the DevTools protocol instead (Node 24 has `WebSocket` and `fetch` built in): launch `--headless=new --mute-audio --enable-automation --remote-debugging-port=<port> --user-data-dir=<scratch dir>` (plain headless reports `navigator.webdriver` false; `--enable-automation` makes it true, so the game and radio skip audio entirely, on top of the mute), connect to the page's `webSocketDebuggerUrl`, `Page.navigate`, then `Page.captureScreenshot` at chosen real times (and `Runtime.evaluate` to click `button[aria-label="Vice City mode"]`, then `[data-revolver]` once enabled; play starts about 9 s later). Combine frames into a contact sheet with Pillow (`python3 -I`). Dev server is on port 3001.

Rebuild the package dev page after changes: `npx esbuild games/vice-hunt/dev/main.ts --bundle --outfile=games/vice-hunt/dev/main.js`.

## Owner preferences that apply

- Discuss new ideas before editing docs or code; direct requests can go ahead.
- No em-dashes in app copy; durations and easings in the app come from tokens in `app/globals.css`.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push or open the PR only when asked (plan Task 12 step 5 is the agreed point).
