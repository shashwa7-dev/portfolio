# Starter Pack Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the OFFCOD8 starter pack card, hung on a physics lanyard, at the top right of the homepage on wide screens and above the footer on phones and tablets, without touching LCP, CLS or INP.

**Architecture:** Pure, tested physics (`lib/starter-pack/`) for the lanyard and the bubbles, a single config file for everything on the card, and a client-only component tree (`components/starter-pack/`) that is dynamically imported after the page is idle. One rAF loop drives both simulations and writes transforms through refs, never React state.

**Tech Stack:** Next 16 App Router, React 19, TypeScript, CSS Modules, `next/font/google`, vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-starter-pack-design.md`. Visual reference for every value not listed here: `.superpowers/brainstorm/63841-1794556133/content/portfolio-pack-v22.html` (git-ignored; read, do not ship).

## Global Constraints

- No em-dashes in any user-facing string, comment copy that ships, or `data/agent-memory.md`.
- No literal easings or UI durations in components; CSS transitions use `var(--duration-fast)` / `var(--ease-out)` etc. Physics constants live in `lib/starter-pack/*`.
- No `text-[Npx]` Tailwind classes; the card's type is sized in `StarterPack.module.css`.
- Icons: none. No new npm dependencies.
- Fonts: `Sedgwick_Ave_Display` (400) and `Barlow_Condensed` (800, 900; normal and italic) via `next/font/google`, `preload: false`, `display: "swap"`, only imported inside the dynamic chunk.
- Nothing from the card in the homepage's initial JS or CSS.
- Sound only on a press; automated tests never play audio; never run a browser with sound during verification.
- `npm test`, `npx tsc --noEmit`, `npm run lint` (0 errors) and `bash scripts/verify-simplification.sh` pass at the end of every task.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A touch that starts on the page (not the card) on a phone must scroll the page normally; only touches starting on the card drag it.
2. A window resize or phone rotation while the card hangs must move the anchor and keep the card hanging from the strap, not leave it stranded.
3. A tab hidden for minutes then shown must not make the card or bubbles jump or explode.
4. Client navigation away from the homepage and back must leave exactly one loop, one set of listeners and one AudioContext.
5. Grabbing the scaled card (60% on desktop, about 68% on phones) must keep the grabbed point under the finger.

Tests pinning these: 3 in Task 1 (`clamps catch-up steps`) and Task 2; 1, 2, 4, 5 in Task 6's manual checklist plus `toLocal` unit test in Task 1.

## File Structure

| File | Responsibility |
|---|---|
| `lib/starter-pack/lanyard.ts` (+ `.test.ts`) | Verlet strap and rigid card arm; pose, rest detection, pointer mapping |
| `lib/starter-pack/bubbles.ts` (+ `.test.ts`) | Ball physics in the card's frame, poke, rest detection |
| `lib/starter-pack/loop.ts` (+ `.test.ts`) | Fixed-timestep accumulator with a catch-up cap |
| `lib/starter-pack/config.ts` (+ `.test.ts`) | Every word, link, asset and size on the card |
| `lib/starter-pack/bloop.ts` (+ `.test.ts`) | `bloopFrequency(r)`, pure |
| `components/starter-pack/bloopSound.ts` | WebAudio voice, spinSound pattern |
| `components/starter-pack/fonts.ts` | The two `next/font` faces as CSS variables |
| `components/starter-pack/StarterPack.module.css` | All card styles and both themes |
| `components/starter-pack/Card.tsx`, `Pod.tsx`, `BubblePod.tsx`, `Ticket.tsx`, `Lanyard.tsx` | Static markup with refs |
| `components/starter-pack/useStarterPackSim.ts` | rAF loop, observers, pointer, reduced motion, sleep, cleanup |
| `components/starter-pack/StarterPack.tsx` | Client root: theme, date, wiring |
| `components/starter-pack/StarterPackMount.tsx` | `"use client"`, idle-gated `next/dynamic` |
| `public/starter-pack/*` | mascot WebP, logo PNGs (128px), pod SVGs, `qr.svg` |
| `app/page.tsx` | Two mounts: `hang` and `footer` |
| `scripts/check-starter-pack-bundle.sh` | Fails if card code or CSS is in the homepage's initial chunks |
| `CLAUDE.md`, `data/agent-memory.md` | Convention entry; one line for Truffy |

Placement decision (deviation from the spec's "in the footer", recorded): the global `Footer` lives in `app/layout.tsx` and cannot know the route on the server, so the phone card is mounted from `app/page.tsx` in a slot directly above the footer. That keeps it homepage only and lets the server reserve its height (no CLS). The config file lives in `lib/` (not `components/`) because vitest only collects `lib/**/*.test.ts`.

---

### Task 1: Lanyard physics and fixed-step loop

**Files:**
- Create: `lib/starter-pack/lanyard.ts`, `lib/starter-pack/lanyard.test.ts`, `lib/starter-pack/loop.ts`, `lib/starter-pack/loop.test.ts`

**Interfaces:**
- Produces:
  - `type Vec = { x: number; y: number }`
  - `type Particle = Vec & { px: number; py: number; invMass: number }`
  - `type LanyardParams = { segments: number; segLen: number; armLen: number; armInvMass: number; gravity: number; damping: number; iterations: number }`
  - `const LANYARD: LanyardParams = { segments: 11, segLen: 22, armLen: 317, armInvMass: 1/8, gravity: 2000, damping: 0.996, iterations: 24 }`
  - `type LanyardState = { anchor: Vec; points: Particle[]; arm: Particle; acc: Vec }` (`points[0]` is pinned to `anchor`; `points[segments]` is the clip; `acc` is the arm's smoothed acceleration, px/s²)
  - `createLanyard(anchor: Vec, swingX?: number, p?: LanyardParams): LanyardState` (strap straight down, arm offset by `swingX`, default 110)
  - `setAnchor(s: LanyardState, anchor: Vec): void`
  - `stepLanyard(s: LanyardState, dt: number, drag: Vec | null, p?: LanyardParams): void` (`drag` pins the arm end)
  - `cardPose(s: LanyardState): { clip: Vec; angle: number }` with `angle = Math.atan2(-(arm.x - clip.x), arm.y - clip.y)` (CSS clockwise radians)
  - `lanyardAtRest(s: LanyardState, eps?: number): boolean` (every particle moved less than `eps`, default 0.02 px, in the last step)
  - `toLocal(client: Vec, rect: { left: number; top: number }, scale: number): Vec` = `((client.x - rect.left) / scale, (client.y - rect.top) / scale)`
  - `const STEP = 1 / 120`, `const MAX_STEPS = 6`
  - `advance(acc: number, elapsedMs: number): { steps: number; acc: number }` in `loop.ts`: adds `min(elapsedMs/1000, MAX_STEPS*STEP)` to `acc`, returns whole steps (at most `MAX_STEPS`) and the remainder.

- [ ] **Step 1: Write failing tests** in `lanyard.test.ts`:
  - `settles hanging straight`: `createLanyard({x:200,y:-40})`, 1200 steps of `STEP` with no drag; expect `Math.abs(cardPose(s).angle) < 0.01`, `Math.hypot(arm-clip)` within 0.5 of 317, clip y within 1 of `-40 + 11*22`, `lanyardAtRest(s)` true.
  - `angle sign`: build a state with the arm right of the clip; expect `cardPose(s).angle < 0`.
  - `drag pins the arm`: 60 steps with `drag={x:400,y:300}`; expect arm at exactly (400,300) and strap segment lengths within 1 px of 22.
  - `anchor follows setAnchor`: `setAnchor(s,{x:500,y:-40})`, 1200 steps; expect clip x within 1 of 500.
  - `toLocal undoes scale`: `toLocal({x:160,y:130},{left:100,top:100},0.6)` equals `{x:100,y:50}`.
  In `loop.test.ts`: `clamps catch-up steps`: `advance(0, 60000)` returns `steps === 6`; `advance(0, 1000/120)` returns `steps === 1`.
- [ ] **Step 2: Run** `npx vitest run lib/starter-pack` and expect FAIL (modules missing).
- [ ] **Step 3: Implement** both files. Verlet integrate (skip `invMass === 0`), then `iterations` passes of distance constraints weighted by `invMass` (strap segments, then clip to arm), re-pinning `points[0]` to `anchor` and the arm to `drag` each pass. Track arm velocity between steps; `acc` is the per-step acceleration clamped to magnitude 6000 and smoothed `acc = acc*0.85 + a*0.15`.
- [ ] **Step 4: Run** `npx vitest run lib/starter-pack` and expect PASS.
- [ ] **Step 5: Commit** `Starter pack: lanyard physics and fixed-step loop`.

### Task 2: Bubble physics

**Files:**
- Create: `lib/starter-pack/bubbles.ts`, `lib/starter-pack/bubbles.test.ts`

**Interfaces:**
- Consumes: `Vec` from Task 1.
- Produces:
  - `type Ball = { id: string; r: number; m: number; x: number; y: number; vx: number; vy: number; angle: number; spin: number; squash: number }` (`m = r*r`)
  - `type Box = { w: number; h: number }` (inner box, origin top left)
  - `const BUBBLES = { gravity: 1500, wallRestitution: 0.5, ballRestitution: 0.6, rollCoupling: 0.04, airDrag: 0.9992, spinDrag: 0.9996, restSpeed: 25 }`
  - `createBalls(defs: { id: string; r: number }[], box: Box): Ball[]` (spread across the top, staggered heights, small sideways velocities)
  - `frameGravity(angle: number, acc: Vec, g?: number): Vec` = world `(-acc.x*k, g - acc.y*k)` with `k = g/2000`, rotated by `-angle`: `{ x: fx*cos + fy*sin, y: -fx*sin + fy*cos }`
  - `stepBalls(balls: Ball[], box: Box, dt: number, gravity: Vec): void` (integrate, walls, rolling on the floor, pairwise collisions with positional correction weighted by mass, squash decays by `0.86` per step)
  - `poke(ball: Ball, rand?: () => number): void` (`vy = -(380 + rand()*160) * k / 30 * 1.4`, `vx += (rand()-0.5) * 260 * k / 30`, `k = 900/sqrt(m)`, `spin += (rand()-0.5)*14`, `squash = 1`)
  - `ballsAtRest(balls: Ball[], eps?: number): boolean` (speed under `eps`, default 2 px/s, and on the floor or resting on another ball)

- [ ] **Step 1: Write failing tests**:
  - `upright frame is plain gravity`: `frameGravity(0,{x:0,y:0})` equals `{x:0,y:1500}`.
  - `sideways frame`: `frameGravity(Math.PI/2,{x:0,y:0})` has `x` within 1e-9 of 1500 and `y` within 1e-9 of 0.
  - `stays in the box and never overlaps`: radii `[30,25,15,14,15,14,15,14]`, box `{w:208,h:136}`, 12 s of `STEP` with `poke(balls[i % 8])` every 480 steps (seeded `rand`); after the first 600 steps every ball satisfies `r - 1 <= x <= w - r + 1` and same for y, and minimum pairwise gap over the run is greater than -0.5.
  - `settles on the floor`: one ball r=15 dropped in `{w:100,h:100}`; after 2400 steps `y` within 0.5 of 85 and `ballsAtRest` true.
  - `light ball moves more`: r=10 and r=30 colliding head on at equal speed; after the collision the small ball's speed change is greater than the large one's.
  - `rolls without slipping`: ball on the floor with `vx=200`; after 600 steps `Math.abs(spin*r - vx) < 5`.
- [ ] **Step 2: Run** `npx vitest run lib/starter-pack/bubbles.test.ts`; expect FAIL.
- [ ] **Step 3: Implement** `bubbles.ts`.
- [ ] **Step 4: Run** the same; expect PASS.
- [ ] **Step 5: Commit** `Starter pack: bubble physics`.

### Task 3: Config, assets and bloop pitch

**Files:**
- Create: `lib/starter-pack/config.ts`, `lib/starter-pack/config.test.ts`, `lib/starter-pack/bloop.ts`, `lib/starter-pack/bloop.test.ts`
- Create: `public/starter-pack/mascot.webp`, `public/starter-pack/logos/{swoopy.svg,sloosh.png,shopos.png,coinbase.png,dehidden.png,polygon.png,santul.png,playai.png}`, `public/starter-pack/pods/{builds.svg,coffee.svg,music.svg,gym.svg}`, `public/starter-pack/qr.svg`

**Interfaces:**
- Produces:
  - `type ThemeId = "card-stock" | "orange"`
  - `type BubbleDef = { id: string; name: string; src: string; r: number; bg: string; fit: "cover" | "contain" }`
  - `type PodDef = { id: string; label: string; art: string }`
  - `type StarterPackConfig = { title: string; subtitle: string; greeting: string; badge: string; stamp: string; sideLabel: string; shippedLabel: string; warning: { struck: string; rest: string; line2: string }; mascot: { src: string; width: number; height: number; alt: string }; bubbles: BubbleDef[]; pods: PodDef[]; ticket: { url: string; qr: string; tag: string; location: string }; themes: ThemeId[] }`
  - `const starterPack: StarterPackConfig` with: title `"OFFCOD8"`, subtitle `"STARTER PACK"`, greeting `"HI :)"`, badge `"OPEN TO WORK"`, stamp `"BLR"`, sideLabel `"ESSENTIALS"`, shippedLabel `"SHIPPED"`, warning `{ struck: "FR", rest: "AGILE!!!", line2: "SHIPS IN SPRINTS" }`, bubbles in order Swoopy r30 (`#ffffff`, contain), Sloosh r25 (`#ffd84a`), ShopOS r15 (`#ffffff`), Coinbase r14 (`#0052ff`), DeHidden r15 (`#b0224f`), Polygon r14 (`#7b3fe4`), Santul r15 (`#111410`), Play AI r14 (`#000000`); pods Builds/Coffee/Music/Gym; ticket url `https://www.youtube.com/watch?v=YlbvZ542Ijo&list=RDYlbvZ542Ijo&start_radio=1`, tag `"SCAN ME"`, location `"BLR"`; themes `["card-stock","orange"]`.
  - `formatTicketDate(d: Date): string` returns `"DD MM YY"`.
  - `bloopFrequency(r: number): number` = `240 + 4200 / r`.

