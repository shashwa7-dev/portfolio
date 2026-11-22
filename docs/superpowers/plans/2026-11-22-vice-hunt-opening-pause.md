# Vice Hunt opening screen and pause Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Vice Hunt's auto-playing title card with a neon title screen that waits for a click, add an Esc pause menu that freezes the game, and give the menus game-style type and chrome buttons.

**Architecture:** The game package (`games/vice-hunt`) gains `pause()` / `resume()` on its `Hunt` handle and an `onPause` callback (replacing `onExit`), driven by a small pure clock so a resume never produces a big frame step. The app (`components/gta6/game/`) owns every screen: a rewritten `Entry` (title screen), a new `Pause` menu, a shared `ControlsNotch` in the site dock's shape, and chrome button styles, all in the lazy `game.module.css`.

**Tech Stack:** TypeScript, React 19, Next 16, CSS modules, vitest (node environment), self-hosted woff2.

**Spec:** `docs/superpowers/specs/2026-11-22-vice-hunt-opening-pause-design.md`

## Global Constraints

- Fonts: Monoton, Mr Dafoe, Audiowide, latin subset woff2 in `public/gta6/fonts/`, declared with `@font-face` in `components/gta6/game/game.module.css`, `font-display: swap`; `public/gta6/fonts/OFL.txt` lists all four families. No run-time request to Google Fonts.
- HUD (score, hearts, ammo, chips, RARE menu, results card, Bigfoot banner) keeps Anton.
- No em-dashes in any user-facing string.
- Buttons and controls text: no coloured glow, no text-shadow. Neon glow only on the "VICE", "Hunt", "Paused" and "WASTED" words.
- Buttons: `transform: skewX(-12deg)`, inner label unskewed; two-tone fill split at 48/52%; hard bottom edge `0 0.45em 0 <darker>`; soft dark drop shadow.
- Colours: neon pink text `#ffd8ec` glow `#ff3ea5`; neon cyan text `#7ff5ff` glow `#18d6ff`; WASTED red glow `#ff2a2a`; pink button `#ff7cc4` / `#f0338f`, edge `#8a0f4f`; cyan button `#c6fdff` / `#5fe6ff`, edge `#0a7f9c`, text `#10203a`; dark item fill `rgba(20,10,40,.78)` with `rgba(127,245,255,.45)` border.
- Notch: same geometry and colours as the site dock (`OUTER_SIDE`, `INNER_SIDE`, `INNER_EDGE` in `components/Navbar.tsx`; `--dock-outer` `hsl(30 6% 7.5%)`, `--dock-inner` `hsl(30 5% 12.5%)`, `--dock-edge` `hsl(30 5% 17%)`; 54px outer, 48px inner, 6px rim), controls padded 22px in, 30px apart.
- Automated browser checks: headless Chrome with `--mute-audio --enable-automation`.
- Gates per task: `npx tsc --noEmit -p .`, `npm test`, `npm run lint` (0 errors), `./scripts/verify-simplification.sh` exit 0.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never stage `app/vice-hunt/`, `components/gta6/ViceHuntRoute.tsx`, `components/gta6/ViceHuntRoute.module.css` unless the owner says so. No push, no PR.

## Review Focus

- Esc pressed while the pause menu's Resume is focused: must resume exactly once, not pause again on the same keypress (both the game's window listener and the menu see it). Pinned in Task 1 (`escapeAction` returns "none" while paused) and checked by eye in Task 4.
- Tab hidden while paused, then shown: the game must stay paused (the visibility handler must not restart the loop). Pinned in Task 1 (clock test) and checked by eye in Task 4.
- Resume after a long pause: first frame must step by 0, not by the pause's length (creatures would jump, globs land at once). Pinned in Task 1.
- Esc or right click during WASTED: nothing (no pause menu over the WASTED hand-over). Pinned in Task 1 (`escapeAction`).
- Reload in progress when pausing: the ammo timer and the gun's reload animation both hold, and continue on resume. Checked by eye in Task 4.

