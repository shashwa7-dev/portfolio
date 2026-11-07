# Diwali Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Behind one flag, turn the hero photo into a fuse that lights a chakri show (YouTube song, sparks, toran), ending on a traditional शुभ दीपावली card left by picking a laddoo.

**Architecture:** A pure state machine and pure helpers live in `lib/diwali/` with vitest tests. The hero gets a small client component (`components/diwali/DiwaliAvatar.tsx`) for the fuse and matchstick; everything else (overlay, finale, plate, canvas effects, synthesised sound, fonts, CSS module) sits behind one dynamic import of `components/diwali/DiwaliShow.tsx`, so none of it is in the homepage bundle and none of it loads before hover or light. With `DIWALI_ENABLED = false`, `About.tsx` renders today's `SpinAvatar` exactly as now.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, CSS modules, Canvas 2D, Web Audio, YouTube IFrame API, `next/font/google`, `sharp` (already installed) for asset conversion, vitest.

**Spec:** `docs/superpowers/specs/2026-11-07-diwali-avatar-design.md`. Visual source of truth: `docs/superpowers/specs/2026-11-07-diwali-avatar/flow-prototype.html` (flow, sparks, fireworks, toran, diyas, sounds) and `finale-screens-prototype.html` (the finale; wins over the flow prototype for the finale). Port drawing code and numbers from these files rather than reinventing them.

## Global Constraints

- One flag: `export const DIWALI_ENABLED = true;` in `lib/diwali.ts`. It ships `true`. When `false`, the hero is byte-for-byte today's behaviour and no Diwali module, font or image is reachable from the homepage.
- Nothing heavy before interest: overlay code, fonts and images load on photo hover/focus or on light; the YouTube API and iframe load only on light.
- Video: id `QirCMADtks8`, host `https://www.youtube-nocookie.com`, `start=0`, `end=67`, no controls, not clickable, `playsinline`, iframe `referrerpolicy="strict-origin-when-cross-origin"`. If it errors or never starts there is no fallback beyond Skip (spec decision "leave it as is").
- Timing: fuse burn 1.4s, blackout fade 0.8s, flight 1.1s, centre hold **5s after arriving**, video stops at **1:07**.
- Copy, verbatim, no em-dashes: title `शुभ दीपावली`; blessing `माँ लक्ष्मी और श्री गणेश की कृपा से आपका घर सुख, समृद्धि और प्रकाश से भरा रहे।`; English `Wishing you and your family a very happy Diwali.`; signature `शाश्वत`; CTA `प्रसाद लीजिए`, hint `Take a laddoo before you go`; plate heading `प्रसाद ग्रहण कीजिए`, sub `Take a laddoo before you go`; after the bite `वाह!`, sub `Happy Diwali. Enjoy the rest of it.`; Skip button `Skip` + forward icon + `Esc` key hint; hero tooltip while enabled `Open to work · Click to light the chakri`; overlay dialog label `Diwali celebration`; idol alt `Lakshmi and Ganesh`.
- Repo rules: no `text-[Npx]`, no `transition-all`, no `font-serif`, icons only from `@phosphor-icons/react/ssr`; durations are tokens in `lib/motionVariants.ts` mirrored as `--duration-*` in `app/globals.css`; `scripts/verify-simplification.sh`, `npm run lint`, `npm test`, `npm run build` all pass.
- Fonts: Rozha One and Tiro Devanagari Hindi via `next/font/google`, subsets `devanagari` + `latin`, declared only inside `components/diwali/`.
- Overlay sits above the dock (z-index up to 56) and the command palette (`z-60`); use `z-index: 100` and up. It locks page scroll, is `role="dialog" aria-modal="true"`.
- Reduced motion (spec §7): no spin, spark jet, fireworks, petals, flicker, shine or pulse; flip becomes a crossfade; moves jump instead of glide; diyas lit from the start; the bite still happens without float or crumbs.
- No browser verification steps: Shashwat checks visuals himself.

## Review Focus

