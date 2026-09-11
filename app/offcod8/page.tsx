import type { Metadata } from "next";
import Link from "next/link";
import { HandWaving, PenNib } from "@phosphor-icons/react/ssr";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import NowPlaying from "@/components/offcod8/NowPlaying";

export const metadata: Metadata = {
  title: "A small note",
  description: "Thanks for dropping by.",
  alternates: { canonical: `${baseUrl}offcod8` },
  /** Unlisted: nothing links here, and nothing should index it either. */
  robots: { index: false, follow: false },
};

/**
 * An unlisted letter, with a song behind it.
 *
 * Nothing links here: not `navLinks`, not `footerLinks`, not the sitemap, and
 * `robots` is noindex. The only way to arrive is to be told the URL, which is
 * the whole idea. It is a note left for whoever went looking.
 *
 * The only route with no chrome: no navbar, no footer, no rails, no page band.
 * A letter arrives on its own, and a reader who has to get past a nav bar and
 * a site footer to reach one is reading a web page about a letter. The mark in
 * the corner is the whole of the branding and the way back to the site.
 *
 * `data-bare` on the `<main>` is what hides the three global pieces, via the
 * rule in `app/globals.css`. They are rendered once from `app/layout.tsx`,
 * which is a server component with no idea which route sits below it: reading
 * the pathname there would make every page on the site dynamic in order to
 * strip chrome from one of them, and giving this route its own root layout
 * means moving every other route into a group and duplicating the theme
 * script, the fonts and the JSON-LD. A selector costs nothing, runs before
 * hydration so nothing flashes, and leaves every other page static.
 *
 * Set in `font-sans` like every other heading here. The reference this came
 * from used Libre Baskerville, and a serif would suit a letter, but there is no
 * serif family in this project by decision: `docs/design-system.md` records
 * that headings are separated by weight and size rather than typeface, and
 * `scripts/verify-simplification.sh` fails check C03 on any serif utility.
 * Hierarchy here is carried by size and measure instead.
 *
 * Scrolling is what starts the song. Reading a letter means scrolling it, so
 * the music arrives while the reader is already inside the thing it is scored
 * to. `NowPlaying` carries the caveat: a scroll on a phone is a touch and
 * counts as a gesture, a trackpad scroll is not and does not.
 *
 * `components/shelf/OnRepeat.tsx` deliberately refuses a YouTube iframe, and
 * that refusal still holds where it was made: paying for fifteen seconds of a
 * track preview with a third-party player, its cookies and a possible advert is
 * a bad trade on a page that loads no other third-party script. Here the song
 * is the point of the page, and nobody arrives by accident.
 */
export default function Offcod8Page() {
  return (
    // Not the `pb-8 md:pb-12` every other route carries. That convention pairs
    // with a PageBand whose own margin supplies the top half, and there is no
    // band here.
    <main data-bare className="py-10 md:py-16">
      <Container width="reading" className="space-y-12 md:space-y-16">
        {/* The mark, and what is playing. The only two things on the page that
            are not the letter.

            Masked rather than drawn as an <img>, the same way the navbar, the
            footer and the chat bubble draw it: `brand-mark.png` is a solid
            shape, so tinting it with `bg-foreground` through a mask is what
            lets one file serve both themes. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <Link
            href="/"
            aria-label="offcod8, home"
            className="flex shrink-0 opacity-80 transition-opacity duration-base ease-out hover:opacity-100"
          >
            <span
              aria-hidden
              className="block h-8 w-8 bg-foreground"
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

          <NowPlaying />
        </div>

        <article className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          {/* The greeting is the h1, and the last line of the letter says it
              again. That bookend is the writer's own move and the reason the
              heading is a sentence rather than a title. */}
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-tight text-foreground">
            Thanks for dropping by.
          </h1>

          <p>
            I&apos;ve been thinking lately about how strange all of this is. How
            much of it we spend trying to figure out what comes next.
          </p>

          <p>
            We make plans, change them, make new ones. We chase things we once
            wanted, then find out we want something else. We grow. We lose
            things. We find people, and we lose people too. We turn into
            versions of ourselves we couldn&apos;t have imagined a few years
            ago.
          </p>

          <p>
            And in between all of that, there are the ordinary little moments:
          </p>

          {/* The one place the line breaks carry meaning. Each line is a
              separate moment, and running them together as a sentence turns a
              list of small things into one long clause. */}
          <p>
            a song playing on the way home,
            <br />
            a late-night conversation,
            <br />
            coffee on a quiet morning,
            <br />
            laughing until it hurts,
            <br />
            watching the sky for no particular reason.
          </p>

          <p>I used to treat those as the gaps between the real thing.</p>

          {/* The two lines the letter turns on. They get the section heading's
              size, which is the largest thing on the page after the greeting,
              so they land as statements rather than as more of the paragraph
              around them. */}
          <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            I&apos;m starting to think they are the real thing.
          </p>

          <p>
            So I&apos;m trying to look up more often. To pay attention to the
            people around me. To make time for things that don&apos;t need to
            become anything. To stay in a good moment instead of immediately
            wondering what&apos;s next.
          </p>

          <p>
            I don&apos;t know where any of this is going.{" "}
            <strong className="font-semibold text-foreground">
              Nobody does.
            </strong>
          </p>

          <p>
            So here&apos;s to the plans that never finished, the turns nobody
            saw coming, the good days and the strange ones.
          </p>

          <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            Here&apos;s to being here.
          </p>

          {/* The sign-off, on the same hairline every band on the site uses.

              One glyph per line, sized to the text beside it: a wave for the
              goodbye, a nib for the signature. Those are the two gestures a
              handwritten letter actually ends with, which is what earns them a
              place on a page that is otherwise unbroken prose. They sit at
              `text-subtle` so they close the words rather than compete with
              them.

              `aria-hidden` on both. A screen reader announcing "hand waving"
              ahead of "thanks for dropping by" adds a word and no meaning, and
              the nib would announce the signature as an object rather than
              reading it as one. */}
          <footer className="space-y-4 border-t border-border pt-7">
            <p className="flex items-center gap-3">
              <HandWaving
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-subtle"
              />
              Thanks for dropping by. Keep going.
            </p>
            <p className="flex items-center gap-3 text-foreground">
              <PenNib
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-subtle"
              />
              Shash
            </p>
          </footer>
        </article>
      </Container>
    </main>
  );
}
