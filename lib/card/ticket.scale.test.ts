import { describe, it, expect, vi } from "vitest";
import { drawTicket, CARD_W, CARD_H } from "./ticket";
import { ISSUES } from "./issues";
import { serialFrom } from "./seed";
import type { CardData, IssueKey } from "./types";

/**
 * A mutable flag, shared between the vi.mock factory below and
 * makeSpatialStubCtx's lineWidth setter, that is true only while a call
 * originating inside drawSticker is on the stack. Declared through
 * vi.hoisted so it exists by the time vi.mock's factory runs (vi.mock calls
 * are hoisted above imports, so a plain `let` here would not yet be
 * initialised when the factory first executes).
 */
const stickerState = vi.hoisted(() => ({ inside: false }));

/**
 * Partially mocks drawSticker so its own lineWidth assignments can be told
 * apart from ticket.ts's, without changing what it actually draws. This is
 * the one legitimate exclusion left in this file: drawSticker's hairline
 * stroke clamps to Math.max(0.5, fontPx * 0.012), a minimum-visible-width
 * floor that is legitimate, already-tested behaviour
 * (lib/card/sticker.test.ts) and is not linear by design, so it would fail
 * a strict scale check for a reason outside ticket.ts's control. Everything
 * ticket.ts sets on lineWidth itself (the stamp frame strokes, the cancel's
 * two rings, the tear line) has no such non-linearity and belongs in the
 * scale check like every other spatial value.
 */
vi.mock("@/lib/card/sticker", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/card/sticker")>();
  return {
    ...actual,
    drawSticker: (...args: Parameters<typeof actual.drawSticker>) => {
      stickerState.inside = true;
      try {
        return actual.drawSticker(...args);
      } finally {
        stickerState.inside = false;
      }
    },
  };
});

/**
 * The scale-invariance test for drawTicket. Every measurement in ticket.ts
 * is meant to be a fraction of w or h, which is the whole reason the same
 * function serves the on-screen preview, the 1200x1500 export and the
 * gallery thumbnails. A single hardcoded pixel value breaks that silently:
 * this test draws the same card at two sizes and checks that every spatial
 * argument recorded at the larger size is the smaller size's value times
 * the scale factor.
 *
 * The vendored portrait engine is mocked out for this file only. Its own
 * drawPortrait deliberately does NOT scale linearly: see the K correction
 * in portrait-engine.js ("A drawing made bigger is not the same drawing
 * scaled up") that thins texture lines relatively as the cell grows, plus
 * jitter ranges like rr(R,2.6,3.8) that are absolute pixel amounts,
 * independent of cell size. That is intentional, tested behaviour of the
 * engine (lib/card/engine/engine.test.ts), not a bug, and it would make a
 * blanket "every coordinate scales" assertion fail on code this file does
 * not own. What ticket.ts owns, and what this test exists to prove, is the
 * cell it hands the engine (sx, sy, sw, sh, pBox, the misprint offset, the
 * inverted flip) and everything else it draws directly. The mock's own
 * portrait() paints one rect from the cell it was given, so a hardcoded
 * pixel anywhere in ticket.ts's own coordinate math still shows up as a
 * rect that failed to scale.
 */
vi.mock("@/lib/card/engine/portrait-engine", () => ({
  createEngine: (ctx: CanvasRenderingContext2D) => ({
    portrait: (
      _name: string,
      cell: { x: number; y: number; w: number; h: number }
    ) => {
      ctx.save();
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
      ctx.restore();
      return { hairStyle: "bob", glasses: null, headwear: null, present: "any" };
    },
    handwrite: () => 0,
    castTraits: () => ({ hairStyle: "bob", glasses: null, headwear: null, present: "any" }),
  }),
}));

type SpatialCall = { method: string; args: number[] };

