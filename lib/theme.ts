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
/**
 * Candy is switched off until Shashwat turns it back on. Flip this to `true`
 * and the third theme returns everywhere: the cycle, the palette action, and
 * stored preferences. Its styles never left; every `candy:` class is inert
 * while `data-theme` can never be "candy".
 */
export const CANDY_ENABLED = false;

const ALL_THEMES = ["light", "candy", "dark"] as const;
export type Theme = (typeof ALL_THEMES)[number];
export const THEMES = (CANDY_ENABLED
  ? ALL_THEMES
  : ALL_THEMES.filter((t) => t !== "candy")) as readonly Theme[];

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

/**
 * What the theme button shows: the theme it will switch TO. Keyed on the next
 * theme rather than the current one, so turning Candy off turns the treat off
 * with it instead of leaving light mode advertising a theme that is gone.
 */
export function toggleIcon(upcoming: Theme): "treat" | "moon" | "sun" {
  return upcoming === "candy" ? "treat" : upcoming === "dark" ? "moon" : "sun";
}

/**
 * The theme button's artwork: a black cowl in the dark theme, a white one in
 * the light theme. Unlike `toggleIcon`, this shows the theme you are IN, not
 * the one the click leads to, because the cowl reads as "this is the mode",
 * the way the page itself does. Candy is a light theme, so it gets white.
 */
export function toggleCowl(current: Theme): "black" | "white" {
  return current === "dark" ? "black" : "white";
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
export const THEME_BOOT_SCRIPT = `(function(){var t=localStorage.getItem("theme");var ok=t==="light"||t==="dark"${
  CANDY_ENABLED ? '||t==="candy"' : ""
};var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=ok?t:(d?"dark":"light");var r=document.documentElement;r.setAttribute("data-theme",theme);r.classList.toggle("dark",theme==="dark");})();`;
