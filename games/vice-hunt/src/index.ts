import { RELOAD_TIME, createAmmo, fire, startReload, tick } from "./ammo";
import { SPRITES } from "./art/sprites";
import { createGun } from "./gun";
import { MAX_DT, SEA_LINE } from "./config";
import { drawGlass, shakeOffset, stepGlass } from "./fx/glass";
import { stepFinishing, stepThreats, THREATS } from "./modules";
import { addPuff, createScene, drawScene, stepScene } from "./render";
import { mulberry32 } from "./rng";
import { createSound, type SfxUrls } from "./sound";
import { loadedArt, preloadHunt, svgUrl } from "./sprites";
import { CREATURES, type Kind } from "./creatures";
import type { Kills } from "./types";
import { createWorld, drain, resize, shoot, spawn, step } from "./world";

export type { Kills } from "./types";
export type { Kind } from "./creatures";
export { KINDS, isEnabled, isRare, kindsWhere, pointsFor, penaltyFor } from "./creatures";
export type { Effect, SfxUrls } from "./sound";
export { ROUNDS } from "./ammo";
export { preloadHunt } from "./sprites";

/** Any creature's first sprite frame as an image URL, for a host's own HUD
 *  (every kind has art, the rares included). */
export function iconUrl(kind: Kind): string {
  return svgUrl(SPRITES[kind][0]);
}

export type HuntOptions = {
  onKills?(kills: Kills): void;
  onShot?(x: number, y: number, hit: Kind | null): void; // CSS px relative to host
  onExit?(): void;
  muted?: boolean;
  /** Where the score strip starts: CSS px from the host's left edge, so a
   *  host can line it up with its own content. Default 12. */
  scoreInset?: number;
  /** Show the package's own score strip. Default true; a host with its own
   *  kill counts sets false. */
  showScore?: boolean;
  /** Each kill, at the animal's centre in CSS px relative to host. `streak`
   *  counts kills each within 1.5 s of the one before (1 for a lone kill). */
  onKill?(kind: Kind, x: number, y: number, streak: number): void;
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
  /** Dev pages: kinds to shoot down (one hit a frame, once fully on screen)
   *  so a finish can be watched. Bypasses the gun. */
  finish?: Kind[];
};
export type Hunt = { destroy(): void };

const SCORE_ORDER: Kind[] = ["rabbit", "iguana", "flamingo", "bigfoot"];

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
  const world = createWorld(startW, startH, rng, seaAt(startW, startH));

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

  const onMove = (e: PointerEvent) => {
    const { x, y } = local(e);
    gun.aim(x, y, world.width, world.height);
  };

  // Fires on press rather than release so rapid shots feel immediate.
  const onDown = (e: PointerEvent) => {
    // ctrl+click is a right click on macOS: it only exits, never shoots.
    if (e.button !== 0 || e.ctrlKey) return;
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
    const hb = host.getBoundingClientRect();
    if (finished && hit) {
      if (CREATURES[hit.kind].finish === "falls") addPuff(scene, world, hit, rng);
      sound.kill();
      showKills(world.kills);
      options.onKills?.({ ...world.kills });
      const lb = layer.getBoundingClientRect();
      options.onKill?.(
        hit.kind,
        lb.left - hb.left + hit.x + hit.w / 2,
        lb.top - hb.top + hit.y + hit.h / 2,
        world.streak,
      );
    } else if (hit) {
      sound.hit();
    }
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

  const onMenu = (e: MouseEvent) => {
    e.preventDefault();
    options.onExit?.();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (escapeIsOurs(e)) options.onExit?.();
    } else if ((e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e)) {
      if (startReload(ammo)) {
        beginReload();
        reportAmmo();
      }
    }
  };

  // Dev pages only (`options.finish`): one hit a frame on each named kind,
  // once it is wholly on screen.
  const devLeft = new Set(options.finish ?? []);
  const devFinish = () => {
    if (devLeft.size === 0) return;
    for (const a of [...world.animals]) {
      if (!devLeft.has(a.kind) || a.x < 0 || a.x + a.w > world.width) continue;
      if (!shoot(world, a.x + a.w / 2, a.y + a.h * 0.3, rng).finished) continue;
      devLeft.delete(a.kind);
      if (CREATURES[a.kind].finish === "falls") addPuff(scene, world, a, rng);
    }
  };

  let raf = 0;
  let last: number | null = null;
  let bigfoot = false;
  const frame = (now: number) => {
    const dt = last === null ? 0 : (now - last) / 1000;
    last = now;
    step(world, dt, rng);
    devFinish();
    stepFinishing(world, dt, reducedMotion, rng);
    stepThreats(world, dt, rng);
    stepGlass(world.glass, Math.min(dt, MAX_DT));
    drain(world); // the events become callbacks in a later task; drop them so they do not pile up
    stepScene(scene, Math.min(dt, 0.05));
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
    if (art) for (const t of world.threats) THREATS[t.id].draw(glassCtx, t.state, art);
    drawGlass(glassCtx, world.glass);
    raf = requestAnimationFrame(frame);
  };
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    last = null;
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

  let destroyed = false;
  return {
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
      layer.remove();
    },
  };
}
