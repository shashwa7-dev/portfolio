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
