# Candy Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third theme, `candy`, to shashwa7.in: a sticker-sheet look applied to every existing component through new tokens and CSS utilities, with a name-based theme switcher that keeps light and dark exactly as they are.

**Architecture:** The switcher moves from a boolean (`.dark` on/off) to a name (`data-theme` on `<html>`, `.dark` still toggled only for `dark`). Candy is a token block under `:root[data-theme="candy"]` plus a `candy:` Tailwind variant, a `.sticker` component class and a `.tilt-*` set, all scoped to that attribute so they are inert in the Paper themes. Components keep their Paper classes and gain `candy:` classes beside them. No React component is created.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind 3.4 (`tailwind.config.ts`), vitest (`lib/**/*.test.ts`, node environment), `next/font/google`, Radix accordion, sugar-high.

**Spec:** `docs/superpowers/specs/2026-09-16-candy-theme-design.md`

## Global Constraints

- Exactly three themes: `light`, `dark`, `candy`. Candy is light only and ignores `prefers-color-scheme`.
- No new React components. New CSS utilities and one new lib module (`lib/theme.ts`, `lib/candy.ts`) are allowed.
- No dividers in Candy: no bands, rails, ticks, hairlines between rows. Sections separate by whitespace.
- Background in Candy: 1px `hsl(45 34% 89%)` lines every 40px on paper `hsl(45 100% 98%)`.
- Tilt is deterministic by index, never random. Cards under 1°, buttons up to 1.5°, chips and tags up to 2°, avatar and brand mark up to 4°. Prose, inputs, tables, code never tilt. Under 640px cards and buttons do not tilt.
- `scripts/verify-simplification.sh` must exit 0 after every task. In particular: no `text-[Npx]`, no `tracking-[Nem]`, no `font-serif`, no `transition-all`, no hue `241` or `242` in `app/globals.css`, no `AvatarWithThemeSwitch`.
- No `rounded-[Npx]` in class names. Radii go through tokens.
- Motion literals only in `lib/motionVariants.ts`; CSS durations only via `--duration-*` and `--ease-out`.
- `body:has([data-bare])` (the `/offcod8` route) keeps forcing the dark palette and must win over Candy.
- `/card`, `lib/card/*` and `app/og/route.tsx` are not touched.
- No em-dashes in any copy or comment.
- Work on a branch off `main` named `candy-theme`. Commit after every task.

---

## File map

| File | Responsibility |
|---|---|
| `lib/theme.ts` (new) | Theme names, resolution, cycling, DOM application, the boot script string. Pure, tested. |
| `lib/theme.test.ts` (new) | Tests for the above. |
| `lib/candy.ts` (new) | Deterministic tilt and tint class pickers. Pure, tested. |
| `lib/candy.test.ts` (new) | Tests for the above. |
| `app/hooks/useTheme.tsx` (renamed from `useDarkMode.tsx`) | `{ theme, setTheme, cycleTheme }`. |
| `app/layout.tsx` | Boot script from `lib/theme.ts`; Fredoka as `--font-display`. |
| `tailwind.config.ts` | `candy` variant, `candy.*` colours, `display` font, sticker radii and shadows. |
| `app/globals.css` | Candy token block, grid background, display headings, `.sticker`, `.tilt-*`, prose rules. |
| `lib/commandData.ts`, `lib/shortcutsData.ts` | Theme rows and the `t` label. |
| `components/Navbar.tsx`, `components/CommandPalette.tsx`, `components/KeyboardShortcuts.tsx` | Consume `useTheme`; Candy classes. |
| Layout: `components/layout/{Rails,Band,BandLabel,Section,PageBand,Bento}.tsx`, `components/Footer.tsx` | Candy chrome. |
| Controls: `components/About.tsx`, `components/Socials.tsx`, `components/common/{CopyMarkdown,OrgChips,StackIcon,Shimmer}.tsx`, `components/CardNudge.tsx`, `components/ProjectsIndex.tsx`, `components/ui/{button,badge}.tsx` | Candy classes. |
| Cards: `components/{ProjectPreviewCard,ProjectShowcaseCard,ExperienceWork,TechStack,Activity,BookListItem,BlogPosts}.tsx`, `components/common/Book.tsx`, `app/shelf/page.tsx`, `app/blogs/[slug]/page.tsx` | Candy classes. |
| Overlays: `components/Faq.tsx`, `components/ui/accordion.tsx`, `components/common/{StickyScrollSpyTOC,MobileChapters}.tsx` | Candy classes. |
| `components/common/mdx.tsx` | No change except `RoundedImage` classes. |
| `docs/design-system.md` | Candy section; fix the two stale claims. |

---

### Task 0: Branch

**Files:** none

- [ ] **Step 1: Create the branch**

```bash
cd /Users/shashwattirpathi/Desktop/personal/portfolio
git checkout -b candy-theme
git status --short
```

Expected: `.gitignore` modified (pre-existing, leave it), `docs/reference/` and `docs/superpowers/specs/2026-09-16-candy-theme-design.md` untracked.

- [ ] **Step 2: Commit the spec and the scrape reference**

```bash
git add docs/reference/simpsons-concept-scrape.md docs/superpowers/specs/2026-09-16-candy-theme-design.md docs/superpowers/plans/2026-09-17-candy-theme.md
git commit -m "docs: Candy theme spec, plan and source scrape"
```

---

### Task 1: Theme model in `lib/theme.ts`

**Files:**
- Create: `lib/theme.ts`
- Test: `lib/theme.test.ts`

**Interfaces:**
- Produces:
  - `export const THEMES = ["light", "dark", "candy"] as const`
  - `export type Theme = (typeof THEMES)[number]`
  - `export const THEME_STORAGE_KEY = "theme"`
  - `export function isTheme(value: unknown): value is Theme`
  - `export function resolveTheme(stored: string | null, prefersDark: boolean): Theme`
  - `export function nextTheme(current: Theme): Theme` (light, dark, candy, light)
  - `export function applyTheme(root: { dataset: DOMStringMap; classList: { toggle(name: string, force: boolean): unknown } }, theme: Theme): void`
  - `export const THEME_BOOT_SCRIPT: string` (inline script for `<head>`)
  - `export function themeLabel(theme: Theme): "Light" | "Dark" | "Candy"`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/theme.test.ts
import { describe, it, expect } from "vitest";
import {
  THEMES,
  THEME_STORAGE_KEY,
  isTheme,
  resolveTheme,
  nextTheme,
  applyTheme,
  themeLabel,
  THEME_BOOT_SCRIPT,
} from "./theme";

describe("theme names", () => {
  it("has exactly three themes in cycle order", () => {
    expect(THEMES).toEqual(["light", "dark", "candy"]);
  });
  it("uses the same storage key as before", () => {
    expect(THEME_STORAGE_KEY).toBe("theme");
  });
  it("recognises only the three names", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("candy")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });
});

