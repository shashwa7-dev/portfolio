import { RELOAD_TIME, createAmmo, fire, startReload, tick } from "./ammo";
import { SPRITES } from "./art/sprites";
import { createGun } from "./gun";
import { MAX_DT, SEA_LINE } from "./config";
import { drawGlass, shakeOffset, stepGlass } from "./fx/glass";
import { resolveFinish, stepFinishing, stepThreats, THREATS } from "./modules";
import { addPuff, createScene, drawScene, stepScene } from "./render";
import { mulberry32 } from "./rng";
import { createSound, type SfxUrls } from "./sound";
import { loadedArt, preloadHunt, svgUrl } from "./sprites";
import { CREATURES, type Kind } from "./creatures";
import type { GameEvent } from "./events";
import type { Kills } from "./types";
import { createClock, escapeAction } from "./pause";
import { createWorld, drain, resize, shoot, spawn, step } from "./world";

export type { Kills } from "./types";
export type { Kind } from "./creatures";
export type { GameEvent } from "./events";
export { KINDS, isEnabled, isRare, kindsWhere, pointsFor, penaltyFor } from "./creatures";
export type { Effect, SfxUrls } from "./sound";
export { ROUNDS } from "./ammo";
export { preloadHunt } from "./sprites";

/** Any creature's first sprite frame as an image URL, for a host's own HUD
 *  (every kind has art, the rares included). */
export function iconUrl(kind: Kind): string {
  return svgUrl(SPRITES[kind][0]);
}

/** The words a host pops over the scene (the package draws no text). */
export type Callout = Extract<GameEvent, { type: "callout" }>["text"];

export type HuntOptions = {
  onKills?(kills: Kills): void;
  onShot?(x: number, y: number, hit: Kind | null): void; // CSS px relative to host
  /** Esc or a right click during play: the host shows its pause menu and
   *  calls `pause()` (nothing while paused or WASTED). */
  onPause?(): void;
  muted?: boolean;
  /** Where the score strip starts: CSS px from the host's left edge, so a
   *  host can line it up with its own content. Default 12. */
  scoreInset?: number;
  /** Show the package's own score strip. Default true; a host with its own
   *  kill counts sets false. */
  showScore?: boolean;
  /** Each kill, at the animal's centre in CSS px relative to host. `streak`
   *  counts kills each within 1.5 s of the one before (1 for a lone kill).
   *  The cow and the tiger are never killed: their last hit is a penalty. */
  onKill?(kind: Kind, x: number, y: number, streak: number): void;
  /** Every hit, finishing or not: the `n`th of `of` needed (`of` is left out
   *  for the UFO, whose total is a secret, and Bigfoot, who has a bar). */
  onHit?(kind: Kind, n: number, of: number | undefined, x: number, y: number): void;
  /** Points lost for hitting a protected creature (negative). */
  onPenalty?(kind: Kind, points: number, x: number, y: number): void;
  /** Hearts left (0 to 3, in halves): once at the start and after each
   *  hit the player takes. */
  onHealth?(hearts: number): void;
  /** Out of hearts: the round is over and the world has stopped. */
  onWasted?(): void;
  /** A rare creature came on, or was hit for the first time this round. */
  onRare?(kind: Kind, event: "appeared" | "met"): void;
  /** The merman got away: his window for the next hits lapsed. */
  onEscaped?(kind: Kind, x: number, y: number): void;
  /** A word to pop at a spot ("ANGRY!", "HSSSS!", "PFFT!", "SPLAT!"). */
  onCallout?(text: Callout, x: number, y: number): void;
  /** Rounds left (0 to 6) and whether a reload is running: once at the start
   *  and on every change. */
  onAmmo?(rounds: number, reloading: boolean): void;
  /** Bigfoot came on (true) or is gone again (false), killed or off the far
   *  edge, so a host can stage his entrance. */
  onBigfoot?(present: boolean): void;
  /** Recorded effects by URL; any left out (or failing to load) are
   *  synthesised. Same silent rules either way. */
  sfx?: SfxUrls;
  /** Where the host's scene has its water line, px from the top, for a
   *  layer of this size (the merman surfaces there; the UFO and fish splash
   *  there). Asked again on every resize. Default: 0.69 of the height. */
  seaLine?(width: number, height: number): number;
  /** Dev pages: creatures to spawn at the start. */
  spawn?: Kind[];
  /** Rares the host saw appear in earlier rounds (`onRare(kind, "appeared")`):
   *  they come back about once a minute from the start. Not Bigfoot. */
  spotted?: Kind[];
  /** Dev pages: kinds kept on screen; each comes back 1.5 s after the last
   *  one of its kind has gone (shot down or walked off). */
  keep?: Kind[];
  /** Dev pages: kinds to shoot down (one hit a frame, once fully on screen)
   *  so a finish can be watched. Bypasses the gun. */
  finish?: Kind[];
  /** Dev pages: kinds to hit once, once fully on screen (provokes Bigfoot). */
  hit?: Kind[];
};
/** `pause()` freezes the round (no steps, no input, gun animations held,
 *  sound suspended); `resume()` carries on with no catch-up step. */