1. **Double light / clicks during the show:** a second click on the photo, or Enter held down, while lit or mid-show must not start a second show or reload the player. Pinned in Task 2 (`LIGHT` ignored outside `idle`).
2. **Skip before the video loads:** Skip or Esc pressed while YouTube is still loading must land on the finale and the late-arriving player must never start playing over it. Pinned in Task 2 (`shouldPlayVideo`) and used in Task 7.
3. **Phone rotation / window resize mid-show:** the chakri must stay centred (or in the corner) and the canvases must match the new size. Pinned in Task 2 (`chakriBox` for both phases at two sizes) and Task 7 (resize listener recomputes).
4. **`end=67` not firing** (tab in background, YouTube quirk): the show must still reach the finale at 1:07. Pinned in Task 2 (`videoReachedEnd`) and polled in Task 7.
5. **Global shortcuts firing under the overlay:** `components/KeyboardShortcuts.tsx` and `CommandPalette.tsx` listen on `window` keydown; while the overlay is open, a key like `g`, `/` or ⌘K must not navigate, open the palette or toggle the theme behind the show. Pinned in Task 7 Step 3 (capture-phase listener).
6. **Leaving the page mid-show** (dock link, back button): audio context closed, rAF loops stopped, player destroyed, scroll unlocked, no stray portal. Covered by Task 7's unmount checklist step (not unit-testable here).

**How "not in the bundle" is checked.** A lazily imported module always gets its own file in `.next/static/chunks`, so grepping that folder proves nothing. What matters is what the homepage loads up front: the `<script src="/_next/static/chunks/….js">` tags in the prerendered `.next/server/app/index.html`. Tasks 6 and 10 use this script (save it as `scripts/check-diwali-bundle.sh`, executable, created in Task 6):
```bash
#!/usr/bin/env bash
# Fails if the homepage's initial JS mentions the Diwali show's heavy parts.
set -euo pipefail
html=.next/server/app/index.html
hits=0
for c in $(grep -oE '/_next/static/chunks/[^"]+\.js' "$html" | sort -u); do
  f=".next${c#/_next}"
  if grep -qE 'QirCMADtks8|iframe_api|Rozha|laddoo-plate|lakshmi-ganesh' "$f"; then echo "heavy Diwali code in initial chunk: $c"; hits=1; fi
done
exit $hits
```
With the flag **on** this must pass (the show is lazy). With the flag **off** it must pass and, in addition, `grep -c "diwali" .next/server/app/index.html` must print `0` (no fuse markup in the HTML).

---

### Task 1: Flag, assets and repo wiring

**Files:**
- Create: `lib/diwali.ts`
- Create: `public/images/diwali/lakshmi-ganesh.webp`, `laddoo-plate.webp`, `laddoo.webp`, `laddoo-bitten.webp`
- Modify: `scripts/verify-simplification.sh` (append check C22)
- Modify: `CLAUDE.md` (Other conventions: one bullet)

**Interfaces:**
- Produces: `DIWALI_ENABLED: boolean` from `@/lib/diwali`; the four image URLs under `/images/diwali/`.

- [ ] **Step 1:** Create `lib/diwali.ts` exporting `export const DIWALI_ENABLED = true;` with a doc comment in the style of `CANDY_ENABLED` (what it switches, that `false` restores the fidget spinner, goggles and status ring, and that nothing else needs touching).
- [ ] **Step 2:** Convert the PNGs with sharp, keeping alpha:
  ```bash
  mkdir -p public/images/diwali && node -e '
  const sharp=require("sharp"), d=process.env.HOME+"/Downloads/";
  const jobs=[["Lakshmi and Ganesha Ivory Statues.png","lakshmi-ganesh",1200],["Golden Laddus on an Ornate Plate.png","laddoo-plate",1100],["Textured Orange Indian Laddu with Pistachio.png","laddoo",640],["Bite-Taken Saffron Pistachio Laddu.png","laddoo-bitten",640]];
  Promise.all(jobs.map(([src,out,w])=>sharp(d+src).resize({width:w}).webp({quality:80,alphaQuality:90}).toFile("public/images/diwali/"+out+".webp")));'
  ls -la public/images/diwali
  ```
  Expected: four files; `lakshmi-ganesh.webp` and `laddoo-plate.webp` under 300 KB, the two laddoos under 200 KB. Lower `quality` if not.
- [ ] **Step 3:** Append to `scripts/verify-simplification.sh` beside C18: `count C22 "Diwali flag defined once" 1 grep -rEoh "export const DIWALI_ENABLED = (true|false);" lib/diwali.ts`.
- [ ] **Step 4:** Add a CLAUDE.md bullet: "**Diwali avatar** is switched by `DIWALI_ENABLED` in `lib/diwali.ts` (spec `docs/superpowers/specs/2026-11-07-diwali-avatar-design.md`). On: the hero photo carries a fuse instead of the fidget spinner, goggles and status ring, and lighting it opens `components/diwali/DiwaliShow.tsx` (dynamic import). Off: the hero is exactly the fidget spinner. Flip it per season; do not delete the feature."
- [ ] **Step 5:** Run `bash scripts/verify-simplification.sh`. Expected: exit 0, C22 passes.
- [ ] **Step 6:** Commit: `git add lib/diwali.ts public/images/diwali scripts/verify-simplification.sh CLAUDE.md && git commit -m "Diwali: flag, assets, verify check"`.

