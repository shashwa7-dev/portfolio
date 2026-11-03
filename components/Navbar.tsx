"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  EnvelopeSimple,
  FileText,
  GithubLogo,
  House,
  Books,
  PenNib,
  CaretUp,
  XLogo,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import CandyMusic from "@/components/CandyMusic";
import { useTheme } from "@/app/hooks/useTheme";
import { nextTheme, themeLabel, toggleCowl } from "@/lib/theme";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { contactEmail, socialLinks } from "@/lib/siteLinks";

/**
 * The site's navigation: a dock fixed to the bottom middle of the screen.
 *
 * Its shape is a tab rising out of the bottom edge with slanted sides, in two
 * layers: a darker rim and a lighter body with a hairline edge (`Shape`).
 * Both are placed from the bar's edges, so the shape follows the bar as it
 * widens. Styles are in `app/globals.css` under "Dock".
 *
 * Closed, it shows the pages and the theme cowl. On desktop, hovering it or
 * tabbing into it widens it in place to reveal the ways to reach Shashwat. On
 * a phone, where there is no hover, a chevron button raises a card just above the
 * dock that lists them by name.
 *
 * Work and Projects are homepage sections, reached by scrolling the homepage
 * and from the footer, so they have no button here. Home replaces the old
 * header's logo.
 */

type Page = { label: string; href: string; icon: Icon; match: (path: string) => boolean };

const PAGES: Page[] = [
  { label: "Home", href: "/", icon: House, match: (p) => p === "/" },
  { label: "Writing", href: "/blogs", icon: PenNib, match: (p) => p.startsWith("/blogs") },
  { label: "Shelf", href: "/shelf", icon: Books, match: (p) => p.startsWith("/shelf") },
  { label: "CV", href: "/cv", icon: FileText, match: (p) => p.startsWith("/cv") },
];

const twitter = socialLinks.find((s) => s.name === "Twitter")!;
const github = socialLinks.find((s) => s.name === "GitHub")!;

type Reach = { label: string; href: string; icon: Icon; detail: string; external: boolean };

const REACH: Reach[] = [
  { label: "Twitter", href: twitter.href, icon: XLogo, detail: "@offcod8", external: true },
  { label: "GitHub", href: github.href, icon: GithubLogo, detail: "shashwa7-dev", external: true },
  { label: "Email", href: `mailto:${contactEmail}`, icon: EnvelopeSimple, detail: contactEmail, external: false },
];

const OUTER_SIDE = "M 0 54 A 14 14 0 0 0 12.98 45.24 L 25.2 15.01 A 24 24 0 0 1 47.45 0 H 48.45 V 54 H 0 Z";
const INNER_SIDE = "M 0 48 L 14.85 11.26 A 18 18 0 0 1 31.53 0 H 32.53 V 48 H 0 Z";
const INNER_EDGE = "M 0 48.5 A 0.5 0.5 0 0 0 0.46 48.19 L 15.31 11.44 A 17.5 17.5 0 0 1 31.53 0.5 H 32.53";

/** The dock's shape: a darker outer rim and, inside it, the body with its hairline edge. */
function Shape() {
  return (
    <>
      <div aria-hidden className="dock-layer dock-layer-outer">
        {(["is-left", "is-right"] as const).map((side) => (
          <svg key={side} className={side} width="48.45" height="54" viewBox="0 0 48.45 54">
            <path d={OUTER_SIDE} fill="currentColor" />
          </svg>
        ))}
        <div className="dock-strip" />
      </div>
      <div aria-hidden className="dock-layer dock-layer-inner">
        {(["is-left", "is-right"] as const).map((side) => (
          <svg key={side} className={side} width="32.53" height="48" viewBox="0 0 32.53 48">
            <path d={INNER_SIDE} fill="currentColor" />
            <path d={INNER_EDGE} className="dock-side-line" />
          </svg>
        ))}
        <div className="dock-strip" />
      </div>
    </>
  );
}

/** True from 1280px, where the dock stands on the left edge (see globals.css). */
const SIDE_DOCK_QUERY = "(min-width: 1280px)";