/**
 * Which numeric argument indices of a call are spatial (a coordinate or a
 * length that must scale with the canvas) versus incidental (an angle, a
 * count, a flag). Everything not listed defaults to "every numeric arg is
 * spatial", which is correct for the methods drawTicket and drawSticker
 * actually call: moveTo/lineTo/translate (x, y), arcTo (x1,y1,x2,y2,radius),
 * fillRect/strokeRect/clearRect (x,y,w,h), fillText/strokeText (x,y once
 * the leading string argument is filtered out), createLinearGradient
 * (x0,y0,x1,y1), and the two dash lengths in setLineDash.
 *
 * "arc" is the one call with a mixed signature: (cx, cy, r, startAngle,
 * endAngle[, anticlockwise]). Only the first three scale; the sweep angles
 * are always literal 0 and Math.PI * 2 in this codebase and must not be
 * checked. "rotate" takes only an angle, so it is excluded outright.
 */
const SPATIAL_INDICES: Record<string, number[] | "all" | "none"> = {
  arc: [0, 1, 2],
  rotate: "none",
};

function spatialIndicesFor(method: string, argCount: number): number[] {
  const rule = SPATIAL_INDICES[method] ?? "all";
  if (rule === "none") return [];
  if (rule === "all") return Array.from({ length: argCount }, (_, i) => i);
  return rule;
}

/**
 * A recording stub built for this one purpose: every canvas call becomes an
 * entry of {method, args}, with args flattened one level (so the two
 * lengths inside setLineDash's array argument are captured, not dropped)
 * and non-numeric values (the fillText/strokeText leading string) filtered
 * out. lineWidth is tracked as a synthetic "lineWidth" call, since a
 * hardcoded stroke width is exactly the kind of bug this test exists to
 * catch and it would otherwise be invisible: it is a plain property in
 * every other card test in this repo.
 *
 * measureText is the one place this stub has to be more than a pass-through
 * mock: it must return a width proportional to the *currently set* font
 * size, parsed off ctx.font, or every text position ticket.ts derives from
 * measureText (the letter-spaced SERIAL/ISSUE/ORIGIN/SHARE rows, the
 * sticker's gradient bounds) would fail to scale for a reason that lives in
 * this stub, not in ticket.ts. A canvas backed by a real font does this for
 * free; node has no canvas, so the stub has to say what a proportionally
 * scaled font would measure.
 */
function makeSpatialStubCtx() {
  const spatial: SpatialCall[] = [];
  let font = "0px sans-serif";

  const flattenNumbers = (args: unknown[]): number[] => {
    const out: number[] = [];
    for (const a of args) {
      if (typeof a === "number") out.push(a);
      else if (Array.isArray(a)) {
        for (const v of a) if (typeof v === "number") out.push(v);
      }
    }
    return out;
  };

  const method =
    (name: string) =>
    (...args: unknown[]) => {
      const nums = flattenNumbers(args);
      const keep = spatialIndicesFor(name, nums.length);
      spatial.push({ method: name, args: keep.map((i) => nums[i]) });
    };

  const ctx: Record<string, unknown> = {
    lineCap: "butt",
    lineJoin: "miter",
    globalAlpha: 1,
    textAlign: "start",
    textBaseline: "alphabetic",
    shadowColor: "",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalCompositeOperation: "source-over",
    filter: "none",
    beginPath: method("beginPath"),
    moveTo: method("moveTo"),
    lineTo: method("lineTo"),
    quadraticCurveTo: method("quadraticCurveTo"),
    bezierCurveTo: method("bezierCurveTo"),
    arc: method("arc"),
    arcTo: method("arcTo"),
    ellipse: method("ellipse"),
    rect: method("rect"),
    fillRect: method("fillRect"),
    strokeRect: method("strokeRect"),
    clearRect: method("clearRect"),
    closePath: method("closePath"),
    stroke: method("stroke"),
    fill: method("fill"),
    save: method("save"),
    restore: method("restore"),
    clip: method("clip"),
    translate: method("translate"),
    rotate: method("rotate"),
    scale: method("scale"),
    setLineDash: method("setLineDash"),
    drawImage: method("drawImage"),
    putImageData: method("putImageData"),
    fillText: method("fillText"),
    strokeText: method("strokeText"),
    createPattern: () => ({}),
    createLinearGradient: (...args: unknown[]) => {
      method("createLinearGradient")(...args);
      return { addColorStop() {} };
    },
    createRadialGradient: () => ({ addColorStop() {} }),
    measureText: (text: string) => {
      const px = parseFloat(font) || 0;
      // A rough, deterministic per-character width. What matters is not the
      // number itself but that it is exactly proportional to the current
      // font's pixel size, which is itself w or h times a fraction.
      return { width: Array.from(text).length * px * 0.56 };
    },
  };

  let fillStyle = "";
  let strokeStyle = "";
  let shadowBlur = 0;
  Object.defineProperties(ctx, {
    fillStyle: { get: () => fillStyle, set: (v: string) => { fillStyle = v; } },
    strokeStyle: { get: () => strokeStyle, set: (v: string) => { strokeStyle = v; } },
    shadowBlur: { get: () => shadowBlur, set: (v: number) => { shadowBlur = v; } },
    font: { get: () => font, set: (v: string) => { font = v; } },
  });

  // lineWidth IS tracked as a spatial value here, unlike every other card
  // stub in this repo (lib/card/engine/engine.test.ts,
  // lib/card/sticker.test.ts): ticket.ts sets six lineWidth values of its
  // own (the stamp frame strokes, the cancel's two rings, the tear line),
  // and a hardcoded pixel among those would otherwise be invisible to this
  // test, exactly the kind of bug it exists to catch. Assignments made
  // while a call is inside drawSticker are excluded, per the vi.mock above:
  // that function's own hairline clamp is legitimate, tested, non-linear
  // behaviour that this file does not own.
  let lineWidthValue = 0;
  Object.defineProperty(ctx, "lineWidth", {
    get: () => lineWidthValue,
    set: (v: number) => {
      lineWidthValue = v;
      if (!stickerState.inside) spatial.push({ method: "lineWidth", args: [v] });
    },
  });

  return { ctx: ctx as unknown as CanvasRenderingContext2D, spatial };
}

