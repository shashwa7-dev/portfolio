import { describe, it, expect } from "vitest";
import { drawTicket, CARD_W, CARD_H, STOCK } from "./ticket";
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
  // Parallel to `calls`, but keeps the actual text drawn (and its position)
  // rather than dropping it in the numeric-only filter below. tracked()
  // draws one character per fillText call, so a whole word is reconstructed
  // by grouping the characters that share a y coordinate.
  const texts: { text: string; x: number; y: number }[] = [];
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
    fillText: (text: string, x: number, y: number) => {
      rec("fillText", [x, y]);
      texts.push({ text, x, y });
    },
    strokeText: method("strokeText"),
    createPattern: () => ({}),
    createLinearGradient: (...args: unknown[]) => {
      rec("createLinearGradient", args);
      return { addColorStop() {} };
    },
    createRadialGradient: () => ({ addColorStop() {} }),
    // A width proportional to the text length and the current font size
    // (parsed off ctx.font), not a constant. A constant width would let the
    // shrink-to-fit loop, tracked()'s centring maths and the sticker's
    // width-dependent gradient run without any assertion in this file ever
    // exercising them.
    measureText: (text: string) => {
      const px = parseFloat(font) || 0;
      return { width: Array.from(text).length * px * 0.56 };
    },
  };

  let fillStyle = "";
  let strokeStyle = "";
  let font = "";
  let globalCompositeOperation = "source-over";
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
    globalCompositeOperation: {
      get: () => globalCompositeOperation,
      set: (v: string) => {
        globalCompositeOperation = v;
        calls.push(`globalCompositeOperation=${v}`);
      },
    },
  });

  return { ctx: ctx as unknown as CanvasRenderingContext2D, log, calls, texts };
}

/** Joins the characters tracked() drew at a given y (within a tolerance for
 *  float noise), in call order, to recover the word it spelled out. */
