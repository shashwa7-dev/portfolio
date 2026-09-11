import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HandWaving, PenNib } from "@phosphor-icons/react/ssr";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import NowPlaying from "@/components/offcod8/NowPlaying";

export const metadata: Metadata = {
  title: "A small note",
  description: "Thanks for dropping by.",
  alternates: { canonical: `${baseUrl}offcod8` },
  /** Unlisted. One link in, from the hero avatar, and no search result. */
  robots: { index: false, follow: false },
};

/**
 * An unlisted letter, with a song behind it.
 *
 * One way in, and it is not signposted: the avatar in the homepage hero. Not
 * `navLinks`, not `footerLinks`, not the sitemap, and `robots` stays noindex
 * even though the page is now linked, because a search result would give it
 * away and the point is that you find it by poking at the one thing on the
 * homepage that looks like a person rather than a control.
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
 * The song starts on its own where the browser allows it, and on the first
 * scroll or touch where it does not. `NowPlaying` holds that whole negotiation,
 * and the reasons it has to be a negotiation.
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
      {/* No panel behind the letter. The words sit on the dimmed video the
          same way they would sit on the page, which is the version that still
          reads as a letter rather than as a card about one. The contrast it
          was providing moved to the scrim in `NowPlaying`. */}
      <Container width="reading" className="space-y-12 md:space-y-16">
        {/* The header.

            An AVIF source at 5504x3072, which is the first one on this page
            with real pixels to spare: the column renders near 712, a 2x screen
            wants about 1424, and everything before this was under 1200 and had
            nothing to put in the srcset's 2x slot. The optimizer will downscale
            a source but never invent one, so the floor for any replacement is
            1200px wide and more is better.

            Served through the optimizer rather than raw, and the AVIF is the
            source rather than the output. Next re-encodes it per width and
            negotiates the format from the request, so a browser gets WebP at
            the size it actually needs: about 48KB at 1920 against 186KB for
            the original. Raw would also mean every phone decoding all 16.9
            megapixels of it to paint a 712px column.

            `priority` because it is the first thing on the page, so it should
            not queue behind the letter it opens, and intrinsic width and
            height because those reserve its box and rule out a shift as it
            loads. Both have to move whenever the picture does. */}
        <Image
          src="/offcod8/cover.avif"
          alt="Misty green hills at dawn, a farmhouse and cypresses on a ridge, captioned &ldquo;the sun will rise and I will try again.&rdquo;"
          width={5504}
          height={3072}
          /* Without this, Next builds the srcset from `width` and ships one
             3840px candidate to everybody, which is a 16.9 megapixel source
             downscaled to almost nothing on a phone. `sizes` switches it to
             width descriptors and describes the box the picture actually
             lands in: the reading measure less the Container's `px-6` above
             760, and the viewport less that same padding below it. The browser
             multiplies by its own DPR from there, so a 2x screen asks for
             about 1424 rather than being handed 3840 or fobbed off with 712. */
          sizes="(min-width: 760px) 712px, calc(100vw - 48px)"
          priority
          className="w-full rounded-2xl border border-border bg-elevated"
        />

        {/* The mark, and what is playing.

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
          {/* The greeting is the h1, and the letter says it again at the foot.
              That bookend is the writer's own move and the reason the heading
              is a sentence rather than a title. */}
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-tight text-foreground">
            Thanks for dropping by.
          </h1>

          {/* The line breaks are the writer's, kept as written.

              They are not soft wrapping and they are not decoration: the letter
              was set out this way, a phrase to a line, and running the phrases
              back together into justified paragraphs would change its pace.
              `<br />` rather than a paragraph each, because a line and a
              paragraph are different amounts of silence and the draft uses
              both. */}
          <p>
            I&apos;ve been thinking lately about how strange this whole thing
            called life is.
          </p>

          <p>
            How we spend so much of it
            <br />
            trying to figure out what comes next.
          </p>

          <p>
            We make plans.
            <br />
            Change them.
            <br />
            Make new ones.
          </p>

          <p>
            We chase things we once wanted,
            <br />
            then sometimes realize we want something else.
          </p>

          <p>
            We grow.
            <br />
            We lose things.
            <br />
            We find people.
            <br />
            We lose people.
            <br />
            We become versions of ourselves
            <br />
            we couldn&apos;t have imagined a few years ago.
          </p>

          {/* One of the three em dashes in the draft. CLAUDE.md bans them in
              user-facing copy, and a colon is what this one was doing anyway:
              announcing the list that follows. */}
          <p>
            And somewhere in between all of that,
            <br />
            there are ordinary little moments:
          </p>

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

          <p>
            I&apos;ve started to think
            <br />
            maybe those moments aren&apos;t the things
            <br />
            that happen between life.
          </p>

          {/* The two lines the letter turns on. They get the section heading's
              size, the largest thing on the page after the greeting, so they
              land as statements rather than as more of the paragraph around
              them. */}
          <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            Maybe they are life.
          </p>

          <p>So I&apos;m trying to remember to look up more often.</p>

          <p>
            To care about the people around me.
            <br />
            To make time for things that don&apos;t need to become anything.
            <br />
            To be present when something feels good
            <br />
            instead of immediately wondering what&apos;s next.
          </p>

          <p>I don&apos;t know where all of this is going.</p>

          <p>None of us really do.</p>

          <p>And maybe that&apos;s what makes it interesting.</p>

          <p>
            So here&apos;s to the unfinished plans,
            <br />
            the unexpected turns,
            <br />
            the good days,
            <br />
            the strange days,
            <br />
            and everything in between.
          </p>

          <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            Here&apos;s to being here.
          </p>

          {/* The second em dash. A comma carries the same pause into the line
              below it. */}
          <p>
            And while we&apos;re here,
            <br />
            might as well make it count.
          </p>

          {/* The sign-off, on the same hairline every band on the site uses.

              A glyph on the greeting and a glyph on the name: a wave for the
              goodbye, a nib for the signature. Those are the two gestures a
              handwritten letter actually ends with, which is what earns them a
              place on a page that is otherwise unbroken prose. They sit at
              `text-subtle` so they close the words rather than compete with
              them, and the line between takes `pl-8` (the glyph plus its gap)
              so all three lines start at the same edge.

              The nib is also the third em dash. "- Shash" is what a signature
              line is for, so the dash goes and the glyph says it instead.

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
              Thanks for dropping by.
            </p>
            <p className="pl-8">Keep living. Keep wondering. Keep going.</p>
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
