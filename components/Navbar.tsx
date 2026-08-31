"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/app/hooks/useDarkMode";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { navLinks } from "@/lib/siteLinks";
import Container from "@/components/layout/Container";


/**
 * The header controls: a filled surface, no border.
 *
 * The hover fill is `border-strong/30` rather than another surface token, because
 * in light mode `--elevated`, `--secondary` and `--muted` are all the same value
 * (38 20% 95.5%), so a token-to-token hover would be invisible there. An opacity
 * wash off `--border-strong` lands about four points darker in light and three
 * lighter in dark, so one value reads in both themes.
 *
 * `backdrop-blur-sm` went with the border: it existed to let the header's blur
 * show through a translucent control, and an opaque fill has nothing to show.
 */
const control =
  "flex h-8 items-center rounded-md bg-elevated text-muted-foreground transition-[color,background-color,transform] duration-fast ease-out hover:bg-border-strong/30 hover:text-foreground active:scale-[0.94]";

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      {/* The same measure as the page below it. The bar used to run to
          1080px while every route's content stopped at 760, so the mark and
          the nav sat outside the column they belong to and the site read as
          two different widths stacked on each other. Through `Container`
          rather than a second hardcoded max-width, so there is one place the
          measure is decided. */}
      <Container as="nav" className="flex items-center justify-between py-3.5">
        {/* The mark alone, with no wordmark beside it.

            It is painted as a mask rather than drawn as an <img>: the asset is
            a single flat colour on transparency, so as an image it would stay
            #0E0D0C and disappear into the dark theme. Masking `bg-foreground`
            through its alpha lets the mark take the theme's ink the same way
            the text beside it does, from one file and with no second asset to
            keep in sync.

            Dropping the word takes the link's accessible name with it, so the
            name moves to `aria-label`. Without it the only thing a screen
            reader could announce for the home link is its href. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/" aria-label="offcod8, home" className="flex shrink-0">
              <span
                aria-hidden
                className="block h-7 w-7 bg-foreground"
                style={{
                  WebkitMaskImage: "url(/brand-mark.png)",
                  maskImage: "url(/brand-mark.png)",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </Link>
          </TooltipTrigger>
          {/* The tooltip names the mark for anyone who does not already read it
              as a wordmark. It is not the accessible name: Radix would wire it
              up as one, but a tooltip only reaches pointers, so the `aria-label`
              on the link carries the name for everyone else and the tooltip
              repeats it rather than supplying it. */}
          <TooltipContent>offcod8</TooltipContent>
        </Tooltip>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => {
            const current = l.match ? pathname.startsWith(l.match) : false;
            return (
              <li key={l.label}>
                <Link
                  href={l.href}
                  aria-current={current ? "page" : undefined}
                  /* The active mark is an absolutely positioned `after`, so it
                     adds no height and cannot shift the row. Colour alone would
                     not do: hover already goes to `text-foreground`, so an active
                     link would be indistinguishable from a hovered one. */
                  className={`relative text-sm transition-colors duration-fast ease-out ${
                    current
                      ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {/* CV, promoted out of the menu on mobile.

              On desktop it sits in the nav row above, one of six links and
              always on screen. On mobile that row collapses, so the one link
              most likely to be the reason someone is here was two taps deep
              behind a button labelled "Menu". Here it is one tap and it is
              never hidden.

              Filled accent rather than the `control` fill the two buttons
              beside it share, because it is the only thing in this row that
              goes anywhere: the other two open a menu and change a colour.
              Sized to `control`'s 8-unit height and same radius so it still
              reads as part of the row rather than as something dropped into
              it. */}
          <Link
            href="/cv"
            aria-current={pathname.startsWith("/cv") ? "page" : undefined}
            className="flex h-8 items-center rounded-md bg-accent px-3 text-sm font-semibold leading-none text-accent-foreground transition-[background-color,transform] duration-fast ease-out hover:bg-accent-hover active:scale-[0.94] md:hidden"
          >
            CV
          </Link>

          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={`${control} w-8 justify-center`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className={`${control} px-2.5 text-sm leading-none md:hidden`}
          >
            Menu
          </button>
        </div>
      </Container>

      <div
        id="mobile-nav"
        className="grid transition-[grid-template-rows,visibility] duration-base ease-out md:hidden"
        style={{
          gridTemplateRows: mobileOpen ? "1fr" : "0fr",
          visibility: mobileOpen ? "visible" : "hidden",
        }}
      >
        <div className="overflow-hidden border-t border-border">
          {/* CV is filtered out here, not missing. It is the accent pill in the
              row above, which is on screen whether this panel is open or not,
              so listing it again would be the same destination twice on one
              screen with the quieter of the two below the fold. */}
          <Container>
            <ul>
            {navLinks
              .filter((l) => l.href !== "/cv")
              .map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    aria-current={
                      l.match && pathname.startsWith(l.match) ? "page" : undefined
                    }
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground aria-[current=page]:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </div>
    </header>
  );
}
