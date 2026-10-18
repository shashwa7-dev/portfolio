import Link from "next/link";
import { Check, ArrowRight, Coffee } from "@phosphor-icons/react/ssr";
import Container from "@/components/layout/Container";
import AvatarHover from "@/components/AvatarHover";
import LocalTime from "@/components/LocalTime";
import Label from "@/components/layout/Label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { SOCIAL_ICONS } from "@/components/common/socialIcons";
import StatsTicker from "@/components/common/StatsTicker";
import HeroPhrase from "@/components/common/HeroPhrase";
import { socialLinks } from "@/lib/siteLinks";

/**
 * The hero.
 *
 * It was not unpolished, it was overpopulated: eight visual devices competing
 * inside one screen. A rounded portrait with a dark availability band and a
 * shadow, a circular verified mark, two mono caps lines stacked to the
 * portrait's height, the headline, a hand-drawn marker scribble under the
 * email, a bordered bento with internal hairlines, five 17px brand avatars
 * floating in the stat cells, and two buttons of identical weight. Premium
 * reads as fewer devices and more space, so most of the work here is deletion.
 *
 * What went, and why:
 *
 * - The brand avatars in the stat cells, and later the "Worked with" row that
 *   replaced them. Both were removed: the hero is the claim, the lede and the
 *   numbers, and the brands are named where they mean something, in each
 *   Work row's one-line summary. Do not re-add a brand row here.
 * - The bento box. A `rounded-2xl` bordered container with internal hairlines
 *   made no sense on a page whose structural idea is full-bleed bands crossing
 *   two rails. The stats are a band now, so the hero uses the page's own
 *   device instead of inventing a second one.
 * - The marker scribble. It was the least premium element on the screen and
 *   the only remaining use of `components/common/Marker.tsx`.
 * - The second button's fill. Two solid-looking buttons side by side is not a
 *   decision; the primary action is now the only thing that looks like one.
 *
 * What deliberately stayed: the name is still the h1 (the ProfilePage JSON-LD
 * declares this person the page's main entity, and the slogan outranking them
 * contradicted it), the verified mark, the live local time, and every number.
 *
 * The identity row is the original, restored. An earlier pass here flattened it
 * onto one line and moved availability off the portrait into a text chip; it
 * was reverted on sight. The portrait keeps its band, its shadow and its
 * `min-h-16` column, and the reasoning for each is in the comments below.
 */
