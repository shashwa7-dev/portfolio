"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/app/hooks/useDarkMode";

const navLinks = [
  { label: "Work", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Writing", href: "/blogs" },
  { label: "Books", href: "/books" },
];

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("open-command-palette"));
}

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-3.5">
        <Link href="/" className="text-lg font-semibold text-foreground">
          offcod8
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command menu"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border-strong bg-background/80 px-2.5 font-mono text-xs leading-none text-muted-foreground backdrop-blur-sm transition-[color,background-color,transform] duration-150 ease-out hover:bg-background hover:text-foreground active:scale-[0.94]"
          >
            <span className="text-sm">⌘</span> K
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border-strong bg-background/80 text-muted-foreground backdrop-blur-sm transition-[color,background-color,transform] duration-150 ease-out hover:bg-background hover:text-foreground active:scale-[0.94]"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="flex h-8 items-center rounded-lg border border-border-strong bg-background/80 px-2.5 text-sm leading-none text-muted-foreground backdrop-blur-sm transition-[color,background-color,transform] duration-150 ease-out hover:bg-background hover:text-foreground md:hidden active:scale-[0.94]"
          >
            Menu
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        className="grid transition-[grid-template-rows,visibility] duration-base ease-out md:hidden"
        style={{
          gridTemplateRows: mobileOpen ? "1fr" : "0fr",
          visibility: mobileOpen ? "visible" : "hidden",
        }}
      >
        <div className="overflow-hidden">
          <ul className="border-t border-border px-6">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
