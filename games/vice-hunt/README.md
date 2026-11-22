# Vice Hunt

A tiny canvas hunting game (rabbits, iguanas, flamingos, and rare creatures: a flying cow, a flying tiger, a walking shark, a merman, a UFO, Bigfoot, a roller ostrich and a candy gator) in its own zero-dependency package. It must not import anything from the app. The portfolio loads it only through dynamic import, via the `@games/vice-hunt` path alias.

## API

The public entry is `src/index.ts`:

- `preloadHunt()` decodes the sprite frames once per page; later calls share the promise.
- `iconUrl(kind)` is an animal's first sprite frame as a data URL, for a host's own HUD.
- The creature registry's helpers, for a host's HUD and score: `KINDS` (registry order), `kindsWhere(role)`, `isRare(kind)`, `isEnabled(kind)`, `pointsFor(kind)`, `penaltyFor(kind, hitNumber, finishing)`, and the types `Kind`, `Kills`, `GameEvent` and `Callout`.
- `toCallbacks(events, options, toHost)` maps world events onto the callbacks below (one `switch` with a `never` check, so a new event does not compile until it is handled); `startHunt` runs it every frame and right after each shot.
- `startHunt(host, options)` adds one full-size layer to `host` (give the host `position: relative` or similar) and returns `{ destroy() }`. Every option is optional:
  - `onShot(x, y, hit)`: every shot that fires, in CSS px relative to `host`. Shots leave no mark on the screen (no bullet holes or cracks, spec revision 3): muzzle flash, recoil, the hit flash and the death animations are the only feedback. A shot that lands on one of the gator's candies stuck to the glass knocks the candy off and hits nothing behind it (`hit` is null).
  - `onKills(kills)`: the running kill counts after each kill.
  - `onKill(kind, x, y, streak)`: each kill at the animal's centre (CSS px relative to `host`); `streak` counts kills each within 1.5 s of the one before, 1 for a lone kill. The cow and the tiger are never killed: their last hit is a penalty, so it reaches `onPenalty` only.
  - `onHit(kind, n, of, x, y)`: every hit, finishing or not, the `n`th of `of` needed; `of` is left out for the UFO (its total is a secret) and Bigfoot (he has a boss bar). The candy gator shows his (5 or 6, rolled).
  - `onPenalty(kind, points, x, y)`: negative points for hitting the cow or the tiger.
  - `onHealth(hearts)`: hearts left (3 at the start, in halves): once at the start and after each hit the player takes (the tiger's claw, Bigfoot's splats, the gator's candy sprays).
  - `onWasted()`: out of hearts. The world stops (no spawns, throws or finishes; shots and R do nothing); the host shows WASTED and its results, then calls `destroy()`.
  - `onRare(kind, event)`: a rare came on (`"appeared"`) or was hit for the first time this round (`"met"`).
  - `onEscaped(kind, x, y)`: the merman's window lapsed ("TOO SLOW").
  - `onCallout(text, x, y)`: a word to pop ("ANGRY!", "HSSSS!", "PFFT!", "SPLAT!", the ostrich's "!!", the gator's "FWUMP!", "POP!" and his shouts, `GATOR_LINES`); the package draws no text.
  - `onAmmo(rounds, reloading)`: once at the start and on every change.
  - `onBigfoot(present)`: true while a live Bigfoot is on (not once his finish starts), false once he is gone (finished or off the far edge).
  - `onPause()`: Esc or right click during play (not while paused, not once WASTED). Esc is ignored when the event was already handled (`defaultPrevented`) or comes from inside a `[role="dialog"]`. The host shows its menu and calls `pause()`; later `resume()` carries on with no catch-up step, or `destroy()` ends it (safe to call twice).
  - `spotted`: rares the host saw appear in earlier rounds (from `onRare(kind, "appeared")`). A rare that has appeared, this round or in one listed here, comes back about once a minute (`SPOTTED_PER_MINUTE`) instead of its own rate; Bigfoot always keeps his.
  - `pause()` / `resume()` on the returned handle: paused, the round does not step, shots and R do nothing, the gun's animations hold and sound is suspended. A hidden tab does not resume a paused hunt.
  - `muted`, `sfx` (see Sound), `showScore` (default true; false hides the package's score strip for a host with its own HUD), `scoreInset` (the strip's CSS px from the host's left edge, default 12), `seaLine(width, height)` (the host scene's water line, see below).
  - Dev pages only: `spawn`, `keep`, `finish` and `hit` (lists of kinds; see "Dev page").
- `destroy()` stops the frame loop and every listener and removes the layer with its three parts: the scene canvas, the gun, and the glass canvas in front of the gun (the tiger's face and paw, claw scratches, splats, the gator's candies). The glass canvas takes no pointer events; `shoot` asks the glass first, and only a stuck candy takes the shot. Nothing keeps running: every sequence advances from frame time, never a timer.
- The gun is a six-round revolver (`art/revolver.ts`, built from `art/revolver.svg`). After the sixth shot it reloads on its own (1 s, the cylinder spins, clicks meanwhile only dry-fire); R reloads early.
- Balance: every creature's role, lane, size, speed, hits, points, penalty, threat, spawn rate and finish is one record in `src/creatures.ts`; the rules and the reasons behind the numbers are in the spec, `docs/superpowers/specs/2026-11-21-vice-hunt-rares-design.md` (its "Edge cases and rules" section especially). A finishing hit removes the animal from the world at once; it moves into `world.finishing` and plays its finish module (`src/modules/`: registries `FINISHES`, `MOVES`, `HIT_REACTIONS`, `THREATS`; prey use `falls`, which wraps `death.ts`). Each frame the host steps the world, then `stepFinishing(world, dt, reduced, rng)`, then `stepThreats(world, dt, rng, reduced)` (the tiger's claw, Bigfoot's throws), then `stepGlass`, then the particles, then takes the events.
- Reduced motion: every finish plays its gentle version (a module's `reduced` id: fades and short moves, no flying globs), the glass does not shake, and the recoil is a small translate.

## Sound

`createSound(muted, sfx)` plays the recorded file given for an effect (`sfx: { shot, reload, empty, hit, kill }`, each a URL, all optional) once it has loaded, and synthesises the effect with Web Audio otherwise. It is silent, and fetches nothing, when `muted` is set or `navigator.webdriver` is true. This package ships no audio files; the host passes the URLs.

Modules: `render.ts` (canvas: animals, finishing entries, poofs), `gun.ts` (first-person revolver and crosshair, DOM), `sound.ts`, `sprites.ts` (art decoding). Pure and tested: `ammo.ts` (`createAmmo`, `fire`, `startReload`, `tick`), `death.ts` (`deathPose(kind, age, fall, out)`, `DEATHS`). The pure simulation lives in `src/world.ts` and has no DOM access:

- `createWorld(width, height, rng)`, `step(world, dt, rng)`, `shoot(world, x, y, rng)` (returns `{ hit, finished }`), `resize(world, width, height)`, `emptyKills()`
- The world pushes typed events (`GameEvent` in `src/events.ts`: hits, kills, penalties, damage, rares, the merman's escape, callouts, WASTED) onto `world.events`; the host takes them each frame with `drain(world)`.
- `damage(world, hearts, source, x, y)` takes hearts (from 3, clamped at 0); at 0 the world is `wasted`, and `step` and `shoot` do nothing.
- Hit rules: each animal counts `hits` against its rolled total `hp`. Cow and tiger hits give penalties and break the streak; a hostile creature's first hit provokes it (Bigfoot starts throwing and shouts "ANGRY!"; the candy gator answers every hit with a candy spray, `threats/candyGun.ts`, at most 1.5 hearts per gator). The roller ostrich skates faster with every hit (`SKATE_SPEED` in `modules/ostrich.ts`). Only a `boss` (Bigfoot) shares the screen with another rare and hides its hit total. Rares roll a per-second chance while their kind is not alive (one rare on screen at a time, Bigfoot aside, never Bigfoot in the first 30 s). The merman lives on the sea lane at `world.sea`, the host's water line (the `seaLine(width, height)` option, asked again on every resize; the app passes `beachSeaLine` from `lib/gta6/sea.ts`, which follows BeachScene's cover-scaled art; default `SEA_LINE` of the height). He surfaces in place (`src/surface.ts`), is clipped at the water line, and only his part above it is hittable.
- `world.streak` is the current kill streak (`STREAK_WINDOW` in `config.ts`).
- `spawn(world, rng, kind?)` is exported for tests; production spawning calls it without `kind`.
- Every creature (lane, speed, hits, size, spawn, points) is one record in `src/creatures.ts`; timings live in `src/config.ts`.
- Each creature has `enabled`. A disabled one never spawns on its own (commons share out the remaining weight; rares skip their roll), but an explicit `spawn(world, rng, kind)` (the dev page's `?spawn=`) still makes it. The tiger is off for now. In the app, `npm run dev` with `?spawn=merman,cow` puts those kinds on screen and brings each back 1.5 s after it goes (the `spawn` and `keep` options; ignored in production builds).

## Flags

The on/off flags (`GTA6_ENABLED`, `VICE_HUNT_ENABLED`) live in the host app, in `lib/gta6.ts`, not in this package.

## Dev page

```
npx esbuild games/vice-hunt/dev/main.ts --bundle --outfile=games/vice-hunt/dev/main.js
```

Then open `games/vice-hunt/dev/index.html`. It mounts the game in a 1000x420 box, muted; add `?sound` to the URL to hear it. `?spawn=ufo,cow` puts those kinds on screen at the start, `?shoot=ufo` lands the hits that finish one once it is fully on screen, and `?hit=bigfoot` lands one hit (he starts throwing). `dev/main.js` is git-ignored.

## Tests

```
npx vitest run games/
```
