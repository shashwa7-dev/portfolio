import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Container from "@/components/layout/Container";
import PageBand from "@/components/layout/PageBand";
import Section from "@/components/layout/Section";
import RoasterPicker from "@/components/shelf/RoasterPicker";
import GearTimeline from "@/components/shelf/GearTimeline";
import { bookmarks } from "@/lib/bookmarks";
import { getPlaylist, PLAYLIST_URL } from "@/lib/playlist";
import OnRepeat from "@/components/shelf/OnRepeat";
import { SpecList, SpecRow } from "@/components/shelf/SpecList";
import { setup, scents } from "@/lib/everyday";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, breadcrumbLd } from "@/lib/seo";

const SHELF_OG = ogUrl({
  title: "Shelf",
  subtitle: "Coffee I drink, the gear that got me here, and links worth keeping.",
  type: "generic",
  label: "Shelf",
});

export const metadata = {
  title: "Shelf",
  description:
    "Coffee I drink, the gear that got me here, and links worth keeping.",
  alternates: { canonical: `${baseUrl}shelf` },
  openGraph: {
    title: "Shelf",
    description:
      "Coffee I drink, the gear that got me here, and links worth keeping.",
    url: `${baseUrl}shelf`,
    images: [{ url: SHELF_OG }],
  },
  // Without this, Next inherits `twitter` wholesale from the root layout, so a
  // shared link showed the homepage card instead of this page's.
  twitter: {
    card: "summary_large_image",
    title: "Shelf",
    description:
      "Coffee I drink, the gear that got me here, and links worth keeping.",
    images: [SHELF_OG],
  },
};

/**
 * The fan behind the roast link: light, medium, dark, tilted outward from the
 * middle so the group reads as a cluster rather than a row. Negative margins
 * overlap them; the middle one sits highest.
 */
const BACKDROP_BEANS = [
  { src: "/coffee/beans/light.webp", transform: "rotate(-14deg) translateY(6px)", overlap: 0 },
  { src: "/coffee/beans/medium.webp", transform: "rotate(2deg) translateY(-4px)", overlap: -18 },
  { src: "/coffee/beans/dark.webp", transform: "rotate(16deg) translateY(8px)", overlap: -18 },
];

/**
 * Bookmarks are parked while the list is rethought.
 *
 * A flag rather than a comment block or a deletion. Commented-out JSX stops
 * being type-checked and quietly rots against every refactor around it, and
 * deleting it means writing the section again. This keeps it compiling.
 */
const SHOW_BOOKMARKS = false;