function wordAt(texts: { text: string; x: number; y: number }[], y: number, tol = 0.01): string {
  return texts
    .filter((t) => Math.abs(t.y - y) < tol)
    .map((t) => t.text)
    .join("");
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
    // Task 11 changed this from "both pale, but not byte-identical" to
    // byte-identical: DARK.stamp now equals LIGHT.stamp exactly
    // ("#fdfaf2"), since the stamp is its own sheet stuck onto whatever
    // stock the card is made of, and every card in the set should carry
    // the same paper regardless of the per-issue STOCK tint underneath it.
    const luminance = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    const inverted = makeStubCtx();
    drawTicket(inverted.ctx, cardFor("stamp-cream-inverted", "inverted"), CARD_W, CARD_H, FONTS);
    const invertedStamp = inverted.calls.filter((c) => c.startsWith("fillStyle="))[1];
    expect(invertedStamp).toBe("fillStyle=#fdfaf2");

    const definitive = makeStubCtx();
    drawTicket(definitive.ctx, cardFor("stamp-cream-definitive", "definitive"), CARD_W, CARD_H, FONTS);
    const definitiveStamp = definitive.calls.filter((c) => c.startsWith("fillStyle="))[1];
    expect(definitiveStamp).toBe("fillStyle=#fdfaf2");
    expect(invertedStamp).toBe(definitiveStamp);

    const invertedLum = luminance(invertedStamp.slice("fillStyle=".length));
    const definitiveLum = luminance(definitiveStamp.slice("fillStyle=".length));
    expect(invertedLum).toBeGreaterThan(0.85);
    expect(definitiveLum).toBeGreaterThan(0.85);
    expect(Math.abs(invertedLum - definitiveLum)).toBeLessThan(0.05);
  });

  it("keeps the stamp-foot lettering (one visit) legible on Inverted's cream stamp: this is the regression the stamp-colour fix could introduce", () => {
    // The foot lettering sits on the stamp, not the stock, so it must stay
    // on a colour that reads against cream regardless of card mode. The
    // code already reaches for P.faint here rather than P.ink, and
    // LIGHT.faint and DARK.faint are the same value, so this is a
    // guard against a future edit routing it through P.ink instead, which
    // on Inverted (DARK.ink = pale "#e8e3d8") would be nearly invisible on
    // the now-cream stamp. Located by the foot text's y coordinate
    // (TOP + sy + sh * 0.905), since fillText's leading string argument is
    // stripped by this stub's numeric-only argument filter.
    //
    // Task 11 moved shashwa7.in out of the foot and up into the top brand
    // row, and shifted the stamp (and everything below it) down by TOP, so
    // this now checks only "one visit" and includes that offset.
    const h = CARD_H;
    const TOP = h * 0.038;
    const footY = TOP + h * 0.101 + h * 0.507 * 0.905;

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

  it("leaves every other issue off the dark stock colour, and on its own STOCK entry", () => {
    // Superseded from a single shared "#f6f1e5 stock" by Task 11's per-issue
    // STOCK table: only Definitive still uses that exact hex, so this now
    // checks each issue against its own entry rather than one shared literal.
    for (const key of ["definitive", "commemorative", "firstDay", "misprint"] as IssueKey[]) {
      const { ctx, calls } = makeStubCtx();
      drawTicket(ctx, cardFor(`light-stock-${key}`, key), CARD_W, CARD_H, FONTS);
      expect(calls).toContain(`fillStyle=${STOCK[key]}`);
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

  // --- Task 11: make each issue collectible ---

  it("fills each issue's own stock colour, and all five are distinct", () => {
    const seen = new Set<string>();
    for (const key of KEYS) {
      const { ctx, calls } = makeStubCtx();
      drawTicket(ctx, cardFor(`stock-${key}`, key), CARD_W, CARD_H, FONTS);
      const firstFillStyle = calls.find((c) => c.startsWith("fillStyle="));
      expect(firstFillStyle).toBe(`fillStyle=${STOCK[key]}`);
      seen.add(STOCK[key]);
    }
    expect(seen.size).toBe(KEYS.length);
  });

  it("gives Misprint a multiply composite-operation for its offset ghosts; Definitive has none", () => {
    // globalCompositeOperation=destination-out is no longer a clean signal
    // for "this is Misprint": Task 12 made the tear-line notches real cuts
    // via destination-out on every card. "multiply" is still Misprint-only,
    // since only its portrait ghosts blend that way.
    const id = "composite-check";
    const { ctx: misCtx, calls: misCalls } = makeStubCtx();
    drawTicket(misCtx, cardFor(id, "misprint"), CARD_W, CARD_H, FONTS);
    expect(misCalls).toContain("globalCompositeOperation=multiply");

    const { ctx: defCtx, calls: defCalls } = makeStubCtx();
    drawTicket(defCtx, cardFor(id, "definitive"), CARD_W, CARD_H, FONTS);
    expect(defCalls).not.toContain("globalCompositeOperation=multiply");
  });

  it("fringes Misprint's frame rule and foot lettering in real cyan and magenta; Definitive has neither", () => {
    // The portrait ghosts stay grey (the engine owns that ink, see the
    // comment in ticket.ts), but the frame rule and the foot lettering are
    // coloured directly by ticket.ts, so those fringe in the real process
    // colours a misregistration separates.
    const CYAN = "rgba(0,132,180,0.42)";
    const MAGENTA = "rgba(190,30,120,0.38)";
    const id = "misregistration-check";

    const { ctx: misCtx, calls: misCalls } = makeStubCtx();
    drawTicket(misCtx, cardFor(id, "misprint"), CARD_W, CARD_H, FONTS);
    expect(
      misCalls.some((c) => c === `strokeStyle=${CYAN}` || c === `fillStyle=${CYAN}`)
    ).toBe(true);
    expect(
      misCalls.some((c) => c === `strokeStyle=${MAGENTA}` || c === `fillStyle=${MAGENTA}`)
    ).toBe(true);

    const { ctx: defCtx, calls: defCalls } = makeStubCtx();
    drawTicket(defCtx, cardFor(id, "definitive"), CARD_W, CARD_H, FONTS);
    expect(
      defCalls.some((c) => c === `strokeStyle=${CYAN}` || c === `fillStyle=${CYAN}`)
    ).toBe(false);
    expect(
      defCalls.some((c) => c === `strokeStyle=${MAGENTA}` || c === `fillStyle=${MAGENTA}`)
    ).toBe(false);
  });

  it("prints First day's cachet in the deep teal; Definitive records none of it", () => {
    const TEAL = "#1f6f78";
    const { ctx: fdCtx, calls: fdCalls } = makeStubCtx();
    drawTicket(fdCtx, cardFor("teal-firstday", "firstDay"), CARD_W, CARD_H, FONTS);
    expect(
      fdCalls.some((c) => c === `strokeStyle=${TEAL}` || c === `fillStyle=${TEAL}`)
    ).toBe(true);

    const { ctx: defCtx, calls: defCalls } = makeStubCtx();
    drawTicket(defCtx, cardFor("teal-definitive", "definitive"), CARD_W, CARD_H, FONTS);
    expect(
      defCalls.some((c) => c === `strokeStyle=${TEAL}` || c === `fillStyle=${TEAL}`)
    ).toBe(false);
  });

  it("draws the wordmark at the top of the card, and no longer at the stamp foot", () => {
    const { ctx, texts } = makeStubCtx();
    drawTicket(ctx, cardFor("wordmark-top", "definitive"), CARD_W, CARD_H, FONTS);

    const h = CARD_H, w = CARD_W;
    const markSize = w * 0.052;
    const topY = h * 0.052 + markSize * 0.66;
    expect(wordAt(texts, topY)).toBe("SHASHWA7.IN");

    const TOP = h * 0.038;
    const sy = TOP + h * 0.101, sh = h * 0.507;
    const footY = sy + sh * 0.905;
    expect(wordAt(texts, footY)).not.toContain("SHASHWA7.IN");
  });

  it("draws the mark image top left when provided, at the top-left position", () => {
    const fakeMark = {} as HTMLImageElement;
    const { ctx, log, calls } = makeStubCtx();
    drawTicket(ctx, cardFor("with-mark", "definitive"), CARD_W, CARD_H, { ...FONTS, mark: fakeMark });
    expect(log).toContain("drawImage");

    const w = CARD_W;
    const L = w * 0.097;
    const markSize = w * 0.052;
    const markY = CARD_H * 0.052;
    expect(calls).toContain(`drawImage(${L},${markY},${markSize},${markSize})`);
  });

  it("still runs to completion with mark: null, drawing the wordmark and no image", () => {
    const { ctx, log, texts } = makeStubCtx();
    const withNullMark = { ...FONTS, mark: null };
    expect(() =>
      drawTicket(ctx, cardFor("no-mark", "definitive"), CARD_W, CARD_H, withNullMark)
    ).not.toThrow();
    expect(log).not.toContain("drawImage");

    const h = CARD_H, w = CARD_W;
    const markSize = w * 0.052;
    const topY = h * 0.052 + markSize * 0.66;
    expect(wordAt(texts, topY)).toBe("SHASHWA7.IN");
  });

  it("draws the rarity share at the larger of the two stub sizes", () => {
    const { ctx, calls } = makeStubCtx();
    drawTicket(ctx, cardFor("share-size", "definitive"), CARD_W, CARD_H, FONTS);

    const smallFont = `${CARD_W * 0.018}px ${FONTS.mono}`;
    const bigFont = `${CARD_W * 0.026}px ${FONTS.mono}`;

    // Find the font assignment immediately preceding the share row's first
    // fillText call. tracked() draws it character by character, so the
    // first fillText after the last font= assignment before it is the one
    // that matters; both origin/date and share are drawn back to back at
    // the same y, so it is the *last* font= before the *last* run of
    // fillText calls that is under test.
    const lastFillTextIndex = calls.map((c) => c.startsWith("fillText(")).lastIndexOf(true);
    let fontBeforeShare: string | undefined;
    for (let i = lastFillTextIndex; i >= 0; i--) {
      if (calls[i].startsWith("font=")) {
        fontBeforeShare = calls[i].slice("font=".length);
        break;
      }
    }
    expect(fontBeforeShare).toBe(bigFont);
    expect(bigFont).not.toBe(smallFont);
    expect(CARD_W * 0.026).toBeGreaterThan(CARD_W * 0.018);
  });

  it("shrinks a long name to stay within the card's horizontal margins", () => {
    // 18 wide characters: the exact length the "Name on the card" input in
    // CardMinter allows (maxLength=18), and wide enough that at the base
    // font size (w * 0.1) it would run past both margins with no shrink.
    const longName = "WWWWWWWWWWWWWWWWWW";
    const { ctx, texts, calls } = makeStubCtx();
    drawTicket(ctx, { ...cardFor("long-name", "definitive"), name: longName }, CARD_W, CARD_H, FONTS);

    const nameEntry = texts.find((t) => t.text === longName);
    expect(nameEntry).toBeDefined();

    // Recover the font size drawTicket had settled on right before drawing
    // the name, the same way the share-row test above does.
    const nameCallString = `fillText(${nameEntry!.x},${nameEntry!.y})`;
    const nameIndex = calls.indexOf(nameCallString);
    let nameFont: string | undefined;
    for (let i = nameIndex; i >= 0; i--) {
      if (calls[i].startsWith("font=")) {
        nameFont = calls[i].slice("font=".length);
        break;
      }
    }
    expect(nameFont).toBeDefined();
    const namePx = parseFloat(nameFont!);
    const nameWidth = Array.from(longName).length * namePx * 0.56;

    const L = CARD_W * 0.097;
    const Rt = CARD_W * 0.903;
    const leftEdge = nameEntry!.x - nameWidth / 2;
    const rightEdge = nameEntry!.x + nameWidth / 2;
    expect(leftEdge).toBeGreaterThanOrEqual(L);
    expect(rightEdge).toBeLessThanOrEqual(Rt);
  });

  // --- Task 12: the stub's bottom rows were clipping ---

  it("keeps every stub-block text baseline at least h * 0.02 above the card's bottom edge", () => {
    // The stub is everything at or after the tear line: the SERIAL/ISSUE
    // caps labels, the serial and issue values, the origin/date line and
    // the rarity share. h * 0.8 sits below the name (h * 0.716 + TOP) and
    // the first-day cachet (h * 0.645 + TOP) in both the pre-fix and
    // post-fix layout, so it cleanly isolates stub text from everything
    // else drawn on the card without hardcoding either layout's y values.
    const h = CARD_H;
    const { ctx, texts } = makeStubCtx();
    drawTicket(ctx, cardFor("clip-check", "definitive"), CARD_W, h, FONTS);

    const stubTexts = texts.filter((t) => t.y > h * 0.8);
    expect(stubTexts.length).toBeGreaterThan(0);

    const limit = h - h * 0.02;
    for (const t of stubTexts) {
      expect(t.y, `"${t.text}" baseline at y=${t.y} must be <= ${limit}`).toBeLessThanOrEqual(limit);
    }
  });

  it("cuts the tear-line notches with destination-out instead of painting them a guessed background colour", () => {
    // A painted notch (the old #e9e2d2 / #2a282c colours) only ever
    // approximates one background and is wrong on every other one, so the
    // fix erases real alpha there instead. Both the light and dark palette's
    // old literals must be gone from the recorded calls, and a
    // globalCompositeOperation=destination-out assignment must be present.
    for (const key of ["definitive", "inverted"] as IssueKey[]) {
      const { ctx, calls } = makeStubCtx();
      drawTicket(ctx, cardFor(`notch-cut-${key}`, key), CARD_W, CARD_H, FONTS);

      expect(calls).toContain("globalCompositeOperation=destination-out");
      expect(calls).not.toContain("fillStyle=#e9e2d2");
      expect(calls).not.toContain("fillStyle=#2a282c");
    }
  });

  // --- Task 13: two visual-pass fixes ---

  it("draws the origin/date stub line at the larger size and in the faint tone, not veryFaint", () => {
    // Mirrors "draws the rarity share at the larger of the two stub sizes"
    // above: the origin line used to sit at the small w * 0.018 size in
    // P.veryFaint, the palest tone on the card, while the share beside it
    // read at w * 0.026 in P.ink. The fix brings origin up to w * 0.022 in
    // P.faint, a step below the serial/issue values but clearly legible,
    // without matching the share's own size exactly.
    const { ctx, calls } = makeStubCtx();
    drawTicket(ctx, cardFor("origin-size", "definitive"), CARD_W, CARD_H, FONTS);

    const bigFont = `${CARD_W * 0.022}px ${FONTS.mono}`;
    const smallFont = `${CARD_W * 0.018}px ${FONTS.mono}`;

    // Instead of guessing an index for the origin/date run, walk backwards
    // from the origin text itself: find the fillText whose y matches the
    // origin/date row's known y (h - h * 0.042), same technique the
    // stamp-foot-ink test above uses.
    const h = CARD_H;
    const originY = h - h * 0.042;
    const originTextIndex = calls.findIndex((c) => {
      if (!c.startsWith("fillText(")) return false;
      const nums = c.slice("fillText(".length, -1).split(",").map(Number);
      return Math.abs(nums[nums.length - 1] - originY) < 0.01;
    });
    expect(originTextIndex).toBeGreaterThan(-1);

    let fontBeforeOrigin: string | undefined;
    let fillStyleBeforeOrigin: string | undefined;
    for (let i = originTextIndex; i >= 0; i--) {
      if (fontBeforeOrigin === undefined && calls[i].startsWith("font=")) {
        fontBeforeOrigin = calls[i].slice("font=".length);
      }
      if (fillStyleBeforeOrigin === undefined && calls[i].startsWith("fillStyle=")) {
        fillStyleBeforeOrigin = calls[i].slice("fillStyle=".length);
      }
      if (fontBeforeOrigin !== undefined && fillStyleBeforeOrigin !== undefined) break;
    }

    expect(fontBeforeOrigin).toBe(bigFont);
    expect(fontBeforeOrigin).not.toBe(smallFont);
    expect(fillStyleBeforeOrigin).toBe("#8a8175"); // LIGHT.faint
    expect(fillStyleBeforeOrigin).not.toBe("#bdb4a4"); // LIGHT.veryFaint
  });

  it("keeps the name baseline at least h * 0.05 above the tear line", () => {
    // Caveat (fonts.hand) is a script face with deep loops on g, y, j, p, q:
    // 35-45% of the em in descender depth, which is 42-54px at the un-shrunk
    // w * 0.1 (120px) starting size. shrinkToFit only engages once a name's
    // width exceeds w * 0.8, so a SHORT name with a descender ("Guy",
    // "Peggy", "Joy") never shrinks and renders at the full size, tail and
    // all, while a long name is safe because it already shrank. This
    // asserts the geometric clearance the fix guarantees regardless of name
    // length, derived from h rather than a hardcoded pixel gap.
    const h = CARD_H;
    const { ctx, calls, texts } = makeStubCtx();
    const data = cardFor("descender-clearance", "definitive");
    drawTicket(ctx, data, CARD_W, h, FONTS);

    const nameEntry = texts.find((t) => t.text === data.name);
    expect(nameEntry).toBeDefined();

    // The tear line's `moveTo(0, ty)` is the only moveTo call in the whole
    // draw whose first argument is exactly 0 (roundRect's moveTo always
    // offsets by the corner radius), so it uniquely locates ty without
    // depending on any other formula in ticket.ts.
    const tearCall = calls.find((c) => c.startsWith("moveTo(0,"));
    expect(tearCall).toBeDefined();
    const tearY = Number(tearCall!.slice("moveTo(0,".length, -1));

    expect(tearY - nameEntry!.y).toBeGreaterThanOrEqual(h * 0.05);
  });

  // The two floors below (h * 0.065 ascent, h * 0.05 descent) are each
  // calibrated against REF_NAME_PX, the un-clamped w * 0.1 size a name
  // renders at when nothing constrains its height: h * 0.065 covers
  // Caveat's ~0.8em ascent there, h * 0.05 covers its ~0.45em descent.
  // These used to be unsatisfiable together on First day: the cachet's
  // rule sat only 130.5px above the tear line, 42px short of the 172.5px
  // the two floors need, no matter how the baseline was placed. The fix
  // was moving the cachet itself (tight beneath the stamp, where it reads
  // as a legend about the stamp rather than a floating line of type)
  // rather than shrinking the name to fit a band that was too small: all
  // five tiers now clear both floors at the SAME, un-clamped font size, so
  // these assert the real floors directly, on every issue, rather than a
  // ratio-preserving property.
  function recoverNamePx(
    calls: string[],
    texts: { text: string; x: number; y: number }[],
    name: string
  ): number {
    const entry = texts.find((t) => t.text === name)!;
    const callString = `fillText(${entry.x},${entry.y})`;
    const index = calls.indexOf(callString);
    for (let i = index; i >= 0; i--) {
      if (calls[i].startsWith("font=")) return parseFloat(calls[i].slice("font=".length));
    }
    throw new Error("no font= call found before the name's fillText");
  }

  it("clears both the ascender and descender floors at once, on every issue", () => {
    // Descent is always measured against the tear line. Ascent is measured
    // against whatever the band computation says sits above the name: the
    // cachet's rule on First day, or the stamp's own lower edge (recovered
    // from the stamp's fillRect(sx, sy, sw, sh), the only fillRect call
    // ticket.ts itself makes) on every other issue. First day is the tight
    // case (the cachet's rule sits well below the stamp's own lower edge),
    // so it is included here rather than singled out separately.
    const h = CARD_H;
    const NAME_ASCENT_CLEARANCE = h * 0.065;
    const NAME_DESCENT_CLEARANCE = h * 0.05;

    for (const key of KEYS) {
      const { ctx, calls, texts } = makeStubCtx();
      const data = cardFor(`both-clearances-${key}`, key);
      drawTicket(ctx, data, CARD_W, h, FONTS);

      const nameEntry = texts.find((t) => t.text === data.name);
      expect(nameEntry, `issue ${key}: name text not found`).toBeDefined();

      const tearCall = calls.find((c) => c.startsWith("moveTo(0,"));
      expect(tearCall, `issue ${key}: tear line not found`).toBeDefined();
      const tearY = Number(tearCall!.slice("moveTo(0,".length, -1));

      let aboveBottom: number;
      if (key === "firstDay") {
        const L = CARD_W * 0.097;
        const cachetCall = calls.find((c) => c.startsWith(`moveTo(${L},`));
        expect(cachetCall, `issue ${key}: cachet rule not found`).toBeDefined();
        aboveBottom = Number(cachetCall!.slice(`moveTo(${L},`.length, -1));
      } else {
        const stampCall = calls.find((c) => c.startsWith("fillRect("));
        expect(stampCall, `issue ${key}: stamp fillRect not found`).toBeDefined();
        const nums = stampCall!.slice("fillRect(".length, -1).split(",").map(Number);
        const [, sy, , sh] = nums;
        aboveBottom = sy + sh;
      }

      expect(tearY - nameEntry!.y, `issue ${key}: descent clearance`).toBeGreaterThanOrEqual(NAME_DESCENT_CLEARANCE);
      expect(nameEntry!.y - aboveBottom, `issue ${key}: ascent clearance`).toBeGreaterThanOrEqual(NAME_ASCENT_CLEARANCE);
    }
  });

  it("renders the name at the same font size on all five issues", () => {
    // The property the owner actually cares about: with both floors now
    // satisfiable at REF_NAME_PX on every tier, the height-derived cap
    // (maxNamePx in ticket.ts) should clamp to REF_NAME_PX everywhere, so
    // the name is never visibly smaller on one tier than the other four.
    // The Math.min band guard stays in the implementation as a safety net
    // for some future layout squeeze, but today it should never bite: if
    // it does, the gallery would show First day's name noticeably smaller,
    // which is exactly what this catches before a visitor sees it.
    const h = CARD_H;
    const sizes = KEYS.map((key) => {
      const { ctx, calls, texts } = makeStubCtx();
      const data = cardFor(`same-size-${key}`, key);
      drawTicket(ctx, data, CARD_W, h, FONTS);
      return recoverNamePx(calls, texts, data.name);
    });

    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i], `issue ${KEYS[i]} vs ${KEYS[0]}`).toBeCloseTo(sizes[0], 5);
    }
  });
});

