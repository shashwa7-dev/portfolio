/**
 * The hero fuse, drawn on a canvas around the photo: a real rope (a
 * straightened photo strip, `fuse-rope.webp`) laid round the photo with a
 * short straight tail at the bottom right, and on light a flame photo
 * (`fuse-flame.webp`) running from the tail tip up the tail and once round the
 * ring, leaving ember and ash behind it, throwing sparks and a little smoke.
 * Ported from the fuse-real prototype's `makeFuse`.
 *
 * At rest it is one draw (no animation frame loop); the loop runs only while
 * the fuse burns and its last sparks fade.
 *
 * Geometry is sized from the photo's rendered diameter D, re-measured on every
 * resize. Particle physics is tuned per 60fps frame, as in the prototype, and
 * scaled by the frame's length so faster screens match; it is physics, not UI
 * durations.
 */

const ROPE_SRC = "/images/diwali/fuse-rope.webp";
const FLAME_SRC = "/images/diwali/fuse-flame.webp";

/** The rope's share of the strip's height (32 of 44 px in the source, kept by the resize to 700x22). */
const ROPE_SHARE = 32 / 44;
/** Where the flame photo's rope end sits (305,70 of the 330x140 source; 200x85 after the resize), as fractions. */
const FLAME_ANCHOR_X = 305 / 330;
const FLAME_ANCHOR_Y = 70 / 140;
/** Arc length of one rope slice, in CSS px. */
const SLICE = 1.4;
/** The prototype was tuned at a 170px photo; speeds scale from it. */
const TUNED_D = 170;

/** The rope's geometry for a photo of diameter `d` (CSS px). */
export function fuseGeometry(d: number) {
  const th = Math.max(3.2, d * 0.075); // rope thickness
  const r = d / 2 + th * 0.55; // ring radius, to the rope's centre
  const tail = d * 0.32; // straight tail, out at 45 degrees (bottom right)
  const pad = d * 0.9; // room for the flame, sparks and smoke
  return { d, th, r, tail, pad, w: d + pad * 2, len: tail + 2 * Math.PI * r };
}

type Geometry = ReturnType<typeof fuseGeometry>;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  smoke: boolean;
  r: number;
};

export type Fuse = {
  /** Re-reads the photo's size and redraws the rope if it is at rest. */
  measure(): void;
  /** Draws the whole rope, ring and tail, at rest. */
  rest(): void;
  /** Clears the canvas (the rope has burnt). */
  clear(): void;
  /** Runs the flame up the tail and round the ring over `ms`, then calls `onDone`. */
  burn(ms: number, onDone: () => void): void;
  /** Stops the loop and drops the image listeners. */
  destroy(): void;
};

