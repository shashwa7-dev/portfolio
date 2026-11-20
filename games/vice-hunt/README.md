# Vice Hunt

A tiny canvas hunting game (rabbits, iguanas, flamingos and a rare Bigfoot) in its own zero-dependency package. It must not import anything from the app. The portfolio loads it only through dynamic import, via the `@games/vice-hunt` path alias.

## API

The public entry is `src/index.ts`:

- `preloadHunt()` decodes the sprite frames and the gun once per page; later calls share the promise.
- `startHunt(host, { onKills, onShot, onExit, muted })` adds one full-size layer to `host` (give the host `position: relative` or similar) and returns `{ destroy() }`. `onShot` gets CSS px relative to `host`. Esc or right click calls `onExit`; the host then calls `destroy()`, which is safe to call twice.
- Sound is synthesised with Web Audio and is silent when `muted` is set or `navigator.webdriver` is true.

Modules: `render.ts` (canvas: animals, poofs, holes), `gun.ts` (first-person gun and crosshair, DOM), `cracks.ts` (seeded crack paths), `sound.ts`, `sprites.ts` (art decoding). The pure simulation lives in `src/world.ts` and has no DOM access:

- `createWorld(width, height, rng)`, `step(world, dt, rng)`, `shoot(world, x, y)`, `resize(world, width, height)`, `emptyKills()`
- `spawn(world, rng, kind?)` is exported for tests; production spawning calls it without `kind`.
- All speeds, hit counts and sizes live in `src/config.ts`.

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