### Task 2: Show state machine and geometry (pure)

**Files:**
- Create: `lib/diwali/show.ts`
- Test: `lib/diwali/show.test.ts`

**Interfaces:**
- Produces:
  - `export const VIDEO_ID = "QirCMADtks8"; export const VIDEO_END_SECONDS = 67;`
  - `export type Phase = "idle" | "lit" | "centre" | "corner" | "finale" | "plate" | "picked" | "returning";`
  - `export type ShowState = { phase: Phase; picked: number | null };` and `export const INITIAL: ShowState = { phase: "idle", picked: null };`
  - `export type ShowEvent = { type: "LIGHT" } | { type: "FUSE_BURNT" } | { type: "CENTRE_HOLD_DONE" } | { type: "VIDEO_ENDED" } | { type: "SKIP" } | { type: "ESCAPE" } | { type: "OPEN_PLATE" } | { type: "PICK"; index: number } | { type: "PICK_DONE" } | { type: "RETURNED" };`
  - `export function reduce(state: ShowState, event: ShowEvent): ShowState` (returns the **same object** for any event not valid in the current phase)
  - `export function shouldPlayVideo(phase: Phase): boolean` (true only for `centre`, `corner`)
  - `export function isOverlayOpen(phase: Phase): boolean` (false for `idle`, `lit`)
  - `export function videoReachedEnd(seconds: number): boolean`
  - `export function chakriBox(phase: "centre" | "corner", vw: number, vh: number): { x: number; y: number; size: number }`

Transitions: `idle+LIGHT→lit`; `lit+FUSE_BURNT→centre`; `centre+CENTRE_HOLD_DONE→corner`; `centre|corner + VIDEO_ENDED|SKIP|ESCAPE → finale`; `finale + OPEN_PLATE|ESCAPE → plate`; `plate + PICK(i) → picked` with `picked: i`; `picked + PICK_DONE → returning`; `returning + RETURNED → INITIAL`. Geometry: centre `size = 0.36 * min(vw, vh)`, centred; corner `size = max(80, 0.15 * min(vw, vh))`, `margin = max(28, 0.4 * size)`, `x = vw - size - margin`, `y = vh - size - margin`.

- [ ] **Step 1: Write the failing tests** in `lib/diwali/show.test.ts`:
  - `walks the happy path`: folding `LIGHT, FUSE_BURNT, CENTRE_HOLD_DONE, VIDEO_ENDED, OPEN_PLATE, {PICK,3}, PICK_DONE, RETURNED` from `INITIAL` visits `lit, centre, corner, finale, plate, picked (picked 3), returning, idle (picked null)`.
  - `ignores a second LIGHT`: `reduce(lit, {type:"LIGHT"})` and `reduce(centre, {type:"LIGHT"})` return the identical object (`toBe`).
  - `Skip and Esc go to the finale from centre and corner`: both events from both phases give `finale`.
  - `Esc in the finale opens the plate; clicks elsewhere cannot leave`: `reduce(finale, ESCAPE).phase === "plate"`; `reduce(finale, RETURNED)` and `reduce(finale, PICK)` return the same object.
  - `picks once`: `reduce(picked, {type:"PICK", index:1})` returns the same object and `picked` stays the first index.
  - `video plays only during the show`: `shouldPlayVideo` true for `centre`, `corner`; false for all other six phases.
  - `ends at 1:07`: `videoReachedEnd(66.9) === false`, `videoReachedEnd(67) === true`, `videoReachedEnd(80) === true`.
  - `chakri box`: `chakriBox("centre", 1280, 800)` → `{ size: 288, x: 496, y: 256 }`; `chakriBox("corner", 1280, 800)` → `{ size: 120, x: 1112, y: 632 }`; `chakriBox("corner", 390, 844)` → size `80`, margin `32`, `{ x: 278, y: 732 }`; `chakriBox("centre", 390, 844).size` → `140.4`.