export function createFuse(
  canvas: HTMLCanvasElement,
  photo: HTMLElement,
): Fuse {
  const ctx = canvas.getContext("2d");
  const rope = new Image();
  const flame = new Image();
  let g: Geometry = fuseGeometry(photo.offsetWidth);
  let dpr = 1;
  let mode: "rest" | "burn" | "done" = "rest";
  let raf = 0;
  let parts: Particle[] = [];

  const ropeReady = () => rope.complete && rope.naturalWidth > 0;

  /** Point and direction of travel along the fuse, `s` px from the tail tip. */
  function at(s: number) {
    const c = g.w / 2;
    const a0 = Math.PI / 4;
    if (s < g.tail) {
      const rr = g.r + (g.tail - s);
      return { x: c + rr * Math.cos(a0), y: c + rr * Math.sin(a0), a: a0 + Math.PI };
    }
    const a = a0 + (s - g.tail) / g.r;
    return { x: c + g.r * Math.cos(a), y: c + g.r * Math.sin(a), a: a + Math.PI / 2 };
  }

  function begin() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, g.w, g.w);
  }

  /** The rope from `from` px to the end, slice by slice along the path. */
  function drawRope(from: number) {
    if (!ctx || !ropeReady()) return;
    const texH = rope.naturalHeight;
    const texScale = (texH * ROPE_SHARE) / g.th; // texture px per CSS px of rope
    const srcW = SLICE * texScale;
    const h = g.th / ROPE_SHARE;
    for (let s = from; s < g.len; s += SLICE) {
      const p = at(s);
      const sx = (s * texScale) % (rope.naturalWidth - srcW - 2);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      // A little overlap on both sides, so the slices never show a seam.
      ctx.drawImage(rope, sx, 0, srcW + 0.75, texH, -SLICE / 2, -h / 2, SLICE + 0.7, h);
      ctx.restore();
    }
  }

  /** Ash behind the flame, fading back to the tail tip, with an ember at the burn point. */
  function drawAsh(to: number) {
    if (!ctx) return;
    const ashLen = Math.min(to, g.d * 0.9);
    if (ashLen <= 0) return;
    for (let s = Math.max(0, to - ashLen); s < to; s += SLICE) {
      const p = at(s);
      const k = 1 - (to - s) / ashLen;
      ctx.fillStyle = `rgba(${40 + 60 * k},${30 + 25 * k},${24 + 10 * k},${0.15 + 0.7 * k})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, g.th * 0.32 * (0.5 + 0.5 * k), 0, Math.PI * 2);
      ctx.fill();
      if (k > 0.75) {
        ctx.fillStyle = `rgba(255,${120 + 80 * (k - 0.75) * 4},40,${(k - 0.75) * 3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, g.th * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** A glow, then the flame photo with its rope end on the burn point, trailing back. */
  function drawFlame(p: { x: number; y: number; a: number }) {
    if (!ctx) return;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, g.th * 5);
    glow.addColorStop(0, "rgba(255,200,90,.55)");
    glow.addColorStop(1, "rgba(255,120,30,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, g.th * 5, 0, Math.PI * 2);
    ctx.fill();
    if (!flame.complete || flame.naturalWidth === 0) return;
    const sc = ((g.th * 2.8) / flame.naturalHeight) * (0.9 + Math.random() * 0.2);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.scale(sc, sc * (0.9 + Math.random() * 0.2));
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.95;
    ctx.drawImage(
      flame,
      -flame.naturalWidth * FLAME_ANCHOR_X,
      -flame.naturalHeight * FLAME_ANCHOR_Y,
    );
    ctx.restore();
  }

  function spark(x: number, y: number, a: number, v: number, life: number): Particle {
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, smoke: false, r: 0 };
  }

  function drawParticles(f: number) {
    if (!ctx) return;
    const scale = g.d / TUNED_D;
    const drag = Math.pow(0.97, f);
    for (const p of parts) {
      const k = p.life / p.max;
      if (!p.smoke) {
        ctx.strokeStyle = `hsla(${35 + Math.random() * 15},100%,${60 + 30 * k}%,${k})`;
        ctx.lineWidth = Math.max(1, g.th * 0.22);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
        p.vy += 0.06 * scale * f;
      } else {
        ctx.fillStyle = `rgba(150,140,130,${0.18 * k})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.8 - k), 0, Math.PI * 2);
        ctx.fill();
        p.r *= Math.pow(1.01, f);
      }
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.vx *= drag;
      p.life -= f;
    }
    parts = parts.filter((p) => p.life > 0);
  }

  function rest() {
    mode = "rest";
    cancelAnimationFrame(raf);
    raf = 0;
    parts = [];
    begin();
    drawRope(0);
  }

  function measure() {
    const d = photo.offsetWidth;
    if (d <= 0) return;
    g = fuseGeometry(d);
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(g.w * dpr);
    canvas.height = Math.round(g.w * dpr);
    // Resizing the canvas wipes it: put the rope back if it is at rest.
    if (mode === "rest") rest();
  }

  function burn(ms: number, onDone: () => void) {
    if (!ctx) {
      onDone();
      return;
    }
    mode = "burn";
    parts = [];
    const t0 = performance.now();
    let last = t0;

    const frame = (now: number) => {
      const f = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      begin();
      const scale = g.d / TUNED_D;
      const c = g.w / 2;
      if (mode === "burn") {
        const p = Math.min(1, (now - t0) / ms);
        const at0 = at(p * g.len);
        // Sparks thrown off the burn point, and now and then a puff of smoke.
        for (let i = 0; i < 3; i++) {
          parts.push(
            spark(at0.x, at0.y, Math.random() * Math.PI * 2, (0.6 + Math.random() * 2.2) * scale, 14 + Math.random() * 16),
          );
          parts[parts.length - 1].vy -= 0.4;
        }
        if (Math.random() < 0.5) {
          parts.push({
            x: at0.x,
            y: at0.y,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.35 - Math.random() * 0.3,
            life: 50,
            max: 50,
            smoke: true,
            r: g.th * 0.8,
          });
        }
        if (p >= 1) {
          mode = "done";
          // The last burst, all round the ring.
          for (let i = 0; i < 40; i++) {
            const a = Math.random() * Math.PI * 2;
            parts.push(
              spark(c + g.r * Math.cos(a), c + g.r * Math.sin(a), a, (1 + Math.random() * 4) * scale, 20 + Math.random() * 20),
            );
          }
          onDone();
        } else {
          drawRope(p * g.len);
          drawAsh(p * g.len);
          drawFlame(at0);
        }
      }
      drawParticles(f);
      if (mode === "burn" || parts.length > 0) raf = requestAnimationFrame(frame);
      else {
        raf = 0;
        begin();
      }
    };
    raf = requestAnimationFrame(frame);
  }

  rope.onload = () => {
    if (mode === "rest") rest();
  };
  rope.src = ROPE_SRC;
  flame.src = FLAME_SRC;
  measure();

  return {
    measure,
    rest,
    clear() {
      mode = "done";
      cancelAnimationFrame(raf);
      raf = 0;
      parts = [];
      begin();
    },
    burn,
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      rope.onload = null;
    },
  };
}
