import { describe, it, expect } from "vitest";
import { drawSticker } from "./sticker";
import { ISSUES } from "./issues";
import { hashStr, mulberry32 } from "./seed";

/**
 * Same recording-stub shape as lib/card/engine/engine.test.ts, trimmed to
 * the surface drawSticker actually calls: fillText, strokeText, save,
 * restore, createLinearGradient (with addColorStop), measureText, plus the
 * settable properties the sticker assigns along the way. fillStyle and
 * strokeStyle are backed by real getter/setter pairs so assignments land in
 * `calls`, which is what the Inverted-edge-colour assertion depends on.
 */
function makeStubCtx() {
  const log: string[] = [];
  const calls: string[] = [];
  const rec = (name: string, args: unknown[] = []) => {
    log.push(name);
    calls.push(args.length ? `${name}(${args.join(",")})` : name);
  };
  const method =
    (name: string) =>
    (...args: unknown[]) =>
      rec(name, args);

  const ctx: Record<string, unknown> = {
    lineWidth: 0,
    lineJoin: "miter",
    miterLimit: 10,
    textAlign: "start",
    textBaseline: "alphabetic",
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    save: method("save"),
    restore: method("restore"),
    translate: method("translate"),
    rotate: method("rotate"),
    fillText: method("fillText"),
    strokeText: method("strokeText"),
    measureText: () => ({ width: 10 }),
    createLinearGradient: (...args: unknown[]) => {
      rec("createLinearGradient", args);
      return { addColorStop() {} };
    },
  };

  let fillStyle = "";
  let strokeStyle = "";
  let font = "";
  Object.defineProperties(ctx, {
    fillStyle: {
      get: () => fillStyle,
      set: (v: string) => {
        fillStyle = v;
        calls.push(`fillStyle=${v}`);
      },
    },
    strokeStyle: {
      get: () => strokeStyle,
      set: (v: string) => {
        strokeStyle = v;
        calls.push(`strokeStyle=${v}`);
      },
    },
    font: {
      get: () => font,
      set: (v: string) => {
        font = v;
        calls.push(`font=${v}`);
      },
    },
  });

  return { ctx: ctx as unknown as CanvasRenderingContext2D, log, calls };
}

const GRADIENT_ISSUES = ["commemorative", "firstDay", "misprint", "inverted"] as const;

describe("drawSticker", () => {
  it("draws each gradient issue without throwing", () => {
    for (const key of GRADIENT_ISSUES) {
      const { ctx } = makeStubCtx();
      const R = mulberry32(hashStr(`sticker-${key}`));
      expect(() => {
        drawSticker(ctx, ISSUES[key].name, ISSUES[key], R, 0, 0, 22, "sans-serif", 0);
      }).not.toThrow();
    }
  });

  it("draws nothing at all for Definitive: the log is empty, not merely short", () => {
    expect(ISSUES.definitive.sticker).toBeNull();
    const { ctx, log } = makeStubCtx();
    const R = mulberry32(hashStr("sticker-definitive"));
    drawSticker(ctx, ISSUES.definitive.name, ISSUES.definitive, R, 0, 0, 22, "sans-serif", 0);
    expect(log).toEqual([]);
  });

  it("issues all four layers for a gradient issue: a die-cut stroke and multiple separate fills", () => {
    const { ctx, log } = makeStubCtx();
    const R = mulberry32(hashStr("sticker-commemorative"));
    drawSticker(ctx, ISSUES.commemorative.name, ISSUES.commemorative, R, 0, 0, 22, "sans-serif", 0);

    const strokes = log.filter((n) => n === "strokeText").length;
    const fills = log.filter((n) => n === "fillText").length;
    expect(strokes).toBeGreaterThanOrEqual(1);
    expect(fills).toBeGreaterThan(1);
  });

  it("balances save and restore, including the inner pair around the shine", () => {
    const { ctx, log } = makeStubCtx();
    const R = mulberry32(hashStr("sticker-firstDay"));
    drawSticker(ctx, ISSUES.firstDay.name, ISSUES.firstDay, R, 0, 0, 22, "sans-serif", 0);

    const saves = log.filter((n) => n === "save").length;
    const restores = log.filter((n) => n === "restore").length;
    expect(saves).toBeGreaterThan(0);
    expect(restores).toBe(saves);
  });

  it("uses a near-black edge for Inverted, not white", () => {
    const { ctx, calls } = makeStubCtx();
    const R = mulberry32(hashStr("sticker-inverted"));
    drawSticker(ctx, ISSUES.inverted.name, ISSUES.inverted, R, 0, 0, 22, "sans-serif", 0);

    const strokeStyleAssignments = calls.filter((c) => c.startsWith("strokeStyle="));
    expect(strokeStyleAssignments).toContain("strokeStyle=#100f12");
    expect(strokeStyleAssignments).not.toContain("strokeStyle=#ffffff");
  });

  it("seeds the shine angle: two different PRNGs produce different gradient coordinates", () => {
    const a = makeStubCtx();
    drawSticker(
      a.ctx, ISSUES.misprint.name, ISSUES.misprint,
      mulberry32(hashStr("visitor-a")), 0, 0, 22, "sans-serif", 0
    );

    const b = makeStubCtx();
    drawSticker(
      b.ctx, ISSUES.misprint.name, ISSUES.misprint,
      mulberry32(hashStr("visitor-b")), 0, 0, 22, "sans-serif", 0
    );

    const gradientCallsA = a.calls.filter((c) => c.startsWith("createLinearGradient"));
    const gradientCallsB = b.calls.filter((c) => c.startsWith("createLinearGradient"));

    // The first createLinearGradient call (the foil) is seed-independent,
    // fixed by measureText's stub width. The second (the shine) is the one
    // that must differ, since its coordinates come from the seeded angle.
    expect(gradientCallsA[1]).not.toEqual(gradientCallsB[1]);
  });
});