- [ ] **Step 2:** Run `npx vitest run lib/diwali/show.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `lib/diwali/show.ts` with the exports above.
- [ ] **Step 4:** Run `npx vitest run lib/diwali/show.test.ts`. Expected: PASS.
- [ ] **Step 5:** Commit: `git add lib/diwali && git commit -m "Diwali: show state machine and chakri geometry"`.

### Task 3: Fireworks sizing and laddoo spots (pure)

**Files:**
- Create: `lib/diwali/fireworks.ts`, `lib/diwali/laddoos.ts`
- Test: `lib/diwali/fireworks.test.ts`, `lib/diwali/laddoos.test.ts`

**Interfaces:**
- Produces:
  - `export type BurstTier = "huge" | "medium" | "small";`
  - `export function burstTier(r: number): BurstTier` (`r < 0.22` huge, `r < 0.65` medium, else small)
  - `export const TIER_SIZE: Record<BurstTier, number> = { huge: 1, medium: 0.55, small: 0.28 };`
  - `export function emberCount(size: number, jitter: number): number` = `Math.round(50 + 190 * size * (0.8 + jitter * 0.4))`
  - `export type LaddooSpot = { x: number; y: number; r: number };` (centre x and radius r in percent of the plate image's **width**, centre y in percent of its **height**)
  - `export const PLATE_ASPECT = 1536 / 1024;`
  - `export function spotBox(s: LaddooSpot): { left: number; top: number; width: number; height: number }` in percent of the plate box: `left = x - r`, `width = 2r`, `height = 2r * PLATE_ASPECT`, `top = y - r * PLATE_ASPECT`. Plate.tsx positions buttons with this, never with raw `r` as a height.
  - `export const LADDOO_SPOTS: readonly LaddooSpot[]` (nine spots, front-most last so DOM order matches stacking)

- [ ] **Step 1: Write the failing tests.**
  - fireworks: `burstTier(0)` huge, `burstTier(0.219)` huge, `burstTier(0.22)` medium, `burstTier(0.649)` medium, `burstTier(0.65)` small, `burstTier(0.999)` small; `emberCount(1, 0.5) === 240`, `emberCount(0.28, 0) === 93`; over 10 000 evenly spaced `r` values the share of huge is 0.22 ± 0.01.
  - laddoos: `LADDOO_SPOTS.length === 9`; every spot has `x - r >= 0`, `x + r <= 100`, `y` in `(0, 100)`, `r > 3`; `spotBox({x:50,y:50,r:10})` → `{ left: 40, width: 20, height: 30, top: 35 }`; every spot's `spotBox` has `top >= 0` and `top + height <= 100`.
- [ ] **Step 2:** Run `npx vitest run lib/diwali`. Expected: the two new files FAIL.
- [ ] **Step 3:** Implement both modules. Starting spots, measured by eye from the 1536×1024 plate (refine against `public/images/diwali/laddoo-plate.webp` so each circle sits on its laddoo): top `{50.8,20.5,10.7}`, upper-left `{36.1,40,8}`, upper-right `{63.5,43,8.5}`, far-left `{25.4,51.8,6}`, far-right `{75.5,62.5,7.2}`, middle `{47,50.8,10.6}`, front-left `{29.3,68.4,9.9}`, front-right `{65.8,72.8,10.7}`, front-centre `{44.9,72.8,10.9}`.
- [ ] **Step 4:** Run `npx vitest run lib/diwali`. Expected: PASS.
- [ ] **Step 5:** Commit: `git add lib/diwali && git commit -m "Diwali: burst sizing and laddoo spots"`.

### Task 4: Motion tokens

**Files:**
- Modify: `lib/motionVariants.ts` (inside `duration`), `app/globals.css` (`:root` token block beside `--duration-goggles-*`)
- Test: `lib/diwali/tokens.test.ts`

**Interfaces:**
- Produces, in `duration` (seconds), each with a one-line comment: `diwaliFuse: 1.4, diwaliBlackout: 0.8, diwaliFlight: 1.1, diwaliFlip: 0.9, diwaliCentreHold: 5, diwaliCorner: 1.1, diwaliToranDrop: 1.4, diwaliRise: 0.9, diwaliIdols: 1.4, diwaliPlateRise: 0.6, diwaliFloat: 0.7, diwaliBiteAt: 0.9, diwaliPicked: 3, diwaliReturn: 1.15, diwaliSquash: 0.18, diwaliSway: 4, diwaliFlicker: 1.1, diwaliGlow: 4, diwaliShine: 3.2, diwaliPulse: 2.4`. Per-particle random lifetimes (sparks, embers, petals, crumbs) are physics constants and stay in their modules. CSS mirrors are `--duration-diwali-<kebab>` in ms (`--duration-diwali-centre-hold: 5000ms`, …). Also `--ease-diwali-flight: cubic-bezier(0.65, 0, 0.35, 1)` and `--ease-diwali-drop: cubic-bezier(0.3, 1.4, 0.5, 1)`, mirrored as `ease.diwaliFlight` / `ease.diwaliDrop` arrays with a comment that they are scene curves, not UI curves.

- [ ] **Step 1: Write the failing test** `every diwali duration is mirrored in globals.css`: read `app/globals.css`; for each key of `duration` starting with `diwali`, convert to kebab (`diwaliCentreHold` → `diwali-centre-hold`) and expect the CSS to contain `--duration-<kebab>: <Math.round(value*1000)>ms;`. Expect at least 20 such keys.
- [ ] **Step 2:** Run `npx vitest run lib/diwali/tokens.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Add the tokens to both files.
- [ ] **Step 4:** Run `npx vitest run lib/diwali/tokens.test.ts && bash scripts/verify-simplification.sh`. Expected: PASS, exit 0.
- [ ] **Step 5:** Commit: "Diwali: motion tokens".