export type Hunt = { destroy(): void; pause(): void; resume(): void };

const SCORE_ORDER: Kind[] = ["rabbit", "iguana", "flamingo", "bigfoot"];

/** Hands each event to its `HuntOptions` callback, with positions moved into
 *  the host's CSS px by `toHost`. A new `GameEvent` member does not compile
 *  here until it is handled; one smuggled in at run time is ignored. */
export function toCallbacks(
  events: readonly GameEvent[],
  options: HuntOptions,
  toHost: (x: number, y: number) => [number, number],
): void {
  for (const e of events) {
    switch (e.type) {
      case "hit":
        options.onHit?.(e.kind, e.n, e.of, ...toHost(e.x, e.y));
        break;
      case "kill":
        options.onKill?.(e.kind, ...toHost(e.x, e.y), e.streak);
        break;
      case "penalty":
        options.onPenalty?.(e.kind, e.points, ...toHost(e.x, e.y));
        break;
      case "damage":
        options.onHealth?.(e.hearts);
        break;
      case "rare":
        options.onRare?.(e.kind, e.event);
        break;
      case "escaped":
        options.onEscaped?.(e.kind, ...toHost(e.x, e.y));
        break;
      case "callout":
        options.onCallout?.(e.text, ...toHost(e.x, e.y));
        break;
      case "wasted":
        options.onWasted?.();
        break;
      default:
        e satisfies never;
    }
  }
}

// Escape belongs to a dialog that has focus, or to whoever handled it first.
function escapeIsOurs(e: KeyboardEvent): boolean {
  if (e.defaultPrevented) return false;
  const t = e.target;
  return !(t instanceof Element && t.closest('[role="dialog"]'));
}

// R is a key press meant for something else when it was handled or typed.
function typing(e: KeyboardEvent): boolean {
  const t = e.target;
  return e.defaultPrevented || (t instanceof Element && !!t.closest("input,textarea,select,[contenteditable]"));
}

function scoreStrip(layer: HTMLElement, left: number): (kills: Kills) => void {
  const strip = document.createElement("div");
  strip.style.cssText =
    `position:absolute;left:${left}px;bottom:10px;` +
    "z-index:2;display:flex;gap:12px;align-items:center;" +
    "padding:4px 10px;border-radius:999px;background:rgba(0,0,0,.45);color:#fff;pointer-events:none;" +
    "font:600 13px/1 system-ui,-apple-system,'Segoe UI',sans-serif;font-variant-numeric:tabular-nums";
  const counts = {} as Record<Kind, HTMLSpanElement>;
  for (const k of SCORE_ORDER) {
    const item = document.createElement("span");
    item.style.cssText = "display:flex;gap:5px;align-items:center";
    const icon = document.createElement("img");
    icon.src = svgUrl(SPRITES[k][0]);
    icon.alt = k;
    icon.style.cssText = "height:20px;width:auto";
    counts[k] = document.createElement("span");
    counts[k].textContent = "0";
    item.append(icon, counts[k]);
    strip.append(item);
  }
  layer.append(strip);
  return (kills) => SCORE_ORDER.forEach((k) => (counts[k].textContent = String(kills[k])));
}

