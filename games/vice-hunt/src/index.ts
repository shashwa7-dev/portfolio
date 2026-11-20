import { SPRITES } from "./art/sprites";
import { createGun } from "./gun";
import { addHole, addPoof, createScene, drawScene, stepScene } from "./render";
import { mulberry32 } from "./rng";
import { createSound } from "./sound";
import { loadedArt, preloadHunt, svgUrl } from "./sprites";
import type { Kills, Kind } from "./types";
import { createWorld, resize, shoot, step } from "./world";

export type { Kills, Kind } from "./types";
export { preloadHunt } from "./sprites";

export type HuntOptions = {
  onKills?(kills: Kills): void;
  onShot?(x: number, y: number, hit: Kind | null): void; // CSS px relative to host
  onExit?(): void;
  muted?: boolean;
};
export type Hunt = { destroy(): void };

const SCORE_ORDER: Kind[] = ["rabbit", "iguana", "flamingo", "bigfoot"];

function scoreStrip(layer: HTMLElement): (kills: Kills) => void {
  const strip = document.createElement("div");
  strip.style.cssText =
    "position:absolute;left:12px;bottom:10px;z-index:2;display:flex;gap:12px;align-items:center;" +
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
  const sound = createSound(!!options.muted);
  void preloadHunt().catch(() => {}); // animals appear once the art is decoded

  const layer = document.createElement("div");
  layer.style.cssText =
    "position:absolute;inset:0;z-index:50;overflow:hidden;cursor:none;touch-action:none;user-select:none;-webkit-user-select:none";
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
  layer.append(canvas);
  const ctx = canvas.getContext("2d")!;
  const gun = createGun(layer);
  const showKills = scoreStrip(layer);
  host.append(layer);

  const scene = createScene();
  let dpr = 1;
  const world = createWorld(Math.max(1, layer.clientWidth), Math.max(1, layer.clientHeight), rng);

  const fit = () => {
    const w = Math.max(1, layer.clientWidth);
    const h = Math.max(1, layer.clientHeight);
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    if (w !== world.width || h !== world.height) resize(world, w, h);
  };
  fit();
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
    const { hit, killed } = shoot(world, x, y);
    addHole(scene, x, y, rng);
    gun.fire();
    sound.shot();
    if (killed && hit) {
      addPoof(scene, hit, rng);
      sound.kill();
      showKills(world.kills);
      options.onKills?.({ ...world.kills });
    } else if (hit) {
      sound.hit();
    }
    const hb = host.getBoundingClientRect();
    options.onShot?.(e.clientX - hb.left, e.clientY - hb.top, hit ? hit.kind : null);
    layer.animate(
      [{ transform: "translate(2px,-1px)" }, { transform: "translate(-2px,1px)" }, { transform: "none" }],
      { duration: 120 },
    );
  };

  const onEnter = () => gun.showCrosshair(true);
  const onLeave = () => gun.showCrosshair(false);

  const onMenu = (e: MouseEvent) => {
    e.preventDefault();
    options.onExit?.();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") options.onExit?.();
  };

  let raf = 0;
  let last: number | null = null;
  const frame = (now: number) => {
    const dt = last === null ? 0 : (now - last) / 1000;
    last = now;
    step(world, dt, rng);
    stepScene(scene, Math.min(dt, 0.05));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScene(ctx, scene, world, loadedArt(), dpr);
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
