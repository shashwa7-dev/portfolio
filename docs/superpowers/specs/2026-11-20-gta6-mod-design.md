# GTA 6 mod and Vice Hunt: design

Date: 2026-11-20. Owner: Shashwat. Status: approved in conversation (visual companion mockups v1 to v3, slideshow v2, gun prototype v3, sprites v2).

## Intent

GTA 6 has launched. For a while the portfolio gets a hidden, playful GTA 6 mode: spinning the hero photo (or clicking a palm in the footer) switches the hero to a Vice City look with the owner's chosen track. While the mode is on, a pistol in the hero starts a tiny hunting game. It is temporary and must be removable with two flags, never deleted code.

## Goals

- A visitor who keeps the avatar spinning gets the GTA 6 mode, with music.
- The footer bottom bar has a small palm icon, an Easter egg, that toggles the same mode.
- The hero restyles; the rest of the site only changes accent colours.
- A pistol in the hero starts a self-contained game ("Vice Hunt") that lives in `games/vice-hunt/`.
- Zero cost on a normal visit: no wallpapers, YouTube API, mod styles or game code in the homepage's first load.

## Non-goals

- No visible theme button (the theme switch is untouched), no command palette action.
- Nothing persisted: a reload always starts normal; game scores reset on Esc and on reload.
- No mobile game: the gun and the game are desktop (fine pointer) only. The theme itself works everywhere.

## Anti-goals

- Neon glow, game fonts, banded sunset gradients, loud saturation. The owner rejected all of these.
- Content disappearing. Shots never hide the hero text.
- Any sound in automated tests.

## Flags

`lib/gta6.ts`:

- `GTA6_ENABLED`: the theme. `false` means the site is exactly as before: the "You Spin Me Round" clip and the "mat kar lala" voice behave as today, no footer palm, no stars.
- `VICE_HUNT_ENABLED`: the game. Only matters when the theme is on. `false` means no pistol.

A verify check pins each flag to one definition, like `DIWALI_ENABLED` (C22).

## The theme

### Turning it on

1. **Spin.** While `GTA6_ENABLED`, `SpinAvatar` no longer plays its clip or the voice. Instead, the time it has spent above `SONG_SPEED` drives a five-star wanted meter beside the photo: one star per 0.5 s, so the fifth lands at the existing `SONG_AFTER` (2.5 s). The meter only shows while it is filling; it empties if the spinner drops below speed before the fifth star. The fifth star turns the mode on.
2. **Footer palm.** A `TreePalm` (Phosphor, from `/ssr`) icon button in the footer's bottom bar, before "MIT License", muted (`text-subtle`), `aria-label` "Vice City mode", `title` the same. Click toggles the mode.

Both are user gestures, so both may start audio.

### Turning it off

The track ends, the hero's Exit tag, or the footer palm again. A reload starts normal. Off fades the hero art out and restores the colours.

### State

A tiny external store, `lib/gta6/store.ts`: `{ on: boolean }` with `subscribe`, `get`, `set`, used through `useSyncExternalStore`. Turning on sets `data-mod="gta6"` on `<html>`; turning off removes it. Pure and unit-tested (subscribe, set, attribute contract via a fake root).

### Look

Colour tokens, scoped to `html[data-mod="gta6"]` (light) and `html.dark[data-mod="gta6"]` (dark). Only these change:

| Token | Light | Dark |
|---|---|---|
| `--accent` | pink `#c84f7d` | pink `#f49ea3` |
| `--accent-hover` | `#b03f6b` | `#f7b5b9` |
| `--accent-foreground` | white | `#1a1727` |
| `--ring` | pink | pink |

Plus, in the mod stylesheet: the hero name ("Shashwat") takes the accent; the "Open to work" amber becomes aqua (light `#2d8c93`, dark `#7fd6cf`); the avatar's status ring takes the accent. Backgrounds, borders and text tokens do not change.

The hero (the `<header>` in `components/About.tsx`) gets a full-bleed backdrop behind its content:

