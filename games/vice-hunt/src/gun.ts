import { REVOLVER_SVG, REVOLVER_VIEWBOX, ROLL_STEP } from "./art/revolver";

const GUN_W = 210;
const SCALE = GUN_W / REVOLVER_VIEWBOX.width;
const FLASH_W = 84;
const REST = "perspective(600px) translateY(0px) scale(1) rotateX(0deg) rotate(0deg)";
const KICK = "perspective(600px) translateY(22px) scale(1.12) rotateX(14deg) rotate(0deg)";
// Reduced motion: the recoil is a small translate only.
const REST_CALM = "translateY(0px)";
const KICK_CALM = "translateY(6px)";
// Reloading: the gun dips and tips aside while the cylinder spins.
const TIPPED = "perspective(600px) translateY(34px) scale(1) rotateX(8deg) rotate(-16deg)";
const ROLL_PERIOD = 80; // ms per flute step: a fast spin
const FLASH_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%"><defs><radialGradient id="vhFlash"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#ffd257"/><stop offset=".7" stop-color="#ff7a1a" stop-opacity=".8"/><stop offset="1" stop-color="#ff4d00" stop-opacity="0"/></radialGradient></defs><path d="M40 0 L46 28 L70 10 L52 34 L80 40 L52 46 L70 70 L46 52 L40 80 L34 52 L10 70 L28 46 L0 40 L28 34 L10 10 L34 28 Z" fill="url(#vhFlash)"/></svg>';

const el = (css: string, html = "") => {
  const d = document.createElement("div");
  d.style.cssText = `position:absolute;pointer-events:none;${css}`;
  d.innerHTML = html;
  return d;
};

export type Gun = {
  aim(x: number, y: number, w: number, h: number): void;
  fire(): void;
  /** Plays the reload (cylinder spin) over `ms`. */
  reload(ms: number): void;
  showCrosshair(visible: boolean): void;
};

// First-person revolver at the bottom of the layer, seen from behind, plus
// the crosshair. Both are DOM so the recoil, flash and spin run on the
// compositor. The SVG is inline so the reload can spin the cylinder's flutes.
export function createGun(layer: HTMLElement, reducedMotion: boolean): Gun {
  const rig = el(`left:0;bottom:0;width:${GUN_W}px;transform-origin:50% 100%;will-change:transform`);
  const kick = el("transform-origin:50% 100%;position:relative");
  const body = document.createElement("div");
  body.innerHTML = REVOLVER_SVG;
  const svg = body.firstElementChild as SVGSVGElement;
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = `display:block;width:${GUN_W}px;height:auto;filter:drop-shadow(0 -2px 10px rgba(0,0,0,.35))`;
  const flutes = svg.querySelector<SVGGElement>(".vh-flutes")!;
  const roll = svg.querySelector<SVGGElement>(".vh-roll")!;
  const flash = el(
    `width:${FLASH_W}px;height:${FLASH_W}px;left:${REVOLVER_VIEWBOX.muzzleX * SCALE - FLASH_W / 2}px;` +
      `top:${REVOLVER_VIEWBOX.muzzleY * SCALE - FLASH_W / 2}px;opacity:0;z-index:1`,
    FLASH_SVG,
  );
  kick.append(svg, flash);
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
    showCrosshair(visible) {
      cross.style.visibility = visible ? "visible" : "hidden";
    },
    fire() {
      const [rest, kicked] = reducedMotion ? [REST_CALM, KICK_CALM] : [REST, KICK];
      kick.animate([{ transform: rest }, { transform: kicked, offset: 0.25 }, { transform: rest }], {
        duration: 190,
        easing: "cubic-bezier(.2,.8,.3,1)",
      });
      flash.animate(
        reducedMotion
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { opacity: 1, transform: "scale(1.15)" },
              { opacity: 0, transform: "scale(.6)" },
            ],
        { duration: 80, easing: "ease-out" },
      );
    },
    reload(ms) {
      if (reducedMotion) {
        kick.animate([{ opacity: 1 }, { opacity: 0.55, offset: 0.2 }, { opacity: 0.55, offset: 0.8 }, { opacity: 1 }], {
          duration: ms,
        });
        return;
      }
      kick.animate(
        [
          { transform: REST },
          { transform: TIPPED, offset: 0.18 },
          { transform: TIPPED, offset: 0.82 },
          { transform: REST },
        ],
        { duration: ms, easing: "cubic-bezier(.3,.7,.3,1)" },
      );
      // The fixed flutes give way to the rolling set while it spins.
      const swap = [
        { opacity: 1 },
        { opacity: 0, offset: 0.15 },
        { opacity: 0, offset: 0.85 },
        { opacity: 1 },
      ];
      flutes.animate(swap, { duration: ms });
      roll.animate(
        swap.map((k) => ({ ...k, opacity: 1 - k.opacity })),
        { duration: ms },
      );
      roll.animate([{ transform: "translateX(0px)" }, { transform: `translateX(${ROLL_STEP}px)` }], {
        duration: ROLL_PERIOD,
        iterations: Math.ceil(ms / ROLL_PERIOD),
      });
    },
  };
}
