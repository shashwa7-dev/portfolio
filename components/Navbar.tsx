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
/**
 * Ceiling opacity. The previous asset was high-contrast black-and-cream line work
 * and had to sit at 0.14 to keep the nav labels readable. This one is soft
 * gradient sky, with no hard edges for text to fight, so it tolerates more while
 * still reading as texture rather than as a picture.
 */
const MAX_OPACITY = 0.3;

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
      {/* Header backdrop. Layered at z-0 with the nav at z-10, never a negative
          z-index: a negative value would paint behind the header's own
          bg-background/70 and be muted by it. `isolate` on the header keeps
          these layers sorting against each other.

          Full-bleed across the viewport while the nav content below stays
          clamped to 1080px, so the art is edge to edge but the logo still lines
          up with the page.

          Starts fully transparent, so at the top of the page the header looks
          exactly as it did before, and fades in as you scroll.

          No `invert` here, unlike the previous asset. That one was dark navy
          with cream clouds, so inverting gave it a usable light-mode form. This
          one is a bright blue sky, and inverting blue yields orange. Instead the
          image carries `dark:opacity-60`, which multiplies with the
          scroll-driven opacity on the wrapper: a bright blue band needs damping
          against a near-black page, but reads fine at full strength on the warm
          light one. */}
      <div
        ref={cloudsRef}
        aria-hidden
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-0 z-0 select-none"
      >
        <Image
          src="/images/header-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          priority
          className="object-cover object-center dark:opacity-60"
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
