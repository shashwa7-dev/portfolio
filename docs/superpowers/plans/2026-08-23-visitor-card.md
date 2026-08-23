# Visitor Stamp Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A visitor to shashwa7.in mints a stamp card drawn in the browser, picks the name on it, and downloads it as a PNG.

**Architecture:** Four pure modules (hashing, issue tiers, trait casting, types) that a test runner can pin down, three canvas drawing modules that consume them, and one route that wires a canvas to a name field and a download. Everything derives from a random id in `localStorage`. No backend, no persistence, no wallet.

**Tech Stack:** Next.js 14 App Router, TypeScript, canvas 2D, `next/font/google`, vitest.

**Spec:** `docs/superpowers/specs/2026-08-23-visitor-card-design.md`

## Global Constraints

Every task's requirements implicitly include these.

- **No em-dashes** in any user-facing copy. Use periods, colons, parentheses, or rephrase.
- **No module-level mutable state in `lib/card/`.** Every drawing function takes its context as a parameter. The gallery puts six canvases on one page and React StrictMode double-renders; module globals break both.
- **One function draws every size.** `drawTicket(ctx, data, w, h)` serves the preview, the 1200x1500 export, and the gallery thumbnails. Never a second drawing routine kept in agreement by hand.
- **Type scale from `tailwind.config.ts`.** Sizes `text-2xs` through `text-4xl`. Arbitrary `text-[Npx]` is forbidden. This applies to DOM only; canvas draws in device pixels.
- **Motion tokens from `lib/motionVariants.ts`**, mirrored as CSS custom properties in `app/globals.css`. Never paste a literal easing like `[0.23, 1, 0.32, 1]` or a duration like `0.4` into a component.
- **`<main>` padding is `py-8 md:py-12`** on every secondary route.
- **The global `<Navbar />`** is rendered once in `app/layout.tsx`. Per-page Navbar imports are forbidden.
- **Tier shares are exactly** 60 / 27 / 11.9 / 1 / 0.1 percent.
- **Card ratio is 4:5.** Export is 1200x1500.
- **Palette:** stock `#f6f1e5`, ink `#1f1d1a`, stamp paper `#fdfaf2`, faint ink `#8a8175`, very faint `#bdb4a4`. Inverted issue only: stock `#17161a`, ink `#e8e3d8`, stamp paper `#201f24`, gold `#c9a227`.
- **`data/agent-memory.md` must be updated in the same change** (Task 9). CLAUDE.md's agent-memory rule lists recent shipments as a trigger.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/card/types.ts` | Shared types: `Cast`, `IssueKey`, `Issue`, `CardData`. No logic. |
| `lib/card/seed.ts` | FNV-1a hashing, mulberry32 PRNG, random helpers, serial formatting. Pure. |
| `lib/card/issues.ts` | The five tiers, their shares, their sticker gradients, and `issueFrom`. Pure. |
| `lib/card/cast.ts` | Picks a portrait's traits from a PRNG. Pure. |
| `lib/card/portrait.ts` | Draws a cast onto a canvas context. |
| `lib/card/sticker.ts` | Draws the four-layer die-cut sticker. |
| `lib/card/ticket.ts` | Composes the whole card at any size. |
| `app/card/page.tsx` | Server component. Reads geo headers, renders metadata, mounts the client. |
| `components/card/CardMinter.tsx` | Client. Owns visitor id, canvas, mint reveal, name field, download. |
| `components/card/IssueGallery.tsx` | Client. Five thumbnails from fixed demo seeds. |
| `vitest.config.ts` | Test runner config, `@/` alias. |

Pure modules are separated from drawing modules on purpose: canvas is not available in Node, so the pure half carries the tests and the drawing half is verified by rendering.

---

## Task 1: Test harness and the seed module

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/card/seed.ts`
- Create: `lib/card/seed.test.ts`
- Modify: `package.json` (scripts, devDependencies)

**Interfaces:**
- Consumes: nothing.
- Produces: `hashStr(s: string): number`, `hashWith(s: string, salt: string): number`, `mulberry32(seed: number): () => number`, `rr(R, a, b): number`, `ri(R, a, b): number`, `chance(R, p): boolean`, `pick<T>(R, arr: T[]): T`, `weighted<T>(R, pairs: [T, number][]): T`, `serialFrom(id: string): string`. Type alias `Rand = () => number`.

- [ ] **Step 1: Install vitest**

```bash
npm install --save-dev vitest@^2
```

- [ ] **Step 2: Add the config and the script**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
```

In `package.json`, add to `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write the failing tests**

Create `lib/card/seed.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { hashStr, hashWith, mulberry32, weighted, serialFrom } from "./seed";

