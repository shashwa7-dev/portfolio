"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

/** Scroll distance over which the cloud backdrop reaches full strength. */
const FADE_OVER_PX = 220;
/** Ceiling opacity. Held well below 1 so the nav stays legible over the art. */
const MAX_OPACITY = 0.55;

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cloudsRef = useRef<HTMLDivElement>(null);

  // Opacity is written straight to the element's style rather than held in
  // state. Driving this through React would re-render the whole Navbar on every
  // scroll frame, and pushing it through a CSS custom property on the header
  // would recalc styles for every child. A single direct style write on one
  // element is the cheap path. rAF-throttled, passive listener.
  useEffect(() => {
    const el = cloudsRef.current;
    if (!el) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const progress = Math.min(window.scrollY / FADE_OVER_PX, 1);
      el.style.opacity = String(progress * MAX_OPACITY);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply(); // covers a reload part-way down the page
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 isolate overflow-hidden border-b border-border bg-background/70 backdrop-blur-xl">
      {/* Cloud backdrop. Layered at z-0 with the nav at z-10, never a negative
          z-index: a negative value would paint behind the header's own
          bg-background/70 and be muted by it. `isolate` on the header keeps
          these three layers sorting against each other.

          Full-bleed across the viewport while the nav content
          below stays clamped to 1080px, so the art is edge to edge but the logo
          still lines up with the page.

          Starts fully transparent, so at the top of the page the header looks
          exactly as it did before, and fades in as you scroll.

          `invert dark:invert-0` is the trick that makes one asset work in both
          themes. The source is dark navy with cream clouds, which suits dark
          mode as-is; inverting it for light mode yields a near-white ground with
          navy clouds instead of pasting a dark band across a warm near-white
          page. */}
      <div
        ref={cloudsRef}
        aria-hidden
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-0 z-0 select-none"
      >
        <Image
          src="/images/header-clouds.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          priority
          className="object-cover object-center invert dark:invert-0"
        />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-[1080px] items-center justify-between px-6 py-3.5">
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
            className="flex items-center gap-1.5 rounded-lg border border-border-strong px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-[0.94]"
          >
            <span className="text-sm leading-none">⌘</span> K
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-[0.94]"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="text-sm text-muted-foreground transition-transform duration-150 ease-out md:hidden active:scale-[0.94]"
          >
            Menu
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        className="relative z-10 grid transition-[grid-template-rows,visibility] duration-base ease-out md:hidden"
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