function useSideDock() {
  const [side, setSide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(SIDE_DOCK_QUERY);
    const sync = () => setSide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return side;
}

/** An icon button with a tooltip on the side facing away from the screen edge. */
function Tip({ label, side, children }: { label: string; side: "top" | "right"; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={side === "right" ? 12 : 8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function Navbar() {
  const { theme, cycleTheme } = useTheme();
  const upcoming = nextTheme(theme);
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  // The drawer closes on Escape, on a tap outside the dock, and on navigation.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!dockRef.current?.contains(e.target as Node)) setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [drawerOpen]);
  useEffect(() => setDrawerOpen(false), [pathname]);

  const themeName = `Switch to ${themeLabel(upcoming)}`;
  const tipSide = useSideDock() ? "right" : "top";

  return (
    <>
      <div aria-hidden className={`dock-scrim ${drawerOpen ? "is-open" : ""}`} />
      <div className={`site-navbar dock-wrap ${drawerOpen ? "is-open" : ""}`}>
        <div ref={dockRef} className="dock">
          <Shape />

          {/* Phone only: a card raised just above the dock. */}
          <div id="dock-drawer" className="dock-drawer" inert={!drawerOpen}>
            <ul>
              {REACH.map(({ label, href, icon: I, detail, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => setDrawerOpen(false)}
                    className="dock-row"
                  >
                    <I aria-hidden className="dock-row-icon h-[18px] w-[18px]" />
                    <span className="dock-row-label text-sm">{label}</span>
                    <span className="dock-row-detail ml-auto truncate text-xs">{detail}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Site" className="dock-bar">
            {PAGES.map(({ label, href, icon: I, match }, i) => {
              const current = match(pathname);
              return (
                <Tip key={label} label={label} side={tipSide}>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={current ? "page" : undefined}
                    className={`dock-btn ${i === 0 ? "dock-edge dock-edge-l" : ""} ${current ? "is-on" : ""}`}
                  >
                    <I aria-hidden weight={current ? "fill" : "regular"} className="h-4 w-4" />
                  </Link>
                </Tip>
              );
            })}

            {/* Desktop only: revealed in place on hover or keyboard focus. */}
            <div className="dock-more">
              <div>
                <span aria-hidden className="dock-sep" />
                {REACH.map(({ label, href, icon: I, external }) => (
                  <Tip key={label} label={label} side={tipSide}>
                    <a
                      href={href}
                      aria-label={label}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="dock-btn"
                    >
                      <I aria-hidden className="h-4 w-4" />
                    </a>
                  </Tip>
                ))}
              </div>
            </div>

            <span aria-hidden className="dock-sep" />

            <button
              type="button"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label={drawerOpen ? "Close links" : "More links"}
              aria-expanded={drawerOpen}
              aria-controls="dock-drawer"
              className="dock-btn dock-toggle"
            >
              <CaretUp aria-hidden weight="bold" className="h-4 w-4" />
            </button>

            <CandyMusic />

            <Tip label={themeName} side={tipSide}>
              <button
                type="button"
                onClick={cycleTheme}
                aria-label={`Theme: ${themeLabel(theme)}. ${themeName}`}
                className="dock-btn is-on dock-cowl dock-edge dock-edge-r"
              >
                {/* The cowl of the theme the click leads to: white in dark,
                    black in light. Both are rendered and crossfade. */}
                <span aria-hidden className="relative block h-5 w-3.5">
                  {(["black", "white"] as const).map((cowl) => (
                    <Image
                      key={cowl}
                      src={`/theme/cowl-${cowl}.webp`}
                      alt=""
                      width={88}
                      height={128}
                      className={`absolute inset-0 h-5 w-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-[opacity,transform] duration-base ease-out ${
                        toggleCowl(theme) === cowl ? "scale-100 opacity-100" : "scale-90 opacity-0"
                      }`}
                    />
                  ))}
                </span>
              </button>
            </Tip>
          </nav>
        </div>
      </div>
    </>
  );
}
