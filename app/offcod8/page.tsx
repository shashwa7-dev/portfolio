import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HandWaving, PenNib, Smiley } from "@phosphor-icons/react/ssr";
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
          <p>I don&apos;t really know how to start this.</p>

          <p>Maybe with the fact that I&apos;m still figuring things out.</p>

          {/* One of the draft's em dashes. CLAUDE.md bans them in user-facing
              copy, and this one was joining two independent clauses, which is
              what a full stop is for. */}
          <p>
            There are times in life when you can be so sure about something,
            give it years of your time, your energy, your heart. And then one
            day you pause and wonder:
          </p>

          {/* The four lines the letter turns on, here and in the three
              sections below. They take the largest size on the page after the
              greeting, above even a section heading, because they are the
              sentences the paragraphs around them exist to arrive at. */}
          <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            What am I actually doing with my life?
          </p>

          <p>I&apos;ve had those moments.</p>

          <p>And honestly, I think it&apos;s okay.</p>

          <p>
            It&apos;s okay to be confused sometimes.
            <br />
            It&apos;s okay to question things.
            <br />
            It&apos;s okay to not have an answer.
            <br />
            It&apos;s okay to change your mind.
          </p>

          <p>We&apos;re not supposed to know everything, all the time.</p>

          {/* Each part opens on the hairline the sign-off uses, standing in for
              the rule the draft wrote as `---`. No `Band`: a band means a
              labelled division of the page starts there, and it stops meaning
              that the moment it is borrowed for emphasis. `space-y-6` on the
              article supplies the air above the rule, `pt-10` the air below,
              so the heading never needs to out-specify the stack it sits in. */}
          <section className="space-y-6 border-t border-border pt-10">
            <h2 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
              Before software, there was music.
            </h2>

            <p>For a while, music was a big part of my life.</p>

            <p>
              I was in Bombay, learning music at the{" "}
              <strong className="font-semibold text-foreground">
                True School of Music
              </strong>
              , going to gigs, listening to bands, spending evenings at places
              like Hard Rock Cafe, and discovering music that stayed with me.
            </p>

            <p>
              Agnee.
              <br />
              The Local Train.
              <br />
              And so many other artists and musicians I came across along the
              way.
            </p>

            <p>More than anything, I remember the people.</p>

            <p>
              The friends I made.
              <br />
              The conversations.
              <br />
              The late nights.
              <br />
              The feeling of being around people who were simply passionate
              about something.
            </p>

            <p>
              Some of those people are still a part of my life in one way or
              another.
            </p>

            <p>
              And looking back, I realize that chapter gave me much more than
              music.
            </p>

            <p>
              It gave me people.
              <br />
              Experiences.
              <br />
              Memories.
            </p>

            <p>
              And maybe, without realizing it, it taught me how much I enjoy{" "}
              <strong className="font-semibold text-foreground">
                creating something that didn&apos;t exist before.
              </strong>
            </p>
          </section>

          <section className="space-y-6 border-t border-border pt-10">
            <h2 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
              Then came tech.
            </h2>

            <p>
              Somewhere along the way, that curiosity found its way into
              software.
            </p>

            <p>
              And I&apos;ve spent the last few years building things, breaking
              things, learning, figuring things out, and trying to become better
              at what I do.
            </p>

            <p>I&apos;ve met some incredible people along the way.</p>

            <p>
              And just a few months ago, I moved to Bangalore after spending a
              long time working remotely.
            </p>

            <p>
              I got the chance to work alongside an amazing team here, with some
              incredibly talented people.
            </p>

            <p>I learned a lot from them.</p>

            <p>Not just about software.</p>

            <p>
              About working with people.
              <br />
              About building something together.
              <br />
              About myself.
            </p>

            <p>And I&apos;m genuinely grateful for that chapter.</p>
          </section>

          <section className="space-y-6 border-t border-border pt-10">
            <h2 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
              But lately, I&apos;ve been thinking again.
            </h2>

            <p>
              I don&apos;t enjoy software engineering in quite the same way I
              used to.
            </p>

            <p>
              And that&apos;s probably one of the hardest things for me to
              admit.
            </p>

            <p>
              Because when you&apos;ve spent years becoming something, it&apos;s
              strange to suddenly wonder if that&apos;s still what you want to
              be.
            </p>

            <p>Maybe I&apos;ll find my way back to it.</p>

            <p>
              Maybe I&apos;ll discover a different part of it that I
              haven&apos;t seen yet.
            </p>

            <p>Maybe I&apos;ll end up doing something completely different.</p>

            <p>
              <strong className="font-semibold text-foreground">
                I honestly don&apos;t know.
              </strong>
            </p>

            <p>And for once, I&apos;m trying to be okay with not knowing.</p>

            <p>I&apos;m still trying to rediscover myself.</p>

            <p>
              What I want to build.
              <br />
              What I want to learn.
              <br />
              What makes me curious.
              <br />
              What makes me feel alive.
            </p>

            <p>Maybe I&apos;ll remain an engineer.</p>

            <p>Maybe I&apos;ll become something else.</p>

            <p>
              Whatever it is, I want to give myself the freedom to find out.
            </p>
          </section>

          <section className="space-y-6 border-t border-border pt-10">
            <h2 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
              And maybe that&apos;s what life is.
            </h2>

            <p>Not having a perfectly written plan.</p>

            <p>
              It&apos;s the unexpected turns.
              <br />
              The people who come into our lives.
              <br />
              The things we fall in love with.
              <br />
              The things we eventually outgrow.
              <br />
              The songs we keep coming back to.
              <br />
              The random conversations we remember years later.
              <br />
              The coffee on a quiet morning.
              <br />
              The nights that somehow become memories.
              <br />
              The things we create.
              <br />
              The places we go.
              <br />
              The people we become.
            </p>

            <p>Maybe those aren&apos;t just things happening along the way.</p>

            <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
              Maybe they are the way.
            </p>

            <p>So I don&apos;t know exactly where I&apos;m headed from here.</p>

            <p>But I know I have the ability to figure it out.</p>

            <p>
              And whatever comes next, I&apos;ll meet it with the same curiosity
              that brought me here in the first place.
            </p>

            <p>
              I want to believe that I can build whatever I truly decide to
              build.
            </p>

            <p>Maybe not immediately.</p>

            <p>Maybe not exactly how I imagined it.</p>

            <p>But I&apos;ll get there.</p>

            <p>
              <strong className="font-semibold text-foreground">
                I have to believe that.
              </strong>
            </p>

            <p>
              Because no matter how confusing things get, no matter how
              difficult life becomes,
            </p>

            <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
              I&apos;m going to rise.
            </p>

            <p>Maybe I&apos;ll stumble.</p>

            <p>Maybe I&apos;ll take a few wrong turns.</p>

            <p>Maybe I&apos;ll have to start over.</p>

            <p>But I&apos;ll rise.</p>
          </section>

          <section className="space-y-6 border-t border-border pt-10">
            {/* The draft ended this heading on an em dash. A comma carries the
                same lean into the line under it. */}
            <h2 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
              And for everything that has brought me here,
            </h2>

            <p>I&apos;m incredibly grateful.</p>

            {/* Two more em dashes gone. Both were introducing the thing being
                said to someone, which is a colon's job. */}
            <p>
              To my{" "}
              <strong className="font-semibold text-foreground">
                Maa, dad, and sister
              </strong>
              : thank you for standing by me, believing in me, and giving me
              more support than I could ever properly put into words.
            </p>

            <p>
              To my closest friends: thank you for the conversations, the
              laughter, the memories, and simply being there.
            </p>

            <p>
              To the people I&apos;ve met along the way, even the ones who were
              only part of one particular chapter: thank you.
            </p>

            <p>
              Every person, every place, every experience has left something
              behind.
            </p>

            <p>
              And when I look at my life, I realize how lucky I am to have had
              all of it.
            </p>
          </section>

          <section className="space-y-6 border-t border-border pt-10">
            <p>So, I don&apos;t really know what&apos;s next.</p>

            <p>
              More music.
              <br />
              More things to build.
              <br />
              More things to learn.
              <br />
              More places to see.
              <br />
              More people to meet.
            </p>

            <p>Maybe more tech.</p>

            <p>Maybe something completely different.</p>

            <p>
              <strong className="font-semibold text-foreground">
                Let&apos;s see where life takes me.
              </strong>
            </p>

            <p>I&apos;m still figuring it out.</p>

            <p>And honestly,</p>

            {/* The one glyph in the body of the letter, and it closes the
                last line of it.

                Inline rather than a flex row, so it stays in the text and
                wraps with it: as a flex item beside a line that goes to two on
                a phone it would sit off to the side, centred against a block
                rather than following a sentence. Sized in `em` for the same
                reason the line is sized in two steps, so it grows with the
                type at `md` without a second class to keep in sync. */}
            <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
              I&apos;m excited to find out.{" "}
              <Smiley
                aria-hidden="true"
                className="inline h-[0.9em] w-[0.9em] align-[-0.1em] text-subtle"
              />
            </p>
          </section>

          {/* The sign-off, on the same hairline every part of the letter opens
              with.

              A glyph on the greeting and a glyph on the name: a wave for the
              goodbye, a nib for the signature. Those are the two gestures a
              handwritten letter actually ends with, which is what earns them a
              place on a page that is otherwise unbroken prose. They sit at
              `text-subtle` so they close the words rather than compete with
              them.

              The nib is also the last em dash. "- Shash" is what a signature
              line is for, so the dash goes and the glyph says it instead.

              `aria-hidden` on both. A screen reader announcing "hand waving"
              ahead of "thanks for dropping by" adds a word and no meaning, and
              the nib would announce the signature as an object rather than
              reading it as one. */}
          <footer className="space-y-4 border-t border-border pt-10">
            <p className="flex items-center gap-3">
              <HandWaving
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-subtle"
              />
              Thanks for dropping by.
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
