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
 *
 * Two parallel records come out of every draw:
 * - `log`: method names only, for the "did it draw at all" and
 *   "save/restore balanced" assertions, where argument values do not matter.
 * - `calls`: method name plus rounded numeric arguments, for the
 *   differential assertions. Method-name sequence alone cannot tell a
 *   correctly drawn trait from a deleted or mispositioned one, since the
 *   face, brows, eyes, nose and mouth always draw regardless of which
 *   branch a trait takes; the argument values are what actually fingerprint
 *   a drawing. Rounded to 2dp so the pencil()-jitter noise floor does not
 *   make every call unique by accident.
 */
function makeStubCtx() {
  const log: string[] = [];
  const calls: string[] = [];
  const rec = (name: string, args: number[] = []) => {
    log.push(name);
    calls.push(args.length ? `${name}(${args.map((n) => n.toFixed(2)).join(",")})` : name);
  };
  const ctx = {
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    lineCap: "butt",
    lineJoin: "miter",
    globalAlpha: 1,
    beginPath() {
      rec("beginPath");
    },
    moveTo(x: number, y: number) {
      rec("moveTo", [x, y]);
    },
    lineTo(x: number, y: number) {
      rec("lineTo", [x, y]);
    },
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
      rec("quadraticCurveTo", [cpx, cpy, x, y]);
    },
    arc(x: number, y: number, r: number, start: number, end: number) {
      rec("arc", [x, y, r, start, end]);
    },
    ellipse(
      x: number,
      y: number,
      rx: number,
      ry: number,
      rotation: number,
      start: number,
      end: number
    ) {
      rec("ellipse", [x, y, rx, ry, rotation, start, end]);
    },
    closePath() {
      rec("closePath");
    },
    stroke() {
      rec("stroke");
    },
    fill() {
      rec("fill");
    },
    save() {
      rec("save");
    },
    restore() {
      rec("restore");
    },
    clip() {
      rec("clip");
    },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, log, calls };
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

/**
 * The tests above only prove "something drew and state did not leak". They
 * cannot catch a broken trait branch: the face outline, brows, eyes, nose
 * and mouth always stroke and fill regardless of which trait a cast carries,
 * so deleting the glasses block entirely, or drawing headwear off-canvas,
 * would still satisfy every assertion above. These tests fingerprint the
 * full call sequence (method name plus rounded arguments) and assert that
 * changing one trait, with every other trait held constant, changes the
 * fingerprint. The hair test is the one that matters most: it is the one
 * that catches three of six hair styles silently sharing one geometry.
 */
describe("drawPortrait — trait branches are actually distinct", () => {
  const box = { x: 0, y: 0, w: 160, h: 160 };
  const base: Cast = {
    hair: "short",
    glasses: "none",
    headwear: "none",
    brow: "flat",
    mouth: "smile",
    shade: 0.5,
  };

  function signature(cast: Cast): string {
    const { ctx, calls } = makeStubCtx();
    // Same fixed seed for every cast under comparison, so any difference in
    // the fingerprint comes from the trait branch, not from a different
    // random stream.
    drawPortrait(ctx, cast, mulberry32(1), box, "#1f1d1a");
    return calls.join("|");
  }

  it("gives all six hair styles distinct signatures, other traits held constant", () => {
    const sigs = HAIR.map((hair) => signature({ ...base, hair }));
    expect(new Set(sigs).size).toBe(HAIR.length);
  });

  it("draws round glasses differently from no glasses", () => {
    expect(signature({ ...base, glasses: "round" })).not.toBe(
      signature({ ...base, glasses: "none" })
    );
  });

  it("draws square glasses differently from no glasses", () => {
    expect(signature({ ...base, glasses: "square" })).not.toBe(
      signature({ ...base, glasses: "none" })
    );
  });

  it("draws a beanie differently from no headwear", () => {
    expect(signature({ ...base, headwear: "beanie" })).not.toBe(
      signature({ ...base, headwear: "none" })
    );
  });

  it("draws a flat cap differently from no headwear", () => {
    expect(signature({ ...base, headwear: "flatCap" })).not.toBe(
      signature({ ...base, headwear: "none" })
    );
  });
});