### Task 5: Artwork and sound modules

**Files:**
- Create: `components/diwali/art/Chakri.tsx`, `Toran.tsx`, `Diya.tsx`, `Rangoli.tsx`, `CornerMotif.tsx`, `LotusDivider.tsx`, `Matchstick.tsx`
- Create: `components/diwali/sound.ts`
- Create: `components/diwali/diwali.module.css` (styles for everything in `components/diwali/`)

**Interfaces:**
- Produces (all server-safe, no hooks, pure SVG; ids from a `idPrefix: string` prop so several instances on one page never share gradient ids):
  - `Chakri({ idPrefix, className })`: the prototype's `chakriSVG()` (striped rim, gold band, purple disc, dotted ring, 14-point sun, three ripples, gold centre), viewBox `0 0 200 200`.
  - `Toran({ width, idPrefix })`: the screens prototype's `toran(W)` (no visible top string, `translate(0 -18)`, mango leaves, marigold swags, joint strands with bells), `viewBox="0 0 ${width} 140"`; swaying `<g>` carries a module class.
  - `Diya({ idPrefix, lit, flickerOffset })`: the screens-v5 diya (lighter clay, lit rim, dark pool, stronger glow). `lit` false hides the flame and glow.
  - `Rangoli()`: the earthy palette from screens v5.
  - `CornerMotif({ corner: "tl" | "tr" | "bl" | "br" })`, `LotusDivider()`, `Matchstick()`.
  - `sound.ts`: `export function createDiwaliSound(): DiwaliSound` where `type DiwaliSound = { unlock(): void; strike(): void; fuse(seconds: number): void; whistle(pan: number): void; boom(size: number, pan: number, crackle: boolean): void; pop(): void; crunch(): void; close(): void }`. Port the prototype's synthesis (master gain 0.55 → compressor; 3s noise buffer; distant bursts quieter, duller and delayed by `(1 - size) * 0.25`s). Every method is a no-op before `unlock()` or after `close()`; `pan` is -0.8..0.8.

- [ ] **Step 1:** Port each SVG from the prototypes into its component; keep the numbers. No `font-serif`, no arbitrary text sizes.
- [ ] **Step 2:** Port the sound module from `flow-prototype.html` (`sfx`), renaming `chomp` → `pop`, adding `close()` (closes the AudioContext).
- [ ] **Step 3:** Create `diwali.module.css` with the keyframes and classes the art needs now (sway, flicker, glow), using `var(--duration-diwali-*)` / `var(--ease-diwali-*)` where a token exists and wrapping every animation in `@media (prefers-reduced-motion: no-preference)`.
- [ ] **Step 4:** Run `npx tsc --noEmit && npm run lint`. Expected: no errors.
- [ ] **Step 5:** Commit: "Diwali: artwork and synthesised sound".

### Task 6: Hero fuse (DiwaliAvatar) and the switch in About

**Files:**
- Create: `components/diwali/DiwaliAvatar.tsx` (client)
- Modify: `components/About.tsx:66-108` (the `Tooltip` around the photo). `About.tsx` is a **server** component; `DiwaliAvatar` is a client component it renders.
- Create: `scripts/check-diwali-bundle.sh`