export default async function ShelfPage() {
  const tracks = await getPlaylist();

  /**
   * The section numbers are derived, never written down.
   *
   * Bookmarks sits behind SHOW_BOOKMARKS, so a hardcoded total would promise a
   * part the page does not show, and the counter is the one element whose whole
   * job is to be true. Sound no longer appears here at all: it is a row inside
   * Everyday, so an empty playlist costs the page one row rather than
   * renumbering everything after it.
   */
  const parts = [
    "coffee",
    "everyday",
    ...(SHOW_BOOKMARKS ? ["bookmarks"] : []),
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  const total = pad(parts.length);
  const no = (key: string) => pad(parts.indexOf(key) + 1);

  return (
    <main className="pb-8 md:pb-12">
      <PageBand id="Shelf" name={`${parts.length} parts`} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", path: "" },
              { name: "Shelf", path: "shelf" },
            ])
          ),
        }}
      />

      {/* The page header.

          It carries its own bottom padding rather than leaning on whatever
          follows, because what follows is a Section whose band draws a
          full-bleed rule across the page: with nothing between them the lede's
          last line sat directly on that rule. The value is Section's own
          `py-10 md:py-14`, so the air above band 01 is the same air every other
          band gets, and the header reads as part of the same rhythm rather than
          as something dropped in above it.

          The display size is the one in `docs/design-system.md`, matching
          /blogs and /projects. This page was on `text-3xl font-semibold`, half
          a step smaller and a weight heavier than every other route's h1. */}
      <Container width="reading" className="space-y-4 pb-10 md:pb-14">
        <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-tight">
          Things I&apos;m into
        </h1>
        <p className="max-w-[62ch] text-muted-foreground">
          Coffee I drink, the gear that got me here, and what is on while I
          work. Updated whenever there is something to add, which is the only
          honest promise a page like this can make.
        </p>
      </Container>

      <Section number={no("coffee")} of={total} label="Coffee" title="What I drink" width="reading">
        {/* The taste note sits above the picker, not below it. Underneath, it
            moved every time someone switched to a roaster with a different
            number of beans, which is a layout shift caused by nothing the
            reader did on purpose. */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Where my taste sits.
            </span>{" "}
            Dark and medium-dark, chocolate and nut over fruit. I am not into
            citrusy, high-acid profiles, so a light roast rarely makes it past
            one bag. Read the dots against that rather than against a cupping
            score: three means <em>not for me</em>, not <em>bad coffee</em>.
          </p>
        </div>

        <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
          Pick one to see what I have had. A dot underneath means it is in
          rotation right now.
        </p>

        <RoasterPicker />

        {/* The ratings above are mine, which is only useful once you know what
            the roast words mean. This is the one thing on the coffee page a
            reader can use rather than read, so it gets a link of its own rather
            than being left at the bottom of a 3,000 word article. */}
        <Link
          href="/coffee#roast-picker"
          className="group relative mt-6 block overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors duration-base ease-out hover:border-border-strong"
        >
          {/* The three beans as a backdrop, fanned light to dark left to
              right, which is the same order the slider runs in. Held well back
              so it reads as a texture on the card rather than as content: it is
              decoration, and the sentence over it is the thing being sold.

              Bled off the right edge on purpose: fully inside the card they
              looked like three product shots that had been placed there rather
              than a backdrop.

              The arrow moved inline after the heading to make room. Parked at
              the card's right edge it fought the fan for the same corner, and
              moving the beans only changed which one it landed on.

              Hidden below `sm`, where the sentence uses the full width and
              there is no room for anything behind it. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 items-center opacity-30 transition-opacity duration-base ease-out group-hover:opacity-40 sm:flex"
          >
            {BACKDROP_BEANS.map((b) => (
              <Image
                key={b.src}
                src={b.src}
                alt=""
                width={240}
                height={240}
                sizes="88px"
                className="h-20 w-20 object-contain md:h-[88px] md:w-[88px]"
                style={{ transform: b.transform, marginLeft: b.overlap }}
              />
            ))}
          </span>

          {/* `block`, because `max-width` does nothing on an inline box and the
              description was running the full width of the card and straight
              under the beans. */}
          <span className="relative block max-w-[46ch]">
            <span className="font-mono text-2xs uppercase tracking-label text-subtle">
              Not sure what to buy
            </span>
            <span className="mt-2 flex items-center gap-2 font-medium text-foreground">
              Pick a roast, see what to brew with it
              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-subtle transition-transform duration-base ease-out group-hover:translate-x-0.5"
              />
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              A slider from light to dark. Each one tells you how it tastes and
              which methods suit it, including the ones to avoid.
            </span>
          </span>
        </Link>

        {/* A subheading rather than a section of its own. The roasters, the
            gear and the long read are one subject, and giving each its own
            numbered section spent three lots of section padding saying so. */}
        <h3 className="mt-10 font-mono text-2xs uppercase tracking-label text-subtle">
          Gear, in the order I bought it
        </h3>
        <p className="mb-4 mt-1.5 max-w-[62ch] text-sm text-muted-foreground">
          Each one solved the problem the last one left me with.
        </p>
        <GearTimeline />

        <div className="mt-8">
          <Link
            href="/coffee"
            className="group relative block overflow-hidden rounded-2xl border border-border bg-card"
          >
            <Image
              src="/shelf/coffee-backdrop.webp"
              alt=""
              width={1600}
              height={1067}
              /* Without `sizes`, next/image builds an x-descriptor srcset off the
                 `width` prop, so a 1x screen downloads the 1600w variant for a
                 slot that never exceeds the reading container's 712px. */
              sizes="(max-width: 760px) 100vw, 712px"
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none object-cover opacity-[0.13] grayscale transition-opacity duration-med ease-out group-hover:opacity-[0.2] dark:opacity-[0.08] dark:group-hover:opacity-[0.14]"
            />
            {/* The top padding is what makes this card tall, and it is doing a
                job: the backdrop is anchored to the bottom edge, so the type has
                to start far enough down to leave the drawing somewhere to be. A
                phone has nothing like the width that illustration needs, though,
                so holding a desktop-sized gap there spends most of the screen on
                a picture nobody can make out. The gap scales with the viewport
                instead of jumping at one breakpoint. */}
            <div className="relative flex items-end justify-between gap-4 p-5 pt-10 sm:gap-6 sm:p-6 sm:pt-16 md:p-8 md:pt-24">
              <div>
                <p className="font-mono text-2xs uppercase tracking-label text-subtle">
                  Longer version
                </p>
                {/* Steps down on a phone rather than holding `text-xl`. At 20px
                    this headline wrapped to three lines on a narrow screen, and
                    three lines of heading over two lines of description reads as
                    a paragraph with a large first sentence. */}
                <p className="mt-1.5 text-lg font-semibold tracking-tight text-foreground sm:mt-2 sm:text-xl">
                  How I got into coffee, and what I learnt
                </p>
                {/* The last clause goes on wider screens only. It is the joke,
                    and a joke is the first thing to cut when the card has to fit
                    in a phone. */}
                <p className="mt-1 max-w-[46ch] text-sm text-muted-foreground sm:mt-1.5">
                  Roast levels, grind size, portafilters, why a lever press works
                  <span className="hidden sm:inline">
                    , and why there is nothing wrong with instant
                  </span>
                  .
                </p>
              </div>
              <ArrowRight className="mb-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-base ease-out group-hover:translate-x-0.5 sm:mb-1" />
            </div>
          </Link>
        </div>
      </Section>



      {/* Desk, scent and sound are one section, not three.

          Three rows, two rows, and a strip of album art each used to carry a
          band, a title and `py-10 md:py-14` of their own, which is roughly
          200px of apparatus around 80px of content. Merged into a spec sheet
          the labels survive as the key column, and the page stops clearing its
          throat between every short list. */}
      <Section
        number={no("everyday")}
        of={total}
        label="Everyday"
        title="Desk, scent, sound"
        width="reading"
      >
        <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
          What I work on, what I wear, and what is playing while I do. No
          shopping links on any of it, on purpose.
        </p>

        <SpecList>
          {setup.map((item) => (
            <SpecRow key={item.name} label={item.role}>
              <span className="block font-medium text-foreground">{item.name}</span>
              {item.note && (
                <span className="mt-1 block max-w-[58ch] text-sm text-muted-foreground">
                  {item.note}
                </span>
              )}
            </SpecRow>
          ))}

          {scents.map((s) => (
            <SpecRow key={s.name} label="Scent">
              <span className="block font-medium text-foreground">
                {s.name}
                <span className="ml-2 font-mono text-2xs uppercase tracking-label text-subtle">
                  {s.house}
                </span>
              </span>
              <span className="mt-1 block max-w-[58ch] text-sm text-muted-foreground">
                {s.note}
              </span>
            </SpecRow>
          ))}

          {/* Still conditional on the feed. YouTube is a third party, and a
              playlist that is unreachable, emptied or made private should take
              its row with it rather than leave a label over nothing. It is a
              row now rather than a section, so losing it costs the page one
              entry instead of a whole numbered part. */}
          {tracks.length > 0 && (
            <SpecRow label="On repeat">
              <p className="mb-3 max-w-[58ch] text-sm text-muted-foreground">
                What I have had on while working, cooking, or walking somewhere.
                Press a sleeve for fifteen seconds of one.
              </p>
              <OnRepeat tracks={tracks} />
              <a
                href={PLAYLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-subtle transition-colors duration-fast ease-out hover:text-foreground"
              >
                The whole playlist
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </SpecRow>
          )}
        </SpecList>
      </Section>

      {/* Parked, not deleted. Flip SHOW_BOOKMARKS at the top of this file to
          bring it back. It sits last so that hiding it leaves 01 to 04 running
          in order, and restoring it appends 05 rather than reopening a gap in
          the middle of the page. */}
      {SHOW_BOOKMARKS && (
        <Section number={no("bookmarks")} of={total} label="Bookmarks" title="Worth keeping" width="reading">
          <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
            Links I come back to. Every one carries a reason, or it does not go in.
          </p>

          {/* Plain text. A chip and a card around every link made three
              bookmarks look like a product grid; the reason is the content, so
              the reason gets the space. */}
          {/* Twelve rows and thirteen rules, on a list whose every entry is a
              bold link over a paragraph of prose. Whitespace was always doing
              this job; the lines were just louder. */}
          <ul className="space-y-6">
            {bookmarks.map((b) => (
              <li key={b.url}>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-baseline gap-1.5 font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {b.title}
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 self-center text-subtle transition-transform duration-base ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">
                  {b.why}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Container width="reading" className="pb-10">
        <Link
          href="/books"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
        >
          <span>
            <span className="block font-mono text-2xs uppercase tracking-label text-subtle">
              Also on the shelf
            </span>
            <span className="mt-1.5 block font-medium text-foreground">
              Books I&apos;m reading
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-base ease-out group-hover:translate-x-0.5" />
        </Link>
      </Container>
    </main>
  );
}