---

### Task 1: Pause in the game package

**Files:**
- Create: `games/vice-hunt/src/pause.ts`
- Test: `games/vice-hunt/src/pause.test.ts`
- Modify: `games/vice-hunt/src/index.ts` (options `onExit` → `onPause`, `Hunt` type, `frame`, `onVisibility`, `onMenu`, `onKey`, `onDown`), `games/vice-hunt/dev/main.ts` (use `onPause`: pause, then resume on the next Esc), rebuild `games/vice-hunt/dev/main.js` the way the handoff says, `games/vice-hunt/README.md` (API section)

**Interfaces:**
- Produces: `export type Hunt = { destroy(): void; pause(): void; resume(): void }`; `HuntOptions.onPause?(): void` (replaces `onExit`); in `pause.ts`: `export type Clock = { tick(now: number): number; pause(): void; resume(): void; readonly paused: boolean }`, `export function createClock(): Clock`, `export function escapeAction(s: { paused: boolean; wasted: boolean }): "pause" | "none"`.

- [ ] **Step 1: Write the failing tests** in `pause.test.ts`:
  - `createClock`: first `tick(1000)` → 0; `tick(1016)` → `0.016` (close to); after `pause()`, `tick(5000)` → 0 and `paused` is true; after `resume()`, `tick(9000)` → 0 then `tick(9020)` → `0.02`.
  - `escapeAction({paused:false,wasted:false})` → `"pause"`; `{paused:true,wasted:false}` → `"none"`; `{paused:false,wasted:true}` → `"none"`.
- [ ] **Step 2: Run** `npx vitest run games/vice-hunt/src/pause.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement `pause.ts`.** `tick` returns seconds since the previous tick, 0 for the first tick after creation or `resume()`, and 0 while paused.
- [ ] **Step 4: Run the test.** Expected: PASS.
- [ ] **Step 5: Wire it into `startHunt`.** `frame` takes `dt` from `clock.tick(now)`, and `onVisibility` only requests a frame when `!document.hidden && !clock.paused`. `pause()`:
  - calls `clock.pause()` and cancels the rAF;
  - pauses every `getAnimations({subtree:true})` animation on the layer;
  - hides the crosshair;
  - suspends sound (add `suspend()` / `resume()` to `Sound` in `sound.ts`, wrapping the AudioContext's, no-ops when there is none).

  `resume()` reverses each step and requests a frame. Input while paused:
  - `onDown` and `R` do nothing;
  - `onKey`'s Escape and `onMenu` call `options.onPause?.()` only when `escapeAction({paused: clock.paused, wasted: world.wasted}) === "pause"`;
  - `onMenu` still calls `preventDefault()` always.

  `destroy` is unchanged apart from these.
- [ ] **Step 6: Run gates** (tsc, `npm test`, lint, verify). Expected: all green; `GameMode.tsx` will fail tsc on `onExit`, so in the same step rename its `onExit` to `onPause` with today's behaviour (`setPhase("results")`) so the tree compiles; Task 4 replaces it.
- [ ] **Step 7: Commit** `games/vice-hunt/src/pause.ts`, `pause.test.ts`, `index.ts`, `sound.ts`, `dev/main.ts`, `dev/main.js`, `README.md`, `components/gta6/game/GameMode.tsx`, plus this plan and its spec: "Vice Hunt: pause and resume, onPause".

### Task 2: Fonts, chrome buttons and the controls notch

**Files:**
- Create: `public/gta6/fonts/monoton-latin.woff2`, `mr-dafoe-latin.woff2`, `audiowide-latin.woff2`; `components/gta6/game/ControlsNotch.tsx`
- Modify: `public/gta6/fonts/OFL.txt`, `components/gta6/game/game.module.css`

**Interfaces:**
- Produces: CSS classes in `game.module.css`: `.neonPink`, `.neonCyan` (script), `.neonRed`, `.chrome` (base slanted button; its child `<span>` unskews), `.chromePink`, `.chromeCyan`, `.chromeDark`. Component `ControlsNotch({ items }: { items: { key: "mouse" | string; label: string }[] })`: `"mouse"` draws the mouse icon, any other string draws a keycap with that text.

- [ ] **Step 1: Fetch the fonts.** Request `https://fonts.googleapis.com/css2?family=Monoton&family=Mr+Dafoe&family=Audiowide&display=swap` with a Chrome User-Agent, then take each family's `/* latin */` woff2 URL and download it to the paths above. Append the three families to `OFL.txt` with their copyright lines from each font's metadata on fonts.google.com.
- [ ] **Step 2: Add the `@font-face` rules and classes** to `game.module.css`, values from Global Constraints. The neon classes take their glow from text-shadow at 0.05em, 0.15em and 0.33em blur. `.chrome:focus-visible` gets a 2px white outline offset 3px.
- [ ] **Step 3: Build `ControlsNotch`.** It is fixed to the bottom centre of the overlay and uses the dock's two-layer markup:
  - an outer layer: SVG side, strip, mirrored SVG side;
  - an inner layer: the same plus the edge line.

  Copy the three path constants with a comment naming `components/Navbar.tsx` as their source. The labels are Audiowide 15px in `hsl(35 6% 80%)`. Keycaps are 24px high, a light gradient on `hsl(30 6% 9%)` text with a `0 3px 0 hsl(30 5% 28%)` edge. The component is `aria-hidden`: the buttons carry their own names.
