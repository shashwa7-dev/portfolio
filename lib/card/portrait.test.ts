import { describe, it, expect } from "vitest";
import { mulberry32 } from "./seed";
import { drawPortrait } from "./portrait";
import type { Cast } from "./types";

/**
 * Canvas is not available in Node, so this stub is a hand-written recording
 * surface covering only the CanvasRenderingContext2D members drawPortrait
 * actually touches. It is not a general canvas polyfill and should not grow
 * into one: any method drawPortrait starts calling that is missing here will
 * throw "is not a function", which is exactly the failure this test wants to
 * see when the drawing code drifts.
 */
function makeStubCtx() {
  const log: string[] = [];
  const ctx = {
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    lineCap: "butt",
    lineJoin: "miter",
    globalAlpha: 1,
    beginPath() {
      log.push("beginPath");
    },
    moveTo(_x: number, _y: number) {
      log.push("moveTo");
    },
    lineTo(_x: number, _y: number) {
      log.push("lineTo");
    },
    quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number) {
      log.push("quadraticCurveTo");
    },
    arc(_x: number, _y: number, _r: number, _start: number, _end: number) {
      log.push("arc");
    },
    ellipse(
      _x: number,
      _y: number,
      _rx: number,
      _ry: number,
      _rotation: number,
      _start: number,
      _end: number
    ) {
      log.push("ellipse");
    },
    closePath() {
      log.push("closePath");
    },
    stroke() {
      log.push("stroke");
    },
    fill() {
      log.push("fill");
    },
    save() {
      log.push("save");
    },
    restore() {
      log.push("restore");
    },
    clip() {
      log.push("clip");
    },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, log };
}

const HAIR: Cast["hair"][] = ["short", "long", "bob", "curls", "buzz", "topknot"];
const GLASSES: Cast["glasses"][] = ["none", "round", "square"];
const HEADWEAR: Cast["headwear"][] = ["none", "flatCap", "beanie"];
const BROW: Cast["brow"][] = ["flat", "arched", "worried"];
const MOUTH: Cast["mouth"][] = ["smile", "line", "open"];

/**
 * Six explicit casts, cycling every trait's array by index. Six is a
 * multiple of the length of every trait array except hair (which has
 * exactly six values), so every union member of every trait appears at
 * least once across this set.
 */
function allCasts(): Cast[] {
  const casts: Cast[] = [];
  for (let i = 0; i < HAIR.length; i++) {
    casts.push({
      hair: HAIR[i % HAIR.length],
      glasses: GLASSES[i % GLASSES.length],
      headwear: HEADWEAR[i % HEADWEAR.length],
      brow: BROW[i % BROW.length],
      mouth: MOUTH[i % MOUTH.length],
      shade: (i + 0.5) / HAIR.length,
    });
  }
  return casts;
}

describe("drawPortrait", () => {
  const box = { x: 0, y: 0, w: 160, h: 160 };

  it("covers every union member of every trait across the fixture", () => {
    const casts = allCasts();
    expect(new Set(casts.map((c) => c.hair)).size).toBe(HAIR.length);
    expect(new Set(casts.map((c) => c.glasses)).size).toBe(GLASSES.length);
    expect(new Set(casts.map((c) => c.headwear)).size).toBe(HEADWEAR.length);
    expect(new Set(casts.map((c) => c.brow)).size).toBe(BROW.length);
    expect(new Set(casts.map((c) => c.mouth)).size).toBe(MOUTH.length);
  });

  for (const cast of allCasts()) {
    const label = `${cast.hair}/${cast.glasses}/${cast.headwear}/${cast.brow}/${cast.mouth}`;

    it(`draws without throwing for ${label}`, () => {
      const { ctx, log } = makeStubCtx();
      const R = mulberry32(1);
      expect(() => drawPortrait(ctx, cast, R, box, "#1f1d1a")).not.toThrow();

      // It actually drew something, not a silent no-op.
      expect(log.length).toBeGreaterThan(0);
      expect(log).toContain("stroke");
      expect(log).toContain("fill");

      // save/restore must balance. An unbalanced pair leaks clip and
      // transform state into whatever draws next on a shared context, which
      // on the finished card is the postmark and the lettering.
      const saves = log.filter((n) => n === "save").length;
      const restores = log.filter((n) => n === "restore").length;
      expect(restores).toBe(saves);
    });
  }

  it("balances save/restore across a full grid of casts on one shared context", () => {
    const { ctx, log } = makeStubCtx();
    let i = 0;
    for (const cast of allCasts()) {
      const R = mulberry32(i * 7919);
      drawPortrait(
        ctx,
        cast,
        R,
        { x: (i % 6) * 160, y: Math.floor(i / 6) * 160, w: 160, h: 160 },
        "#1f1d1a"
      );
      i++;
    }
    const saves = log.filter((n) => n === "save").length;
    const restores = log.filter((n) => n === "restore").length;
    expect(saves).toBeGreaterThan(0);
    expect(restores).toBe(saves);
  });
});