describe("hashStr", () => {
  it("is stable for the same input", () => {
    expect(hashStr("shashwa7")).toBe(hashStr("shashwa7"));
  });

  it("returns an unsigned 32 bit integer", () => {
    const h = hashStr("shashwa7");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it("separates inputs that differ by one character", () => {
    expect(hashStr("visitor-a")).not.toBe(hashStr("visitor-b"));
  });

  it("handles the empty string without throwing", () => {
    expect(() => hashStr("")).not.toThrow();
  });
});

describe("hashWith", () => {
  it("gives independent streams from one input", () => {
    expect(hashWith("abc", "face")).not.toBe(hashWith("abc", "issue"));
  });

  it("is stable per salt", () => {
    expect(hashWith("abc", "face")).toBe(hashWith("abc", "face"));
  });
});

describe("mulberry32", () => {
  it("replays the same sequence from the same seed", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("stays inside [0, 1)", () => {
    const R = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const v = R();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("weighted", () => {
  it("respects the weights within tolerance", () => {
    const R = mulberry32(7);
    const counts: Record<string, number> = { a: 0, b: 0 };
    for (let i = 0; i < 20000; i++) {
      counts[weighted(R, [["a", 3], ["b", 1]] as [string, number][])]++;
    }
    expect(counts.a / 20000).toBeGreaterThan(0.73);
    expect(counts.a / 20000).toBeLessThan(0.77);
  });

  it("never returns an item with zero weight", () => {
    const R = mulberry32(3);
    for (let i = 0; i < 500; i++) {
      expect(weighted(R, [["keep", 1], ["never", 0]] as [string, number][])).toBe("keep");
    }
  });
});

describe("serialFrom", () => {
  it("matches the A-XXXX-XX shape", () => {
    expect(serialFrom("some-uuid-here")).toMatch(/^A-[0-9A-F]{4}-[0-9A-F]{2}$/);
  });

  it("is stable for the same id", () => {
    expect(serialFrom("abc")).toBe(serialFrom("abc"));
  });
});
```

- [ ] **Step 4: Run the tests and watch them fail**

Run: `npm test`
Expected: FAIL, cannot resolve `./seed`.

- [ ] **Step 5: Write the implementation**

Create `lib/card/seed.ts`:

```ts
/**
 * Deterministic seeding for the visitor card.
 *
 * The contract for this whole module is that the same input always produces
 * the same output, forever. A visitor's card is drawn from an id in their
 * browser, so any drift here silently changes cards people have already
 * downloaded and kept.
 *
 * FNV-1a with an avalanche step, feeding mulberry32. Both are standard and
 * both are chosen for being small and exactly reproducible, not for
 * cryptographic strength. Nothing here is a security boundary.
 */

export type Rand = () => number;

/** FNV-1a plus an avalanche mix, so ids differing by one character land far apart. */
export function hashStr(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return h >>> 0;
}

/**
 * A second, independent stream from the same input.
 *
 * This is what lets one visitor id drive the face, the issue and the serial
 * without any of them correlating, and what lets the typed name drive the
 * lettering without disturbing the face.
 */
export const hashWith = (str: string, salt: string): number =>
  hashStr(`${salt} ${str}`);

export function mulberry32(a: number): Rand {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Real in [a, b). */
export const rr = (R: Rand, a: number, b: number): number => a + R() * (b - a);

/** Integer in [a, b], inclusive both ends. */
export const ri = (R: Rand, a: number, b: number): number =>
  Math.floor(rr(R, a, b + 1));

export const chance = (R: Rand, p: number): boolean => R() < p;

export const pick = <T>(R: Rand, arr: readonly T[]): T =>
  arr[Math.floor(R() * arr.length)];

/** Weighted choice. Zero-weight entries are unreachable. */
export function weighted<T>(R: Rand, pairs: readonly (readonly [T, number])[]): T {
  let total = 0;
  for (const [, w] of pairs) total += w;
  let x = R() * total;
  for (const [value, w] of pairs) {
    x -= w;
    if (x < 0) return value;
  }
  return pairs[pairs.length - 1][0];
}

/**
 * `A-7A4E-C1`. The leading letter is a literal series marker, kept so there is
 * somewhere to go if the drawing code ever changes enough that old and new
 * cards should be told apart.
 *
 * Deliberately not `0x`-prefixed. That reads as a wallet address, and this
 * card is not on-chain.
 */
export function serialFrom(id: string): string {
  const hex = hashStr(id).toString(16).toUpperCase().padStart(8, "0");
  return `A-${hex.slice(0, 4)}-${hex.slice(4, 6)}`;
}
```

- [ ] **Step 6: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS, all cases green.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/card/seed.ts lib/card/seed.test.ts
git commit -m "Seed the card from an id, and pin it down with tests"
```

---

## Task 2: The five issues

**Files:**
- Create: `lib/card/types.ts`
- Create: `lib/card/issues.ts`
- Create: `lib/card/issues.test.ts`

**Interfaces:**
- Consumes: `hashWith`, `mulberry32` from `lib/card/seed.ts`.
- Produces: type `IssueKey = "definitive" | "commemorative" | "firstDay" | "misprint" | "inverted"`; `ISSUES: Record<IssueKey, Issue>`; `issueFrom(visitorId: string): IssueKey`. `Issue` has `{ key, name, share, sticker: string[] | null, inverted: boolean }` where `share` is a percentage number and `sticker` is a five-stop gradient or `null` for Definitive.

- [ ] **Step 1: Write the failing tests**

Create `lib/card/issues.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ISSUES, issueFrom, type IssueKey } from "./issues";

describe("ISSUES", () => {
  it("shares sum to 100", () => {
    const total = Object.values(ISSUES).reduce((n, i) => n + i.share, 0);
    expect(total).toBeCloseTo(100, 6);
  });

  it("gives every issue but Definitive a five stop gradient", () => {
    expect(ISSUES.definitive.sticker).toBeNull();
    for (const key of ["commemorative", "firstDay", "misprint", "inverted"] as IssueKey[]) {
      expect(ISSUES[key].sticker).toHaveLength(5);
    }
  });

  it("inverts only the rarest issue", () => {
    const inverting = Object.values(ISSUES).filter((i) => i.inverted).map((i) => i.key);
    expect(inverting).toEqual(["inverted"]);
  });

  it("has no em-dash in any display name", () => {
    for (const issue of Object.values(ISSUES)) {
      expect(issue.name).not.toContain("—");
    }
  });
});

describe("issueFrom", () => {
  it("is stable for the same id", () => {
    expect(issueFrom("abc-123")).toBe(issueFrom("abc-123"));
  });

  it("lands within a point of the declared shares over 100k ids", () => {
    const counts: Record<string, number> = {
      definitive: 0, commemorative: 0, firstDay: 0, misprint: 0, inverted: 0,
    };
    const N = 100_000;
    for (let i = 0; i < N; i++) counts[issueFrom(`visitor-${i}`)]++;

    expect((counts.definitive / N) * 100).toBeGreaterThan(59);
    expect((counts.definitive / N) * 100).toBeLessThan(61);
    expect((counts.commemorative / N) * 100).toBeGreaterThan(26);
    expect((counts.commemorative / N) * 100).toBeLessThan(28);
    expect((counts.firstDay / N) * 100).toBeGreaterThan(11);
    expect((counts.firstDay / N) * 100).toBeLessThan(13);
    // 1% of 100k is 1000, 0.1% is 100. Wide bands: this is checking the
    // bands are wired to the right issues, not that the PRNG is perfect.
    expect(counts.misprint).toBeGreaterThan(700);
    expect(counts.misprint).toBeLessThan(1300);
    expect(counts.inverted).toBeGreaterThan(50);
    expect(counts.inverted).toBeLessThan(170);
  });

  it("can actually reach the rarest issue", () => {
    const seen = new Set<IssueKey>();
    for (let i = 0; i < 100_000; i++) seen.add(issueFrom(`v${i}`));
    expect(seen.size).toBe(5);
  });
});
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `npm test`
Expected: FAIL, cannot resolve `./issues`.

- [ ] **Step 3: Write the types**

Create `lib/card/types.ts`:

```ts
export type IssueKey =
  | "definitive"
  | "commemorative"
  | "firstDay"
  | "misprint"
  | "inverted";

export type Issue = {
  key: IssueKey;
  /** Shown on the card and in the gallery. */
  name: string;
  /** Percentage of all cards. The five sum to 100. */
  share: number;
  /** Five gradient stops for the sticker, or null for the issue that has none. */
  sticker: readonly string[] | null;
  /** Only the rarest issue flips the stock. */
  inverted: boolean;
};

export type Cast = {
  hair: "short" | "long" | "bob" | "curls" | "buzz" | "topknot";
  glasses: "none" | "round" | "square";
  headwear: "none" | "flatCap" | "beanie";
  brow: "flat" | "arched" | "worried";
  mouth: "smile" | "line" | "open";
  /** 0 to 1, drives how heavily the face is hatched. */
  shade: number;
};

export type CardData = {
  visitorId: string;
  /** What the visitor typed, or "Visitor". */
  name: string;
  serial: string;
  issue: Issue;
  cast: Cast;
  /** "Bengaluru, IN" or null when the headers were absent. */
  origin: string | null;
  /** City alone for the cancel, or null. */
  city: string | null;
  /** "23 Aug 2026" */
  date: string;
};
```

- [ ] **Step 4: Write the implementation**

Create `lib/card/issues.ts`:

```ts
import { hashWith, mulberry32 } from "@/lib/card/seed";
import type { Issue, IssueKey } from "@/lib/card/types";

/**
 * Named from philately rather than from a loot table.
 *
 * Two reasons. The artefact is a stamp, so the vocabulary is already sitting
 * there. And "common" is a deflating thing to tell 27% of your visitors,
 * where "commemorative" is something a person would repeat out loud.
 *
 * Each issue changes something its name promises. That is a rule for anyone
 * adding a sixth: if the only difference is the gradient, it does not earn a
 * name.
 */
export const ISSUES: Record<IssueKey, Issue> = {
  definitive: {
    key: "definitive",
    name: "Definitive",
    share: 60,
    sticker: null,
    inverted: false,
  },
  commemorative: {
    key: "commemorative",
    name: "Commemorative",
    share: 27,
    sticker: ["#8c8579", "#615b53", "#a49c8e", "#57524a", "#7d766b"],
    inverted: false,
  },
  firstDay: {
    key: "firstDay",
    name: "First day",
    share: 11.9,
    sticker: ["#2f6a88", "#63b6cf", "#bfe8ef", "#4b93bb", "#27596f"],
    inverted: false,
  },
  misprint: {
    key: "misprint",
    name: "Misprint",
    share: 1,
    sticker: ["#ef548f", "#ef8b6d", "#cfef6b", "#3bf0c1", "#bb4af0"],
    inverted: false,
  },
  inverted: {
    key: "inverted",
    name: "Inverted",
    share: 0.1,
    sticker: ["#6b4d12", "#c9a227", "#fff3c4", "#e8c96a", "#7a5c1e"],
    inverted: true,
  },
};

/**
 * Order matters: the bands are walked in this sequence, so it must run from
 * commonest to rarest.
 */
const BANDS: readonly IssueKey[] = [
  "definitive",
  "commemorative",
  "firstDay",
  "misprint",
  "inverted",
];

/**
 * Fixed to the visitor id, so a person's issue never changes. There is no
 * re-roll: the card is theirs, not a pull.
 */
export function issueFrom(visitorId: string): IssueKey {
  const roll = mulberry32(hashWith(visitorId, "issue"))() * 100;
  let floor = 0;
  for (const key of BANDS) {
    floor += ISSUES[key].share;
    if (roll < floor) return key;
  }
  return "inverted";
}
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS. If the distribution case fails, the bug is in the band walk or in `hashWith`, not in the tolerances. Do not widen the tolerances to make it green.

- [ ] **Step 6: Commit**

```bash
git add lib/card/types.ts lib/card/issues.ts lib/card/issues.test.ts
git commit -m "Five issues, named from philately, with their odds pinned"
```

---

## Task 3: Casting a face

> **SUPERSEDED by Task 10 (2026-08-23).** The lean cast was built, reviewed and rejected on sight: six hair styles against the vendored engine's seventeen, six traits against its fifty. Its output is deleted in Task 10. Kept here as the record of what was tried. Do not implement.

**Files:**
- Create: `lib/card/cast.ts`
- Create: `lib/card/cast.test.ts`

**Interfaces:**
- Consumes: `Rand`, `weighted`, `chance`, `rr` from `lib/card/seed.ts`; `Cast` from `lib/card/types.ts`.
- Produces: `castFrom(R: Rand): Cast`, `castForVisitor(visitorId: string): Cast`.

- [ ] **Step 1: Write the failing tests**

Create `lib/card/cast.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mulberry32 } from "./seed";
import { castFrom, castForVisitor } from "./cast";

describe("castFrom", () => {
  it("replays exactly from the same seed", () => {
    expect(castFrom(mulberry32(42))).toEqual(castFrom(mulberry32(42)));
  });

  it("keeps shade inside 0 to 1", () => {
    for (let i = 0; i < 2000; i++) {
      const c = castFrom(mulberry32(i));
      expect(c.shade).toBeGreaterThanOrEqual(0);
      expect(c.shade).toBeLessThanOrEqual(1);
    }
  });

  it("reaches every hair style within 5000 seeds", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 5000; i++) seen.add(castFrom(mulberry32(i)).hair);
    expect(seen.size).toBe(6);
  });

  it("leaves most faces without headwear", () => {
    let bare = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) if (castFrom(mulberry32(i)).headwear === "none") bare++;
    expect(bare / N).toBeGreaterThan(0.5);
  });
});

describe("castForVisitor", () => {
  it("is stable for the same id", () => {
    expect(castForVisitor("abc")).toEqual(castForVisitor("abc"));
  });

  it("does not change when a different salt would", () => {
    // The face must come off the 'face' stream only, so two ids that happen
    // to share an issue still differ in the face.
    expect(castForVisitor("abc")).not.toEqual(castForVisitor("abd"));
  });
});
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `npm test`
Expected: FAIL, cannot resolve `./cast`.

- [ ] **Step 3: Write the implementation**

Create `lib/card/cast.ts`:

```ts
import { hashWith, mulberry32, weighted, rr, type Rand } from "@/lib/card/seed";
import type { Cast } from "@/lib/card/types";

/**
 * The lean cast. Ink Folio runs a much larger wardrobe; this is the subset
 * that gives enough variety that two visitors rarely collide, while staying
 * small enough to read in one sitting.
 *
 * Weights are deliberately uneven. A wardrobe where everything is equally
 * likely produces a crowd where nothing stands out, and the whole point of
 * the issue tiers is that some cards feel luckier than others.
 */
export function castFrom(R: Rand): Cast {
  return {
    hair: weighted(R, [
      ["short", 26],
      ["long", 22],
      ["bob", 18],
      ["curls", 16],
      ["buzz", 12],
      ["topknot", 6],
    ] as const),
    glasses: weighted(R, [
      ["none", 62],
      ["round", 24],
      ["square", 14],
    ] as const),
    headwear: weighted(R, [
      ["none", 74],
      ["beanie", 18],
      ["flatCap", 8],
    ] as const),
    brow: weighted(R, [
      ["flat", 46],
      ["arched", 34],
      ["worried", 20],
    ] as const),
    mouth: weighted(R, [
      ["smile", 52],
      ["line", 33],
      ["open", 15],
    ] as const),
    shade: rr(R, 0.25, 0.85),
  };
}

/** The face comes off its own stream, so the name and the issue cannot disturb it. */
export const castForVisitor = (visitorId: string): Cast =>
  castFrom(mulberry32(hashWith(visitorId, "face")));
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/card/cast.ts lib/card/cast.test.ts
git commit -m "Cast a face from a seed, weighted so some rolls feel lucky"
```

---

## Task 4: Drawing the portrait

> **SUPERSEDED by Task 10 (2026-08-23).** Replaced by the vendored Ink Folio engine. Its output is deleted in Task 10. Kept here as the record of what was tried. Do not implement.

**Files:**
- Create: `lib/card/portrait.ts`
- Create: `app/card/preview/page.tsx` (temporary scratch harness, deleted in Task 7)

**Interfaces:**
- Consumes: `Cast` from types, `Rand`/`rr`/`chance` from seed.
- Produces: `drawPortrait(ctx: CanvasRenderingContext2D, cast: Cast, R: Rand, box: { x: number; y: number; w: number; h: number }, ink: string): void`.

Canvas is not available in Node, so this task has no unit test. It is verified by looking at it, via the scratch route created in Step 1 and removed in Task 7.

- [ ] **Step 1: Build the scratch harness**

Create `app/card/preview/page.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/card/seed";
import { castFrom } from "@/lib/card/cast";
import { createEngine } from "@/lib/card/engine/portrait-engine";

/** Scratch only. Deleted in Task 7. Renders 24 faces so a change to the
 *  drawing code shows up as a visible diff instead of a silent one. */
export default function PortraitPreview() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 960 * dpr;
    c.height = 640 * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#f6f1e5";
    ctx.fillRect(0, 0, 960, 640);
    for (let i = 0; i < 24; i++) {
      const R = mulberry32(i * 7919);
      drawPortrait(
        ctx,
        castFrom(mulberry32(i * 7919)),
        R,
        { x: (i % 6) * 160, y: Math.floor(i / 6) * 160, w: 160, h: 160 },
        "#1f1d1a"
      );
    }
  }, []);
  return <canvas ref={ref} style={{ width: 960, height: 640 }} />;
}
```

- [ ] **Step 2: Write the portrait module**

Create `lib/card/portrait.ts`. Draw in this order so later layers cover earlier ones: face shape, shading hatch, ears, hair back, features, glasses, hair front, headwear.

```ts
import { chance, rr, type Rand } from "@/lib/card/seed";
import type { Cast } from "@/lib/card/types";

type Box = { x: number; y: number; w: number; h: number };

/**
 * A pencil line, not a geometric one.
 *
 * A path stroked at constant width reads as machine made instantly. Every
 * stroke here is walked in short segments whose width varies along the path
 * and whose points wobble, which is the single technique that makes the whole
 * thing look drawn. Ink Folio's write-up calls this out as the trick, and it
 * is the one idea from it worth reimplementing exactly.
 */
function pencil(
  ctx: CanvasRenderingContext2D,
  R: Rand,
  pts: [number, number][],
  width: number,
  ink: string
) {
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < pts.length - 1; i++) {
    const t = i / Math.max(1, pts.length - 2);
    // thin at both ends, full width through the middle
    const taper = 0.35 + 0.65 * Math.sin(Math.PI * t);
    ctx.beginPath();
    ctx.lineWidth = width * taper * rr(R, 0.85, 1.15);
    ctx.moveTo(pts[i][0] + rr(R, -0.4, 0.4), pts[i][1] + rr(R, -0.4, 0.4));
    ctx.lineTo(pts[i + 1][0] + rr(R, -0.4, 0.4), pts[i + 1][1] + rr(R, -0.4, 0.4));
    ctx.stroke();
  }
}

/** Sample an ellipse into points a pencil can walk. */
function ellipsePts(
  cx: number, cy: number, rx: number, ry: number, n = 40, from = 0, to = Math.PI * 2
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

/** Parallel strokes inside a clipped region, for shade. */
function hatch(
  ctx: CanvasRenderingContext2D, R: Rand, box: Box, density: number, ink: string
) {
  const step = Math.max(3, 9 - density * 6);
  ctx.save();
  ctx.globalAlpha = 0.18 + density * 0.16;
  for (let y = box.y; y < box.y + box.h; y += step) {
    pencil(ctx, R,
      [[box.x, y], [box.x + box.w * rr(R, 0.6, 1), y + rr(R, -1.5, 1.5)]],
      0.7, ink);
  }
  ctx.restore();
}

export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  cast: Cast,
  R: Rand,
  box: Box,
  ink: string
): void {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h * 0.5;
  const s = Math.min(box.w, box.h) / 130;
  const faceRx = 40 * s;
  const faceRy = 52 * s;

  ctx.save();

  // face
  pencil(ctx, R, ellipsePts(cx, cy, faceRx, faceRy), 2.1 * s, ink);

  // shade down one cheek
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, faceRx, faceRy, 0, 0, Math.PI * 2);
  ctx.clip();
  hatch(ctx, R,
    { x: cx + faceRx * 0.1, y: cy - faceRy * 0.2, w: faceRx * 0.9, h: faceRy * 1.1 },
    cast.shade, ink);
  ctx.restore();

  // ears
  pencil(ctx, R, ellipsePts(cx - faceRx, cy, 6 * s, 10 * s, 20, Math.PI * 0.5, Math.PI * 1.5), 1.6 * s, ink);
  pencil(ctx, R, ellipsePts(cx + faceRx, cy, 6 * s, 10 * s, 20, Math.PI * 1.5, Math.PI * 2.5), 1.6 * s, ink);

  // hair, back mass
  const hairTop = cy - faceRy * 1.12;
  if (cast.hair !== "buzz") {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(cx - faceRx * 1.08, cy - faceRy * 0.25);
    ctx.quadraticCurveTo(cx - faceRx * 1.15, hairTop, cx, hairTop);
    ctx.quadraticCurveTo(cx + faceRx * 1.15, hairTop, cx + faceRx * 1.08, cy - faceRy * 0.25);
    ctx.quadraticCurveTo(cx + faceRx * 0.6, cy - faceRy * 0.85, cx, cy - faceRy * 0.82);
    ctx.quadraticCurveTo(cx - faceRx * 0.6, cy - faceRy * 0.85, cx - faceRx * 1.08, cy - faceRy * 0.25);
    ctx.fill();
    ctx.restore();
  }

  // long hair falls past the jaw
  if (cast.hair === "long" || cast.hair === "curls") {
    const drop = cast.hair === "curls" ? faceRy * 0.7 : faceRy * 1.15;
    for (const side of [-1, 1]) {
      pencil(ctx, R, [
        [cx + side * faceRx * 1.02, cy - faceRy * 0.4],
        [cx + side * faceRx * 1.12, cy + faceRy * 0.2],
        [cx + side * faceRx * 0.95, cy + drop],
      ], 2 * s, ink);
    }
  }

  // brows
  const browY = cy - faceRy * 0.22;
  for (const side of [-1, 1]) {
    const lift = cast.brow === "arched" ? -2.5 * s : cast.brow === "worried" ? 2 * s : 0;
    pencil(ctx, R, [
      [cx + side * 22 * s - side * 8 * s, browY + (side < 0 ? lift : lift)],
      [cx + side * 22 * s + side * 8 * s, browY + lift * 0.3],
    ], 1.6 * s, ink);
  }

  // eyes
  const eyeY = cy - faceRy * 0.04;
  for (const side of [-1, 1]) {
    pencil(ctx, R, ellipsePts(cx + side * 15 * s, eyeY, 5.5 * s, 4 * s, 22), 1.4 * s, ink);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(cx + side * 15 * s, eyeY, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // nose
  pencil(ctx, R, [
    [cx, cy + faceRy * 0.08],
    [cx - 4 * s, cy + faceRy * 0.28],
    [cx + 3 * s, cy + faceRy * 0.3],
  ], 1.5 * s, ink);

  // mouth
  const mouthY = cy + faceRy * 0.55;
  if (cast.mouth === "smile") {
    pencil(ctx, R, ellipsePts(cx, mouthY - 5 * s, 11 * s, 9 * s, 18, Math.PI * 0.22, Math.PI * 0.78), 1.7 * s, ink);
  } else if (cast.mouth === "line") {
    pencil(ctx, R, [[cx - 9 * s, mouthY], [cx + 9 * s, mouthY]], 1.7 * s, ink);
  } else {
    pencil(ctx, R, ellipsePts(cx, mouthY, 8 * s, 5.5 * s), 1.5 * s, ink);
  }

  // glasses
  if (cast.glasses !== "none") {
    const r = 9 * s;
    for (const side of [-1, 1]) {
      if (cast.glasses === "round") {
        pencil(ctx, R, ellipsePts(cx + side * 15 * s, eyeY, r, r * 0.85, 30), 1.5 * s, ink);
      } else {
        pencil(ctx, R, [
          [cx + side * 15 * s - r, eyeY - r * 0.8],
          [cx + side * 15 * s + r, eyeY - r * 0.8],
          [cx + side * 15 * s + r, eyeY + r * 0.8],
          [cx + side * 15 * s - r, eyeY + r * 0.8],
          [cx + side * 15 * s - r, eyeY - r * 0.8],
        ], 1.5 * s, ink);
      }
    }
    pencil(ctx, R, [[cx - 5 * s, eyeY], [cx + 5 * s, eyeY]], 1.3 * s, ink);
  }

  // headwear, last so it sits over the hair
  if (cast.headwear === "beanie") {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(cx - faceRx * 1.1, cy - faceRy * 0.35);
    ctx.quadraticCurveTo(cx, cy - faceRy * 1.5, cx + faceRx * 1.1, cy - faceRy * 0.35);
    ctx.closePath();
    ctx.fill();
    pencil(ctx, R, [
      [cx - faceRx * 1.14, cy - faceRy * 0.35],
      [cx + faceRx * 1.14, cy - faceRy * 0.35],
    ], 2.6 * s, ink);
  } else if (cast.headwear === "flatCap") {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(cx - faceRx * 1.05, cy - faceRy * 0.5);
    ctx.quadraticCurveTo(cx - faceRx * 0.2, cy - faceRy * 1.35, cx + faceRx * 1.0, cy - faceRy * 0.62);
    ctx.quadraticCurveTo(cx + faceRx * 0.4, cy - faceRy * 0.42, cx - faceRx * 1.05, cy - faceRy * 0.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + faceRx * 0.6, cy - faceRy * 0.62);
    ctx.quadraticCurveTo(cx + faceRx * 1.5, cy - faceRy * 0.6, cx + faceRx * 1.35, cy - faceRy * 0.44);
    ctx.quadraticCurveTo(cx + faceRx * 0.9, cy - faceRy * 0.46, cx + faceRx * 0.6, cy - faceRy * 0.55);
    ctx.fill();
  }

  ctx.restore();
}
```

- [ ] **Step 3: Look at it**

Run: `npm run dev`, open `http://localhost:3000/card/preview`.
Expected: 24 distinct faces on cream. Check that hair, glasses and headwear all appear across the grid, that no face has its features outside the head outline, and that nothing is clipped at a cell edge.

- [ ] **Step 4: Verify determinism by reloading**

Reload the page three times. Expected: byte-identical grid every time. If faces change between reloads, something is reading `Math.random()` and must be found and removed.

- [ ] **Step 5: Commit**

```bash
git add lib/card/portrait.ts app/card/preview/page.tsx
git commit -m "Draw a face with a pencil, not a plotter"
```

---

## Task 5: The sticker

**Files:**
- Create: `lib/card/sticker.ts`
- Modify: `app/card/preview/page.tsx` (add stickers under the faces)

**Interfaces:**
- Consumes: `Rand`, `rr` from seed; `Issue` from types.
- Produces: `drawSticker(ctx: CanvasRenderingContext2D, text: string, issue: Issue, R: Rand, cx: number, cy: number, fontPx: number, fontFamily: string, angle: number): void`.

Adapted from Stephanie Eckles' "CSS Sticker" (`codepen.io/5t3ph/pen/mdVZYpr`). Hers is CSS; this is the same four layers in canvas, because a CSS sticker would render in the preview and vanish from the downloaded PNG, which is the only artefact that matters.

- [ ] **Step 1: Write the sticker module**

Create `lib/card/sticker.ts`:

```ts
import { rr, type Rand } from "@/lib/card/seed";
import type { Issue } from "@/lib/card/types";

/**
 * Four stacked layers, drawn bottom to top:
 *
 *   1. a dark offset shadow, so the sticker lifts off the paper
 *   2. a fat white stroke, which is the die-cut vinyl edge
 *   3. the tier gradient as a fill
 *   4. a diagonal white stripe over the fill, which is the specular shine
 *
 * The shine angle is seeded, so no two stickers catch the light identically.
 * Issues with a null gradient draw nothing at all.
 */
export function drawSticker(
  ctx: CanvasRenderingContext2D,
  text: string,
  issue: Issue,
  R: Rand,
  cx: number,
  cy: number,
  fontPx: number,
  fontFamily: string,
  angle: number
): void {
  const stops = issue.sticker;
  if (!stops) return;

  const edge = issue.inverted ? "#100f12" : "#ffffff";

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.font = `italic 900 ${fontPx}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const w = ctx.measureText(text).width;

  // 1. lift
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = fontPx * 0.05;
  ctx.shadowOffsetX = fontPx * 0.07;
  ctx.shadowOffsetY = fontPx * 0.08;
  ctx.fillStyle = edge;
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // 2. die-cut edge
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeStyle = edge;
  ctx.lineWidth = fontPx * 0.42;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = edge;
  ctx.fillText(text, 0, 0);

  // 3. the foil
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillText(text, 0, 0);

  // 4. the shine, clipped to the glyphs
  ctx.save();
  const shineAngle = rr(R, 0.14, 0.34);
  const len = w * 0.8;
  const s = ctx.createLinearGradient(
    -Math.cos(shineAngle) * len, -Math.sin(shineAngle) * len,
    Math.cos(shineAngle) * len, Math.sin(shineAngle) * len
  );
  s.addColorStop(0, "rgba(255,255,255,0)");
  s.addColorStop(0.46, "rgba(255,255,255,0)");
  s.addColorStop(0.5, "rgba(255,255,255,0.95)");
  s.addColorStop(0.54, "rgba(255,255,255,0)");
  s.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = s;
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // hairline definition
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = Math.max(0.5, fontPx * 0.012);
  ctx.strokeText(text, 0, 0);

  ctx.restore();
}
```

- [ ] **Step 2: Add stickers to the scratch harness**

In `app/card/preview/page.tsx`, import `drawSticker`, `ISSUES` and the seed helpers, and after each face draw a sticker labelled with a different issue, cycling through the four that have gradients.

Note the engine-based preview has no `R` in scope of its own, because the engine seeds itself internally. The sticker needs its own PRNG for the shine angle, so make one from the same specimen id:

```tsx
import { drawSticker } from "@/lib/card/sticker";
import { ISSUES } from "@/lib/card/issues";
import { hashStr, mulberry32 } from "@/lib/card/seed";
// ...inside the loop, after engine.portrait(...):
const keys = ["commemorative", "firstDay", "misprint", "inverted"] as const;
const issue = ISSUES[keys[i % 4]];
const R = mulberry32(hashStr(`specimen-${i}`));
drawSticker(ctx, issue.name, issue, R,
  (i % 6) * 160 + 80, Math.floor(i / 6) * 160 + 140,
  22, "system-ui, sans-serif", -0.12);
```

- [ ] **Step 3: Write the smoke test**

Nobody in this pipeline can open a browser, and a sticker that throws or silently draws nothing would pass lint and build. Create `lib/card/sticker.test.ts` with the same recording-stub approach `lib/card/engine/engine.test.ts` uses. Reuse that stub's shape rather than inventing a second one; the sticker needs `createLinearGradient` returning `{ addColorStop() {} }`, `measureText` returning `{ width: 10 }`, `fillText`, `strokeText`, plus settable `font`, `textAlign`, `textBaseline`, `shadowColor`, `shadowBlur`, `shadowOffsetX`, `shadowOffsetY`, `lineWidth`, `lineJoin`, `miterLimit`, `fillStyle`, `strokeStyle`.

Assert:

1. Drawing a sticker for each of the four issues that have gradients does not throw.
2. **Definitive draws nothing at all.** `ISSUES.definitive.sticker` is null, so `drawSticker` must return before issuing a single call. Assert the log is empty. Six in ten visitors get this card and a stray mark on it would be a visible bug.
3. All four layers are present for a gradient issue: at least one `strokeText` (the die-cut edge) and more than one `fillText` (the edge fill, the foil, and the shine are separate passes).
4. `save` and `restore` are balanced, including the inner save/restore around the shine.
5. The Inverted issue uses a near-black edge rather than white. Assert the recorded `strokeStyle` assignments include the dark value and not `#ffffff`.
6. The shine angle is seeded: two different PRNGs produce different recorded gradient coordinates. If they match, the angle is not actually varying and the seeded-shine claim is false.

- [ ] **Step 4: Commit**

```bash
git add lib/card/sticker.ts app/card/preview/page.tsx
git commit -m "A die-cut sticker that survives into the PNG"
```

---

## Task 6: Composing the card

**Files:**
- Create: `lib/card/ticket.ts`
- Modify: `app/card/preview/page.tsx` (draw whole cards instead of bare faces)

**Interfaces:**
- Consumes: everything above.
- Produces: `drawTicket(ctx: CanvasRenderingContext2D, data: CardData, w: number, h: number, fonts: { hand: string; sticker: string; mono: string }): void`. Also `CARD_W = 1200`, `CARD_H = 1500`.

Every measurement is expressed as a fraction of `w` or `h`, which is what lets one function serve the preview, the export and the gallery thumbnails.

- [ ] **Step 1: Write the ticket module**

Create `lib/card/ticket.ts`:

```ts
import { hashWith, mulberry32, rr } from "@/lib/card/seed";
import { createEngine } from "@/lib/card/engine/portrait-engine";
import { drawSticker } from "@/lib/card/sticker";
import type { CardData } from "@/lib/card/types";

export const CARD_W = 1200;
export const CARD_H = 1500;

type Fonts = { hand: string; sticker: string; mono: string };

const LIGHT = {
  stock: "#f6f1e5",
  stamp: "#fdfaf2",
  ink: "#1f1d1a",
  faint: "#8a8175",
  veryFaint: "#bdb4a4",
  cancel: "#1f1d1a",
  notch: "#e9e2d2",
};

const DARK = {
  stock: "#17161a",
  stamp: "#201f24",
  ink: "#e8e3d8",
  faint: "#8a8175",
  veryFaint: "#6f6a63",
  cancel: "#c9a227",
  notch: "#2a282c",
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Punch paper-coloured bites along the stamp's four edges. */
function perforate(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number, stock: string
) {
  ctx.fillStyle = stock;
  const step = r * 3.3;
  for (let px = x + step / 2; px < x + w; px += step) {
    ctx.beginPath(); ctx.arc(px, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px, y + h, r, 0, Math.PI * 2); ctx.fill();
  }
  for (let py = y + step / 2; py < y + h; py += step) {
    ctx.beginPath(); ctx.arc(x, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w, py, r, 0, Math.PI * 2); ctx.fill();
  }
}

function caps(ctx: CanvasRenderingContext2D, text: string, px: number, mono: string) {
  ctx.font = `${px}px ${mono}`;
  return text.toUpperCase();
}

/** Letter-spaced fill, since canvas has no tracking. */
function tracked(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number,
  align: "left" | "right" = "left"
) {
  const chars = [...text];
  const total = chars.reduce((n, c) => n + ctx.measureText(c).width + spacing, -spacing);
  let cx = align === "left" ? x : x - total;
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spacing;
  }
}

/**
 * Draws the whole card at any size.
 *
 * Everything is a fraction of w or h, so the on-screen preview, the 1200x1500
 * export and the gallery thumbnails are the same drawing. There is no second
 * routine to keep in agreement.
 */
export function drawTicket(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  w: number,
  h: number,
  fonts: Fonts
): void {
  const P = data.issue.inverted ? DARK : LIGHT;
  const R = mulberry32(hashWith(data.visitorId, "paper"));

  /* One engine per call, never a shared module-level instance. The vendored
     renderer keeps its ink registers in the factory closure, so two cards drawn
     from one engine would tread on each other's state. The issue gallery draws
     six cards, so this is not hypothetical. */
  const engine = createEngine(ctx, { hand: fonts.hand });

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // stock
  roundRect(ctx, 0, 0, w, h, w * 0.037);
  ctx.fillStyle = P.stock;
  ctx.fill();

  // stamp
  const sx = w * 0.202, sy = h * 0.101, sw = w * 0.597, sh = h * 0.507;
  ctx.fillStyle = P.stamp;
  ctx.fillRect(sx, sy, sw, sh);
  perforate(ctx, sx, sy, sw, sh, w * 0.0112, P.stock);

  // inner rule. Commemorative gets a second one, Misprint prints it twice off-register.
  ctx.strokeStyle = P.ink;
  if (data.issue.key === "misprint") {
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = w * 0.0034;
    ctx.strokeRect(sx + w * 0.039, sy + h * 0.029, sw - w * 0.06, sh - h * 0.047);
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = w * 0.0034;
  ctx.strokeRect(sx + w * 0.03, sy + h * 0.024, sw - w * 0.06, sh - h * 0.047);
  if (data.issue.key === "commemorative") {
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = w * 0.0019;
    ctx.strokeRect(sx + w * 0.045, sy + h * 0.036, sw - w * 0.09, sh - h * 0.07);
  }
  ctx.globalAlpha = 1;

  // portrait. Inverted prints the plate upside down, which is the joke the name makes.
  //
  // The engine seeds itself from the id and casts its own traits, so there is
  // no cast to pass in and no PRNG to thread through. Drawing the same id twice
  // gives the same face, which is what the Misprint double strike relies on.
  const pBox = { x: sx + sw * 0.12, y: sy + sh * 0.06, w: sw * 0.76, h: sh * 0.72 };
  ctx.save();
  if (data.issue.inverted) {
    ctx.translate(pBox.x + pBox.w / 2, pBox.y + pBox.h / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(pBox.x + pBox.w / 2), -(pBox.y + pBox.h / 2));
  }
  if (data.issue.key === "misprint") {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.translate(w * 0.0021, h * 0.0017);
    engine.portrait(data.visitorId, pBox);
    ctx.restore();
  }
  const traits = engine.portrait(data.visitorId, pBox);
  ctx.restore();

  // the stamp says the country and the denomination, like a real one
  ctx.fillStyle = P.faint;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `${w * 0.0194}px ${fonts.mono}`;
  tracked(ctx, "SHASHWA7.IN", sx + sw * 0.1, sy + sh * 0.905, w * 0.0028);
  ctx.textAlign = "left";
  tracked(ctx, "ONE VISIT", sx + sw * 0.9, sy + sh * 0.905, w * 0.0028, "right");

  // first day covers carry the legend
  if (data.issue.key === "firstDay") {
    ctx.fillStyle = P.faint;
    ctx.font = `${w * 0.0194}px ${fonts.mono}`;
    tracked(ctx, "FIRST DAY OF ISSUE", w * 0.097, h * 0.645, w * 0.0028);
  }

  // the cancel
  const ccx = w * 0.724, ccy = h * 0.531, cr = w * 0.101;
  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.strokeStyle = P.cancel;
  ctx.fillStyle = P.cancel;
  ctx.lineWidth = w * 0.0052;
  ctx.beginPath(); ctx.arc(ccx, ccy, cr, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = w * 0.0026;
  ctx.beginPath(); ctx.arc(ccx, ccy, cr * 0.81, 0, Math.PI * 2); ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = `${w * 0.0164}px ${fonts.mono}`;
  ctx.fillText((data.issue.key === "firstDay" ? "FIRST DAY" : (data.city ?? "")).toUpperCase(), ccx, ccy - cr * 0.22);
  ctx.font = `${w * 0.028}px ${fonts.mono}`;
  ctx.fillText(data.date.slice(0, 2) + " · " + data.date.slice(3, 6).toUpperCase(), ccx, ccy + cr * 0.15);
  ctx.font = `${w * 0.0164}px ${fonts.mono}`;
  ctx.fillText(data.date.slice(-4), ccx, ccy + cr * 0.48);
  ctx.restore();

  // the name, in handwriting
  ctx.fillStyle = P.ink;
  ctx.textAlign = "center";
  ctx.font = `${w * 0.1}px ${fonts.hand}`;
  ctx.fillText(data.name || "Visitor", w / 2, h * 0.716);

  // tear line, painted, with notches bitten out of both edges
  const ty = h * 0.782;
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = w * 0.0045;
  ctx.setLineDash([w * 0.015, w * 0.019]);
  ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w, ty); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = P.notch;
  ctx.beginPath(); ctx.arc(0, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();

  // the stub: four values on two aligned columns
  const L = w * 0.097, Rt = w * 0.903;
  ctx.fillStyle = P.veryFaint;
  ctx.font = `${w * 0.018}px ${fonts.mono}`;
  ctx.textAlign = "left";
  tracked(ctx, "SERIAL", L, h * 0.848, w * 0.0028);
  tracked(ctx, "ISSUE", Rt, h * 0.848, w * 0.0028, "right");

  ctx.fillStyle = P.ink;
  ctx.font = `${w * 0.0448}px ${fonts.mono}`;
  ctx.textAlign = "left";
  ctx.fillText(data.serial, L, h * 0.893);

  // "Commemorative" overflows the column, so shrink to fit rather than truncate
  ctx.textAlign = "right";
  let issuePx = w * 0.0448;
  ctx.font = `${issuePx}px ${fonts.mono}`;
  const maxIssue = w * 0.36;
  while (ctx.measureText(data.issue.name).width > maxIssue && issuePx > w * 0.02) {
    issuePx -= w * 0.0015;
    ctx.font = `${issuePx}px ${fonts.mono}`;
  }
  ctx.fillStyle = data.issue.inverted ? P.cancel : P.ink;
  ctx.fillText(data.issue.name, Rt, h * 0.893);

  ctx.fillStyle = P.veryFaint;
  ctx.font = `${w * 0.018}px ${fonts.mono}`;
  ctx.textAlign = "left";
  if (data.origin) {
    tracked(ctx, `${data.origin} · ${data.date}`.toUpperCase(), L, h * 0.958, w * 0.0028);
  } else {
    tracked(ctx, data.date.toUpperCase(), L, h * 0.958, w * 0.0028);
  }
  tracked(ctx, `${data.issue.share}% OF CARDS`, Rt, h * 0.958, w * 0.0028, "right");

  // the sticker, applied last so it sits over the stamp
  drawSticker(
    ctx, data.issue.name, data.issue, R,
    w * 0.2, h * 0.55, w * 0.088, fonts.sticker, rr(R, -0.16, -0.08)
  );

  ctx.restore();
}
```

- [ ] **Step 2: Draw whole cards in the scratch harness**

Replace the whole body of `app/card/preview/page.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { ISSUES } from "@/lib/card/issues";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket } from "@/lib/card/ticket";
import type { IssueKey } from "@/lib/card/types";

/** Scratch only. Deleted in Task 7. */
const KEYS: IssueKey[] = ["definitive", "commemorative", "firstDay", "misprint", "inverted"];
const FONTS = { hand: "cursive", sticker: "system-ui, sans-serif", mono: "ui-monospace, monospace" };

function One({ k }: { k: IssueKey }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 268 * dpr;
    c.height = 335 * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const id = `specimen-${k}`;
    drawTicket(ctx, {
      visitorId: id,
      name: "Visitor",
      serial: serialFrom(id),
      issue: ISSUES[k],
      origin: "Bengaluru, IN",
      city: "Bengaluru",
      date: "23 Aug 2026",
    }, 268, 335, FONTS);
  }, [k]);
  return <canvas ref={ref} style={{ width: 268, height: 335 }} />;
}

export default function CardPreview() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: 24 }}>
      {KEYS.map((k) => <One key={k} k={k} />)}
    </div>
  );
}
```

- [ ] **Step 3: Look at all five**

Run: `npm run dev`, open `http://localhost:3000/card/preview`.
Expected, checked one at a time against the spec table:
- Definitive: no sticker anywhere.
- Commemorative: second frame line inside the stamp, graphite sticker.
- First day: cancel reads FIRST DAY, legend under the stamp, blue sticker.
- Misprint: frame and portrait visibly doubled a couple of pixels apart, rainbow sticker.
- Inverted: black stock, pale ink, gold cancel and gold issue name, portrait upside down.

- [ ] **Step 4: Check it scales**

Temporarily render one card at 1200x1500 in the harness. Expected: identical composition, nothing clipped, no text overlapping. If anything shifts, a measurement was hardcoded in pixels instead of expressed as a fraction of `w` or `h`. Find it and fix it.

- [ ] **Step 5: Commit**

```bash
git add lib/card/ticket.ts app/card/preview/page.tsx
git commit -m "Compose the card once, at any size"
```

---

## Task 7: The route, the mint, and the download

**Files:**
- Create: `app/card/page.tsx`
- Create: `components/card/CardMinter.tsx`
- (preview page is NOT deleted here, see Step 4)
- Modify: `app/layout.tsx` (font imports)

**Interfaces:**
- Consumes: `drawTicket`, `CARD_W`, `CARD_H`, `ISSUES`, `issueFrom`, `serialFrom`.
- Produces: the `/card` route.

- [ ] **Step 1: Add the two fonts**

In `app/layout.tsx`, alongside the existing font imports:

```ts
import { Caveat, Alegreya_Sans_SC } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-hand",
  display: "swap",
});

const alegreya = Alegreya_Sans_SC({
  subsets: ["latin"],
  weight: ["900"],
  style: ["italic"],
  variable: "--font-sticker",
  display: "swap",
});
```

Add `caveat.variable` and `alegreya.variable` to the `<html>` className alongside the existing font variables.

- [ ] **Step 2: Write the server component**

Create `app/card/page.tsx`:

```tsx
import { headers } from "next/headers";
import Container from "@/components/layout/Container";
import CardMinter from "@/components/card/CardMinter";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";

const DESCRIPTION =
  "Mint yourself a stamp card. The portrait is drawn in your browser from a random id, and the card downloads as a PNG.";

const CARD_OG = ogUrl({
  title: "Mint a visitor card",
  subtitle: "A stamp drawn in your browser, at one of five rarities.",
  type: "generic",
  label: "Card",
});

export const metadata = {
  title: "Mint a visitor card",
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}card` },
  openGraph: {
    title: "Mint a visitor card",
    description: DESCRIPTION,
    url: `${baseUrl}card`,
    images: [{ url: CARD_OG }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mint a visitor card",
    description: DESCRIPTION,
    images: [CARD_OG],
  },
};

/**
 * Reading headers opts this route into dynamic rendering, which is intended:
 * the origin printed on the card is per request. Both headers are absent in
 * local dev, so the fallback is no origin line rather than a guess.
 */
export default function CardPage() {
  const h = headers();
  const country = h.get("x-vercel-ip-country");
  const rawCity = h.get("x-vercel-ip-city");
  const city = rawCity ? decodeURIComponent(rawCity) : null;
  const origin = city && country ? `${city}, ${country}` : country;

  return (
    <main className="py-8 md:py-12">
      <Container width="reading">
        <h1 className="text-3xl font-semibold tracking-tighter text-foreground">
          Mint a visitor card
        </h1>
        <p className="mt-3 max-w-[56ch] text-base text-muted-foreground">
          Every visitor gets a stamp drawn for them. The portrait comes from a
          random id kept in this browser, so it is yours and it does not change.
          Five issues exist. Most people get a Definitive.
        </p>
        <CardMinter origin={origin ?? null} city={city} />
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Write the client**

Create `components/card/CardMinter.tsx`. It owns:

- the visitor id: read `localStorage.getItem("shashwa7:visitor-id")`, else `crypto.randomUUID()` and write it back, inside a `useEffect` so it never runs during SSR
- a `minted` boolean, starting false
- the name, starting `"Visitor"`
- a `<canvas>` sized to its CSS box times `devicePixelRatio`

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ISSUES, issueFrom } from "@/lib/card/issues";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import type { CardData } from "@/lib/card/types";

const KEY = "shashwa7:visitor-id";
const FONTS = {
  hand: "var(--font-hand), cursive",
  sticker: "var(--font-sticker), sans-serif",
  mono: "var(--font-mono), ui-monospace, monospace",
};

function today(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date());
}

export default function CardMinter({
  origin,
  city,
}: {
  origin: string | null;
  city: string | null;
}) {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [minted, setMinted] = useState(false);
  const [name, setName] = useState("Visitor");
  const [fontsReady, setFontsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    setVisitorId(id);
  }, []);

  /* Canvas draws text with whatever is loaded at draw time, so it has to wait
     for the two webfonts or the first paint lands in a fallback face. */
  useEffect(() => {
    if (!document.fonts) { setFontsReady(true); return; }
    document.fonts.ready.then(() => setFontsReady(true)).catch(() => setFontsReady(true));
  }, []);

  const buildData = useCallback((): CardData | null => {
    if (!visitorId) return null;
    return {
      visitorId,
      name: name.trim() || "Visitor",
      serial: serialFrom(visitorId),
      issue: ISSUES[issueFrom(visitorId)],
      origin,
      city,
      date: today(),
    };
  }, [visitorId, name, origin, city]);

  useEffect(() => {
    if (!minted || !fontsReady) return;
    const c = canvasRef.current;
    const data = buildData();
    if (!c || !data) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = c.clientWidth;
    const cssH = (cssW * CARD_H) / CARD_W;
    c.width = Math.round(cssW * dpr);
    c.height = Math.round(cssH * dpr);
    c.style.height = `${cssH}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawTicket(ctx, data, cssW, cssH, FONTS);
  }, [minted, fontsReady, buildData]);

  const download = useCallback(() => {
    const data = buildData();
    if (!data) return;
    const off = document.createElement("canvas");
    off.width = CARD_W;
    off.height = CARD_H;
    const ctx = off.getContext("2d");
    if (!ctx) return;
    drawTicket(ctx, data, CARD_W, CARD_H, FONTS);
    off.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shashwa7-visitor-${data.serial}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [buildData]);

  const data = buildData();

  return (
    <div className="mt-8">
      {!minted ? (
        <button
          onClick={() => setMinted(true)}
          disabled={!visitorId}
          className="rounded-lg bg-accent px-5 py-3 text-base font-medium text-accent-foreground transition-colors duration-base ease-out hover:bg-accent-hover disabled:opacity-50"
        >
          Mint my card
        </button>
      ) : (
        <div className="max-w-[420px]">
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg"
            role="img"
            aria-label={
              data
                ? `A ${data.issue.name} visitor card, serial ${data.serial}, issued to ${data.name}.`
                : "A visitor card"
            }
          />
          <label className="mt-6 block">
            <span className="block font-mono text-2xs uppercase tracking-label text-subtle">
              Name on the card
            </span>
            <input
              value={name}
              maxLength={18}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-transparent px-3 py-2 text-base text-foreground"
            />
          </label>
          <button
            onClick={download}
            className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-base font-medium text-accent-foreground transition-colors duration-base ease-out hover:bg-accent-hover"
          >
            Download PNG
          </button>
          <p className="mt-3 text-sm text-subtle">
            Drawn from a random id kept in this browser. We read your country to
            print it on the card and store nothing.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Leave the scratch harness in place**

Do NOT delete `app/card/preview` in this task, despite what the Files list above says.

It is the only surface showing all five issues side by side, and the owner is using it for visual passes while this branch is built. Task 8's issue gallery replaces that job properly. Deleting the preview here would leave a window with no way to compare the five cards at a glance, in the exact stretch where design feedback is most likely.

Task 9 deletes it, once the gallery exists.

- [ ] **Step 5: Check the whole flow**

Run: `npm run dev`, open `http://localhost:3000/card`.
Expected: the mint button, then a card. Type in the name field and confirm the handwriting changes while the portrait stays put. Download and open the PNG: 1200x1500, sticker present, nothing clipped. Reload and confirm the same card comes back. Open a private window and confirm a different card appears.

- [ ] **Step 6: Commit**

```bash
git add app/card components/card app/layout.tsx
git commit -m "Mint, name, and download a visitor card"
```

---

## Task 8: The issue gallery

**Files:**
- Create: `components/card/IssueGallery.tsx`
- Modify: `app/card/page.tsx` (mount the gallery)

**Interfaces:**
- Consumes: `drawTicket`, `ISSUES`, `serialFrom`.
- Produces: `<IssueGallery />`.

Five thumbnails from fixed demo ids, drawn by the same `drawTicket`, so the gallery can never advertise a card the generator does not actually produce. It doubles as the determinism check named in the spec.

- [ ] **Step 1: Write the gallery**

Create `components/card/IssueGallery.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { ISSUES } from "@/lib/card/issues";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import type { IssueKey } from "@/lib/card/types";

const FONTS = {
  hand: "var(--font-hand), cursive",
  sticker: "var(--font-sticker), sans-serif",
  mono: "var(--font-mono), ui-monospace, monospace",
};

/* Fixed ids, one per issue, so every visitor sees the same five specimens and
   any unintended change to the drawing code shows up here as a visible diff. */
const SPECIMENS: { key: IssueKey; id: string; name: string; city: string; origin: string }[] = [
  { key: "definitive", id: "specimen-definitive", name: "Maya", city: "Lisbon", origin: "Lisbon, PT" },
  { key: "commemorative", id: "specimen-commemorative", name: "Jonas", city: "Berlin", origin: "Berlin, DE" },
  { key: "firstDay", id: "specimen-firstday", name: "Priya", city: "Toronto", origin: "Toronto, CA" },
  { key: "misprint", id: "specimen-misprint", name: "Ade", city: "Lagos", origin: "Lagos, NG" },
  { key: "inverted", id: "specimen-inverted", name: "Ana", city: "Porto", origin: "Porto, PT" },
];

function Specimen({ spec }: { spec: (typeof SPECIMENS)[number] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = c.clientWidth;
      const cssH = (cssW * CARD_H) / CARD_W;
      c.width = Math.round(cssW * dpr);
      c.height = Math.round(cssH * dpr);
      c.style.height = `${cssH}px`;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      drawTicket(ctx, {
        visitorId: spec.id,
        name: spec.name,
        serial: serialFrom(spec.id),
        // The specimen shows its issue, not the one its id happens to roll.
        issue: ISSUES[spec.key],
        origin: spec.origin,
        city: spec.city,
        date: "23 Aug 2026",
      }, cssW, cssH, FONTS);
    };
    if (document.fonts) document.fonts.ready.then(draw).catch(draw);
    else draw();
  }, [spec]);

  const issue = ISSUES[spec.key];
  return (
    <li>
      <canvas
        ref={ref}
        className="w-full rounded-md"
        role="img"
        aria-label={`Example of a ${issue.name} card`}
      />
      <p className="mt-2 font-mono text-2xs uppercase tracking-label text-foreground">
        {issue.name}
      </p>
      <p className="font-mono text-2xs uppercase tracking-label text-subtle">
        {issue.share}% of cards
      </p>
    </li>
  );
}

export default function IssueGallery() {
  return (
    <section className="mt-14">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        The five issues
      </h2>
      <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">
        Each one changes something its name promises. The Misprint plate really
        does slip, and the Inverted portrait really is upside down.
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {SPECIMENS.map((s) => (
          <Specimen key={s.key} spec={s} />
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Mount it**

In `app/card/page.tsx`, import `IssueGallery` and render it inside the `<Container>` after `<CardMinter />`.

- [ ] **Step 3: Look at it**

Run: `npm run dev`, open `http://localhost:3000/card`.
Expected: five thumbnails, each legible at that size, each visibly different in the way its row of the spec table promises. Confirm the serial and issue text has not collapsed into an unreadable smudge at thumbnail scale; if it has, the stub font fractions in `drawTicket` need raising, not a special case for small sizes.

- [ ] **Step 4: Commit**

```bash
git add components/card/IssueGallery.tsx app/card/page.tsx
git commit -m "Show all five issues, drawn by the same code that mints them"
```

---

## Task 9: Wire it into the site

**Files:**
- Modify: `lib/commandData.ts`
- Modify: `app/sitemap.ts`
- Modify: `data/agent-memory.md`
- Modify: `CLAUDE.md`
- Delete: `app/card/preview/` (the scratch harness, carried this far on purpose)

- [ ] **Step 0: Delete the scratch harness**

```bash
git rm -r app/card/preview
```

Task 4 originally scheduled this for Task 7. It was deferred to here because the preview was the only surface showing all five issues side by side, and the owner used it for visual passes throughout the build. Task 8's issue gallery now does that job on a real page, so the scratch route has nothing left to offer.

Confirm nothing references it: `grep -rn "card/preview" app components lib || echo clean`

- [ ] **Step 1: Add the route to the command palette**

In `lib/commandData.ts`, add one entry to the `nav` array, after the `nav-cv` line:

```ts
{ id: "nav-card", label: "Mint a visitor card", group: "Navigation", href: "/card" },
```

Leave `goToShortcuts` alone. `withGoToKeys` looks the href up and simply finds nothing, so the row renders without a key chip, which is correct: there is no `g` chord for this route.

- [ ] **Step 2: Add the route to the sitemap**

In `app/sitemap.ts`, add to the `routes` array after the `cv` entry:

```ts
    {
      url: `${baseUrl}card`,
      lastModified: today,
    },
```

- [ ] **Step 3: Update the agent memory**

Required by CLAUDE.md's agent-memory rule, not optional. `data/agent-memory.md` documents visitor-facing surfaces in their own sections (`## The shelf (\`/shelf\`)`, `## The coffee long read (\`/coffee\`)`), so the card gets one too rather than a row in the ShopOS shipments table, which is for work history.

Add after the coffee section:

```markdown
## The visitor card (`/card`)

Anyone visiting the site can mint themselves a card: a portrait drawn in their
browser on a perforated stamp, cancelled with a postmark carrying their city and
the date, signed with a name they choose, and downloadable as a PNG.

The portrait is generated from a random id kept in that browser's local storage,
so a person's card is stable and does not change between visits. Nothing is
stored on a server, there is no account, and there is no wallet: "mint" is
flavour, not a blockchain.

Five issues exist, named after stamp collecting, with the share of cards each
one accounts for: Definitive (60%), Commemorative (27%), First day (11.9%),
Misprint (1%) and Inverted (0.1%). Each differs in a way its name promises. The
Misprint plate really does slip, so its frame and portrait print twice slightly
out of register. The Inverted card is printed on black stock with gold ink and
its portrait really is upside down.

If someone asks how to get a rarer one: the issue is fixed to their id and there
is no re-roll. That is deliberate. The card is theirs, not a pull.
```

No em-dashes.

- [ ] **Step 4: Record the conventions this introduced**

In `CLAUDE.md`, under "Other conventions in this repo", add:

```markdown
- **All visitor-card drawing** goes through `lib/card/`. The pure modules (`seed`, `issues`, `cast`) carry vitest tests and must stay free of DOM access; the drawing modules (`portrait`, `sticker`, `ticket`) take a canvas context as a parameter and must never hold module-level mutable state, because the issue gallery renders six canvases on one page. `drawTicket` draws every size: preview, export and thumbnail. Never add a second drawing routine.
```

Also add `npm test` to the Commands block, replacing the "(There is no test script yet.)" line.

- [ ] **Step 5: Run every gate**

```bash
npm test
npm run lint
npm run build
bash scripts/verify-simplification.sh
```

Expected: all four clean, the script exiting 0.

- [ ] **Step 6: Commit**

```bash
git add lib/commandData.ts app/sitemap.ts data/agent-memory.md CLAUDE.md
git commit -m "Wire the card into the palette, the sitemap and Truffy's memory"
```

---

## Task 10: Vendor the Ink Folio engine, retire the lean generator

**Supersedes Tasks 3 and 4.** Runs before Task 5. Their output is deleted here.

**Files:**
- Create: `lib/card/engine/portrait-engine.js`
- Create: `lib/card/engine/portrait-engine.d.ts`
- Create: `lib/card/engine/LICENSE-cyber-crowd.md`
- Create: `lib/card/engine/engine.test.ts`
- Delete: `lib/card/cast.ts`, `lib/card/cast.test.ts`, `lib/card/portrait.ts`, `lib/card/portrait.test.ts`
- Modify: `lib/card/types.ts` (drop the `Cast` type and `CardData.cast`)
- Modify: `app/card/preview/page.tsx` (draw via the engine)

**Source:** `/Users/shashwa7/Desktop/personal/inkfolio/portrait.html`, lines 60 to 1578 inclusive. That range is sections 1 through 7: seeding, palette, geometry, the hand, casting, the portrait, lettering. Sections 8 and 9 (lines 1579 to end) are demo UI and are NOT vendored.

**Interfaces:**
- Produces: `createEngine(ctx: CanvasRenderingContext2D, opts?: { hand?: string }): Engine`, where `Engine` is `{ portrait(name: string, cell: {x,y,w,h}, opts?: PortraitOpts): Traits; handwrite(R, text, cx, cy, size, o?): number }`. `PortraitOpts` is `{ present?: "any"|"femme"|"masc"|"fluid"; variant?: number; scale?: number; force?: Partial<Traits> }`.
- Task 6 consumes `createEngine` and calls `.portrait()`.

- [ ] **Step 1: Extract the source range verbatim**

```bash
sed -n '60,1578p' /Users/shashwa7/Desktop/personal/inkfolio/portrait.html > /tmp/engine-raw.js
wc -l /tmp/engine-raw.js
```

Expected: about 1519 lines. Read the first and last 20 lines to confirm you have whole statements at both ends, not a fragment. Line 60 is `const canvas = document.getElementById('c');` and the range should end inside or just after section 7 (lettering).

- [ ] **Step 2: Wrap it in the factory**

Create `lib/card/engine/portrait-engine.js`. Structure:

```js
/**
 * Vendored from Ink Folio (portrait.html), the generative portrait engine
 * behind app/blogs/posts/drawing-faces-with-code.mdx.
 *
 * Section 4, "the hand", derives from cyber-crowd by Kevin Ngo, MIT licensed.
 * See LICENSE-cyber-crowd.md beside this file. Do not strip that notice.
 *
 * Wrapped rather than rewritten. The renderer's 202 canvas calls reference a
 * bare `ctx`, and its ink registers (CUR_INK, INK_BOOST, DETAIL) are mutated
 * mid-render. Making those locals of this closure gives every instance its own
 * state without editing a single drawing call, which is why this file is a
 * faithful copy and not a port. Two engines on one page cannot see each other,
 * which the issue gallery depends on.
 *
 * There is deliberately no singleton and no default instance. Each caller
 * creates its own.
 */
export function createEngine(ctx, opts = {}) {
  let CUR_INK, INK_BOOST, DETAIL;   // hoisted out of the vendored body

  // ---- BEGIN VENDORED SOURCE (portrait.html lines 60-1578) ----
  // ... the extracted body, with the edits listed in Step 3 ...
  // ---- END VENDORED SOURCE ----

  return { portrait, handwrite, castTraits };
}
```

- [ ] **Step 3: Make exactly these edits to the vendored body, and no others**

1. **Delete** the three lines that reach for the DOM and page state:
   `const canvas = document.getElementById('c');`, `let ctx = canvas.getContext('2d');`, and `let W, H, DPR, bg, wear;`.
   `ctx` now comes from the factory parameter.
2. **Delete** `let cells = [], cols, rows, cw, ch;`, `let mode = 'one';`, `let hovered = null;`. These belong to the demo UI in sections 8 and 9, which are not vendored.
3. **Change** `let CUR_INK = INK;` to `CUR_INK = INK;`, `let INK_BOOST = 1;` to `INK_BOOST = 1;`, and `let DETAIL = 1;` to `DETAIL = 1;`. They are declared at the top of the factory instead, so each instance owns them.
4. **Replace** the `HANDS` array so the caller's font wins:
   `const HANDS = [opts.hand, 'Caveat', '"Bradley Hand"', '"Segoe Print"', 'cursive'].filter(Boolean);`
5. If any function in the range references a symbol that only exists in sections 8 or 9, delete that function. Run Step 5's typecheck to find them; do not go hunting by eye.

**Change nothing else.** Not formatting, not variable names, not a single number. This file's value is that it is the code that already works. If you find something you believe is a bug, leave it and note it in your report.

- [ ] **Step 4: Add the type declarations and the licence**

Create `lib/card/engine/portrait-engine.d.ts`:

```ts
export type Traits = Record<string, unknown> & {
  hairStyle: string;
  glasses: string;
  headwear: string;
  present: string;
};

export type PortraitOpts = {
  present?: "any" | "femme" | "masc" | "fluid";
  variant?: number;
  scale?: number;
  force?: Partial<Traits>;
};

export type Engine = {
  portrait(name: string, cell: { x: number; y: number; w: number; h: number }, opts?: PortraitOpts): Traits;
  handwrite(R: () => number, text: string, cx: number, cy: number, size: number, o?: Record<string, unknown>): number;
  castTraits(R: () => number, present?: string): Traits;
};

export function createEngine(
  ctx: CanvasRenderingContext2D,
  opts?: { hand?: string }
): Engine;
```

Create `lib/card/engine/LICENSE-cyber-crowd.md` containing the standard MIT licence text, `Copyright (c) Kevin Ngo`, with a line above it saying the portrait engine's stroke and texture routines derive from https://github.com/kengocodes/cyber-crowd, and that the notice ships with the code as MIT requires.

- [ ] **Step 5: Delete the lean generator and its type**

```bash
git rm lib/card/cast.ts lib/card/cast.test.ts lib/card/portrait.ts lib/card/portrait.test.ts
```

In `lib/card/types.ts`, delete the `Cast` type entirely and delete the `cast: Cast;` field from `CardData`. The engine casts its own traits from the id it is handed, so nothing outside the engine needs that type.

Then confirm nothing still refers to them:

```bash
npx tsc --noEmit
grep -rn "castForVisitor\|castFrom\|drawPortrait\|from \"@/lib/card/cast\"" app components lib || echo "clean"
```

- [ ] **Step 6: Rewire the scratch preview**

Replace `app/card/preview/page.tsx` so it renders 24 portraits through the engine:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createEngine } from "@/lib/card/engine/portrait-engine";

/** Scratch only. Deleted in Task 7. */
export default function PortraitPreview() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 960 * dpr;
    c.height = 640 * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#f6f1e5";
    ctx.fillRect(0, 0, 960, 640);
    const engine = createEngine(ctx);
    for (let i = 0; i < 24; i++) {
      engine.portrait(`specimen-${i}`, {
        x: (i % 6) * 160, y: Math.floor(i / 6) * 160, w: 160, h: 160,
      });
    }
  }, []);
  return <canvas ref={ref} style={{ width: 960, height: 640 }} />;
}
```

- [ ] **Step 7: Write the smoke test**

Create `lib/card/engine/engine.test.ts`. The same headless recording-stub approach the deleted `portrait.test.ts` used, now aimed at the engine. It must assert:

1. `createEngine(stub)` does not throw and returns an object with `portrait`, `handwrite`, `castTraits`.
2. `engine.portrait("visitor-1", {x:0,y:0,w:160,h:160})` does not throw, returns a traits object, and issued both `stroke` and `fill` calls.
3. `save` and `restore` counts are equal after a portrait. An imbalance leaks clip and transform state into the postmark and the lettering, which draw next.
4. **Instance isolation.** Two engines built over two different stubs, drawn in an interleaved order, produce the same call log as when each is drawn alone. This is the assertion that proves the factory actually fixed the shared-globals problem, so write it carefully and do not settle for a weaker version.
5. **Determinism.** The same id drawn twice produces identical call logs.
6. **Variety.** Twenty different ids produce at least fifteen distinct `hairStyle` values across the returned traits. The engine advertises 17 styles; this catches a casting path that collapsed during extraction.

The stub needs a wider surface than the old one: add `createLinearGradient`, `createRadialGradient` (each returning `{ addColorStop() {} }`), `measureText` returning `{ width: 10 }`, `setLineDash`, `arcTo`, `bezierCurveTo`, `rect`, `fillText`, `strokeText`, `translate`, `rotate`, `scale`, `drawImage`, `putImageData`, `createPattern`, and settable `font`, `textAlign`, `textBaseline`, `shadowColor`, `shadowBlur`, `shadowOffsetX`, `shadowOffsetY`, `globalCompositeOperation`, `filter`. If the engine calls something you did not stub, the test will throw and tell you what to add. That is the test working, not failing.

- [ ] **Step 8: Run every gate**

```bash
npm test
npm run lint
npm run build
npx tsc --noEmit
```

All four clean.

- [ ] **Step 9: Commit**

```bash
git add lib/card/engine app/card/preview/page.tsx lib/card/types.ts
git commit -m "Vendor the Ink Folio engine, and retire the lean generator"
```

---

## Task 11: Make each issue collectible

Raised by the owner after seeing the five real cards side by side. Four changes, all in `lib/card/ticket.ts` unless stated.

**Files:**
- Modify: `lib/card/ticket.ts`, `lib/card/ticket.test.ts`
- Modify: `components/card/CardMinter.tsx` and `components/card/IssueGallery.tsx` if they exist yet (Tasks 7 and 8); if not, Task 7 must load the mark, see change 4.

### Change 1: a subtle stock per issue

The five cards currently differ only by their sticker. Give each its own paper, kept low enough in chroma that it reads as a different batch of stock rather than a coloured card:

```ts
const STOCK: Record<IssueKey, string> = {
  definitive:    "#f6f1e5",  // the base cream, unchanged
  commemorative: "#f4eede",  // a touch deeper, a warmer batch
  firstDay:      "#eef1ef",  // barely cool, the way first day covers lean
  misprint:      "#f7efe8",  // barely pink, an over-inked run
  inverted:      "#17161a",  // unchanged
};
```

Replace `LIGHT.stock` usage with a lookup on `data.issue.key`. Everything else in `LIGHT` stays shared.

While here, fix an inconsistency the Task 6 fix round surfaced: `LIGHT.stamp` is `#fdfaf2` but `DARK.stamp` was set to `#f6f1e5`, so the Inverted card's stamp is a slightly different paper from every other card's. The stamp is its own sheet, stuck onto whatever the card is made of, so it should be the same paper on all five. Set `DARK.stamp` to `#fdfaf2` and leave `LIGHT.stamp` alone. The per-issue tint in `STOCK` above applies to the CARD, never to the stamp.

### Change 2: the Misprint actually misregisters in colour

This is the one that makes the card worth showing someone. A real plate misregistration separates the colour channels, which is why misprints are collectible in the first place. The card currently double-strikes in mono at 0.2 alpha, which just looks blurry.

Replace that with two offset ghosts in process colours, drawn UNDER the true portrait:

```ts
// cyan ghost, up and left
ctx.save();
ctx.globalAlpha = 0.22;
ctx.globalCompositeOperation = "multiply";
ctx.translate(-w * 0.0035, -h * 0.0016);
engine.portrait(data.visitorId, pBox);   // engine paints its own ink; the tint comes from the layer below
ctx.restore();
```

The engine paints in its own near-black ink, so a straight translate gives a grey ghost, not a cyan one. To tint it, draw each ghost into the same context with a composite fill on top of it, clipped to the stamp: after drawing the ghost, `ctx.save()`, clip to the stamp rect, set `globalCompositeOperation = "source-atop"`, fill the stamp rect with `rgba(0,174,239,0.18)` for cyan, `restore()`. Repeat for a magenta ghost offset down and right with `rgba(236,0,140,0.16)`.

If `source-atop` proves unworkable against the stub in tests, fall back to drawing the ghosts at low alpha and accept grey, and say so in the report rather than shipping something that looks wrong. Do not invent a third approach without saying so.

### Change 3: the First day cachet

Real first day covers carry a coloured cachet. Draw the `FIRST DAY OF ISSUE` legend and the cancel's two rings in a deep teal `#1f6f78` instead of `P.ink`, and rule a thin teal line under the legend. Nothing else changes colour. On the Inverted card this does not apply, since Inverted and First day are different issues and cannot co-occur.

### Change 4: branding at the top, and the rarity made legible

The card has a bare band above the stamp. The owner objected to that band earlier when it held nothing; it now gets the brand mark, which is what it was missing.

- Add an optional `mark: HTMLImageElement | null` to the assets parameter `drawTicket` already takes for fonts. When present, draw it at the top left at `w * 0.052` square, with `SHASHWA7.IN` beside it in the mono face, tracked, at `w * 0.019`, in `P.faint`. When null, draw the wordmark alone. **Keep `drawTicket` synchronous**: the caller loads the image and passes it in. Do not add an `await` inside the draw path, because the scale test and the gallery both depend on it staying synchronous.
- Shift the stamp and everything below it down by `h * 0.038` to make room. Every offset is already a fraction of `h`, so this is one constant if the values are expressed relative to a single `TOP` origin. Introduce that origin rather than editing a dozen numbers by hand.
- Remove `shashwa7.in` from the stamp's foot, since it now appears at the top. Keep `one visit` there, centred.
- **The rarity share is currently unreadable**: `w * 0.018` in `veryFaint`. It is the single most interesting fact on the card. Render it at `w * 0.026` in `P.ink`, with a hairline rule above it spanning the right column, so it reads as a figure rather than a footnote.

Callers (`CardMinter`, `IssueGallery`) load the mark once with `new Image()`, set `src = "/brand-mark.png"`, and draw only after `decode()` resolves, alongside the existing font wait.

### Tests

Extend `lib/card/ticket.test.ts`:

1. Each of the five issues fills its own stock colour: assert the first recorded `fillStyle` matches the `STOCK` entry for that issue, and that the five values are distinct.
2. Misprint issues strictly more drawing calls than Definitive for the same id, and records at least one composite-operation assignment. Definitive records none.
3. First day records the teal value in its recorded `strokeStyle` or `fillStyle` assignments; Definitive records none.
4. The wordmark is drawn: `SHASHWA7.IN` appears in recorded `fillText` calls at the top of the card, and does NOT appear in the stamp-foot position any more.
5. `drawTicket` still runs to completion with `mark: null`, drawing the wordmark and no image.
6. The share text is drawn at the larger size: assert the recorded `font` assignment preceding the share `fillText` is the larger of the two stub sizes.

Then re-run the scale test unchanged. It must still pass: every value introduced here is a fraction of `w` or `h`. If it fails, a literal pixel crept in.

- [ ] Run `npm test`, `npm run lint`, `npm run build`, `npx tsc --noEmit`. All clean.
- [ ] Commit.

---

## Task 12: Four defects found on the first real visual pass

Raised by the owner after seeing the rendered gallery. All in `lib/card/ticket.ts` and `lib/card/sticker.ts`.

### Defect 1: the stub's bottom rows are clipped (regression from Task 11)

`ticket.ts` draws the origin line and the share at `h * 0.958 + TOP`, where `TOP = h * 0.038`. That resolves to `0.996h`: six pixels above the card's bottom edge at 1500px. The text and its descenders are cut off. Task 11 introduced `TOP` to make room for the brand row and applied it to every y below, including rows that were already near the bottom.

Fix, and do it structurally rather than by nudging a number: **anchor everything below the tear line to the card's BOTTOM edge instead of to the top.** The stub is a fixed block at the foot of the card, so its rows should be expressed as `h - <fraction>`, not `TOP + <fraction>`. Then no future change to the header can push them off.

Suggested anchors, tune to taste but keep the relationships: share and origin baseline at `h - h * 0.042`, the serial and issue values at `h - h * 0.107`, their caps labels at `h - h * 0.152`, and the tear line at `h - h * 0.218`. Verify the block still sits below the name and does not collide with it.

### Defect 2: the tear notches are painted, not cut

`ticket.ts` fills the two edge notches with a hardcoded `notch` colour (`#e9e2d2` light, `#2a282c` dark) that guesses at the page background. That is why they read as pale circles sitting on the card rather than as bites taken out of it, and it breaks completely if the card is ever shown on a different background or saved and viewed on one.

Fix: punch real holes. Replace the filled arcs with an erase:

```ts
ctx.save();
ctx.globalCompositeOperation = "destination-out";
ctx.beginPath(); ctx.arc(0, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.arc(w, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();
ctx.restore();
```

This makes the notches genuinely transparent, so whatever is behind shows through, and the downloaded PNG carries real alpha there. It matches what `app/cv/page.tsx` does for the CV sheet, where the perforation is a true cut rather than a painted approximation. Read that file's comments around its `NOTCH` constant before you start: it documents why a painted mask was the wrong answer there too.

Delete the now-unused `notch` entry from both palettes.

Check the card's rounded corners still work: they already rely on the fill being a rounded path, so the area outside them is already transparent. The notches now behave the same way, which is the point.

### Defect 3: the sticker does not sit on the card

The sticker reads as printed rather than applied. It has a shadow pass but it is too tight to separate the sticker from the paper.

In `lib/card/sticker.ts`, strengthen the lift: raise `shadowBlur` to about `fontPx * 0.16`, and the offsets to about `fontPx * 0.11` x and `fontPx * 0.13` y, with the shadow colour around `rgba(0,0,0,0.42)`. Keep all four layers and their order. The goal is a vinyl sticker resting on paper with a soft shadow under its lower right, not a hard drop shadow.

### Defect 4: the Misprint looks cheap next to the Inverted

The Inverted card reads as premium because it is restrained: two colours, high contrast, gold on black. The Misprint currently shows bright cyan and magenta frame rectangles at wide offsets, which read as stray coloured boxes rather than as a registration slip, and its pink stock is sickly against the others.

Make it premium through restraint, not more colour:

- Halve the fringe offsets, from `w * 0.0035` / `h * 0.0016` to about `w * 0.0018` / `h * 0.0008`, so the three impressions read as one slipped plate rather than three frames.
- Deepen and calm the inks: cyan from `rgba(0,174,239,0.55)` to about `rgba(0,132,180,0.42)`, magenta from `rgba(236,0,140,0.5)` to about `rgba(190,30,120,0.38)`. Real process inks on absorbent paper are duller than screen primaries.
- Change the Misprint stock in `STOCK` from `#f7efe8` to something closer to the base cream with only a hint of warmth, around `#f6f0e8`. The tint should be felt, not seen.
- Apply the same treatment to the `ONE VISIT` fringe so the frame and the type agree.

Do not add new colours and do not touch the sticker's rainbow gradient: that is the tier's identity and it is working.

### Tests

- The clipped-stub fix needs an assertion: every `fillText` and `tracked` baseline in the stub block must be at least `h * 0.02` above the card's bottom edge. Write it, watch it FAIL against the current code, then fix. This is the assertion that would have caught the regression Task 11 introduced.
- The notch fix needs an assertion that `destination-out` is used and that the old `notch` fill colours appear nowhere in the recorded calls.
- The Misprint colour change needs its existing colour assertions updated to the new values.
- The scale test must still pass. Every new value is a fraction of `w` or `h`.

- [ ] Run `npm test`, `npm run lint`, `npm run build`, `npx tsc --noEmit`, `bash scripts/verify-simplification.sh`. All clean.
- [ ] Commit.

---

## Manual checks before opening the PR

These cannot be automated here and are named in the spec:

- [ ] **Determinism across browsers.** Copy the `shashwa7:visitor-id` value from one browser's localStorage into another's, load `/card` in both, and confirm the cards are identical.
- [ ] **iOS Safari download.** Open `/card` on a real iPhone and press Download. If nothing saves, add the documented fallback: open the blob URL in a new tab so it can be long-pressed. Do not skip this because it works on desktop.
- [ ] **The Definitive card on its own.** Six in ten visitors see it with no sticker. Look at it cold and decide whether it holds up. If it does not, the fix is the card, not another tier.
- [ ] **Long names.** Type 18 characters into the name field and confirm the handwriting does not run past the card edges.
- [ ] **No origin.** Run with the geo headers absent (which is local dev) and confirm the stub reads sensibly with only a date.

---

## Deliberately not in this plan

- **The photo path.** Tracing an uploaded photo into ink is a different algorithm and gets its own spec and PR. The stamp window is already the slot it drops into.
- **Guilloche and registration marks.** Drawn during design, then cut. They were the only elements that existed because there was room rather than because they had a job.
- **Any persistence.** No database, no gallery of minted cards, no re-roll.

## Open question inherited from the spec

The card is drawn on Ink Folio's warm paper (`#f6f1e5`), while `app/og/route.tsx`
draws share previews on `#F1F0EF`, lifted from the favicon so generated imagery
and the app icon read as one system. Matching the OG card would make everything
the site generates share a ground. The palette constant in `lib/card/ticket.ts`
is a two-line change either way, so this can be answered after seeing it real.