- [ ] **Step 1: Copy and convert assets** from `.superpowers/brainstorm/63841-1794556133/content/`: `mascot3d.png` to `mascot.webp` at 260 px wide (sips or Pillow, quality 82); `ball-*.png` to `logos/*.png` at 128x128; `swoopy.svg` from `public/swoopy/icons/swoopy.svg`; `tablet2/cup2/headphones2/dumbbell2.svg` to `pods/builds/coffee/music/gym.svg`; `qr.svg`. Expected: `du -sh public/starter-pack` under 200K.
- [ ] **Step 2: Write failing tests**: `ticket url is exact` (string equality with the url above); `every asset exists` (`fs.existsSync("public" + src)` for mascot, every bubble, pod and the QR); `bubble ids are unique`; `no em-dash anywhere` (`JSON.stringify(starterPack)` has no `—`); `formatTicketDate(new Date(2026,10,13))` is `"13 11 26"`; `bloopFrequency(30)` is 380 and `bloopFrequency(14) > bloopFrequency(30)`.
- [ ] **Step 3: Run** `npx vitest run lib/starter-pack`; expect FAIL. **Step 4: Implement**; expect PASS.
- [ ] **Step 5: Owner check (blocking before merge, not before commit):** ask Shashwat to scan `public/starter-pack/qr.svg` on screen with a phone and confirm it opens the video.
- [ ] **Step 6: Commit** `Starter pack: config and assets`.