const FONTS = {
  hand: "cursive",
  sticker: "system-ui, sans-serif",
  mono: "ui-monospace, monospace",
  mark: {} as unknown as HTMLImageElement,
};

function cardFor(id: string, key: IssueKey): CardData {
  return {
    visitorId: id,
    name: "Visitor",
    serial: serialFrom(id),
    issue: ISSUES[key],
    origin: "Bengaluru, IN",
    city: "Bengaluru",
    date: "23 Aug 2026",
  };
}

const KEYS: IssueKey[] = ["definitive", "commemorative", "firstDay", "misprint", "inverted"];

// 268x335 is an arbitrary small thumbnail size, chosen only to be far from
// the export size below. 1200x1500 is CARD_W x CARD_H, the export size. Both
// share the 4:5 aspect ratio, so a single scalar covers every measurement
// regardless of whether it was written against w or h: 1200/268 and 1500/335
// are the same number.
const SMALL_W = 268, SMALL_H = 335;
const SCALE = CARD_W / SMALL_W;

describe("drawTicket — scale invariance", () => {
  it("has one shared scale factor for width and height", () => {
    expect(CARD_H / SMALL_H).toBeCloseTo(SCALE, 9);
  });

  for (const key of KEYS) {
    it(`scales every spatial coordinate linearly for the ${key} issue`, () => {
      const small = makeSpatialStubCtx();
      drawTicket(small.ctx, cardFor(`scale-${key}`, key), SMALL_W, SMALL_H, FONTS);

      const large = makeSpatialStubCtx();
      drawTicket(large.ctx, cardFor(`scale-${key}`, key), CARD_W, CARD_H, FONTS);

      // Same code path taken at both sizes: the sequence of calls must match
      // exactly, since branching in drawTicket depends only on data.issue,
      // never on w or h.
      expect(large.spatial.length).toBe(small.spatial.length);

      for (let i = 0; i < small.spatial.length; i++) {
        const s = small.spatial[i];
        const l = large.spatial[i];
        expect(l.method, `call ${i} method`).toBe(s.method);
        expect(l.args.length, `call ${i} (${s.method}) arg count`).toBe(s.args.length);
        for (let j = 0; j < s.args.length; j++) {
          expect(
            l.args[j],
            `call ${i} (${s.method}) arg ${j}: ${s.args[j]} * ${SCALE} !== ${l.args[j]}`
          ).toBeCloseTo(s.args[j] * SCALE, 1);
        }
      }
    });
  }
});
