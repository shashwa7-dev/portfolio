import { GUN_SVG, GUN_VIEWBOX } from "./art/gun";
import { svgUrl } from "./sprites";

const GUN_W = 210;
const SCALE = GUN_W / GUN_VIEWBOX.width;
const FLASH_W = 84;
const REST = "perspective(600px) translateY(0px) scale(1) rotateX(0deg)";
const KICK = "perspective(600px) translateY(22px) scale(1.12) rotateX(14deg)";
const FLASH_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%"><defs><radialGradient id="vhFlash"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#ffd257"/><stop offset=".7" stop-color="#ff7a1a" stop-opacity=".8"/><stop offset="1" stop-color="#ff4d00" stop-opacity="0"/></radialGradient></defs><path d="M40 0 L46 28 L70 10 L52 34 L80 40 L52 46 L70 70 L46 52 L40 80 L34 52 L10 70 L28 46 L0 40 L28 34 L10 10 L34 28 Z" fill="url(#vhFlash)"/></svg>';

const el = (css: string, html = "") => {
  const d = document.createElement("div");
  d.style.cssText = `position:absolute;pointer-events:none;${css}`;
  d.innerHTML = html;
  return d;
};

export type Gun = { aim(x: number, y: number, w: number, h: number): void; fire(): void };

// First-person pistol at the bottom of the layer, seen from behind, plus the
// crosshair. Both are DOM so the recoil and flash run on the compositor.
export function createGun(layer: HTMLElement): Gun {
  const rig = el(`left:0;bottom:0;width:${GUN_W}px;transform-origin:50% 100%;will-change:transform`);
  const kick = el("transform-origin:50% 100%;position:relative");
  const img = document.createElement("img");
  img.src = svgUrl(GUN_SVG);
  img.alt = "";
  img.draggable = false;
  img.style.cssText = `display:block;width:${GUN_W}px;filter:drop-shadow(0 -2px 10px rgba(0,0,0,.35))`;
  const flash = el(
    `width:${FLASH_W}px;height:${FLASH_W}px;left:${GUN_VIEWBOX.muzzleX * SCALE - FLASH_W / 2}px;` +
      `top:${GUN_VIEWBOX.muzzleY * SCALE - FLASH_W / 2}px;opacity:0;z-index:1`,
    FLASH_SVG,
  );
  kick.append(img, flash);
  rig.append(kick);

  const bar = "position:absolute;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.55)";
  const cross = el(
    "left:0;top:0;width:26px;height:26px;z-index:3",
    `<i style="${bar};left:12px;top:0;width:2px;height:26px"></i>` +
      `<i style="${bar};top:12px;left:0;width:26px;height:2px"></i>` +
      '<i style="position:absolute;left:10px;top:10px;width:6px;height:6px;border-radius:50%;background:#ff3d5a;box-shadow:0 0 0 1px rgba(0,0,0,.5)"></i>',
  );
  layer.append(rig, cross);

  return {
    aim(x, y, w, h) {
      cross.style.transform = `translate(${x - 13}px, ${y - 13}px)`;
      // Slide under the aim point, lean toward it, rise a little as it goes up.
      const gx = Math.min(Math.max(x * 0.55 + w * 0.3, 40), Math.max(40, w - 40));
      const lean = ((x - gx) / Math.max(w, 1)) * 40;
      const lift = Math.max(0, 1 - y / Math.max(h, 1)) * 26;
      rig.style.transform = `translateX(${gx - GUN_W / 2}px) translateY(${34 - lift}px) rotate(${lean}deg)`;
    },
    fire() {
      kick.animate([{ transform: REST }, { transform: KICK, offset: 0.25 }, { transform: REST }], {
        duration: 190,
        easing: "cubic-bezier(.2,.8,.3,1)",
      });
      flash.animate(
        [
          { opacity: 1, transform: "scale(1.15)" },
          { opacity: 0, transform: "scale(.6)" },
        ],
        { duration: 80, easing: "ease-out" },
      );
    },
  };
}