### Task 4: Static card markup, fonts and styles

**Files:**
- Create: `components/starter-pack/fonts.ts`, `StarterPack.module.css`, `Card.tsx`, `Pod.tsx`, `BubblePod.tsx`, `Ticket.tsx`, `Lanyard.tsx`, `bloopSound.ts`

**Interfaces:**
- Consumes: `starterPack`, `ThemeId`, `BubbleDef`, `PodDef`, `formatTicketDate`, `bloopFrequency`.
- Produces:
  - `fonts.ts`: `spMarker` (`variable: "--sp-marker"`), `spLabel` (`variable: "--sp-label"`).
  - `Card` props `{ theme: ThemeId; date: string; tiltRef: Ref<HTMLDivElement>; ballsRef: Ref<HTMLDivElement> }`; renders the whole card face as a `<figure>` with a visually hidden `<figcaption>` listing title, every bubble name and every pod label.
  - `BubblePod` props `{ bubbles: BubbleDef[]; hostRef: Ref<HTMLDivElement> }`; renders one `<span data-ball={id}>` per bubble (with `.tex` and `.shine` children), `aria-hidden`.
  - `Ticket` props `{ url: string; qr: string; tag: string; label: string }`; a real `<a target="_blank" rel="noopener noreferrer" aria-label="Scan or open: a song on YouTube">`.
  - `Lanyard` props `{ edgeRef, fillRef, stitchRef, clipRef }` refs to the SVG paths and clip group.
  - `playBloop(r: number): void` in `bloopSound.ts`, same lazy-context and silent-failure shape as `components/common/spinSound.ts`: sine at `bloopFrequency(r)` swept down from 1.55x over 80 ms, peak gain 0.13, plus a triangle at 2.01x with gain 0.03, both released by 240 ms.
