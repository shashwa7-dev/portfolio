# Vice Hunt

A tiny canvas hunting game (rabbits, iguanas, flamingos and a rare Bigfoot) in its own zero-dependency package. It must not import anything from the app. The portfolio loads it only through dynamic import, via the `@games/vice-hunt` path alias.

## API

The public entry is `src/index.ts` (the renderer arrives in a later task). The pure simulation lives in `src/world.ts` and has no DOM access:

- `createWorld(width, height, rng)`, `step(world, dt, rng)`, `shoot(world, x, y)`, `resize(world, width, height)`, `emptyKills()`
- `spawn(world, rng, kind?)` is exported for tests; production spawning calls it without `kind`.
- All speeds, hit counts and sizes live in `src/config.ts`.

## Flags

The on/off flags (`GTA6_ENABLED`, `VICE_HUNT_ENABLED`) live in the host app, in `lib/gta6.ts`, not in this package.

## Tests

```
npx vitest run games/
```
