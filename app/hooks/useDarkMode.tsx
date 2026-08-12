"use client";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/**
 * Reads and toggles the `dark` class on <html>.
 *
 * Three components call this independently (Navbar, CommandPalette,
 * KeyboardShortcuts), so the shape here matters more than it looks:
 *
 * 1. `toggleDarkMode` is wrapped in `useCallback` with no dependencies, because
 *    it derives the next value from the DOM rather than from state. A stable
 *    identity is required, not cosmetic: `KeyboardShortcuts` lists it in the
 *    dependency array of the effect that registers its global `keydown`
 *    listener. When the identity changed on every render, toggling the theme
 *    re-rendered that component, which tore the listener down and re-added it.
 *    A second keypress landing inside that window hit no listener at all, so
 *    the toggle worked intermittently.
 *
 * 2. The mount effect only READS the DOM. It does not re-apply the theme. The
 *    blocking script in `app/layout.tsx` is the single place the class is
 *    applied on load, which is what prevents a flash. Having every consumer
 *    also write on mount meant three components racing to set the same class,
 *    with a late-mounting `ssr: false` component able to clobber a toggle that
 *    had already happened.
 *
 * 3. `toggleDarkMode` does not call `setIsDarkMode` directly. It dispatches
 *    `themechange` and lets the listener below update every instance through
 *    one path, so the Navbar icon cannot desync from the actual class.
 */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Read-only sync of the value the layout's blocking script already applied.
  useLayoutEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    const sync = () =>
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("themechange"));
  }, []);

  return { isDarkMode, toggleDarkMode };
}