**Interfaces:**
- Consumes: `DIWALI_ENABLED`, `reduce`/`INITIAL`/`isOverlayOpen` (Task 2), `Matchstick` (Task 5), `createDiwaliSound` (Task 5), `duration.diwaliFuse`.
- Produces: `export default function DiwaliAvatar(props: Omit<ComponentProps<"button">, "children">)`: a `button` (forwarding `ref` the same way `SpinAvatar.setButton` does, so the Radix tooltip trigger works) containing the greyscale photo (`/images/avatar.png`, as in `AvatarHover`, no goggles), the fuse ring and tail SVG (prototype `.fuse`), the amber live dot, and on hover devices a `Matchstick` that follows the pointer while `cursor: none`. It owns the `ShowState` via `useReducer(reduce, INITIAL)` and renders `<DiwaliShow>` (Task 7) once the phase leaves `idle`.
  - Warm-up: `const loadShow = () => import("@/components/diwali/DiwaliShow")`, called on `pointerenter` and `focus`; the component itself is `next/dynamic(loadShow, { ssr: false })`.
  - Light (click, Enter, Space): dispatch `LIGHT`, create and `unlock()` the sound, `strike()`, `fuse(1.4)`, animate the spark up the tail and round the ring for `duration.diwaliFuse` (canvas around the photo as in the prototype; under reduced motion the ring simply darkens), then dispatch `FUSE_BURNT`. The YouTube API load is kicked off from this same click by calling `primeYouTube()` (Task 7's `youtube.ts`; Task 6 may create that file with just this function and Task 7 extends it). `DiwaliAvatar` owns the single `DiwaliSound` (in a ref) and passes it to `DiwaliShow`; it calls `sound.close()` on `RETURNED` and on unmount.
  - On `RETURNED`, restore the fuse, and move focus back to this button.

- [ ] **Step 1:** In `About.tsx`, wrap the existing `SpinAvatar` block in `DIWALI_ENABLED ? <DiwaliAvatar className=…same classes… /> : <SpinAvatar …unchanged…>`, and the tooltip's spin hint in `DIWALI_ENABLED ? "Click to light the chakri" : <existing Press F markup>`. The SpinAvatar branch must be untouched character for character.
- [ ] **Step 2:** Implement `DiwaliAvatar.tsx` as specified; styles in `diwali.module.css`.
- [ ] **Step 3:** Run `npx tsc --noEmit && npm run lint && bash scripts/verify-simplification.sh`. Expected: clean, exit 0.
- [ ] **Step 4:** Create `scripts/check-diwali-bundle.sh` (Review Focus section). `npm run build && bash scripts/check-diwali-bundle.sh` → exit 0. Flip `DIWALI_ENABLED` to `false`, rebuild, run it again → exit 0, and `grep -c "diwali" .next/server/app/index.html` → `0`. Flip back to `true`. If the flag-off grep is not 0, load `DiwaliAvatar` in `About.tsx` with `next/dynamic` inside the `DIWALI_ENABLED` branch instead of a static import, and re-check.
- [ ] **Step 5:** Commit: "Diwali: fuse on the hero photo, switched by DIWALI_ENABLED".

### Task 7: The show overlay (blackout, chakri, video, toran, Skip)

**Files:**
- Create: `components/diwali/DiwaliShow.tsx` (default export, client), `components/diwali/youtube.ts`, `components/diwali/SparkCanvas.tsx`

**Interfaces:**
- Consumes: Task 2 (`reduce` events, `shouldPlayVideo`, `videoReachedEnd`, `chakriBox`, `VIDEO_ID`, `VIDEO_END_SECONDS`), Task 5 art + sound, Task 4 tokens.
- Produces:
  - `youtube.ts`: `export function primeYouTube(): Promise<void>` (inject `https://www.youtube.com/iframe_api` once, chain any existing `window.onYouTubeIframeAPIReady`, resolve when `window.YT.Player` exists; the same promise on every call) and `export function createPlayer(host: HTMLElement, handlers: { onPlaying(): void; onEnded(): void; onError(code: number): void }): { play(): void; pause(): void; currentTime(): number; destroy(): void }`. The iframe is built by hand (`youtube-nocookie.com/embed/${VIDEO_ID}?enablejsapi=1&autoplay=1&start=0&end=${VIDEO_END_SECONDS}&controls=0&rel=0&playsinline=1&disablekb=1&origin=…`, `allow="autoplay; encrypted-media"`, `referrerpolicy` as in Global Constraints) and then handed to `new YT.Player(iframe, …)`.
  - `DiwaliShow({ state, dispatch, photoRect, sound }: { state: ShowState; dispatch: (e: ShowEvent) => void; photoRect: () => DOMRect; sound: DiwaliSound })`: portal to `document.body`.
  - `SparkCanvas({ target })`: full-screen canvas drawing the rim jet and rim glow for the element in `target` (prototype `loop`, jet from one rim point, sparks thrown backward along the tangent; count scales with chakri size).

- [ ] **Step 1:** `youtube.ts` as above. `DiwaliShow` awaits `primeYouTube()` (already started by the light click) before `createPlayer`; if the component has unmounted by then, it does nothing. `play()` is called only when `shouldPlayVideo(state.phase)`; `onReady` checks the **current** phase (via a ref), never the phase at creation.
- [ ] **Step 2:** `DiwaliShow`: on mount (phase `centre`) fade in the blackout, drop the toran, create the flyer at `photoRect()`, flip to `Chakri` (crossfade under reduced motion), move to `chakriBox("centre", …)` over `duration.diwaliFlight`, start a `setTimeout` for `CENTRE_HOLD_DONE` at flight + `duration.diwaliCentreHold`. Phase `corner` moves to `chakriBox("corner", …)`. A `resize` listener re-applies the current box and resizes canvases. Poll `videoReachedEnd(player.currentTime())` every 250 ms; dispatch `VIDEO_ENDED` once.
- [ ] **Step 3:** Skip button bottom-left (prototype v9 styling: marigold pill, Phosphor `FastForward` icon from `@phosphor-icons/react/ssr`, `<kbd>Esc</kbd>`, three pulses after a 1s fade-in, ≥ 44px tall), `onClick → SKIP`. One `keydown` listener on `window` in the **capture** phase while `isOverlayOpen(phase)`: `Escape` dispatches `ESCAPE`; every key except `Tab`, `Shift`, `Enter` and `Space` gets `stopImmediatePropagation()` so `KeyboardShortcuts.tsx` and `CommandPalette.tsx` (bubble-phase `window` listeners) never see it. `Enter`/`Space` are let through only to the focused button. Focus Skip when it appears.
- [ ] **Step 4:** Dialog semantics and scroll lock: `role="dialog" aria-modal="true" aria-label="Diwali celebration"`; `document.documentElement.style.overflow = "hidden"` while `isOverlayOpen`, restored on close and on unmount.
- [ ] **Step 5:** Phase `returning`: stop the spark loop, lift the toran, fade the blackout, flip the chakri back and move the flyer to `photoRect()` over `duration.diwaliReturn`, then dispatch `RETURNED`.
- [ ] **Step 6: Unmount checklist** (Review Focus 5): the effect cleanup cancels every rAF and timer, calls `player.destroy()`, `sound.close()`, restores `overflow`, removes `resize`/`keydown` listeners. Read the cleanup once against this list.
- [ ] **Step 7:** Run `npx tsc --noEmit && npm run lint && npm test`. Expected: clean, all pass.
- [ ] **Step 8:** Commit: "Diwali: the chakri show with the Diwali Song".

### Task 8: The finale

**Files:**
- Create: `components/diwali/Finale.tsx`, `components/diwali/FireworksCanvas.tsx`, `components/diwali/fonts.ts`
- Modify: `components/diwali/DiwaliShow.tsx` (render `Finale` from phase `finale` through `picked`), `components/diwali/diwali.module.css`

**Interfaces:**
- Consumes: art (Task 5), `burstTier`/`TIER_SIZE`/`emberCount` (Task 3), `sound.whistle/boom` (Task 5), tokens.
- Produces:
  - `fonts.ts`: `export const rozha = Rozha_One({ weight: "400", subsets: ["devanagari", "latin"], variable: "--font-diwali-display" })` and `export const tiro = Tiro_Devanagari_Hindi({ weight: "400", style: ["normal", "italic"], subsets: ["devanagari", "latin"], variable: "--font-diwali-text" })`.
  - `FireworksCanvas({ running, sound })`: the flow prototype's `fwLoop` (trails by `destination-out`, rockets, tiered bursts with ring/peony/two-tone, 45% whistle chance, boom per burst); stops launching when `running` is false and clears after the last ember. Renders nothing under reduced motion.
  - `Finale({ onOpenPlate, plating })`: the screens prototype v5 laid out with container query units (`container-type: size` on the finale root): wash, petals (28 desktop / 16 under 600px), gold frame with four `CornerMotif`s, idols (`/images/diwali/lakshmi-ganesh.webp`, width `min(74cqw, 30cqh * 1.5, 500px)`, breathing glow), title, `LotusDivider`, blessing, English line, signature, the prasad CTA button (v5: gold gradient, maroon text, laddoo dot, arrow, shine, pulsing ring, ≥ 52px), hint, `Rangoli`, 7 `Diya`s (5 under 600px) lit one after another. No mandir arch. When `plating`, text dims to 0.15 with a 2px blur; the idols only dim to 0.5 and never blur.

- [ ] **Step 1:** Fonts and `FireworksCanvas`.
- [ ] **Step 2:** `Finale` with the entrance stagger (idols, title, divider, blessing, CTA, at the prototype's `--t` offsets via the `diwaliRise`/`diwaliIdols` tokens). CTA `onClick → onOpenPlate`, receives focus when it appears.
- [ ] **Step 3:** In `DiwaliShow`, on `finale`: pause and fade the video, fade the chakri, mount `Finale` and run fireworks; `OPEN_PLATE` from the CTA.
- [ ] **Step 4:** Run `npx tsc --noEmit && npm run lint && bash scripts/verify-simplification.sh`. Expected: clean, exit 0.
- [ ] **Step 5:** Commit: "Diwali: the शुभ दीपावली finale".

### Task 9: The laddoo plate and the bite

**Files:**
- Create: `components/diwali/Plate.tsx`
- Modify: `components/diwali/DiwaliShow.tsx`, `components/diwali/diwali.module.css`

**Interfaces:**
- Consumes: `LADDOO_SPOTS`, `spotBox` (Task 3), `sound.pop/crunch`, tokens `diwaliPlateRise`, `diwaliFloat`, `diwaliBiteAt`, `diwaliPicked`.
- Produces: `Plate({ phase, onPick, onDone }: { phase: "plate" | "picked"; onPick(index: number): void; onDone(): void })`.
  - Heading `प्रसाद ग्रहण कीजिए` / sub; the plate image (`/images/diwali/laddoo-plate.webp`) rising over `diwaliPlateRise`; one round `<button aria-label="Laddoo N">` per spot, positioned in percent, gold ring on hover/focus; focus the first on open; preload `laddoo.webp` and `laddoo-bitten.webp` (`new Image()`) when the plate mounts.
  - On pick: `onPick(i)`, `sound.pop()`, place `laddoo.webp` exactly over that spot's box, float it to 38% of the viewport height while scaling to about 2.2× over `diwaliFloat`; plate fades to 0.33; at `diwaliBiteAt` swap the `src` to `laddoo-bitten.webp` with a squash over `duration.diwaliSquash` / `--duration-diwali-squash`, `sound.crunch()`, 14 crumbs from the bite side (right edge, 40–60% height); then `वाह!` and its sub; `onDone()` at `diwaliPicked`.
  - Reduced motion: no float, no squash, no crumbs; the laddoo appears centred and the swap still happens.

- [ ] **Step 1:** Implement `Plate`.
- [ ] **Step 2:** Wire into `DiwaliShow`: `OPEN_PLATE` mounts it; `onPick → dispatch PICK`; `onDone → dispatch PICK_DONE`, which runs Task 7's return.
- [ ] **Step 3:** Run `npx tsc --noEmit && npm run lint && npm test && bash scripts/verify-simplification.sh`. Expected: clean, pass, exit 0.
- [ ] **Step 4:** Commit: "Diwali: prasad plate and the bite".

### Task 10: Whole-feature gate

**Files:** none new.

- [ ] **Step 1:** Run `npm test && npm run lint && bash scripts/verify-simplification.sh && npm run build`. Expected: all pass.
- [ ] **Step 2:** `bash scripts/check-diwali-bundle.sh` → exit 0 (flag on). Then with `DIWALI_ENABLED = false`: `npm run build && bash scripts/check-diwali-bundle.sh && grep -c "diwali" .next/server/app/index.html` → exit 0 and `0`; `git diff master -- components/About.tsx` shows only the flag branches. Restore `true` and rebuild.
- [ ] **Step 3:** Grep the new files for em-dashes in strings: `grep -rn "—" components/diwali lib/diwali` → no hits in user-facing strings.
- [ ] **Step 4:** Commit any fixes: "Diwali: final checks".
