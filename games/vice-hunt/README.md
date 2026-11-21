# Vice Hunt

A tiny canvas hunting game (rabbits, iguanas, flamingos and a rare Bigfoot) in its own zero-dependency package. It must not import anything from the app. The portfolio loads it only through dynamic import, via the `@games/vice-hunt` path alias.

## API

The public entry is `src/index.ts`:

- `preloadHunt()` decodes the sprite frames once per page; later calls share the promise.
- `iconUrl(kind)` is an animal's first sprite frame as a data URL, for a host's own HUD.
- `startHunt(host, options)` adds one full-size layer to `host` (give the host `position: relative` or similar) and returns `{ destroy() }`. Every option is optional:
  - `onShot(x, y, hit)`: every shot that fires, in CSS px relative to `host`. Shots leave no mark on the screen (no bullet holes or cracks, spec revision 3): muzzle flash, recoil, the hit flash and the death animations are the only feedback.
  - `onKills(kills)`: the running kill counts after each kill.
  - `onKill(kind, x, y, streak)`: each kill at the animal's centre (CSS px relative to `host`); `streak` counts kills each within 1.5 s of the one before, 1 for a lone kill.
  - `onAmmo(rounds, reloading)`: once at the start and on every change.
  - `onBigfoot(present)`: true when Bigfoot comes on, false once he is gone (killed or off the far edge).
  - `onExit()`: Esc or right click. Esc is ignored when the event was already handled (`defaultPrevented`) or comes from inside a `[role="dialog"]`. The host then calls `destroy()`, which is safe to call twice.
  - `muted`, `sfx` (see Sound), `showScore` (default true; false hides the package's score strip for a host with its own HUD), `scoreInset` (the strip's CSS px from the host's left edge, default 12).
- The gun is a six-round revolver (`art/revolver.ts`, built from `art/revolver.svg`). After the sixth shot it reloads on its own (1 s, the cylinder spins, clicks meanwhile only dry-fire); R reloads early.
- Balance (spec revision 2): one hit kills a rabbit, iguana or flamingo, Bigfoot takes 3. A kill removes the animal from the world at once; the animal moves into `world.finishing` and plays its finish module (`src/modules/`: registries `FINISHES`, `MOVES`, `HIT_REACTIONS`, `THREATS`; prey use `falls`, which wraps `death.ts`; ids whose module has not landed use a generic 0.6 s fade). The host steps them with `stepFinishing(world, dt, reduced)`.
- Reduced motion: no screen shake, and the recoil is a small translate.

## Sound

`createSound(muted, sfx)` plays the recorded file given for an effect (`sfx: { shot, reload, empty, hit, kill }`, each a URL, all optional) once it has loaded, and synthesises the effect with Web Audio otherwise. It is silent, and fetches nothing, when `muted` is set or `navigator.webdriver` is true. This package ships no audio files; the host passes the URLs.

Modules: `render.ts` (canvas: animals, finishing entries, poofs), `gun.ts` (first-person revolver and crosshair, DOM), `sound.ts`, `sprites.ts` (art decoding). Pure and tested: `ammo.ts` (`createAmmo`, `fire`, `startReload`, `tick`), `death.ts` (`deathPose(kind, age, fall, out)`, `DEATHS`). The pure simulation lives in `src/world.ts` and has no DOM access:

- `createWorld(width, height, rng)`, `step(world, dt, rng)`, `shoot(world, x, y, rng)` (returns `{ hit, finished }`), `resize(world, width, height)`, `emptyKills()`
- The world pushes typed events (`GameEvent` in `src/events.ts`: hits, kills, penalties, damage, rares, the merman's escape, callouts, WASTED) onto `world.events`; the host takes them each frame with `drain(world)`.
- `damage(world, hearts, source, x, y)` takes hearts (from 3, clamped at 0); at 0 the world is `wasted`, and `step` and `shoot` do nothing.
- Hit rules: each animal counts `hits` against its rolled total `hp`. Cow and tiger hits give penalties and break the streak; Bigfoot's first hit provokes him. Rares roll a per-second chance while their kind is not alive (one rare on screen at a time, Bigfoot aside, never Bigfoot in the first 30 s). The merman lives on the sea lane at `world.sea`, the host's water line (the `seaLine(width, height)` option, asked again on every resize; the app passes `beachSeaLine` from `lib/gta6/sea.ts`, which follows BeachScene's cover-scaled art; default `SEA_LINE` of the height). He surfaces in place (`src/surface.ts`), is clipped at the water line, and only his part above it is hittable.
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

Then open `games/vice-hunt/dev/index.html`. It mounts the game in a 1000x420 box, muted; add `?sound` to the URL to hear it. `dev/main.js` is git-ignored.

## Tests

```
npx vitest run games/
```
