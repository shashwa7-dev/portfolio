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

- Thirteen wallpapers in `public/gta6/wallpapers/01.webp` to `13.webp` (the owner's chosen official GTA VI art, replaced 2026-11-20), crossfading every 5 s on a 65 s cycle, `object-fit: cover`.
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

## Revision 2 (2026-11-21): game mode revamp

Approved by the owner in the visual companion (game-mode-layout A, radio R1, beach scene v14). This section overrides anything above it that conflicts.

### Platform
The whole GTA 6 mode is desktop only: viewport at least 1024px wide and a fine pointer (`(min-width: 1024px) and (pointer: fine)`). Elsewhere the spin trigger and footer palm do nothing GTA-related and the site is exactly as without the flag.

### Footer palm and navigation
The palm renders only on the homepage (`usePathname() === "/"`). Leaving the homepage turns the mode off (unmount cleanup sets the store false).

### Hero while the mode is on (not playing)
As before (wallpaper slideshow, veil, accents, cluster), plus: the background dot-matrix brand mark (`BrandBackdrop` and `BrandBackdropFill`) is hidden. Wallpapers load lazily: `01` eagerly, the rest after the first has loaded; under reduced motion only `01` is rendered.

### Game mode (after picking up the revolver)
A full-viewport overlay (`position: fixed; inset: 0`, above everything), not inside the hero. While it is open: page scroll locked, the dock, chat bubble, starter pack card and command palette shortcut are hidden or inert (`inert` on the page root), the cursor is the crosshair.

- **Scene, back to front, all static (no mouse parallax):** sky, clouds, sea (CraftPix "Free Beach 2D Backgrounds", scene 3 layers, `public/gta6/beach/`), sailboat (small, far, bobbing and drifting across the bay), Golden Gate-style bridge across the full width (`bridge.svg`) with fog rolling under it and random cars crossing both ways, the billboard (behind the bridge, turned about 28 degrees on its Y axis to face the bridge, faint fogged stand, three lamps washing its face, the 13-wallpaper crossfade on it), sand and props (`props.webp`: the beach bar with an LED string, surfboards, two umbrellas, lounger, two palms on the edges leaning toward each other), two lamp posts set back on the sand behind the props. The reference is `.superpowers/sdd/2026-11-20-gta6-mod/scene-reference.html` (v14); match it.
- **Time of day:** morning (6:00 to 17:00), evening (17:00 to 20:00), night (20:00 to 6:00) from the visitor's clock, with a HUD switch (Morning, Evening, Night, Auto). Morning: natural colours, lights off. Evening: purple-pink-orange sky, blue water with an orange sun shimmer (never green), billboard lamps, bar LEDs, lamp posts and car lights on. Night: dark-blue sky, moon and stars, the scene dimmed, every light on, red tower lights and deck lights on the bridge. Changes fade over about 1.2 s. The pure function `timeOfDay(hour)` lives in `lib/gta6/timeOfDay.ts` and is tested.
- **HUD (layout A):** radio top left; time switch top centre; wanted stars and kill counts (big numbers with each animal's icon and name) top right; six-round cylinder ammo bottom right; "Esc exit" bottom centre.
- **Revolver:** first person, no hands (`games/vice-hunt/src/art/revolver.svg`), replacing the pistol art. Six rounds; after the sixth shot it reloads automatically with a cylinder spin (about 1 s, no firing meanwhile); R reloads early.
- **Pick-up button:** a revolver icon (placeholder drawn from the revolver art until the owner's Figma icons arrive), loading ring until the game is ready.
- **Drama (controller's choice from the approved extras):** cinematic entry (letterbox bars, a short push-in, the "VICE HUNT" title for about 1.5 s, then the HUD slides in); "+1 RABBIT" style pop-ups at each kill and "DOUBLE!" or "TRIPLE!" for kills within 1.5 s of each other; the Bigfoot event (red edge pulse, "BIGFOOT SPOTTED" banner, music dips); a results card on Esc (kills per animal, accuracy, best streak, Play again, Back to site). No film grain.
- **Balance:** about 40% slower than revision 1: rabbit 0.33 to 0.45, iguana 0.15 to 0.36 (with its pauses), flamingo 0.12 to 0.18, bigfoot 0.05 to 0.075 hero widths per second. One hit kills a rabbit, iguana or flamingo; Bigfoot takes 3. Each animal has its own death animation (rabbit flips and lands on its back, iguana flips and slides with twitching legs, flamingo spirals down with feathers, Bigfoot staggers and topples backwards with a dust puff), drawn from the existing sprites with transforms only.
- **Esc:** ignored while a dialog has focus or the event was already handled.

### Radio
Replaces the single track. The playlist is 31 tracks (see Ids below): the theme first, then the rest shuffled, looping. Compact glass card: cover thumbnail (`i.ytimg.com/vi/<id>/mqdefault.jpg`), title and artist (from the playlist file; "Track N" only for a missing entry), previous, play/pause, next, mute, and a list button that drops down all tracks. The mode no longer ends when a track ends; the next one plays. If the YouTube API never loads (blocked), the card says "Radio unavailable" and the mode continues silently. The hidden player is at least 200x200 (off-screen, `opacity: 0`).

### Sound
Short recorded effects, CC0 (or equivalent free licence, credited in `public/gta6/sfx/CREDITS.md`), as `.mp3` in `public/gta6/sfx/`, loaded only when the game opens: revolver shot, cylinder spin plus click (reload), dry click (empty), hit thud, a short kill cue, a low entry stinger, and a soft ocean-waves loop under the music. Mixed quietly under the radio. Silent under `navigator.webdriver` and when the visitor mutes the radio. The owner may swap any file by ear later.

### Ids (playlist, in order)
The playlist lives in `components/gta6/track.ts` (`PLAYLIST`, entries of `{ id, title, artist }`): 31 tracks, starting with the original theme `aonTwBM1AZM`, then the owner's 30 (`IeqQ-UWgxuY` first). The card and list show each entry's title and artist from that file. The theme always plays first; the other 30 follow in an order shuffled once per music session (`playOrder` in `lib/gta6/radio.ts`), and the radio loops that order. The list shows the play order.

### Final-review fixes folded in
Palm homepage-only and mode-off on navigation; focus returns to the avatar button (or the palm) after Exit, Exit named "Exit Vice City mode"; the YouTube script rejects after a timeout so a blocked API never hangs; `check-gta6-bundle.sh` fails on zero stylesheets; flag-off contract wording in CLAUDE.md is "no mode markup or lazy GTA chunks".

## Revision 3 (2026-11-21): layouts chosen by the owner

Overrides revision 2 where they conflict. Mockups: `.superpowers/brainstorm/55516-1795237094/content/` (`radio-card.html` design A, `headers2.html` M1 and L1, `score.html` S2).

- **Radio card:** design A (cover fills the left 62% and fades into a dark glass panel; eyebrow "VICE FM · n / 31" with an equaliser; title and artist; prev, round play/pause, next, mute, list; a pink-to-teal progress line). The list shows the play order: entry 1 (the main theme) first, the other 30 shuffled per session.
- **Hero corner (mode on, not playing): M1.** One slim dark pill: a spinning vinyl with the current cover (stops spinning when paused and under reduced motion), the track as "Title · Artist" (ellipsis), play/pause, a pink round revolver button (starts the game; loading ring until ready), and ✕ (exit). Clicking the vinyl opens the full radio card (design A) as a popover under the pill. The star meter, the old cluster and the separate "now playing" tag go away.
- **Game HUD: L1, classic GTA corners.** Top left: a small icon-only time switch (☀ 🌅 🌙, plus Auto). Top right: the wanted stars and the score (S2). Bottom left: a small radio (cover, "VICE FM", title · artist, prev, play/pause, next, mute; the list opens upward). Bottom right: the six-round ammo cylinder. Bottom centre: a faint "ESC EXIT · R RELOAD". Nothing in the middle of the screen.
- **Score: S2.** A big glowing score number with "SCORE" under it, and four small glass chips (icon and count) for rabbit, iguana, flamingo and Bigfoot; the latest kill's chip glows pink briefly. Points: rabbit 100, iguana 150, flamingo 200, Bigfoot 1000; a DOUBLE adds 50% to that kill and a TRIPLE or more adds 100%. The results card shows the score first, then the per-animal counts, accuracy and best streak.
- **No glass-break effect:** shots leave no holes or cracks (in the game canvas or anywhere else). Keep the muzzle flash, recoil, hit flash and death animations.