export function startHunt(host: HTMLElement, options: HuntOptions = {}): Hunt {
  const rng = mulberry32(Date.now() >>> 0);
  const sound = createSound(!!options.muted, options.sfx);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ammo = createAmmo();
  const reportAmmo = () => options.onAmmo?.(ammo.rounds, ammo.reloading);
  void preloadHunt().catch(() => {}); // animals appear once the art is decoded

  const layer = document.createElement("div");
  layer.style.cssText =
    "position:absolute;inset:0;z-index:50;overflow:hidden;cursor:none;touch-action:none;user-select:none;-webkit-user-select:none";
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  layer.append(canvas);
  const ctx = canvas.getContext("2d")!;
  const gun = createGun(layer, reducedMotion);
  // The glass, in front of the gun: the tiger's face and paw, claw scratches
  // and splats. Never takes a shot.
  const glassCanvas = document.createElement("canvas");
  glassCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  layer.append(glassCanvas);
  const glassCtx = glassCanvas.getContext("2d")!;
  const showKills = options.showScore === false ? () => {} : scoreStrip(layer, options.scoreInset ?? 12);
  host.append(layer);

  const scene = createScene();
  let dpr = 1;
  const seaAt = (w: number, h: number) => options.seaLine?.(w, h) ?? SEA_LINE * h;
  const startW = Math.max(1, layer.clientWidth);
  const startH = Math.max(1, layer.clientHeight);
  const world = createWorld(startW, startH, rng, seaAt(startW, startH), options.spotted);

  const fit = () => {
    const w = Math.max(1, layer.clientWidth);
    const h = Math.max(1, layer.clientHeight);
    dpr = window.devicePixelRatio || 1;
    canvas.width = glassCanvas.width = Math.round(w * dpr);
    canvas.height = glassCanvas.height = Math.round(h * dpr);
    if (w !== world.width || h !== world.height) resize(world, w, h, seaAt(w, h));
  };
  fit();
  for (const k of options.spawn ?? []) spawn(world, rng, k);
  gun.aim(world.width / 2, world.height / 2, world.width, world.height);
  const ro = new ResizeObserver(fit);
  ro.observe(layer);

  const local = (e: MouseEvent) => {
    const b = layer.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };

  let destroyed = false;
  // The world's events since the last flush become the host's callbacks, in
  // the host's px. Kills are only ever reported from here: a cow or a tiger
  // finished is a penalty, never a kill (the world emits no kill for them).
  const flush = () => {
    const events = drain(world);
    if (events.length === 0) return;
    const hb = host.getBoundingClientRect();
    const lb = layer.getBoundingClientRect();
    const dx = lb.left - hb.left;
    const dy = lb.top - hb.top;
    toCallbacks(events, options, (x, y) => [x + dx, y + dy]);
    if (events.some((e) => e.type === "kill")) {
      showKills(world.kills);
      options.onKills?.({ ...world.kills });
    }
  };

  const onMove = (e: PointerEvent) => {
    const { x, y } = local(e);
    gun.aim(x, y, world.width, world.height);
  };

  // Fires on press rather than release so rapid shots feel immediate.
  const onDown = (e: PointerEvent) => {
    // ctrl+click is a right click on macOS: it only exits, never shoots.
    // Once the round is WASTED the gun is down: no shot, no round spent.
    if (destroyed || paused || world.wasted || e.button !== 0 || e.ctrlKey) return;
    e.preventDefault();
    const { x, y } = local(e);
    gun.aim(x, y, world.width, world.height);
    if (!fire(ammo)) {
      sound.empty(); // reloading: dry click, no shot
      return;
    }
    const { hit, finished } = shoot(world, x, y, rng);
    gun.fire();
    sound.shot();
    if (finished && hit) {
      if (CREATURES[hit.kind].finish === "falls") addPuff(scene, world, hit, rng);
      sound.kill();
    } else if (hit) {
      sound.hit();
    }
    flush(); // the shot's hit, kill, penalty and callouts, straight away
    if (destroyed) return; // a callback ended the hunt
    const hb = host.getBoundingClientRect();
    options.onShot?.(e.clientX - hb.left, e.clientY - hb.top, hit ? hit.kind : null);
    if (!reducedMotion) {
      layer.animate(
        [{ transform: "translate(2px,-1px)" }, { transform: "translate(-2px,1px)" }, { transform: "none" }],
        { duration: 120 },
      );
    }
    if (ammo.reloading) beginReload(); // that was the sixth
    reportAmmo();
  };

  const beginReload = () => {
    gun.reload(RELOAD_TIME * 1000);
    sound.reload();
  };

  const onEnter = () => gun.showCrosshair(true);
  const onLeave = () => gun.showCrosshair(false);

  const askPause = () => {
    if (escapeAction({ paused, wasted: world.wasted }) === "pause") options.onPause?.();
  };
  const onMenu = (e: MouseEvent) => {
    e.preventDefault();
    askPause();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (escapeIsOurs(e)) askPause();
    } else if ((e.key === "r" || e.key === "R") && !paused && !world.wasted && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e)) {
      if (startReload(ammo)) {
        beginReload();
        reportAmmo();
      }
    }
  };

  // Dev pages only (`options.finish`): one hit a frame on each named kind,
  // once it is wholly on screen.
  const devLeft = new Set(options.finish ?? []);
  // Dev pages only (`options.keep`): bring a kind back once it is gone.
  const devGone = new Map<Kind, number>();
  const devKeep = (dt: number) => {
    if (world.wasted) return;
    for (const k of options.keep ?? []) {
      const here = world.animals.some((a) => a.kind === k) || world.finishing.some((f) => f.kind === k);
      if (here) {
        devGone.delete(k);
        continue;
      }
      const t = (devGone.get(k) ?? 0) + Math.min(dt, MAX_DT);
      if (t < 1.5) devGone.set(k, t);
      else {
        devGone.delete(k);
        spawn(world, rng, k);
      }
    }
  };

  const devHit = new Set(options.hit ?? []);
  const devFinish = () => {
    for (const a of world.animals) {
      if (!devHit.has(a.kind) || a.x < 0 || a.x + a.w > world.width) continue;
      shoot(world, a.x + a.w / 2, a.y + a.h * 0.3, rng);
      devHit.delete(a.kind);
    }
    if (devLeft.size === 0) return;
    for (const a of [...world.animals]) {
      if (!devLeft.has(a.kind) || a.x < 0 || a.x + a.w > world.width) continue;
      if (!shoot(world, a.x + a.w / 2, a.y + a.h * 0.3, rng).finished) continue;
      devLeft.delete(a.kind);
      if (CREATURES[a.kind].finish === "falls") addPuff(scene, world, a, rng);
    }
  };

  let raf = 0;
  const clock = createClock();
  let paused = false; // by the host, through pause(); a hidden tab is not this
  let bigfoot = false;
  const frame = (now: number) => {
    const dt = clock.tick(now);
    step(world, dt, rng);
    devFinish();
    devKeep(dt);
    stepFinishing(world, dt, reducedMotion, rng);
    stepThreats(world, dt, rng, reducedMotion);
    stepGlass(world.glass, Math.min(dt, MAX_DT));
    stepScene(scene, Math.min(dt, MAX_DT));
    flush();
    if (destroyed) return; // a callback ended the hunt
    if (tick(ammo, dt)) reportAmmo();
    const big = world.animals.some((a) => a.kind === "bigfoot");
    if (big !== bigfoot) {
      bigfoot = big;
      options.onBigfoot?.(big);
    }
    const jolt = shakeOffset(world.glass);
    const art = loadedArt();
    for (const c of [ctx, glassCtx]) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, canvas.width, canvas.height); // the whole canvas, whatever the shake
    }
    ctx.setTransform(dpr, 0, 0, dpr, jolt.dx * dpr, jolt.dy * dpr);
    drawScene(ctx, scene, world, art, reducedMotion);
    glassCtx.setTransform(dpr, 0, 0, dpr, jolt.dx * dpr, jolt.dy * dpr);
    if (art) {
      for (const f of world.finishing) resolveFinish(f.id, reducedMotion).drawGlass?.(glassCtx, f.state, art);
      for (const t of world.threats) THREATS[t.id].draw(glassCtx, t.state, art);
    }
    drawGlass(glassCtx, world.glass);
    raf = requestAnimationFrame(frame);
  };
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (paused) return; // stays paused until the host resumes
    clock.resume(); // the next tick steps by 0
    if (!document.hidden) raf = requestAnimationFrame(frame);
  };

  layer.addEventListener("pointermove", onMove);
  layer.addEventListener("pointerdown", onDown);
  layer.addEventListener("pointerenter", onEnter);
  layer.addEventListener("pointerleave", onLeave);
  layer.addEventListener("contextmenu", onMenu);
  window.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisibility);
  onVisibility();
  reportAmmo();
  options.onHealth?.(world.hearts);

  const held = () => layer.getAnimations({ subtree: true });

  return {
    pause() {
      if (destroyed || paused) return;
      paused = true;
      cancelAnimationFrame(raf);
      clock.pause();
      for (const a of held()) a.pause();
      gun.showCrosshair(false);
      sound.suspend();
    },
    resume() {
      if (destroyed || !paused) return;
      paused = false;
      clock.resume();
      for (const a of held()) a.play();
      sound.resume();
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      layer.removeEventListener("pointermove", onMove);
      layer.removeEventListener("pointerdown", onDown);
      layer.removeEventListener("pointerenter", onEnter);
      layer.removeEventListener("pointerleave", onLeave);
      layer.removeEventListener("contextmenu", onMenu);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      sound.close();
      layer.remove(); // the scene, the gun and the glass canvas with it
    },
  };
}