- Seven wallpapers in `public/gta6/wallpapers/01.webp` to `07.webp` (official GTA VI art: rooftop no logo, sunset car, dock no logo, Jack of Hearts, boat, Ocean View, plus the owner's bulldog still), crossfading every 5 s, `object-fit: cover`.
- A veil in the page background colour, a left-to-right gradient: about 85% opaque behind the text on the left, 70% in the middle, 20% at the right edge, with `backdrop-filter: blur(1.5px)`.
- A bottom fade into the page background so the hero melts into the next section.
- Overlays: one small control cluster at the top right of the hero's measure (inside the header's top padding): the five-star row, the pistol button (when the game is enabled), "now playing" and Exit.
- `LocalTime` shows "Vice City" in place of "BLR" while the mode is on.
- Reduced motion: one still wallpaper, no crossfade.

Images load only when the mode turns on (the backdrop component is a dynamic import and its `<img>` tags are created then).

### Music

The owner's track, YouTube id `aonTwBM1AZM`, in a hidden, privacy-enhanced iframe player, reusing the Diwali player (`components/diwali/youtube.ts`). That file is generalised: the shared code moves to `components/common/youtube.ts` with `createPlayer(host, { videoId, end?, title }, handlers)`, and Diwali passes its own id and end. Diwali behaviour must not change; `scripts/check-diwali-bundle.sh` must still pass.

- `primeYouTube()` is called on the first spin flick and on the palm click (gestures), so the API is ready.
- On activation the player is created; on ready it plays and fades in to volume 60 over the hero fade time.
- On end: the mode turns off. On error, or if play is refused (Safari without a gesture): the "now playing" tag becomes a "play" button the visitor can press.
- Turning off fades the volume to 0, then destroys the player.

## Vice Hunt (the game)

### Package

`games/vice-hunt/` is its own package: `package.json` (name `vice-hunt`, private, no dependencies, `"type": "module"`), `README.md`, `src/`, tests. Plain TypeScript and canvas, no React, no imports from the app. The app reaches it through a tsconfig path alias `@games/vice-hunt` and only ever with `import()`. Root vitest also runs `games/**/*.test.ts`.

Public API (`src/index.ts`):

```ts
export type Kind = "rabbit" | "iguana" | "flamingo" | "bigfoot";
export type Kills = Record<Kind, number>;
export type HuntOptions = {
  onKills?(kills: Kills): void;
  onShot?(x: number, y: number, hit: Kind | null): void; // host clears frost here
  onExit?(): void;                                       // Esc pressed inside the game
  muted?: boolean;                                        // tests and automation
};
export type Hunt = { destroy(): void };
export function startHunt(host: HTMLElement, options?: HuntOptions): Hunt;
export function preloadHunt(): Promise<void>; // decodes sprites; resolves when ready
```

### Loading and the gun

- When the theme turns on and `VICE_HUNT_ENABLED`, the app starts `import("@games/vice-hunt")` and then `preloadHunt()` in the background.
- Until both resolve, the pistol button is shown disabled with a spinning ring around it and the tooltip "Loading the game"; then the ring stops and the button is enabled ("Grab the gun"). On a coarse pointer (touch), the pistol is not shown at all.

### Game mode

- Clicking the pistol starts the game: page scroll locks (`overflow: hidden` on `<html>`), the page scrolls the hero into view first, the cursor is hidden and a crosshair follows the pointer inside the hero, and the first-person pistol (seen from behind, hands holding it) sits at the bottom of the hero, sliding under and leaning toward the aim point.
- A click fires: muzzle flash, recoil toward the viewer (larger, lower, muzzle up), a synthesised gunshot (noise burst plus low thump, Web Audio, not in tests), a bullet hole with random radial and ring cracks at the point, and `onShot` so the host clears a circle of the veil there. At most 12 holes; the oldest goes.
- Esc (or right click) exits: scroll unlocks, cursor returns, holes clear, animals clear, kills reset. Picking the gun up again starts at zero.
- The score strip, bottom left inside the hero: one small sprite icon and count per animal.

