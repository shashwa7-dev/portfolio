"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/layout/Container";

/**
 * Recovery links, not decoration. A 404 that offers only "go home" makes the
 * reader start their search over; these are the four places anything worth
 * landing on actually lives, and they mirror the header's own nav.
 */
const DESTINATIONS = [
  { label: "Work", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Writing", href: "/blogs" },
  { label: "Books", href: "/books" },
];

/**
 * The page is deliberately still.
 *
 * Every element used to enter on its own delay: the mark popped, the numerals
 * and copy slid up, the buttons followed, and a pulsing "Lost in the void"
 * faded in last. That is a lot of choreography spent on the one page nobody
 * chose to visit, and it delays the two controls that get them out of it.
 *
 * Alignment is flush left like the rest of the site rather than centred. The
 * centred column was the only page here that read as a splash screen, and the
 * numerals ran at `text-9xl`, three steps past the top of the scale in
 * `tailwind.config.ts`.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <main className="py-8 md:py-12">
      <Container width="reading">
        <div className="flex min-h-[60vh] flex-col justify-center">
          <Image
            src="/apple-touch-icon.png"
            alt="offcod8"
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl border border-border"
            priority
          />

          <p className="mt-8 font-mono text-2xs uppercase tracking-label text-subtle">
            Error 404
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            This page does not exist
          </h1>
          <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
            The link may be broken, or the page may have moved since it was
            written down.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">
                <Home />
                Go home
              </Link>
            </Button>
            {/* A real button, not a link: this goes back through history, which
                has no href to point at. */}
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft />
              Go back
            </Button>
          </div>

          <nav
            aria-label="Other pages"
            className="mt-10 border-t border-border pt-5"
          >
            <p className="font-mono text-2xs uppercase tracking-label text-subtle">
              Or try
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {DESTINATIONS.map((d) => (
                <li key={d.label}>
                  <Link
                    href={d.href}
                    className="text-sm text-muted-foreground transition-colors duration-base ease-out hover:text-foreground"
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </main>
  );
}
