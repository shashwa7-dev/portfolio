"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, House } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import Container from "@/components/layout/Container";
import PeekingEyes from "@/components/common/PeekingEyes";

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
 *
 * Structure: the tear is the hero, at the column's width (up to 720px) so the
 * eyes are large enough to read as following you. Under it, two columns from
 * `md`: what happened and the two ways out on the left, the other places worth
 * landing on as a short list on the right, split by a hairline. On a phone the
 * list drops below, under a rule.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <main className="pt-8 md:pt-12 pb-8 md:pb-12">
      <Container width="reading">
        <div className="flex min-h-[70vh] flex-col justify-center">
          {/* The page rolled back from a ₹500 note, and Gandhi's eyes follow
              the pointer: the hole this link fell into, watching you. See
              PeekingEyes. */}
          <PeekingEyes className="w-full max-w-[720px] -translate-x-1 -rotate-2" />

          <div className="mt-8 grid gap-10 md:mt-10 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
            <div>
              <p className="font-mono text-2xs uppercase tracking-label text-subtle">
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
                    <House />
                    Go home
                  </Link>
                </Button>
                {/* A real button, not a link: this goes back through history,
                    which has no href to point at. */}
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft />
                  Go back
                </Button>
              </div>
            </div>

            <nav
              aria-label="Other pages"
              className="border-t border-border pt-5 candy:border-t-0 md:min-w-44 md:border-l md:border-t-0 md:pb-1 md:pl-8 md:pt-0"
            >
              <p className="font-mono text-2xs uppercase tracking-label text-subtle">
                Or try
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 md:flex-col md:gap-y-2.5">
                {DESTINATIONS.map((d) => (
                  <li key={d.label}>
                    <Link
                      href={d.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-base ease-out hover:text-foreground"
                    >
                      {d.label}
                      <ArrowRight
                        aria-hidden
                        className="h-3 w-3 -translate-x-0.5 opacity-0 transition-[opacity,transform] duration-base ease-out group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </Container>
    </main>
  );
}