- [ ] **Step 4: Run gates.** Expected: green. It renders nothing yet, so there's no visual check.
- [ ] **Step 5: Commit** the fonts, `OFL.txt`, `game.module.css` and `ControlsNotch.tsx`: "GTA6: neon fonts, chrome buttons, controls notch".

### Task 3: Title screen and neon WASTED

**Files:**
- Modify: `components/gta6/game/Entry.tsx`, `components/gta6/game/Wasted.tsx`, `components/gta6/game/game.module.css` (`.title*`, `.wasted b`, reduced-motion block), `components/gta6/game/GameMode.tsx` (Entry props)

**Interfaces:**
- Consumes: Task 2 classes and `ControlsNotch`.
- Produces: `Entry({ onStart }: { onStart(): void })`.

- [ ] **Step 1: Rewrite `Entry`** as the title screen:
  - **Layout:** a dusk tint (`linear-gradient(180deg, rgba(40,10,70,.72), rgba(255,60,140,.35) 70%, rgba(20,5,40,.8))`), then "VICE" (`.neonPink`, Monoton, about 7.5vw), then "Hunt" (`.neonCyan`, Mr Dafoe, about 6.5vw, rotated -6deg, pulled up 2%).
  - **Start button:** `<button class="chrome chromePink">` with the label "CLICK TO START", focused on mount, calling `onStart`.
  - **Controls:** `ControlsNotch` with `[{key:"mouse",label:"Shoot"},{key:"R",label:"Reload"},{key:"ESC",label:"Pause"}]`.
  - **Motion:** the neon flickers in once over `--duration-gta-entry`, then holds. Under reduced motion it fades in instead. Remove the timer and `animationend` hand-over, since the click now starts the game.
  - **Esc:** stays as today, handled by GameMode.
- [ ] **Step 2: GameMode:** `<Entry onStart={() => setPhase("play")} />`.
- [ ] **Step 3: Wasted:** the word uses `.neonRed` in Monoton. Keep its timings and the reduced-motion rules the last branch added.
- [ ] **Step 4: Run gates**, then screenshot `http://localhost:3001/vice-hunt` at 2 s and 6 s with the muted helper. Expected:
  - the title screen holds at 6 s, with no auto-start;
  - the notch is flush with the bottom edge;
  - nothing glows except the two neon words.

  Then check WASTED with `?spawn=tiger,bigfoot&shoot=tiger&hit=bigfoot`: the helper has to click the start button first. Add a `CLICK` env to the scratch helper that dispatches a click on `[data-start]`, and put `data-start` on the button.
