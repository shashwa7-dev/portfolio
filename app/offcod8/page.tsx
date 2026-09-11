import type { Metadata } from "next";
import { HandWaving, PenNib } from "@phosphor-icons/react/ssr";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import PageBand from "@/components/layout/PageBand";
import LetterAudio from "@/components/offcod8/LetterAudio";

export const metadata: Metadata = {
  title: "A small note",
  description: "Thanks for stopping by.",
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
 * It keeps the site's chrome, its rails and its page band rather than taking
 * the screen over. An earlier pass did the opposite, a full-bleed video with
 * the copy floating on a scrim, and it read as a different website wearing the
 * same domain. A letter that arrives on the same paper as everything else is
 * the more personal version, not the less.
 *
 * Set in `font-sans` like every other heading here. The reference this came
 * from used Libre Baskerville, and a serif would suit a letter, but there is no
 * serif family in this project by decision: `docs/design-system.md` records
 * that headings are separated by weight and size rather than typeface, and
 * `scripts/verify-simplification.sh` fails check C03 on any serif utility.
 * Hierarchy here is carried by size and measure instead.
 *
 * `components/shelf/OnRepeat.tsx` deliberately refuses a YouTube iframe, and
 * that refusal still holds where it was made: paying for fifteen seconds of a
 * track preview with a third-party player, its cookies and a possible advert is
 * a bad trade on a page that loads no other third-party script. Here the song
 * is the point of the page, and nobody arrives by accident.
 */
export default function Offcod8Page() {
  return (
    <main className="pb-8 md:pb-12">
      <PageBand id="Off code" name="A small note" />

      <Container width="reading">
        <article className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-tight text-foreground">
            Hey, you.
          </h1>

          <p>
            If you&apos;re reading this, you probably came here looking for
            something.
          </p>

          <p>
            Maybe you&apos;re figuring things out. Maybe you&apos;re building
            something. Maybe you&apos;re wondering if you&apos;re where
            you&apos;re supposed to be by now.
          </p>

          <p>I don&apos;t know your story.</p>

          <p>But I do know this:</p>

          {/* The two lines the letter is actually about. They get the section
              heading's size, which is the largest thing on the page after the
              greeting, so they land as statements rather than as more of the
              paragraph around them. */}
          <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            You don&apos;t have to have it all figured out.
          </p>

          <p>
            Some days you&apos;ll feel like you&apos;re moving forward. Some
            days you&apos;ll feel like you&apos;ve done nothing at all.
          </p>

          <p>
            Some people will seem miles ahead of you. You&apos;ll wonder if
            you&apos;re falling behind.
          </p>

          <p>You&apos;re not.</p>

          <p>
            <strong className="font-semibold text-foreground">
              Life isn&apos;t a race, even though it really likes to make us
              feel like it is.
            </strong>
          </p>

          <p>Take your time.</p>

          <p>
            It&apos;s okay if the plan changes.
            <br />
            It&apos;s okay if you change.
            <br />
            It&apos;s okay to rest.
            <br />
            It&apos;s okay to start over.
            <br />
            It&apos;s okay to not be at your best every day.
          </p>

          <p>
            You don&apos;t need to be productive every minute. You don&apos;t
            need to turn every year into a success story.
          </p>

          <p>Sometimes, getting through the day is enough.</p>

          <p>
            And someday, you&apos;ll look back at a version of yourself that was
            worried about everything you&apos;re worried about now, and
            you&apos;ll realise:
          </p>

          <p className="py-2 text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            you were doing just fine.
          </p>

          <p>So keep going.</p>

          <p>Not because you need to become someone else.</p>

          <p>
            But because there&apos;s still a lot of life left for you to live.
          </p>

          <p>
            Take care of yourself.
            <br />
            Call someone you love.
            <br />
            Go outside.
            <br />
            Listen to good music.
            <br />
            Make mistakes.
            <br />
            Laugh a little more.
          </p>

          <p>
            And don&apos;t forget to enjoy the life you&apos;re working so hard
            to build.
          </p>

          {/* The sign-off, on the same hairline every band on the site uses.

              One glyph per line, sized to the text beside it: a wave for the
              goodbye, a nib for the signature. Those are the two gestures a
              handwritten letter actually ends with, which is what earns them a
              place on a page that is otherwise unbroken prose. They sit at
              `text-subtle` so they close the words rather than compete with
              them.

              `aria-hidden` on both. A screen reader announcing "hand waving"
              ahead of "thanks for stopping by" adds a word and no meaning, and
              the nib would announce the signature as an object rather than
              reading it as one. */}
          <footer className="space-y-4 border-t border-border pt-7">
            <p className="flex items-center gap-3">
              <HandWaving
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-subtle"
              />
              Thanks for stopping by.
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

        {/* Under the letter, not over it. The song is the last thing offered
            rather than the first thing demanded. */}
        <div className="mt-12 border-t border-border pt-7">
          <LetterAudio />
        </div>
      </Container>
    </main>
  );
}
