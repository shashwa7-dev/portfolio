import { describe, it, expect } from "vitest";
import {
  CANDY_ENABLED,
  THEMES,
  THEME_STORAGE_KEY,
  isTheme,
  resolveTheme,
  nextTheme,
  applyTheme,
  themeLabel,
  toggleIcon,
  THEME_BOOT_SCRIPT,
} from "./theme";

describe("theme names", () => {
  it("Candy is disabled for now", () => {
    expect(CANDY_ENABLED).toBe(false);
  });
  it("cycles only light and dark while Candy is off", () => {
    expect(THEMES).toEqual(["light", "dark"]);
  });
  it("uses the same storage key as before", () => {
    expect(THEME_STORAGE_KEY).toBe("theme");
  });
  it("does not recognise candy while it is off", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("candy")).toBe(false);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
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
  it("sends a stored candy back to the system theme", () => {
    expect(resolveTheme("candy", true)).toBe("dark");
    expect(resolveTheme("candy", false)).toBe("light");
  });
  it("treats an unknown stored value like nothing stored", () => {
    expect(resolveTheme("purple", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});

describe("nextTheme", () => {
  it("toggles light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
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
    applyTheme(root, "light");
    expect(root.dataset.theme).toBe("light");
    expect(root.classes.has("dark")).toBe(false);
  });
});

describe("themeLabel", () => {
  it("capitalises for people", () => {
    expect(themeLabel("light")).toBe("Light");
    expect(themeLabel("dark")).toBe("Dark");
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
    const cases: Array<[string | null, boolean]> = [
      [null, true], [null, false], ["light", true], ["dark", false],
      ["candy", true], ["candy", false], ["nonsense", false], ["", true],
    ];
    for (const [stored, prefersDark] of cases) {
      const classes = new Set<string>();
      const root = {
        dataset: {} as DOMStringMap,
        classList: {
          toggle(name: string, force: boolean) {
            if (force) classes.add(name);
            else classes.delete(name);
            return force;
          },
        },
      };
      applyTheme(root, resolveTheme(stored, prefersDark));
      expect(run(stored, prefersDark)).toEqual({
        theme: root.dataset.theme,
        dark: classes.has("dark"),
      });
    }
  });
  it("is a single self-contained statement with no template placeholders", () => {
    expect(THEME_BOOT_SCRIPT).not.toContain("${");
    expect(THEME_BOOT_SCRIPT.trim().startsWith("(function")).toBe(true);
  });
});

describe("toggleIcon", () => {
  it("shows the theme the button will switch to", () => {
    expect(toggleIcon(nextTheme("light"))).toBe("moon");
    expect(toggleIcon(nextTheme("dark"))).toBe("sun");
  });
  it("shows the candy treat only when candy is next", () => {
    expect(toggleIcon("candy")).toBe("treat");
  });
});