- [ ] **Step 5: Commit** "GTA6: neon title screen and WASTED".

### Task 4: Pause menu

**Files:**
- Create: `components/gta6/game/Pause.tsx`
- Modify: `components/gta6/game/GameMode.tsx`, `components/gta6/game/game.module.css` (`.pause*`)

**Interfaces:**
- Consumes: `Hunt.pause()` / `resume()` and `onPause` (Task 1); the classes and `ControlsNotch` (Task 2).
- Produces: `Pause({ onResume, onEnd, onBack }: { onResume(): void; onEnd(): void; onBack(): void })`.

- [ ] **Step 1: Build `Pause`.** It's a `role="dialog"` with `aria-label="Paused"`, over a dimmed and blurred backdrop (`rgba(14,10,30,.62)`, `backdrop-filter: blur(3px)`). Inside:
  - "Paused" in `.neonCyan`;
  - three stacked buttons, each 24% of the width at minimum: **Resume** (`.chromeCyan`, focused on mount), **End round** and **Back to site** (`.chromeDark`). A dark button takes the cyan look while focused;
  - `ControlsNotch` with `[{key:"ESC",label:"Resume"}]`.

  An Escape keydown inside it calls `onResume` and stops propagation. Enter and Space work as normal button presses.
- [ ] **Step 2: GameMode.**
  - Keep the hunt handle in a ref and add `paused` state.
  - `onPause`: `hunt.pause()`, then `setPaused(true)`.
  - Render `Pause` while `phase === "play" && paused`:
    - `onResume`: `setPaused(false)`, then `hunt.resume()`, then focus the overlay;
    - `onEnd`: `setPaused(false)`, then `setPhase("results")`;
    - `onBack`: `close.current()`.
  - The overlay's own Escape handler must not close the page while paused.
  - `overlayKey` already lets through Escape, Tab, Enter and Space, so the menu works.
  - Reset `paused` on Play again.
- [ ] **Step 3: Run gates.** Then screenshot `/vice-hunt`: click start, wait 2 s, press Esc (CDP `Input.dispatchKeyEvent`), capture. Expected: the paused menu shows with Resume focused, and creatures sit in the same places in two captures 1 s apart. Then press Esc again and capture twice 1 s apart: the menu is gone and the creatures have moved. Check by eye:
  - right click pauses;
  - End round shows the results card;
  - Back to site goes to `/`;
  - a reload started before the pause finishes after resume;
  - while paused, hiding and showing the tab (CDP `Page.setWebLifecycleState` frozen, then active) leaves it paused.
- [ ] **Step 4: Commit** "GTA6: pause menu (Esc or right click)".

### Task 5: Verify and docs

**Files:**
- Modify: `CLAUDE.md` (the GTA 6 bullet), `docs/superpowers/HANDOFF-vice-hunt-rares.md`, `games/vice-hunt/README.md` if Task 1 left anything out

- [ ] **Step 1: Update docs.** In the CLAUDE.md GTA 6 bullet, add one sentence: the game opens on a neon title screen that waits for a click, and Esc or right click pauses (Resume, End round, Back to site) through `Hunt.pause()` / `resume()`. Add a "Done" line for this plan to the handoff.
- [ ] **Step 2: Build and run the bundle checks:** `npm run build`, then `scripts/check-gta6-bundle.sh`. Expected: both exit 0, with nothing from the mode in the homepage's first load.
- [ ] **Step 3: Run the full gates.** Expected: all green, with a test count of 455 plus the new pause tests.
- [ ] **Step 4: Commit** "Vice Hunt: opening and pause, docs". Do not push.