- [ ] **Step 1: Port the prototype's CSS** into the module: card layers, edge, face, both themes as `.cardStock` / `.orange` with the `--t1 ... --rope` tokens from the prototype's `.th-a` / `.th-b`, pods, plastic, mascot layer, chip (`translateZ(70px)`, after the pod in DOM order), side label 27px, chip 23px, ticket, warning with the struck "FR", selection guards (`user-select:none`, `-webkit-user-drag:none`, `-webkit-touch-callout:none`, tap highlight transparent), `touch-action:none` on the card only. Replace the prototype's `.15s ease-out` tilt transition with `var(--duration-fast) var(--ease-out)`. The card keeps its own colours in both site themes (it is a printed object); only its cast shadow may darken in dark mode.
- [ ] **Step 2: Build components** with `draggable={false}` on every `<img>`; images `loading="lazy"`, `decoding="async"`, no `priority`.
- [ ] **Step 3: Verify** `npx tsc --noEmit`, `npm run lint`, `bash scripts/verify-simplification.sh`; all pass.
- [ ] **Step 4: Commit** `Starter pack: card markup, fonts and styles`.

### Task 5: Simulation hook and client root

**Files:**
- Create: `components/starter-pack/useStarterPackSim.ts`, `components/starter-pack/StarterPack.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1 to 4.
- Produces:
  - `useStarterPackSim(opts: { root: RefObject<HTMLElement>; hang: RefObject<HTMLDivElement>; tilt: RefObject<HTMLDivElement>; balls: RefObject<HTMLDivElement>; rope: { edge; fill; stitch; clip }; scale: number; anchor: () => Vec }): void`
  - `StarterPack` default export, props `{ variant: "hang" | "footer" }`. Picks `theme` and `date` in a mount effect (render nothing until then, so there is no hydration mismatch and no flash), computes `scale` (hang: 0.6; footer: `Math.min(0.68, (innerWidth - 32) / 470)`) and the anchor (hang: top centre of its box at `y = -40`; footer: top centre of its slot).
- [ ] **Step 1: Implement the hook**, one rAF loop that:
  - runs only while an `IntersectionObserver` reports the root intersecting and `document.visibilityState === "visible"`; uses `advance()` from Task 1 for steps;
  - each step: `stepLanyard`, then `stepBalls(balls, box, STEP, frameGravity(cardPose(s).angle, s.acc))`;
  - draws through `style.transform` and `setAttribute` only (strap path as quadratic segments through the points, clip rotated to the card angle, hang `translate(...) rotate(angle)` with origin at the slot);
  - stops scheduling frames when `lanyardAtRest && ballsAtRest`; any pointer event or resize restarts it;
  - pointer: `pointerdown` on the card (not on `[data-ball]`, not on the ticket) calls `preventDefault`, caches one `getBoundingClientRect`, captures the pointer and drags the arm through `toLocal(..., scale)`; on `[data-ball]` it calls `poke` and `playBloop(r)`; tilt toward the pointer (±12° Y, ±6° X) only on fine pointers;
  - cancels `selectstart` and `dragstart` on the root;
  - reduced motion (`matchMedia("(prefers-reduced-motion: reduce)")`, listened to): no loop, card upright, balls placed at rest once, a press still plays the bloop;
  - resize and orientation change: `setAnchor` and recompute scale;
  - cleanup removes every listener and observer and cancels the frame.
- [ ] **Step 2: Verify** `npx tsc --noEmit`, `npm run lint`; pass.
- [ ] **Step 3: Commit** `Starter pack: simulation hook and client root`.

### Task 6: Homepage mounts, web vitals guard and docs

**Files:**
- Create: `components/starter-pack/StarterPackMount.tsx`, `scripts/check-starter-pack-bundle.sh`
- Modify: `app/page.tsx`, `CLAUDE.md` (one convention bullet), `data/agent-memory.md` (one line under Personal or the homepage notes: the card exists and what is on it)

**Interfaces:**
- Consumes: `StarterPack`.
- Produces: `StarterPackMount({ variant }: { variant: "hang" | "footer" })`: `"use client"`; `dynamic(() => import("./StarterPack"), { ssr: false })` rendered only after `window` `load` has fired and `requestIdleCallback` (fallback `setTimeout` 1500 ms) has run.
- [ ] **Step 1: Mount** in `app/page.tsx`: `<StarterPackMount variant="hang" />` inside an absolutely positioned box at the top right of `<main>` that is `display:none` below 1440px; `<StarterPackMount variant="footer" />` after `<Closing />` inside a slot with server-rendered `height: 600px` that is `display:none` from 1440px. Both boxes are plain server markup (no client JS) so their space is fixed before mount.
- [ ] **Step 2: Write the bundle check**: after `npm run build`, scan the JS chunks and stylesheets linked from `.next/server/app/index.html` for `SHIPS IN SPRINTS|stepLanyard|frameGravity|StarterPack-module__|Sedgwick`; exit 1 with the chunk name on any hit.
- [ ] **Step 3: Run** `npm run build && bash scripts/check-starter-pack-bundle.sh`; expect exit 0.
- [ ] **Step 4: Manual checklist with the dev server, every browser muted** (Chromium and WebKit, desktop 1440 and 1920, phone 375 and 414 in device mode): card drops in after load; no layout shift (Performance panel: CLS 0 from the card); LCP element is still the hero; strap and clip above the title; chip in front of its pod; mascot and items behind the plastic; drag, throw, settle; bubbles feel the swing; pokes move bubbles; ticket click opens the link and never starts a drag; no selection highlight anywhere while dragging; page scrolls normally when a touch starts off the card; rotate the phone and the card still hangs from the strap; hide the tab 2 minutes, return, nothing jumps; navigate to `/swoopy` and back three times, then the Performance monitor shows one rAF loop; on wide screens the card does not cover hero text, margin notes or the dock; on phones it clears the bottom dock and the chat bubble; reduced motion on: card still and upright.
- [ ] **Step 5: Verify** `npm test`, `npx tsc --noEmit`, `npm run lint`, `bash scripts/verify-simplification.sh`; all pass.
- [ ] **Step 6: Commit** `Starter pack: homepage mounts, bundle guard, docs`, then hand over for the owner's listening pass (bloop volume) and QR scan before opening the PR.
