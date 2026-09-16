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