### Animals

Sprites from the approved v2 sheet (SVG, two-frame cycles), drawn to canvas from pre-decoded images, mirrored for leftward runs.

| Animal | Lane | Speed (hero widths per second) | Hits to kill | Behaviour |
|---|---|---|---|---|
| Rabbit | bottom | fastest, 0.55 to 0.75 | 1 or 2 (random per spawn) | hops in bounds, sometimes in pairs |
| Iguana | bottom | fast and erratic, 0.25 to 0.6 | 3 | dashes, random pauses of 0.2 to 0.8 s |
| Flamingo | top | medium, 0.2 to 0.3 | 2 or 3 (random per spawn) | flaps, gentle sine wave |
| Bigfoot | middle-bottom | slow, 0.08 to 0.12 | 7 or 8 (random per spawn) | rare, health bar above, at most one at a time |

Spawning: one every 0.9 to 1.6 s, at most 6 on screen; Bigfoot has a 6% chance per spawn once 8 s have passed and none is alive. A hit that does not kill flashes the sprite white and knocks it back slightly; a kill plays a small poof (feathers for flamingo, dust otherwise) and increments the count. Animals leave the far edge and are removed.

The game logic (spawning, movement, hit testing, kills) is pure and tested with a seeded random and fixed time steps. Rendering and input are thin and untested.

## Bundle and verification

- `scripts/check-gta6-bundle.sh`: after `npm run build`, the homepage's first-load chunks must not contain `aonTwBM1AZM`, `vice-hunt` internals, or the wallpaper paths, and its stylesheets must not contain the mod's colour overrides. The overrides are a CSS string in the lazy chunk, rendered as a `<style>` element by the mod component (a CSS module cannot hold pure `html[...]` selectors, and a global stylesheet would ship up front). With `--off`: no GTA code at all.
- `scripts/verify-simplification.sh` must pass; new checks pin both flags.
- `npm test`, `npm run lint`, `npm run build` pass.
- Manual test by the owner in the browser.

## Approaches considered

1. **Colour layer plus hero restyle (chosen).** Token overrides on a `data-mod` attribute, a lazy hero backdrop. Cheap, removable, works in light and dark.
2. Third theme in the light/dark switch. Rejected: the owner wants no visible switch, and it would break the light/dark choice.
3. Restyle the whole site. Rejected: too much for a temporary mod.

For the game: a local package reached by a path alias and dynamic import (chosen) over an npm workspace (lockfile churn, no gain for zero-dependency code) and over a separately hosted iframe app (a second deploy for a toy).

## Decisions from the builder check

- **Starter pack card:** hidden while the mode is on (`html[data-mod="gta6"] .starter-pack-hang { display: none }` in the mod styles). It shares the hero's top-right corner and would cover the art and catch shots. Hidden, its loop stops on its own (it only runs while on screen).
- **Stars:** while filling, the meter sits beside the photo (in `SpinAvatar`). Once the mode is on, a full five-star row sits in the mod's control cluster at the top right of the hero's measure, together with the pistol, "now playing" and Exit. The palm route shows the same full row.
- **Track ends during the game:** the game keeps running; the mode turns off when the game exits (Esc). Exit or the palm during the game ends the game at once (destroy, unlock scroll, clear holes), then turns the mode off.
- **Diwali and GTA 6:** both flags on is not allowed; a verify check fails if both are `true` (the fuse replaces the spinner, so the spin trigger would vanish).
- **Art:** the approved sprite frames and the first-person gun (redrawn hands) are already in `games/vice-hunt/src/art/sprites.ts` and `games/vice-hunt/src/art/gun.ts`. Use them as they are.
- **Automation is silent:** under `navigator.webdriver` the game makes no sound and the YouTube player is never created.

## Left to the builder

Exact z-order inside the hero, crack drawing details, poof particles, sound envelope numbers, the rabbit-pair rule. Keep within the anti-goals.