describe("resolveTheme", () => {
  it("follows the OS when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
  it("keeps a stored light or dark regardless of the OS", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("keeps candy regardless of the OS", () => {
    expect(resolveTheme("candy", true)).toBe("candy");
    expect(resolveTheme("candy", false)).toBe("candy");
  });
  it("treats an unknown stored value like nothing stored", () => {
    expect(resolveTheme("purple", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});

describe("nextTheme", () => {
  it("cycles light, dark, candy, light", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("candy");
    expect(nextTheme("candy")).toBe("light");
  });
});

describe("applyTheme", () => {
  function fakeRoot() {
    const classes = new Set<string>();
    return {
      dataset: {} as DOMStringMap,
      classList: {
        toggle(name: string, force: boolean) {
          if (force) classes.add(name);
          else classes.delete(name);
          return force;
        },
      },
      classes,
    };
  }
  it("sets data-theme and toggles .dark only for dark", () => {
    const root = fakeRoot();
    applyTheme(root, "dark");
    expect(root.dataset.theme).toBe("dark");
    expect(root.classes.has("dark")).toBe(true);
    applyTheme(root, "candy");
    expect(root.dataset.theme).toBe("candy");
    expect(root.classes.has("dark")).toBe(false);
    applyTheme(root, "light");
    expect(root.dataset.theme).toBe("light");
    expect(root.classes.has("dark")).toBe(false);
  });
});

describe("themeLabel", () => {
  it("capitalises for people", () => {
    expect(themeLabel("light")).toBe("Light");
    expect(themeLabel("dark")).toBe("Dark");
    expect(themeLabel("candy")).toBe("Candy");
  });
});

describe("THEME_BOOT_SCRIPT", () => {
  function run(stored: string | null, prefersDark: boolean) {
    const classes = new Set<string>();
    const documentElement = {
      dataset: {} as Record<string, string>,
      classList: {
        toggle(name: string, force: boolean) {
          if (force) classes.add(name);
          else classes.delete(name);
        },
      },
      setAttribute(name: string, value: string) {
        if (name === "data-theme") documentElement.dataset.theme = value;
      },
    };
    const sandbox = {
      localStorage: { getItem: (k: string) => (k === "theme" ? stored : null) },
      window: { matchMedia: () => ({ matches: prefersDark }) },
      document: { documentElement },
    };
    const fn = new Function("localStorage", "window", "document", THEME_BOOT_SCRIPT);
    fn(sandbox.localStorage, sandbox.window, sandbox.document);
    return { theme: documentElement.dataset.theme, dark: classes.has("dark") };
  }
  it("mirrors resolveTheme and applyTheme without importing them", () => {
    expect(run(null, true)).toEqual({ theme: "dark", dark: true });
    expect(run(null, false)).toEqual({ theme: "light", dark: false });
    expect(run("candy", true)).toEqual({ theme: "candy", dark: false });
    expect(run("dark", false)).toEqual({ theme: "dark", dark: true });
    expect(run("nonsense", false)).toEqual({ theme: "light", dark: false });
  });
  it("is a single self-contained statement with no template placeholders", () => {
    expect(THEME_BOOT_SCRIPT).not.toContain("${");
    expect(THEME_BOOT_SCRIPT.trim().startsWith("(function")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/theme.test.ts`
Expected: FAIL, `Cannot find module './theme'`.

- [ ] **Step 3: Write `lib/theme.ts`**

```ts
// lib/theme.ts
/**
 * The theme model. Three names, one storage key, one DOM contract.
 *
 * `data-theme` on <html> is the source of truth for CSS. `.dark` is still
 * toggled, and only for `dark`, because dozens of `dark:` utilities and a few
 * `.dark .foo` selectors depend on that class. Candy never sets it.
 *
 * `localStorage["theme"]` is the same key the old boolean switcher used, with
 * the same two values plus "candy", so existing visitors keep their choice.
 * Absent (or garbage) means follow the OS between light and dark. Candy is
 * light only and ignores the OS.
 */
export const THEMES = ["light", "dark", "candy"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "theme";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? "dark" : "light";
}

export function nextTheme(current: Theme): Theme {
  const i = THEMES.indexOf(current);
  return THEMES[(i + 1) % THEMES.length];
}

export function themeLabel(theme: Theme): "Light" | "Dark" | "Candy" {
  return theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Candy";
}

type RootLike = {
  dataset: DOMStringMap;
  classList: { toggle(name: string, force: boolean): unknown };
};

export function applyTheme(root: RootLike, theme: Theme): void {
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
}

/**
 * Inline <head> script. It cannot import this module (it runs before any
 * bundle), so it restates resolveTheme and applyTheme by hand. The test in
 * lib/theme.test.ts runs it against the pure functions so the two cannot
 * drift. Uses setAttribute rather than dataset so it also works on the
 * minimal stub the test hands it.
 */
export const THEME_BOOT_SCRIPT =
  '(function(){var t=localStorage.getItem("theme");var ok=t==="light"||t==="dark"||t==="candy";var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=ok?t:(d?"dark":"light");var r=document.documentElement;r.setAttribute("data-theme",theme);r.classList.toggle("dark",theme==="dark");})();';
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/theme.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/theme.ts lib/theme.test.ts
git commit -m "feat(theme): three-theme model with boot script"
```

---

### Task 2: Switcher wiring

**Files:**
- Rename: `app/hooks/useDarkMode.tsx` to `app/hooks/useTheme.tsx`
- Modify: `app/layout.tsx:265-269`
- Modify: `components/Navbar.tsx`
- Modify: `components/CommandPalette.tsx`
- Modify: `components/KeyboardShortcuts.tsx`
- Modify: `lib/commandData.ts`
- Modify: `lib/shortcutsData.ts`

**Interfaces:**
- Consumes: `lib/theme.ts` (`Theme`, `resolveTheme`, `nextTheme`, `applyTheme`, `THEME_STORAGE_KEY`, `THEME_BOOT_SCRIPT`, `themeLabel`, `isTheme`).
- Produces: `useTheme(): { theme: Theme; setTheme: (t: Theme) => void; cycleTheme: () => void }`. `setTheme` and `cycleTheme` have stable identity (zero-dep `useCallback`). `Command.action` gains `"set-theme"` with `theme?: Theme`, and `"cycle-theme"` replaces `"toggle-theme"`.

- [ ] **Step 1: Rename and rewrite the hook**

```bash
git mv app/hooks/useDarkMode.tsx app/hooks/useTheme.tsx
```

Replace the file's contents with:

```tsx
"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isTheme,
  nextTheme,
  type Theme,
} from "@/lib/theme";

/**
 * Reads the theme the inline script in app/layout.tsx already applied, and
 * writes changes back through the same DOM contract. The script is the only
 * place the theme is applied on load; this hook never re-applies on mount.
 *
 * Three consumers (Navbar, CommandPalette, KeyboardShortcuts) each call this.
 * They stay in sync through the "themechange" event rather than shared state,
 * so a change from any of them reaches all of them. `setTheme` and
 * `cycleTheme` are zero-dep callbacks on purpose: KeyboardShortcuts lists
 * `cycleTheme` in a keydown effect's deps, and a fresh identity per render
 * would re-bind that listener every time.
 */
function readTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  return isTheme(t) ? t : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useLayoutEffect(() => {
    setThemeState(readTheme());
  }, []);

  useEffect(() => {
    const sync = () => setThemeState(readTheme());
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(document.documentElement, next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event("themechange"));
  }, []);

  const cycleTheme = useCallback(() => {
    const next = nextTheme(readTheme());
    applyTheme(document.documentElement, next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event("themechange"));
  }, []);

  return { theme, setTheme, cycleTheme };
}
```

- [ ] **Step 2: Use the boot script in `app/layout.tsx`**

Add the import at the top of `app/layout.tsx`:

```tsx
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
```

Replace the theme `<script>` (the one whose `__html` starts with `(function(){var t=localStorage.getItem("theme")`) with:

```tsx
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
```

- [ ] **Step 3: Update the data files**

In `lib/commandData.ts` change the `Command` type and the actions array:

```ts
import type { Theme } from "@/lib/theme";

export type Command = {
  id: string;
  label: string;
  group: "Navigation" | "Projects" | "Actions";
  href?: string;
  action?: "cycle-theme" | "set-theme" | "copy-email" | "open-shortcuts";
  theme?: Theme;
  keys?: string[];
};
```

```ts
  const actions: Command[] = [
    { id: "act-theme-cycle", label: "Cycle theme", group: "Actions", action: "cycle-theme", keys: ["t"] },
    { id: "act-theme-light", label: "Light theme", group: "Actions", action: "set-theme", theme: "light" },
    { id: "act-theme-dark", label: "Dark theme", group: "Actions", action: "set-theme", theme: "dark" },
    { id: "act-theme-candy", label: "Candy theme", group: "Actions", action: "set-theme", theme: "candy" },
    { id: "act-email", label: "Copy email", group: "Actions", action: "copy-email" },
    { id: "act-shortcuts", label: "Keyboard shortcuts", group: "Actions", action: "open-shortcuts", keys: ["?"] },
  ];
```

In `lib/shortcutsData.ts` change the label:

```ts
      { keys: ["t"], label: "Cycle theme" },
```

- [ ] **Step 4: Update `components/CommandPalette.tsx`**

Replace the import and the hook call:

```tsx
import { useTheme } from "@/app/hooks/useTheme";
```

```tsx
  const { setTheme, cycleTheme } = useTheme();
```

Replace the `run` function's theme branch:

```tsx
  const run = (c: Command) => {
    setOpen(false);
    if (c.href) router.push(c.href);
    else if (c.action === "cycle-theme") cycleTheme();
    else if (c.action === "set-theme" && c.theme) setTheme(c.theme);
    else if (c.action === "copy-email") navigator.clipboard?.writeText("contact@shashwa7.in");
    else if (c.action === "open-shortcuts") window.dispatchEvent(new CustomEvent("open-shortcuts"));
  };
```

- [ ] **Step 5: Update `components/KeyboardShortcuts.tsx`**

```tsx
import { useTheme } from "@/app/hooks/useTheme";
```

```tsx
  const { cycleTheme } = useTheme();
```

In the keydown handler replace `toggleDarkMode();` with `cycleTheme();`, and change the effect deps to `[router, cycleTheme]`.

- [ ] **Step 6: Update `components/Navbar.tsx` control**

Replace the imports:

```tsx
import { Sun, Moon, Circle } from "@phosphor-icons/react/ssr";
import { useTheme } from "@/app/hooks/useTheme";
import { nextTheme, themeLabel } from "@/lib/theme";
```

Replace `const { isDarkMode, toggleDarkMode } = useDarkMode();` with:

```tsx
  const { theme, cycleTheme } = useTheme();
  const upcoming = nextTheme(theme);
```

Replace the theme button:

```tsx
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Theme: ${themeLabel(theme)}. Switch to ${themeLabel(upcoming).toLowerCase()}`}
            className={`${control} w-8 justify-center candy:w-auto candy:gap-1.5 candy:px-3`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : theme === "candy" ? (
              <>
                <Circle weight="fill" className="h-3 w-3 text-candy-pink" />
                <span className="hidden text-xs font-bold md:inline">Candy</span>
              </>
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
```

Note `text-candy-pink` and the `candy:` variant do not exist until Task 3. Tailwind ignores unknown classes, so this compiles now and lights up then.

- [ ] **Step 7: Verify nothing still imports the old hook**

Run: `grep -rn "useDarkMode\|toggle-theme\|toggleDarkMode\|isDarkMode" --include=*.ts --include=*.tsx app components lib`
Expected: no output.

- [ ] **Step 8: Type-check, lint, tests, gate**

Run: `npx tsc --noEmit && npm run lint && npm test && bash scripts/verify-simplification.sh`
Expected: all pass, script exits 0.

- [ ] **Step 9: Manual check**

Run `npm run dev`, open `http://localhost:3000`:
- Clear storage. With OS dark: page is dark, button shows Sun. With OS light: page is light, button shows Moon.
- Press `t` three times: dark, then the button shows the pink dot (page unchanged for now, Candy has no tokens yet), then light. Storage holds `candy` after the second press.
- `Cmd+K`, type "candy", Enter: storage holds `candy`, button shows the dot.
- Reload: same theme, no flash.

- [ ] **Step 10: Commit**

```bash
git add -A app/hooks app/layout.tsx components/Navbar.tsx components/CommandPalette.tsx components/KeyboardShortcuts.tsx lib/commandData.ts lib/shortcutsData.ts
git commit -m "feat(theme): name-based switcher, palette rows, t cycles"
```

---

### Task 3: Candy tokens, utilities and pickers

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx` (fonts)
- Modify: `app/globals.css`
- Create: `lib/candy.ts`
- Test: `lib/candy.test.ts`

**Interfaces:**
- Produces (Tailwind): variant `candy:` (`[data-theme="candy"] &`); colours `candy-pink`, `candy-mint`, `candy-butter`, `candy-sky`, `candy-lavender`; `font-display`; radii `rounded-sticker` (22px), `rounded-tile` (16px), `rounded-tag` (8px); shadows `shadow-sticker-1` to `shadow-sticker-4`.
- Produces (CSS, Candy only): `.sticker`, `.sticker-sm` (thinner cut for chips), `.sticker-flat` (no shadow), `.tilt-a` to `.tilt-i` (always), `.tilt-md-a` to `.tilt-md-i` (640px and up).
- Produces (TS): `tilt(i: number): string`, `tiltMd(i: number): string`, `tint(i: number): string` (a `candy:bg-candy-*` class), `TINT_CLASSES`.

- [ ] **Step 1: Write the failing test for `lib/candy.ts`**

```ts
// lib/candy.test.ts
import { describe, it, expect } from "vitest";
import { TILT_CLASSES, TINT_CLASSES, tilt, tiltMd, tint } from "./candy";

describe("tilt", () => {
  it("has nine fixed slots", () => {
    expect(TILT_CLASSES).toEqual([
      "tilt-a", "tilt-b", "tilt-c", "tilt-d", "tilt-e", "tilt-f", "tilt-g", "tilt-h", "tilt-i",
    ]);
  });
  it("is deterministic and wraps", () => {
    expect(tilt(0)).toBe("tilt-a");
    expect(tilt(8)).toBe("tilt-i");
    expect(tilt(9)).toBe("tilt-a");
    expect(tilt(0)).toBe(tilt(0));
  });
  it("has a 640px-and-up variant with the same slots", () => {
    expect(tiltMd(1)).toBe("tilt-md-b");
    expect(tiltMd(10)).toBe("tilt-md-b");
  });
});

describe("tint", () => {
  it("cycles the five candy tints as full class strings", () => {
    expect(TINT_CLASSES).toEqual([
      "candy:bg-candy-pink",
      "candy:bg-candy-mint",
      "candy:bg-candy-butter",
      "candy:bg-candy-sky",
      "candy:bg-candy-lavender",
    ]);
    expect(tint(0)).toBe("candy:bg-candy-pink");
    expect(tint(5)).toBe("candy:bg-candy-pink");
    expect(tint(7)).toBe("candy:bg-candy-butter");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/candy.test.ts`
Expected: FAIL, `Cannot find module './candy'`.

- [ ] **Step 3: Write `lib/candy.ts`**

```ts
// lib/candy.ts
/**
 * Deterministic pickers for the Candy theme.
 *
 * Tilts and tints are chosen by index, never at random: the server and the
 * client must agree on every class or hydration fails. The class strings are
 * written out in full so Tailwind's scanner sees them.
 */
export const TILT_CLASSES = [
  "tilt-a", "tilt-b", "tilt-c", "tilt-d", "tilt-e", "tilt-f", "tilt-g", "tilt-h", "tilt-i",
] as const;

const TILT_MD_CLASSES = [
  "tilt-md-a", "tilt-md-b", "tilt-md-c", "tilt-md-d", "tilt-md-e", "tilt-md-f", "tilt-md-g", "tilt-md-h", "tilt-md-i",
] as const;

export const TINT_CLASSES = [
  "candy:bg-candy-pink",
  "candy:bg-candy-mint",
  "candy:bg-candy-butter",
  "candy:bg-candy-sky",
  "candy:bg-candy-lavender",
] as const;

/** Always-on tilt, for chips, tags, badges and decorative stickers. */
export function tilt(i: number): string {
  return TILT_CLASSES[Math.abs(i) % TILT_CLASSES.length];
}

/** Tilt only from 640px up, for cards and buttons. */
export function tiltMd(i: number): string {
  return TILT_MD_CLASSES[Math.abs(i) % TILT_MD_CLASSES.length];
}

/** A candy background, cycling the five tints. Inert outside Candy. */
export function tint(i: number): string {
  return TINT_CLASSES[Math.abs(i) % TINT_CLASSES.length];
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/candy.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Extend `tailwind.config.ts`**

Add at the top:

```ts
import plugin from "tailwindcss/plugin";
```

Inside `theme.extend`, change `fontFamily` and `borderRadius`, and add `boxShadow` and the `candy` colours:

```ts
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
        display: ["var(--font-display)", "var(--font-sans)", ...fontFamily.sans],
      },
```

```ts
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Candy only. Undefined in Paper, so always pair with the candy: variant.
        sticker: "var(--sticker-radius-card)",
        tile: "var(--sticker-radius-tile)",
        tag: "var(--sticker-radius-tag)",
      },
      boxShadow: {
        // Candy only. Hard ink offsets, no blur.
        "sticker-1": "var(--sticker-shadow-1)",
        "sticker-2": "var(--sticker-shadow-2)",
        "sticker-3": "var(--sticker-shadow-3)",
        "sticker-4": "var(--sticker-shadow-4)",
        "sticker-press": "var(--sticker-shadow-press)",
      },
```

Inside `colors` add:

```ts
        candy: {
          pink: "hsl(var(--candy-pink))",
          mint: "hsl(var(--candy-mint))",
          butter: "hsl(var(--candy-butter))",
          sky: "hsl(var(--candy-sky))",
          lavender: "hsl(var(--candy-lavender))",
        },
```

Replace `plugins: [],` with:

```ts
  plugins: [
    // `candy:` scopes a utility to the Candy theme. It is an attribute on
    // <html>, like `.dark` is a class there, so `candy:` and `dark:` never
    // both match: Candy never sets `.dark`.
    plugin(({ addVariant }) => {
      addVariant("candy", '[data-theme="candy"] &');
    }),
  ],
```

- [ ] **Step 6: Load Fredoka in `app/layout.tsx`**

Change the font import and add the face:

```tsx
import { DM_Sans, Fredoka } from "next/font/google";
```

```tsx
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-display",
});
```

Add `${fredoka.variable}` to the body className, next to `${dmSans.variable}`.

- [ ] **Step 7: Add the Candy block to `app/globals.css`**

Insert immediately after the `.dark, body:has([data-bare]) { ... }` block (after line 121) and still inside `@layer base`:

```css
  /* Candy. A sticker sheet: warm paper with a faint line grid, ink outlines,
     hard shadows, five tints. Light only; the boot script never pairs it with
     `.dark`, and `body:has([data-bare])` below still wins for /offcod8 because
     it comes later in this layer at equal specificity... except it does not:
     `:root[data-theme="candy"]` is (0,1,1) and `body:has([data-bare])` is
     (0,1,1) too, so source order decides. The bare block is therefore
     restated after this one. */
  :root[data-theme="candy"] {
    --background: 45 100% 98%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
    --elevated: 45 100% 98%;
    --primary: 0 0% 10%;
    --primary-foreground: 0 0% 100%;
    --secondary: 44 36% 94%;
    --secondary-foreground: 0 0% 10%;
    --muted: 44 36% 94%;
    --muted-foreground: 0 0% 23%;
    --subtle: 0 0% 42%;
    --accent: 0 0% 10%;
    --accent-foreground: 0 0% 100%;
    --accent-hover: 0 0% 22%;
    --border: 0 0% 10%;
    --border-strong: 0 0% 10%;
    --input: 0 0% 10%;
    --ring: 348 100% 86%;
    --radius: 1rem;

    --candy-pink: 348 100% 86%;
    --candy-mint: 154 65% 83%;
    --candy-butter: 50 100% 82%;
    --candy-sky: 203 100% 87%;
    --candy-lavender: 263 100% 92%;

    --grid-line: 45 34% 89%;
    --grid-size: 40px;

    --sticker-radius-card: 22px;
    --sticker-radius-tile: 16px;
    --sticker-radius-tag: 8px;
    --sticker-shadow-1: 2px 2px 0 hsl(var(--foreground));
    --sticker-shadow-2: 3px 3px 0 hsl(var(--foreground));
    --sticker-shadow-3: 4px 4px 0 hsl(var(--foreground));
    --sticker-shadow-4: 7px 7px 0 hsl(var(--foreground));
    --sticker-shadow-press: 1px 1px 0 hsl(var(--foreground));

    /* Complete colour values, not triplets. See the note in :root above. */
    --sh-class: #b7791f;
    --sh-identifier: #1a1a1a;
    --sh-sign: #6b6b6b;
    --sh-string: #1f8a5b;
    --sh-keyword: #d6336c;
    --sh-comment: #8a8a8a;
    --sh-jsxliterals: #b7791f;
    --sh-property: #2b7bbf;
    --sh-entity: #7c5cbf;
  }

  /* /offcod8 stays dark in every theme, Candy included. Restated here so it
     comes after the Candy block in source order. */
  body:has([data-bare]) {
    --background: 30 7% 5%;
    --foreground: 35 6% 94%;
    --card: 30 7% 8.5%;
    --card-foreground: 35 6% 94%;
    --elevated: 30 7% 12%;
    --muted: 30 6% 15%;
    --muted-foreground: 35 6% 63%;
    --subtle: 30 5% 55%;
    --accent: 35 8% 94%;
    --accent-foreground: 30 7% 6%;
    --accent-hover: 35 8% 84%;
    --border: 30 6% 16%;
    --border-strong: 30 6% 24%;
    --input: 30 6% 16%;
    --ring: 35 6% 70%;
  }

  [data-theme="candy"] body {
    background-image:
      linear-gradient(hsl(var(--grid-line)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--grid-line)) 1px, transparent 1px);
    background-size: var(--grid-size) var(--grid-size);
  }

  [data-theme="candy"] h1,
  [data-theme="candy"] h2,
  [data-theme="candy"] h3,
  [data-theme="candy"] h4,
  [data-theme="candy"] h5,
  [data-theme="candy"] h6 {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: -0.01em;
  }
```

Then, inside the existing `@layer components { ... }` block (before its closing brace, after `.embed-cover`), add:

```css
  /* ── Candy stickers ──────────────────────────────────────────────────────
   * Every interactive surface in Candy is a die-cut sticker: a white cut
   * edge, an ink outline, a hard offset shadow. Scoped to the theme attribute
   * so these classes are inert in Paper, where the element keeps its own
   * classes. Specificity (0,2,0) beats a plain utility; the :hover and
   * :active rules are (0,3,0) so they also beat `hover:` utilities that the
   * Paper design left on the element.
   * ---------------------------------------------------------------------- */
  [data-theme="candy"] .sticker {
    background-color: #fff;
    border: 3px solid #fff;
    outline: 2px solid hsl(var(--foreground));
    box-shadow: var(--sticker-shadow-3);
    transition:
      transform var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }
  [data-theme="candy"] .sticker-sm {
    border-width: 2px;
    outline-width: 1.5px;
    box-shadow: var(--sticker-shadow-1);
  }
  [data-theme="candy"] .sticker-flat {
    box-shadow: none;
  }
  [data-theme="candy"] a.sticker:hover,
  [data-theme="candy"] button.sticker:hover,
  [data-theme="candy"] .sticker-hover:hover {
    border-color: #fff;
    transform: translateY(-1px) rotate(0);
    box-shadow: var(--sticker-shadow-4);
  }
  [data-theme="candy"] a.sticker:active,
  [data-theme="candy"] button.sticker:active,
  [data-theme="candy"] .sticker-hover:active {
    transform: translate(2px, 2px) rotate(0);
    box-shadow: var(--sticker-shadow-press);
  }

  /* Tilts. Nine fixed slots so a list can pick one by index and the server
     and client agree. `tilt-md-*` is the same set gated to 640px and up, for
     cards and buttons, which stack full width on a phone and should not lean. */
  [data-theme="candy"] .tilt-a { transform: rotate(-2deg); }
  [data-theme="candy"] .tilt-b { transform: rotate(1.5deg); }
  [data-theme="candy"] .tilt-c { transform: rotate(-1deg); }
  [data-theme="candy"] .tilt-d { transform: rotate(2deg); }
  [data-theme="candy"] .tilt-e { transform: rotate(-1.5deg); }
  [data-theme="candy"] .tilt-f { transform: rotate(0.8deg); }
  [data-theme="candy"] .tilt-g { transform: rotate(-0.8deg); }
  [data-theme="candy"] .tilt-h { transform: rotate(4deg); }
  [data-theme="candy"] .tilt-i { transform: rotate(-4deg); }
  @media (min-width: 640px) {
    [data-theme="candy"] .tilt-md-a { transform: rotate(-2deg); }
    [data-theme="candy"] .tilt-md-b { transform: rotate(1.5deg); }
    [data-theme="candy"] .tilt-md-c { transform: rotate(-1deg); }
    [data-theme="candy"] .tilt-md-d { transform: rotate(2deg); }
    [data-theme="candy"] .tilt-md-e { transform: rotate(-1.5deg); }
    [data-theme="candy"] .tilt-md-f { transform: rotate(0.8deg); }
    [data-theme="candy"] .tilt-md-g { transform: rotate(-0.8deg); }
    [data-theme="candy"] .tilt-md-h { transform: rotate(4deg); }
    [data-theme="candy"] .tilt-md-i { transform: rotate(-4deg); }
  }
  /* Shadows step down one size on a phone. */
  @media (max-width: 639px) {
    [data-theme="candy"] .sticker { box-shadow: var(--sticker-shadow-2); }
    [data-theme="candy"] .sticker-sm { box-shadow: var(--sticker-shadow-1); }
    [data-theme="candy"] .sticker-flat { box-shadow: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-theme="candy"] a.sticker:active,
    [data-theme="candy"] button.sticker:active,
    [data-theme="candy"] .sticker-hover:active {
      transform: none;
    }
  }
```

- [ ] **Step 8: Gate, type-check, tests**

Run: `bash scripts/verify-simplification.sh && npx tsc --noEmit && npm test`
Expected: exit 0, C14 reports 0 (grep for `24[12] [0-9]+%` finds nothing: the hues used are 45, 44, 348, 154, 50, 203, 263).

- [ ] **Step 9: Manual check**

`npm run dev`, press `t` until Candy. Expected: paper background with a faint 40px grid, ink text, headings in Fredoka, the navbar control shows the pink dot and "Candy". Nothing else changes yet. Switch to light and dark: identical to before this branch (compare with `git stash` if unsure).

- [ ] **Step 10: Commit**

```bash
git add tailwind.config.ts app/layout.tsx app/globals.css lib/candy.ts lib/candy.test.ts
git commit -m "feat(candy): tokens, grid paper, display face, sticker and tilt utilities"
```

---

### Task 4: Section chrome

**Files:**
- Modify: `components/layout/Rails.tsx`
- Modify: `components/layout/Band.tsx`
- Modify: `components/layout/BandLabel.tsx`
- Modify: `components/layout/Section.tsx`
- Modify: `components/layout/PageBand.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `components/Footer.tsx`
- Modify: `app/globals.css` (band gutters, plate rules, wordmark)

**Interfaces:**
- Consumes: `candy:` variant, `.sticker`, `.sticker-sm`, `.tilt-*`, `tint()`.

- [ ] **Step 1: Hide rails and band lines in Candy**

`components/layout/Rails.tsx`, add `candy:hidden`:

```tsx
      className="page-rails pointer-events-none absolute inset-0 mx-auto max-w-[var(--measure)] border-x border-border candy:hidden"
```

`components/layout/Band.tsx`, strip the lines but keep the row:

```tsx
      className={cn(
        "band-gutters relative border-b border-border candy:border-0",
        !flush && "border-t",
        className
      )}
```

and give the tick `candy:hidden`:

```tsx
      <span aria-hidden className="band-tick candy:hidden" />
```

In `app/globals.css`, inside `@layer components`, add right after the `.band-gutters::after { right: 0; }` line:

```css
  [data-theme="candy"] .band-gutters::before,
  [data-theme="candy"] .band-gutters::after {
    display: none;
  }
```

- [ ] **Step 2: BandLabel becomes a sticker tag in Candy**

`components/layout/BandLabel.tsx`:

```tsx
import Label from "./Label";

export default function BandLabel({
  id,
  of,
  name,
  tone = "butter",
}: {
  id: string;
  of?: string;
  name?: string;
  /** Candy only: sections are butter, secondary pages lavender. */
  tone?: "butter" | "lavender";
}) {
  const candyTone = tone === "butter" ? "candy:bg-candy-butter" : "candy:bg-candy-lavender";
  return (
    <Label
      className={`candy:sticker candy:sticker-sm candy:inline-flex candy:items-center candy:gap-2 candy:rounded-tag candy:px-3 candy:py-1.5 candy:font-semibold candy:text-foreground candy:tilt-e ${candyTone}`}
    >
      <span className="text-foreground">
        [ {id}
        {of ? ` / ${of}` : ""} ]
      </span>
      {name ? (
        <>
          <span className="px-2 text-border-strong candy:opacity-50 candy:text-foreground">·</span>
          {name}
        </>
      ) : null}
    </Label>
  );
}
```

`components/layout/PageBand.tsx`, pass the tone:

```tsx
      <BandLabel id={id} name={name} tone="lavender" />
```

- [ ] **Step 3: Section title spacing**

`components/layout/Section.tsx`, the `h2` gets a little more air under the sticker in Candy:

```tsx
          <h2 className="mb-8 text-2xl text-foreground md:text-3xl candy:mt-2">{title}</h2>
```

- [ ] **Step 4: Navbar chrome**

In `components/Navbar.tsx`:

Header: drop the rule in Candy.

```tsx
    <header className="site-navbar sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl candy:border-0">
```

Brand mark: a tilted white sticker tile around it.

```tsx
            <Link href="/" aria-label="offcod8, home" className="flex shrink-0 candy:sticker candy:sticker-sm candy:rounded-tag candy:p-1.5 candy:tilt-a">
```

Desktop links: current link gets a pink highlight bar instead of the underline.

```tsx
                  className={`relative text-sm transition-colors duration-fast ease-out candy:font-semibold candy:px-1 ${
                    current
                      ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-foreground candy:after:hidden candy:bg-[linear-gradient(transparent_60%,hsl(var(--candy-pink))_60%)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
```

`control` constant: sticker pill in Candy.

```tsx
const control =
  "flex h-8 items-center rounded-md bg-elevated text-muted-foreground transition-[color,background-color,transform] duration-fast ease-out hover:bg-border-strong/30 hover:text-foreground active:scale-[0.94] candy:sticker candy:sticker-sm candy:rounded-full candy:bg-white candy:text-foreground candy:hover:bg-white";
```

CV link: butter sticker pill.

```tsx
            className="flex h-8 items-center rounded-md bg-accent px-3 text-sm font-semibold leading-none text-accent-foreground transition-[background-color,transform] duration-fast ease-out hover:bg-accent-hover active:scale-[0.94] md:hidden candy:sticker candy:sticker-sm candy:rounded-full candy:bg-candy-butter candy:text-foreground candy:hover:bg-candy-butter candy:tilt-d"
```

Mobile menu: no top rule, links become full-width white pills.

```tsx
          <div className="border-t border-border candy:border-0">
            <Container>
              <ul className="candy:flex candy:flex-col candy:gap-2 candy:py-3">
```

```tsx
                        className="block py-3 text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground aria-[current=page]:text-foreground candy:sticker candy:sticker-sm candy:rounded-full candy:px-4 candy:py-2.5 candy:font-semibold candy:text-foreground candy:aria-[current=page]:bg-candy-pink"
```

- [ ] **Step 5: Footer**

In `components/Footer.tsx`:

```tsx
    <footer className="site-footer mt-24 border-t border-border candy:border-0">
```

Brand mark in the Studio column: `candy:sticker candy:sticker-sm candy:rounded-tag candy:p-1 candy:tilt-i` on the `span` with the mask (add to its className, keep the style).

Plate wrapper: no rules.

```tsx
        className="relative select-none overflow-hidden border-t border-border py-9 candy:border-0"
```

Both `plate-rule` spans: add `candy:hidden`.

Wordmark: a white Fredoka sticker with an ink stroke and a pink offset shadow.

```tsx
        <p className="plate-wordmark px-8 text-center text-[clamp(2.75rem,11vw,8rem)] font-bold leading-[0.86] tracking-tight candy:font-display candy:tilt-a">
```

In `app/globals.css`, inside `@layer components`, after the `.plate-rule` rule:

```css
  [data-theme="candy"] .plate-wordmark {
    color: #fff;
    -webkit-text-stroke: 3px hsl(var(--foreground));
    text-shadow: 10px 10px 0 hsl(var(--candy-pink));
  }
```

Legal bar: `border-t border-border candy:border-0` on its wrapper div.

- [ ] **Step 6: Gate and manual check**

Run: `bash scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint`
Expected: exit 0.

`npm run dev`, Candy: no rails, no band lines, no dot gutters, no tick; each section opens with a butter sticker label and a Fredoka title; navbar has no rule and the current link sits on a pink bar; footer has no rules and the wordmark is a white outlined sticker with a pink shadow. Light and dark: unchanged.

- [ ] **Step 7: Commit**

```bash
git add components/layout components/Navbar.tsx components/Footer.tsx app/globals.css
git commit -m "feat(candy): section chrome without dividers, sticker labels, navbar and footer"
```

---

### Task 5: Controls, chips and labels

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/badge.tsx`
- Modify: `components/common/OrgChips.tsx`
- Modify: `components/common/StackIcon.tsx`
- Modify: `components/common/Shimmer.tsx` (no change if it only forwards `className`; verify)
- Modify: `components/common/CopyMarkdown.tsx`
- Modify: `components/CardNudge.tsx`
- Modify: `components/Socials.tsx`
- Modify: `components/About.tsx`
- Modify: `components/ProjectsIndex.tsx`
- Modify: `components/CommandPalette.tsx` (kbd), `components/KeyboardShortcuts.tsx` (kbd)

- [ ] **Step 1: Button and Badge variants**

`components/ui/button.tsx`, in `variants.variant`:

```ts
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 candy:sticker candy:rounded-full candy:bg-candy-pink candy:text-foreground candy:shadow-none candy:hover:bg-candy-pink candy:font-bold",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground candy:sticker candy:rounded-full candy:bg-white candy:text-foreground candy:shadow-none candy:hover:bg-white candy:hover:text-foreground candy:font-bold",
```

Note: `candy:shadow-none` removes shadcn's `shadow` utility so `.sticker`'s own `box-shadow` (higher specificity) is the only one. Keep the other variants untouched.

In `variants.size`: no change.

`components/ui/badge.tsx`, `secondary`:

```ts
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 candy:sticker candy:sticker-sm candy:sticker-flat candy:rounded-full candy:bg-candy-butter candy:font-bold candy:tilt-a",
```

- [ ] **Step 2: OrgChips**

`components/common/OrgChips.tsx`:

```tsx
export function EmploymentTag({ employment }: { employment?: "full-time" | "contract" }) {
  if (!employment) return null;
  const label = employment === "full-time" ? "Full-time" : "Contract";
  return (
    <span className="inline-flex items-center rounded-sm border border-border-strong px-1.5 py-0.5 font-mono text-2xs uppercase tracking-label text-muted-foreground candy:sticker candy:sticker-sm candy:sticker-flat candy:rounded-tag candy:font-semibold candy:text-foreground">
      {label}
    </span>
  );
}

export function Tag({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  return (
    <span className={`inline-flex items-center rounded-sm border border-border bg-elevated px-2 py-0.5 font-mono text-2xs text-muted-foreground candy:sticker candy:sticker-sm candy:sticker-flat candy:rounded-full candy:text-foreground ${tint(index)}`}>
      {children}
    </span>
  );
}

export function OrgLinkChip({ href, label, icon = "arrow", index = 0 }: { href: string; label: string; icon?: "arrow" | "external"; index?: number }) {
  const Icon = icon === "external" ? ArrowSquareOut : ArrowUpRight;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-2xs uppercase tracking-label text-muted-foreground transition-colors duration-base ease-out hover:border-border-strong hover:text-foreground candy:sticker candy:sticker-sm candy:rounded-tag candy:font-semibold candy:text-foreground ${tilt(index)}`}
    >
      {label}
      <Icon className="h-2.5 w-2.5" />
    </a>
  );
}
```

Add `import { tilt, tint } from "@/lib/candy";` at the top. The `index` props default to 0 so existing call sites compile; `ExperienceWork` passes real indices in Task 6.

- [ ] **Step 3: StackIcon**

In `components/common/StackIcon.tsx`, the labelled pill:

```tsx
    <span
      className={cn(
        "group inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3.5 py-2 text-xs text-muted-foreground transition-colors duration-base ease-out hover:border-border-strong hover:bg-elevated hover:text-foreground",
        "candy:sticker candy:sticker-sm candy:rounded-full candy:font-semibold candy:text-foreground candy:hover:bg-white",
        className
      )}
    >
```

The glyph wrapper: `"text-subtle transition-colors group-hover:text-foreground candy:text-foreground"`.

The icon-only variant: `"inline-flex items-center text-muted-foreground transition-colors hover:text-foreground candy:text-foreground"`.

- [ ] **Step 4: CopyMarkdown, CardNudge, Socials**

`components/common/CopyMarkdown.tsx`: aside and both buttons.

```tsx
    <aside className="mt-12 rounded-lg border border-border bg-card p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5 candy:sticker candy:rounded-sticker candy:tilt-md-f">
```

Copy button, replace the third `cn` argument line:

```tsx
            "bg-accent text-accent-foreground hover:bg-accent-hover",
            "candy:sticker candy:rounded-full candy:bg-candy-pink candy:text-foreground candy:hover:bg-candy-pink candy:font-bold",
            copied && "candy:bg-candy-butter candy:hover:bg-candy-butter"
```

View raw link:

```tsx
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong px-4 text-sm text-muted-foreground transition-colors duration-fast ease-out hover:bg-muted hover:text-foreground candy:sticker candy:rounded-full candy:text-foreground candy:font-bold candy:hover:bg-white"
```

`components/CardNudge.tsx`, the Link:

```tsx
        "group inline-flex items-center gap-2.5 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-med ease-out hover:bg-elevated candy:sticker candy:rounded-full candy:font-bold candy:hover:bg-white candy:tilt-md-b",
```

`components/Socials.tsx`: email CTA and social links.

```tsx
            className="inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity candy:sticker candy:rounded-full candy:bg-candy-pink candy:text-foreground candy:font-bold candy:hover:opacity-100 candy:tilt-md-c"
```

```tsx
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 hover:text-foreground transition-colors candy:sticker candy:sticker-sm candy:rounded-full candy:px-3 candy:py-1.5 candy:font-semibold candy:text-foreground ${tilt(i)}`}
              >
```

Change the map to `socialLinks.map(({ name, href }, i) => {` and import `tilt` from `@/lib/candy`.

- [ ] **Step 5: About hero**

In `components/About.tsx` import `tint, tilt` from `@/lib/candy`, then:

Avatar link:

```tsx
                  className="group relative block shrink-0 overflow-hidden rounded-2xl border border-border-strong shadow-md shadow-black/10 dark:shadow-lg dark:shadow-black/40 candy:sticker candy:rounded-full candy:shadow-none candy:tilt-i"
```

Verified mark:

```tsx
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-foreground text-background candy:h-[18px] candy:w-[18px] candy:bg-candy-mint candy:text-foreground candy:outline candy:outline-[1.5px] candy:outline-foreground"
```

Headline emphasis:

```tsx
            <span className="font-semibold candy:bg-candy-butter candy:px-2 candy:rounded-tag candy:[box-decoration-break:clone]">ship and scale</span>
```

Lede email link: `candy:no-underline candy:bg-[linear-gradient(transparent_55%,hsl(var(--candy-butter))_55%)] candy:font-semibold candy:hover:bg-[linear-gradient(transparent_0%,hsl(var(--candy-pink))_0%)]` appended to its className.

Primary CTA "View selected work":

```tsx
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[color,background-color,transform] duration-fast ease-out hover:bg-accent-hover active:scale-[0.97] candy:sticker candy:rounded-full candy:border-white candy:bg-candy-pink candy:text-foreground candy:font-bold candy:hover:bg-candy-pink candy:tilt-md-e"
```

Secondary CTA "Get in touch":

```tsx
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-[color,background-color,border-color,transform] duration-fast ease-out hover:border-foreground hover:bg-elevated active:scale-[0.97] candy:sticker candy:rounded-full candy:font-bold candy:hover:bg-white candy:hover:border-white candy:tilt-md-b"
```

Social icon buttons (the `sm:absolute` list): append `candy:sticker candy:sticker-sm candy:rounded-full candy:text-foreground candy:hover:bg-white` to their className.

Client avatars in the brand row: append `candy:outline-foreground candy:outline-[1.5px] candy:ring-0` to the `cn(...)` first string.

Stats band: replace the wrapper and cells so the four numbers become round stickers in Candy while keeping the Paper grid untouched.

```tsx
        <Container width="reading" className="border-t border-border candy:border-0">
          <div className="-mx-6 grid grid-cols-2 md:mx-0 md:grid-cols-4 candy:mx-0 candy:gap-4 candy:px-1">
            {stats.map((s, i) => (
              <div
                key={s.c}
                className={cn(
                  "px-6 py-4 md:px-0",
                  i > 0 && "md:border-l md:border-border md:pl-4",
                  i % 2 === 1 && "border-l border-border",
                  i >= 2 && "border-t border-border md:border-t-0",
                  "candy:border-0 candy:sticker candy:rounded-full candy:aspect-square candy:flex candy:flex-col candy:items-center candy:justify-center candy:p-3 candy:text-center",
                  tint(i),
                  tilt(i + 7),
                )}
              >
                <div className="text-xl font-medium tabular-nums tracking-tight text-foreground candy:font-display candy:text-3xl candy:font-bold">
                  {s.n}
                </div>
                <div className="mt-1.5 font-mono text-2xs uppercase tracking-label text-subtle candy:font-sans candy:normal-case candy:tracking-normal candy:text-xs candy:font-bold candy:text-foreground">
                  {s.c}
                </div>
              </div>
            ))}
          </div>
        </Container>
```

- [ ] **Step 6: Filter chips and kbd chips**

`components/ProjectsIndex.tsx` button className:

```tsx
              className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-label
                transition-[color,background-color,border-color,transform]
                duration-fast ease-out active:scale-[0.97] candy:sticker candy:sticker-sm candy:sticker-flat candy:rounded-full candy:font-semibold ${
                active === f.tag
                  ? "border-accent bg-accent text-accent-foreground candy:bg-foreground candy:text-background"
                  : "border-border text-muted-foreground hover:text-foreground candy:text-foreground"
              }`}
```

`components/CommandPalette.tsx` kbd:

```tsx
                                  className={`grid h-[18px] min-w-[18px] place-items-center rounded-md border px-1 font-mono text-2xs candy:border-foreground candy:border-b-[3px] candy:bg-white candy:text-foreground candy:font-semibold ${
```

`components/KeyboardShortcuts.tsx` kbd:

```tsx
                              className="grid h-6 min-w-[24px] place-items-center rounded-md border border-border-strong bg-card px-1.5 font-mono text-xs text-muted-foreground candy:border-2 candy:border-foreground candy:border-b-4 candy:bg-white candy:text-foreground candy:font-semibold"
```

- [ ] **Step 7: Gate and manual check**

Run: `bash scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint && npm test`
Expected: exit 0, tests pass.

`npm run dev`, Candy homepage: avatar is a tilted round sticker; "ship and scale" sits on a butter block; both hero buttons are sticker pills, pink and white; the four stats are round tinted stickers; contact section has a pink email pill, a white nudge pill and three social pills; org link chips are white tags. Hover a pill: it lifts and its shadow grows; press: it sinks. Under 640px the buttons stop tilting. Light and dark: unchanged.

- [ ] **Step 8: Commit**

```bash
git add components/ui components/common/OrgChips.tsx components/common/StackIcon.tsx components/common/CopyMarkdown.tsx components/CardNudge.tsx components/Socials.tsx components/About.tsx components/ProjectsIndex.tsx components/CommandPalette.tsx components/KeyboardShortcuts.tsx
git commit -m "feat(candy): sticker buttons, chips, labels and hero"
```

---

### Task 6: Cards and lists

**Files:**
- Modify: `components/ProjectPreviewCard.tsx`
- Modify: `components/ProjectShowcaseCard.tsx`
- Modify: `components/ExperienceWork.tsx`
- Modify: `components/Projects.tsx`
- Modify: `components/TechStack.tsx`
- Modify: `components/layout/Bento.tsx`
- Modify: `components/Activity.tsx`
- Modify: `components/BookListItem.tsx`
- Modify: `components/common/Book.tsx`
- Modify: `components/BlogPosts.tsx`
- Modify: `app/shelf/page.tsx`
- Modify: `app/blogs/[slug]/page.tsx`

**Interfaces:**
- `ProjectPreviewCard` and `ProjectShowcaseCard` gain an optional `index?: number` prop (default 0) used for tilt and tint. Callers pass the map index.

- [ ] **Step 1: ProjectPreviewCard**

```tsx
import { tilt, tiltMd, tint } from "@/lib/candy";

export default function ProjectPreviewCard({ project, index = 0 }: { project: ProjectCardData; index?: number }) {
  return (
    <Link
      href={project.href}
      className={`group flex overflow-hidden rounded-lg border border-border bg-card transition-colors duration-base ease-out hover:border-border-strong candy:sticker candy:rounded-tile candy:border-white candy:hover:border-white ${tiltMd(index + 5)}`}
    >
      <span className={`relative w-[4.5rem] shrink-0 self-stretch bg-elevated sm:w-20 candy:border-r-2 candy:border-foreground ${tint(index)}`}>
```

Badge wrapper `Shimmer` className: append `candy:rounded-tag candy:border-foreground candy:bg-candy-pink`.

Metric span: append `candy:text-foreground`.

- [ ] **Step 2: ProjectShowcaseCard**

```tsx
import { tiltMd, tint } from "@/lib/candy";

export default function ProjectShowcaseCard({ project, index = 0 }: { project: ProjectCardData; index?: number }) {
  return (
    <Link
      href={project.href}
      className={`group block overflow-hidden rounded-2xl border border-border bg-card transition-[transform,border-color] duration-base ease-out hover:-translate-y-0.5 hover:border-border-strong active:scale-[0.99] candy:sticker candy:rounded-sticker candy:border-white candy:hover:border-white ${tiltMd(index + 6)}`}
    >
      <div className={`relative aspect-[16/10] overflow-hidden bg-elevated candy:border-b-2 candy:border-foreground ${tint(index)}`}>
```

Badge Shimmer: append `candy:rounded-tag candy:border-foreground candy:bg-white candy:tilt-a`.
Metric span: append `candy:rounded-tag candy:border-foreground candy:bg-candy-butter candy:text-foreground candy:tilt-d`.
Play circle: append `candy:bg-candy-pink candy:text-foreground candy:border-2 candy:border-foreground candy:shadow-sticker-1`.
Title `h3`: unchanged (headings are already Fredoka in Candy).
"Case study" span: append `candy:font-semibold candy:bg-[linear-gradient(transparent_55%,hsl(var(--candy-mint))_55%)]`.

- [ ] **Step 3: Pass indices from the callers**

`components/Projects.tsx`: `sideProjects.map((p, i) => <ProjectPreviewCard key={p.id} project={sideProjectToCard(p)} index={i} />)`.
`components/ProjectsIndex.tsx`: `shown.map((p, i) => <ProjectShowcaseCard key={p.id} project={sideProjectToCard(p)} index={i} />)`.
`components/ExperienceWork.tsx`: `featured.map((p, i) => <ProjectPreviewCard key={p.id} project={workProjectToCard(org.slug, p)} index={i} />)`.

- [ ] **Step 4: ExperienceWork org block**

Logo well: append `candy:rounded-tag candy:ring-0 candy:outline candy:outline-2 candy:outline-foreground candy:tilt-i` to the `span` around the org `Image`.

Rail wrapper: hide the line in Candy.

```tsx
              <div className="relative pl-9 pt-2 before:absolute before:left-3 before:top-0 before:bottom-[1.625rem] before:w-px before:bg-border candy:before:hidden">
```

Skills: `org.skills.map((s, i) => (<li key={s} className="flex"><Tag index={i}>{s}</Tag></li>))`.

Highlight bullets: `className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle candy:h-2 candy:w-2 candy:bg-candy-pink candy:outline candy:outline-[1.5px] candy:outline-foreground"`.

Org link chips: pass `index={0}`, `index={1}`, `index={2}` to the three `OrgLinkChip` calls.

Deep-dive link: append `candy:no-underline candy:font-semibold candy:bg-[linear-gradient(transparent_55%,hsl(var(--candy-mint))_55%)]`.

Elbow span at the bottom: append `candy:hidden`.

- [ ] **Step 5: TechStack**

Tier container: `className="divide-y divide-border candy:divide-y-0"`.
Tier 0 `StackIcon` className: `"border-border-strong px-4 py-2 text-sm font-medium text-foreground candy:h-10"`.
Tier 1 `StackIcon` className: `"px-2.5 py-1 candy:sticker-sm"`.

- [ ] **Step 6: Bento and Activity**

`components/layout/Bento.tsx`:

```tsx
    <div className="overflow-hidden rounded-2xl border border-border candy:sticker candy:rounded-sticker candy:border-white">
      <div className={cn("grid gap-px bg-border candy:gap-[2px] candy:bg-foreground", className)}>{children}</div>
    </div>
```

`components/Activity.tsx`: tint the cells.
- Writing cell: `className="bg-card p-5 candy:bg-candy-butter"`.
- Currently cell: `className="bg-card p-5 candy:bg-candy-mint"`.
- Reading strip: unchanged (white).
- Book rows: unchanged.
- Off the clock: `className="col-span-full bg-card p-5 candy:bg-candy-sky"`.
- "Building at ShopOS" `p`: append `candy:font-display`.
- Both "View all" and the two inline links: append `candy:font-semibold candy:text-foreground`.

- [ ] **Step 7: BookListItem and Book**

`components/BookListItem.tsx`:
- Cover: append `candy:rounded-tag candy:border-2 candy:border-foreground candy:tilt-c`.
- Track: append `candy:h-2 candy:bg-white candy:outline candy:outline-[1.5px] candy:outline-foreground`.
- Fill: append `candy:bg-candy-pink candy:border-r candy:border-foreground`.

`components/common/Book.tsx`:
- Link: append `candy:sticker candy:rounded-tile candy:border-white candy:hover:border-white candy:tilt-md-c`.
- Done badge: append `candy:bg-candy-mint candy:text-foreground candy:ring-0 candy:outline candy:outline-2 candy:outline-foreground`.
- Info overlay: append `candy:bg-white candy:border-t-2 candy:border-foreground candy:backdrop-blur-none`.

- [ ] **Step 8: BlogPosts rows and shelf cards**

`components/BlogPosts.tsx`:
- `ul`: `className="divide-y divide-border candy:divide-y-0"`.
- Link row: append `candy:py-[18px]`.
- Thumb span: append `candy:sticker candy:sticker-sm candy:rounded-tile candy:ring-0 candy:border-white ${tint(i)} ${tilt(i)}`; change the map to `posts.map((post, i) =>` and import `tilt, tint`.
- Tag chips: append `candy:sticker candy:sticker-sm candy:sticker-flat candy:rounded-tag candy:font-semibold candy:text-foreground ${tint(i)}` (the tag map already has `i`).

`app/shelf/page.tsx`: every element whose className contains `rounded-2xl border border-border bg-card` gets `candy:sticker candy:rounded-sticker candy:border-white` appended; the ones that are links also get `candy:hover:border-white`.

- [ ] **Step 9: Blog post page**

In `app/blogs/[slug]/page.tsx`:
- Hero image wrapper: append `candy:sticker candy:rounded-tile candy:border-white candy:bg-candy-sky candy:tilt-g`.
- Newer card: append `candy:sticker candy:sticker-sm candy:rounded-tile candy:border-white candy:hover:border-white candy:bg-candy-sky candy:tilt-c`.
- Older card: append `candy:sticker candy:sticker-sm candy:rounded-tile candy:border-white candy:hover:border-white candy:bg-candy-butter candy:tilt-b`.
- The `nav` wrapper: `border-t border-border` gains `candy:border-0`.
- Badge tags already handled by Task 5.

- [ ] **Step 10: Gate and manual check**

Run: `bash scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint`
Expected: exit 0.

`npm run dev`, Candy: preview cards are tinted-well sticker tiles leaning opposite ways; `/projects` shows sticker cards with a pink play circle; the org block has no rail line, tinted skill pills and pink bullets; the Now bento is a sticker with an ink grid and tinted cells; `/blogs` rows have no dividers and tilted tinted thumbs; `/books` covers are sticker tiles; a post's hero is a tilted sky sticker and the Newer/Older cards are sky and butter. Light and dark: unchanged.

- [ ] **Step 11: Commit**

```bash
git add components app/shelf/page.tsx "app/blogs/[slug]/page.tsx"
git commit -m "feat(candy): sticker cards, lists, bento and post page"
```

---

### Task 7: FAQ, overlays and the table of contents

**Files:**
- Modify: `components/Faq.tsx`
- Modify: `components/ui/accordion.tsx`
- Modify: `components/CommandPalette.tsx`
- Modify: `components/KeyboardShortcuts.tsx`
- Modify: `components/common/StickyScrollSpyTOC.tsx`
- Modify: `components/common/MobileChapters.tsx`

- [ ] **Step 1: FAQ as a stack of stickers**

`components/Faq.tsx`:

```tsx
import { tilt } from "@/lib/candy";
```

```tsx
      <Accordion type="single" collapsible defaultValue="faq-0" className="overflow-hidden rounded-2xl border border-border candy:overflow-visible candy:rounded-none candy:border-0 candy:flex candy:flex-col candy:gap-3.5">
        {faqs.map((f, i) => (
          <AccordionItem
            key={f.q}
            value={`faq-${i}`}
            className={`border-b border-border px-5 last:border-b-0 candy:sticker candy:sticker-hover candy:rounded-sticker candy:border-white candy:px-5 candy:data-[state=open]:bg-candy-pink candy:data-[state=open]:shadow-sticker-4 candy:data-[state=open]:rotate-0 ${tilt(i + 5)}`}
          >
            <AccordionTrigger className="py-4 text-left text-base font-medium text-foreground candy:font-bold candy:hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground candy:text-foreground/80">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
```

`components/ui/accordion.tsx`, the caret:

```tsx
      <CaretDown className="h-4 w-4 shrink-0 text-subtle transition-transform duration-base ease-out candy:h-[30px] candy:w-[30px] candy:rounded-full candy:bg-white candy:p-2 candy:text-foreground candy:outline candy:outline-2 candy:outline-foreground" />
```

Note `candy:data-[state=open]:rotate-0` on the item: an open sticker straightens. `.sticker-hover` gives the whole item the lift on hover because the item is a `div`, not an `a` or `button`.

- [ ] **Step 2: Command palette panel**

`components/CommandPalette.tsx`:
- Panel div: append `candy:sticker candy:rounded-sticker candy:border-white candy:bg-white candy:shadow-sticker-4`.
- Input: `border-b border-border` gains `candy:border-secondary`.
- Active row: change the ternary to
  `idx === active ? "bg-accent text-accent-foreground candy:bg-candy-butter candy:text-foreground candy:outline candy:outline-2 candy:outline-foreground candy:rounded-tag candy:font-bold" : "text-foreground"`.

- [ ] **Step 3: Shortcuts panel**

`components/KeyboardShortcuts.tsx`:
- Panel div: append `candy:sticker candy:rounded-sticker candy:border-white candy:bg-white candy:shadow-sticker-4`.
- Header row: `border-b border-border` gains `candy:border-secondary`.

- [ ] **Step 4: Table of contents rail and mobile pill**

`components/common/StickyScrollSpyTOC.tsx`: find the tick `span` (the one with `h-px shrink-0` and the current/else `w-6 bg-foreground` / `w-3 bg-border-strong` classes) and append to its base classes:
`candy:h-1 candy:rounded-full candy:outline candy:outline-[1.5px] candy:outline-foreground candy:bg-white`, and to the current branch `candy:bg-candy-pink candy:w-7`.

`components/common/MobileChapters.tsx`:
- The pill (`rounded-full border border-border bg-elevated/90 ... shadow-lg backdrop-blur-md`): append `candy:sticker candy:border-white candy:bg-white candy:shadow-sticker-3 candy:backdrop-blur-none`.
- Progress ring: the `stroke-foreground` arc gains `candy:stroke-candy-pink`.
- Sheet header `border-b border-border`: append `candy:border-secondary`.
- Sheet current row (`bg-elevated` + `font-semibold text-foreground`): append `candy:bg-candy-butter`.

- [ ] **Step 5: Gate and manual check**

Run: `bash scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint`
Expected: exit 0.

`npm run dev`, Candy: FAQ is five tilted white stickers; the open one is pink, straight, with a bigger shadow; clicking another animates open as before. `Cmd+K`: white sticker panel, butter active row. `?`: same panel style. On a post at 1440 the TOC rail ticks are pill bars, pink for the current one; at 375 the chapters pill is a sticker with a pink ring. Light and dark: unchanged.

- [ ] **Step 6: Commit**

```bash
git add components/Faq.tsx components/ui/accordion.tsx components/CommandPalette.tsx components/KeyboardShortcuts.tsx components/common/StickyScrollSpyTOC.tsx components/common/MobileChapters.tsx
git commit -m "feat(candy): FAQ stickers, overlays and table of contents"
```

---

### Task 8: Article prose

**Files:**
- Modify: `app/globals.css` (prose rules)
- Modify: `components/common/mdx.tsx` (`RoundedImage` only)

- [ ] **Step 1: Candy prose rules**

Append to `app/globals.css`, after the `.prose > :first-child` rule:

```css
/* Candy prose. Scoped to the theme attribute; the Paper rules above still
   apply and these override the few that differ. No new elements: blockquote,
   figure and figcaption are what markdown already emits, they simply had no
   rules before. */
[data-theme="candy"] .prose a {
  text-decoration: none;
  font-weight: 600;
  background-image: linear-gradient(transparent 55%, hsl(var(--candy-butter)) 55%);
  transition: background-image var(--duration-fast) var(--ease-out);
}
[data-theme="candy"] .prose a:hover {
  background-image: linear-gradient(transparent 0%, hsl(var(--candy-pink)) 0%);
}
[data-theme="candy"] .prose .anchor:after {
  color: hsl(var(--foreground));
  background: hsl(var(--candy-pink));
  border-radius: 6px;
  padding: 0 6px;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 600;
}
[data-theme="candy"] .prose code {
  background: hsl(var(--candy-butter));
  border: 1.5px solid hsl(var(--foreground));
  border-radius: 6px;
  padding: 2px 7px;
}
[data-theme="candy"] .prose pre {
  background: #fff;
  border: 3px solid #fff;
  outline: 2px solid hsl(var(--foreground));
  border-radius: var(--sticker-radius-tile);
  box-shadow: var(--sticker-shadow-3);
  padding: 14px 16px;
}
[data-theme="candy"] .prose pre code {
  background: transparent;
  border: 0;
  padding: 0;
}
[data-theme="candy"] .prose ul li::marker {
  color: hsl(var(--candy-pink));
}
[data-theme="candy"] .prose ol li::marker {
  font-family: var(--font-display);
  font-weight: 700;
}
[data-theme="candy"] .prose .table-scroll {
  background: #fff;
  border: 3px solid #fff;
  outline: 2px solid hsl(var(--foreground));
  border-radius: var(--sticker-radius-tile);
  box-shadow: var(--sticker-shadow-3);
}
[data-theme="candy"] .prose th {
  background: hsl(var(--candy-butter));
  border-bottom: 2px solid hsl(var(--foreground));
  padding: 10px 14px;
}
[data-theme="candy"] .prose td {
  border-bottom: 1px solid hsl(var(--secondary));
  padding: 10px 14px;
}
[data-theme="candy"] .prose blockquote {
  position: relative;
  margin: 1.5rem 0;
  padding: 22px 22px 18px;
  background: hsl(var(--candy-pink));
  border: 4px solid #fff;
  outline: 2px solid hsl(var(--foreground));
  border-radius: var(--sticker-radius-card);
  box-shadow: var(--sticker-shadow-4);
  font-weight: 600;
  transform: rotate(-1deg);
}
[data-theme="candy"] .prose blockquote::before {
  content: "\201C";
  position: absolute;
  left: 14px;
  top: -12px;
  font-family: var(--font-display);
  font-size: 54px;
  line-height: 1;
  color: #fff;
  -webkit-text-stroke: 2px hsl(var(--foreground));
}
[data-theme="candy"] .prose blockquote p {
  margin: 0;
}
[data-theme="candy"] .prose figure {
  margin: 1.5rem 0;
}
[data-theme="candy"] .prose figcaption {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: hsl(var(--subtle));
}
@media (prefers-reduced-motion: reduce) {
  [data-theme="candy"] .prose blockquote {
    transform: none;
  }
}
```

- [ ] **Step 2: RoundedImage**

`components/common/mdx.tsx`:

```tsx
      className="rounded-lg grayscale transition-[filter] duration-base ease-out hover:grayscale-0 candy:sticker candy:rounded-tile candy:border-white candy:tilt-md-g"
```

- [ ] **Step 3: Gate and manual check**

Run: `bash scripts/verify-simplification.sh && npx tsc --noEmit`
Expected: exit 0.

`npm run dev`, open "Teaching JavaScript to hold a pencil" in Candy: Fredoka headings with a pink `#` on hover; butter links that fill pink on hover; butter inline code chips; code blocks as sticker tiles with the candy token colours; pink bullets; tables inside a sticker with a butter header row. Light and dark: unchanged.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/common/mdx.tsx
git commit -m "feat(candy): article prose, code and tables"
```

---

### Task 9: Docs, gates and the manual matrix

**Files:**
- Modify: `docs/design-system.md`
- Modify: `.claude/skills/design-system/SKILL.md`

- [ ] **Step 1: Document Candy**

In `docs/design-system.md`:
- Under "Color Tokens", after the semantic table, add a subsection `### Candy` listing the Candy values from the spec (section 4), the five tints with their hues, the sticker shadow and radius scale, and the two rules: `candy:` utilities only, and no dividers.
- Under "Typography", fix the family table so Body is DM Sans and Code is IBM Plex Mono, and add Display: Fredoka, Candy only.
- Under "Motion Guidelines", fix `--ease-out` to `cubic-bezier(0.23, 1, 0.32, 1)`.
- Under "Layout Primitives", note that Rails, band lines, the tick and the dot gutters are hidden in Candy and the label renders as a sticker.
- Under "Component Patterns", add one line per pattern saying what Candy does (pink sticker pill, white sticker pill, butter highlight link, tinted tag, sticker card).

In `.claude/skills/design-system/SKILL.md`: replace "Body: font-sans (Inter)" with DM Sans, "font-mono (JetBrains Mono)" with IBM Plex Mono, the ease value, and add two fast rules: "Three themes: light, dark, candy; Candy classes use the `candy:` variant and are inert elsewhere" and "No dividers in Candy".

- [ ] **Step 2: Full gate**

Run: `bash scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: all pass. Note the build output for any Candy class that Tailwind could not generate (there is none if every class is a literal string).

- [ ] **Step 3: Manual matrix**

At 1440, 900, 670x460 and 375, in light, dark and candy: `/`, `/projects`, `/blogs`, one post, `/books`, `/shelf`, `/cv`, a missing URL for the 404, and `/offcod8`.

Check:
- Light and dark are pixel-identical to `main` (compare in two windows).
- Candy: no rails, bands, ticks, dot gutters or row dividers anywhere; the grid paper shows behind every page; the navbar, footer and every list use whitespace.
- `/offcod8` is dark in Candy too.
- `/card` looks the same in every theme.
- Switcher: fresh visitor with OS dark lands on dark; stored `light` or `dark` unchanged; stored `candy` lands on Candy regardless of OS; `t` cycles light, dark, candy; the three palette rows set directly; navbar, palette and shortcuts stay in sync; no flash on load.
- No hydration warnings in the console on `/` and `/projects`.
- Reduced motion on: hovering a sticker changes shadow and colour only.
- Contrast: ink on each tint and `--subtle` on paper reads at 4.5:1 or better (spot check with the browser's accessibility panel).

- [ ] **Step 4: Commit**

```bash
git add docs/design-system.md .claude/skills/design-system/SKILL.md
git commit -m "docs: Candy theme in the design system"
```

---

## Self-review

**Spec coverage.** Section 2 decisions: three themes (Task 1, 2), light only (Task 1 `resolveTheme`), name `candy` (Task 1), no dividers (Task 4, 6, 7), grid background (Task 3), section chrome (Task 4), thumbnails greyscale (untouched), pages on Paper (never edited), prose additions as CSS only (Task 8), deterministic tilt (Task 3 `lib/candy.ts`), fonts (Task 3). Section 3 switcher: storage, DOM contract, boot script, hook, navbar control, palette rows, `t`, no crossfade (Task 1, 2). Section 4 tokens and sugar-high (Task 3). Section 5 typography (Task 3 headings, Task 5 highlight and links). Section 6 layout (Task 4). Section 7 tilt rules including under 640px and reduced motion (Task 3 CSS). Section 8 every component listed: controls (Task 5), cards and lists (Task 6), sections and overlays (Task 4, 7), article (Task 8). Section 9 mobile (Task 3 media queries, Task 4 mobile menu, Task 7 chapters pill). Section 10 gates (every task's gate step; hues checked in Task 3). Section 11 out of scope respected. Section 12 testing (Task 9).

**Placeholders.** None: every step carries the class strings or code it needs.

**Type consistency.** `useTheme` returns `{ theme, setTheme, cycleTheme }` in Task 2 and is consumed by name in Navbar, CommandPalette and KeyboardShortcuts. `Command.action` values `"cycle-theme"` and `"set-theme"` match between `lib/commandData.ts` and `CommandPalette.tsx`. `tilt`, `tiltMd`, `tint` from `lib/candy.ts` are used with those names throughout. `index` props on `ProjectPreviewCard`, `ProjectShowcaseCard`, `Tag`, `OrgLinkChip` default to 0 and are passed from callers in Task 6.