export default function About() {
  return (
    <header className="pt-10 md:pt-14 candy:pb-6">
      <Container width="reading">
        <div className="relative space-y-6 sm:space-y-7">
          <div className="flex items-start gap-3.5">
            {/* The portrait is a postage stamp: a white perforated edge
                (`.stamp-edge` in globals.css) around a square photo, postmarked
                "OPEN" in the top-right corner (Postmark, inside AvatarHover).
                The postmark replaced a dark "Open" band along the bottom; the
                tooltip and the `sr-only` text still carry "Open to work".

                The shadow is a `drop-shadow` on this link rather than a
                box-shadow, because the stamp is masked and a box-shadow would
                be cut away with the perforations. It is deeper in dark mode,
                where a soft black shadow does very little against a near-black
                page.

                The whole stamp is the hover target for the goggles. It is also
                a link, to /offcod8. Nothing else on the site points there and
                nothing says it is there, which is the idea: the page is a letter
                left for whoever pokes at the one thing on the homepage that
                looks like a person rather than a control. The accessible name
                is left to come from the contents, "Shashwat Tripathi" and "Open
                to work", rather than being overridden with an `aria-label`
                naming the destination, which keeps the surprise intact for
                everyone equally.

                `block` because an `<a>` is inline by default. */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/offcod8"
                  className="group relative block shrink-0 drop-shadow-[0_1px_1.5px_rgb(0_0_0/0.25)] dark:drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)] tilt-i"
                >
                  <span className="stamp-edge block bg-white p-1.25">
                    <AvatarHover />
                  </span>
                  <span className="sr-only">Open to work</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Open to work</TooltipContent>
            </Tooltip>
            {/* `min-h-18.5`, not `h-18.5`. It is the stamp's exact height (the
                64px photo plus its 5px paper edge) so the edges still line up,
                but a fixed height would overflow instead of growing if the
                availability row ever wrapped on a narrow screen. */}
            <div className="flex min-h-18.5 flex-col justify-between">
              {/* The name is the page's h1.

                  It used to be a 17px div while the tagline below was the h1 at
                  up to 54px, so the person was the smallest text in their own
                  hero and the slogan outranked them. That also contradicted the
                  ProfilePage JSON-LD, which declares this person the page's main
                  entity. The tagline is still the visually dominant line, and
                  still does the selling; it is just no longer the heading.

                  The verified mark sits beside the name rather than pinned to the
                  avatar's corner. As an overhang at `-bottom-1 -right-1` it broke
                  the alignment above, and it belongs with the name it
                  qualifies. */}
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
                  Shashwat Tripathi
                </h1>
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-foreground text-background candy:h-[18px] candy:w-[18px] candy:bg-candy-mint candy:text-foreground candy:outline-solid candy:outline-[1.5px] candy:outline-foreground"
                  title="Verified engineer"
                  /* `role="img"` is load-bearing, not decoration: `aria-label`
                     on a bare span is a prohibited attribute, so without a role
                     the label is dropped and the mark reads as nothing. */
                  role="img"
                  aria-label="Verified"
                >
                  <Check className="h-2.5 w-2.5" weight="bold" />
                </span>
              </div>
              {/* No margins on these two: `justify-between` on the column owns
                  the vertical distribution, and a margin here would fight it. */}
              <div>
                <Label>Frontend Engineer · AI · Web3</Label>
              </div>
              {/* Availability. Same treatment as the "Currently building" badge on
                  the active Experience role, so one signal reads one way
                  everywhere.

                  The green is now the dot only. A full emerald pill (green
                  border, green text, green dot) put a lot of hue on a page whose
                  premise is a restrained neutral palette, and it read as an
                  intrusion. The dot alone still carries the live-status meaning,
                  which is the part the colour actually earns; the label sits on
                  neutral tokens like every other pill in the app. */}
              {/* The availability pill that used to sit here has moved onto the
                  avatar. What remains is the working day, which answers the other
                  half of the same question for a client in another timezone. */}
              <LocalTime />
            </div>
          </div>

          {/* The positioning statement. Still the line doing the selling, but a
              `p` rather than the h1: a page gets one h1 and it is the person.

              Sized down from clamp(2rem, 5vw, 3rem) and dropped from semibold
              to medium. At 48px and 600 it was shouting; the claim is stronger
              said quietly, and the smaller size leaves the emphasis span
              somewhere to go, which it had nowhere to do when the whole line
              was already semibold.

              `text-balance` because the natural break left "millions." alone on
              a line under eight words, and a one-word last line reads as a
              mistake at this size. Balance evens the two lines instead of
              filling the first and dropping the remainder. */}
          <p className="mt-10! text-balance text-[clamp(1.625rem,3.4vw,2.3rem)] font-medium sm:mt-14! leading-[1.08] tracking-tighter text-foreground">
            {/* Emphasis by contrast: the frame of the sentence drops to muted
                and the claim stays in full foreground, set in DM Sans's real
                italic (loaded in app/layout.tsx). Candy keeps its butter chip. */}
            <span className="text-muted-foreground">I build interfaces that </span>
            <HeroPhrase className="font-semibold italic candy:bg-candy-butter candy:px-2 candy:rounded-tag candy:[box-decoration-break:clone]" />
            <span className="text-muted-foreground"> to millions.</span>
          </p>

          {/* lede (no em-dashes, no org names — generic AI-adaptive positioning) */}
          <p className="max-w-[56ch] text-lg text-muted-foreground">
            I&apos;m Shashwat, an{" "}
            <span className="text-foreground">
              AI-adaptive frontend engineer
            </span>
            . I ship fast, polished interfaces for agentic and generative AI
            products with top AI and Web3 teams. Reach me at{" "}
            <a
              href="mailto:contact@shashwa7.in"
              className="text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:decoration-foreground candy:no-underline candy:bg-[linear-gradient(transparent_55%,hsl(var(--candy-butter))_55%)] candy:font-semibold hover:candy:bg-[linear-gradient(transparent_0%,hsl(var(--candy-pink))_0%)]"
            >
              contact@shashwa7.in
            </a>
            .
          </p>

          {/* A filled action and an outlined one.

              The second was a bare text link for a while, on the argument that
              two buttons of equal weight is no decision. It read as an
              afterthought beside a solid button: contacting him is half the
              point of the page, and a link with no edge did not look like
              something to press. An outline is the middle setting. Fill still
              beats border, so the hierarchy survives, but both now look
              pressable and the pair reads as a set rather than a button with a
              stray link next to it.

              Same `rounded-md` and `px-5 py-2.5` as the primary, deliberately,
              and the primary carries `border border-transparent` for the same
              reason. Without it the outlined button stood 42px against the
              filled one's 40: with `box-sizing: border-box` and an auto height,
              a 1px border still adds its two pixels to the box. Matching
              padding is not enough; both buttons have to agree on whether they
              have a border at all.

              `Coffee`, not `Envelope` and not a paper plane. Both of those
              describe the mechanism, and the mechanism is the least interesting
              part of a mailto. Coffee names the thing being proposed, and it is
              not a stock friendly gesture here: there is a whole /coffee page
              and a shelf section behind it, so the icon points at something the
              site can actually back up. */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#experience"
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[color,background-color,transform] duration-fast ease-out hover:bg-accent-hover active:scale-[0.97] sticker candy:rounded-full candy:border-white candy:bg-candy-pink candy:text-foreground candy:font-bold hover:candy:bg-candy-pink tilt-md-e candy:px-4 candy:py-2"
            >
              View selected work <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:contact@shashwa7.in"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-[color,background-color,border-color,transform] duration-fast ease-out hover:border-foreground hover:bg-elevated active:scale-[0.97] sticker candy:rounded-full candy:font-bold hover:candy:bg-white hover:candy:border-white tilt-md-b candy:px-4 candy:py-2"
            >
              <Coffee className="h-4 w-4" /> Get in touch
            </a>
          </div>

          {/* The proof points, as one slow line at the column's width. It
              replaced a four-cell stat band: the numbers read as part of the
              intro rather than as a table under it. */}
          <div className="mt-10!">
            <StatsTicker />
          </div>

          {/* Socials, desktop only.

              Two phone placements were tried and both were worse than nothing.
              Hung off the identity row it read as orphaned, indented into the
              middle of the block with dead space beside it. Moved under the
              actions it became a third row of controls in a hero that already
              has two. The footer carries all three on a phone, in full, with
              labels, which is where a reader looks for them anyway.

              It stays below the actions in source order rather than back up in
              the identity row: that is the reading order it would take if it
              ever returned to the flow, and `top-0` of this stack is the
              identity row's top edge either way.

              From `sm` it lifts out of the flow to the stack's top right
              corner, level with the portrait. No magic numbers hold that
              alignment, so changing the row's height cannot break it.

              `mt-0!` is not a shortcut. `space-y-7` sets `margin-top` through
              `.space-y-7 > :not([hidden]) ~ :not([hidden])`, which outranks a
              plain `mt-0` on specificity, and on an absolutely positioned box
              that margin offsets it below the `top-0` it was just given.

              Icon only, because this is a corner and the footer already lists
              them by name. Each still carries an `sr-only` name and a `title`,
              so nothing is reachable only by a pointer. */}
          <ul className="hidden items-center gap-0.5 sm:absolute sm:right-0 sm:top-0 sm:flex sm:mt-0!">
            {socialLinks.map(({ name, href }) => {
              const Icon = SOCIAL_ICONS[name];
              return (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className="grid h-8 w-8 place-items-center rounded-md text-subtle transition-colors duration-fast ease-out hover:bg-elevated hover:text-foreground sticker sticker-sm candy:rounded-full candy:text-foreground hover:candy:bg-white"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">{name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>

    </header>
  );
}
