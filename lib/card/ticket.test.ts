import { describe, it, expect } from "vitest";
import { drawTicket, CARD_W, CARD_H } from "./ticket";
import { ISSUES } from "./issues";
import { serialFrom } from "./seed";
import type { CardData, IssueKey } from "./types";

/**
 * Same recording-stub shape as lib/card/engine/engine.test.ts and
 * lib/card/sticker.test.ts, widened with the two methods drawTicket calls
 * directly that neither of those stubs needed: clearRect (the card wipe)
 * and strokeRect (the stamp's inner rules). fillStyle/strokeStyle/font stay
 * backed by real getter/setter pairs, since that is the only channel the
 * dark-stock and no-sticker assertions below have into what actually got
 * painted.
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
      rec(
        name,
        args.filter((a): a is number => typeof a === "number")
      );

  const ctx: Record<string, unknown> = {
    lineWidth: 0,
    lineCap: "butt",
    lineJoin: "miter",
    globalAlpha: 1,
    textAlign: "start",
    textBaseline: "alphabetic",
    shadowColor: "",
    shadowBlur: 0,
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
      rec("createLinearGradient", args);
      return { addColorStop() {} };
    },
    createRadialGradient: () => ({ addColorStop() {} }),
    measureText: () => ({ width: 10 }),
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

const FONTS = { hand: "cursive", sticker: "system-ui, sans-serif", mono: "ui-monospace, monospace" };

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

describe("drawTicket", () => {
  it("draws every issue without throwing", () => {
    for (const key of KEYS) {
      const { ctx } = makeStubCtx();
      const data = cardFor(`smoke-${key}`, key);
      expect(() => drawTicket(ctx, data, CARD_W, CARD_H, FONTS)).not.toThrow();
    }
  });

  it("balances save and restore for every issue", () => {
    for (const key of KEYS) {
      const { ctx, log } = makeStubCtx();
      drawTicket(ctx, cardFor(`balance-${key}`, key), CARD_W, CARD_H, FONTS);
      const saves = log.filter((n) => n === "save").length;
      const restores = log.filter((n) => n === "restore").length;
      expect(restores).toBe(saves);
    }
  });

  it("draws no sticker for Definitive, and a sticker for every other issue", () => {
    // createLinearGradient is only ever called from drawSticker: the engine
    // itself never calls a gradient factory (checked against
    // lib/card/engine/portrait-engine.js), so its presence or absence is a
    // clean signal for "was a sticker painted."
    const { ctx: defCtx, log: defLog } = makeStubCtx();
    drawTicket(defCtx, cardFor("sticker-definitive", "definitive"), CARD_W, CARD_H, FONTS);
    expect(defLog).not.toContain("createLinearGradient");

    for (const key of ["commemorative", "firstDay", "misprint", "inverted"] as IssueKey[]) {
      const { ctx, log } = makeStubCtx();
      drawTicket(ctx, cardFor(`sticker-${key}`, key), CARD_W, CARD_H, FONTS);
      expect(log).toContain("createLinearGradient");
    }
  });

  it("paints Inverted's stock in the dark colour, not the warm one", () => {
    // The stock roundRect is the very first fillStyle assignment in the
    // whole draw (engine construction does not paint), which is what makes
    // this precise: the vendored engine's own portrait wash also happens to
    // use "#f6f1e5" as a highlight colour internally (see PAPER in
    // portrait-engine.js), for reasons that have nothing to do with card
    // stock. A blanket "#f6f1e5 must not appear anywhere in the log" check
    // would fail on that unrelated coincidence, so this checks the specific
    // assignment that paints the card background instead.
    const { ctx, calls } = makeStubCtx();
    drawTicket(ctx, cardFor("dark-stock", "inverted"), CARD_W, CARD_H, FONTS);
    const firstFillStyle = calls.find((c) => c.startsWith("fillStyle="));
    expect(firstFillStyle).toBe("fillStyle=#17161a");
  });

  it("paints the stamp itself cream on Inverted, matching the paleness of Definitive's stamp", () => {
    // The vendored engine only ever draws dark ink on light paper (it has
    // no pale-on-dark mode), so the stamp rectangle has to stay pale in
    // every card mode. The second fillStyle assignment in the whole draw
    // is always the stamp fill (first is the stock, third is perforate()'s
    // own re-assignment of the stock colour for its punched bites), which
    // is what makes this precise without depending on the engine's
    // internal fillStyle churn.
    //
    // Inverted's stamp ("#f6f1e5") and Definitive's ("#fdfaf2") are not
    // literally the same hex: this fix only ever touched DARK.stamp, and
    // LIGHT.stamp was already a slightly different pale cream from
    // LIGHT.stock by design (the two shades give the stamp paper a hair of
    // contrast against the card stock even in light mode). "Agree" is
    // checked as both being pale, not as a byte-for-byte match: a
    // perceived-luminance floor cleanly separates this pair from both the
    // dark stocks (~0.09) and the old, wrong DARK.stamp ("#201f24", ~0.12).
    const luminance = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    const inverted = makeStubCtx();
    drawTicket(inverted.ctx, cardFor("stamp-cream-inverted", "inverted"), CARD_W, CARD_H, FONTS);
    const invertedStamp = inverted.calls.filter((c) => c.startsWith("fillStyle="))[1];
    expect(invertedStamp).toBe("fillStyle=#f6f1e5");

    const definitive = makeStubCtx();
    drawTicket(definitive.ctx, cardFor("stamp-cream-definitive", "definitive"), CARD_W, CARD_H, FONTS);
    const definitiveStamp = definitive.calls.filter((c) => c.startsWith("fillStyle="))[1];
    expect(definitiveStamp).toBe("fillStyle=#fdfaf2");

    const invertedLum = luminance(invertedStamp.slice("fillStyle=".length));
    const definitiveLum = luminance(definitiveStamp.slice("fillStyle=".length));
    expect(invertedLum).toBeGreaterThan(0.85);
    expect(definitiveLum).toBeGreaterThan(0.85);
    expect(Math.abs(invertedLum - definitiveLum)).toBeLessThan(0.05);
  });

  it("keeps the stamp-foot lettering (shashwa7.in, one visit) legible on Inverted's cream stamp: this is the regression the stamp-colour fix could introduce", () => {
    // The foot lettering sits on the stamp, not the stock, so it must stay
    // on a colour that reads against cream regardless of card mode. The
    // code already reaches for P.faint here rather than P.ink, and
    // LIGHT.faint and DARK.faint are the same value, so this is a
    // guard against a future edit routing it through P.ink instead, which
    // on Inverted (DARK.ink = pale "#e8e3d8") would be nearly invisible on
    // the now-cream stamp. Located by the foot text's y coordinate
    // (sy + sh * 0.905), since fillText's leading string argument is
    // stripped by this stub's numeric-only argument filter.
    const h = CARD_H;
    const footY = h * 0.101 + h * 0.507 * 0.905;

    const { ctx, calls } = makeStubCtx();
    drawTicket(ctx, cardFor("stamp-foot-ink", "inverted"), CARD_W, CARD_H, FONTS);

    const footTextIndex = calls.findIndex((c) => {
      if (!c.startsWith("fillText(")) return false;
      const nums = c.slice("fillText(".length, -1).split(",").map(Number);
      const y = nums[nums.length - 1];
      return Math.abs(y - footY) < 0.01;
    });
    expect(footTextIndex).toBeGreaterThan(-1);

    let inkAtFoot: string | undefined;
    for (let i = footTextIndex; i >= 0; i--) {
      if (calls[i].startsWith("fillStyle=")) {
        inkAtFoot = calls[i].slice("fillStyle=".length);
        break;
      }
    }
    expect(inkAtFoot).toBe("#8a8175");
    expect(inkAtFoot).not.toBe("#e8e3d8");
  });

  it("leaves every other issue off the dark stock colour", () => {
    for (const key of ["definitive", "commemorative", "firstDay", "misprint"] as IssueKey[]) {
      const { ctx, calls } = makeStubCtx();
      drawTicket(ctx, cardFor(`light-stock-${key}`, key), CARD_W, CARD_H, FONTS);
      expect(calls).toContain("fillStyle=#f6f1e5");
      expect(calls).not.toContain("fillStyle=#17161a");
    }
  });

  it("issues strictly more drawing calls for Misprint than Definitive on the same id, since the plate strikes the frame and the portrait twice", () => {
    const id = "same-visitor";
    const { ctx: defCtx, log: defLog } = makeStubCtx();
    drawTicket(defCtx, cardFor(id, "definitive"), CARD_W, CARD_H, FONTS);

    const { ctx: misCtx, log: misLog } = makeStubCtx();
    drawTicket(misCtx, cardFor(id, "misprint"), CARD_W, CARD_H, FONTS);

    expect(misLog.length).toBeGreaterThan(defLog.length);
  });

  it("is deterministic: the same CardData drawn twice produces identical call logs", () => {
    const data = cardFor("determinism-check", "commemorative");
    const a = makeStubCtx();
    drawTicket(a.ctx, data, CARD_W, CARD_H, FONTS);

    const b = makeStubCtx();
    drawTicket(b.ctx, data, CARD_W, CARD_H, FONTS);

    expect(b.calls).toEqual(a.calls);
  });
});
