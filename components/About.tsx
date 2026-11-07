import Link from "next/link";
import { Check, ArrowRight, Coffee } from "@phosphor-icons/react/ssr";
import Container from "@/components/layout/Container";
import AvatarHover from "@/components/AvatarHover";
import SpinAvatar from "@/components/common/SpinAvatar";
import DiwaliAvatar from "@/components/diwali/DiwaliAvatar";
import { DIWALI_ENABLED } from "@/lib/diwali";
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
 * The identity row is now one intro line, "Hi, I am (photo) Shashwat",
 * with the portrait inline in the sentence, chosen over an ID card, a status
 * ring and a polaroid. It replaced the postage-stamp row. Availability moved
 * from the stamp's postmark to the mono row under the line.
 */
export default function About() {
  return (
    <header className="pt-10 md:pt-14 candy:pb-6">
      <Container width="reading">
        <div className="relative space-y-6 sm:space-y-7">
          {/* The intro line, and the page's h1: "Hi, I am (photo)
              Shashwat". The portrait sits inside the sentence at about the
              letters' height, which replaced the postage stamp row.

              The photo is a button, not a link: a click spins it like a
              fidget spinner (SpinAvatar), and hovering slides the goggles on.

              The size is a clamp so the whole line fits one line on a 390px
              phone and tops out at the old stamp row's weight on desktop. */}
          <div className="space-y-3.5">
            <h1 className="text-[clamp(1.4rem,5.6vw,2.15rem)] font-medium leading-[1.15] tracking-tighter text-muted-foreground">
              Hi, I am{" "}
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Click spins the photo like a fidget spinner. See SpinAvatar. */}
                  {DIWALI_ENABLED ? (
                    /* Diwali: the photo wears a chakri's fuse. See DiwaliAvatar. */
                    <DiwaliAvatar className="group relative mx-1.5 inline-block cursor-pointer touch-manipulation select-none align-[-0.2em] -rotate-4 rounded-full transition-transform duration-fast ease-out hover:rotate-0" />
                  ) : (
                  <SpinAvatar
                    photo={<AvatarHover />}
                    className="group relative mx-1.5 inline-block cursor-pointer touch-manipulation select-none align-[-0.2em] -rotate-4 rounded-full transition-transform duration-fast ease-out hover:rotate-0"
                  >
                    {/* The status ring: an accent (ink) dotted circle turning slowly
                        around the photo (`.status-ring`), plus a live dot.
                        Both say "open to work" at a glance; under reduced
                        motion the ring holds still. */}
                    <svg
                      aria-hidden
                      viewBox="0 0 40 40"
                      className="status-ring pointer-events-none absolute -inset-[0.14em] text-accent"
                    >
                      <circle cx={20} cy={20} r={19.25} fill="none" stroke="currentColor" strokeWidth={1.2} strokeDasharray="1.6 3.2" strokeLinecap="round" />
                    </svg>
                    <span
                      aria-hidden
                      className="absolute -bottom-[0.02em] -right-[0.04em] h-[0.28em] w-[0.28em] rounded-full bg-amber-700 ring-2 ring-background dark:bg-amber-300"
                    />
                  </SpinAvatar>
                  )}
                </TooltipTrigger>
                {/* The spin hint lives here: F only exists on a keyboard, and
                    keyboard users are the ones who see a hover tooltip. */}
                <TooltipContent className="flex items-center gap-2">
                  Open to work
                  <span aria-hidden className="opacity-40">·</span>
                  {DIWALI_ENABLED ? (
                    <span className="opacity-70">Click to light the chakri</span>
                  ) : (
                  <span className="inline-flex items-center gap-1 opacity-70">
                    Press
                    <kbd className="grid h-4 min-w-4 place-items-center rounded border border-current/30 px-1 font-mono text-2xs">
                      F
                    </kbd>
                    to spin
                  </span>
                  )}
                </TooltipContent>
              </Tooltip>{" "}
              <span className="whitespace-nowrap font-semibold text-foreground">
                Shashwat
                <span
                  className="ml-1.5 inline-grid h-4 w-4 place-items-center rounded-full bg-foreground align-[0.2em] text-background candy:h-[18px] candy:w-[18px] candy:bg-candy-mint candy:text-foreground candy:outline-solid candy:outline-[1.5px] candy:outline-foreground"
                  title="Verified engineer"
                  /* An aria-label on a bare span is a prohibited attribute, so
                     without a role the label is dropped. */
                  role="img"
                  aria-label="Verified"
                >
                  <Check className="h-2.5 w-2.5" weight="bold" />
                </span>
              </span>
            </h1>

            {/* Role on its own line, then the working day in Bengaluru and
                availability beneath it. Two fixed lines rather than one row
                that wraps wherever the viewport decides. The amber is the glyph
                and the word only, the one live-status signal on the page. */}
            <div className="flex flex-col items-start gap-1.5">
              <Label>Frontend Engineer · AI · Web3</Label>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <LocalTime />
                <span aria-hidden className="font-label text-2xs text-subtle">·</span>
                <span className="inline-flex items-center gap-1.5 font-label text-2xs uppercase tracking-label text-amber-700 dark:text-amber-300">
                  {/* A 3x3 live glyph in the section-glyph dot language: the
                      centre holds, the ring pulses outward like a signal
                      (.live-glyph in globals.css). Amber, like the avatar's live dot. */}
                  <span aria-hidden className="live-glyph grid grid-cols-3 gap-px">
                    {[2, 1, 2, 1, 0, 1, 2, 1, 2].map((ring, i) => (
                      <span
                        key={i}
                        data-centre={ring === 0 ? "" : undefined}
                        style={{ "--ring": ring } as React.CSSProperties}
                        className="h-0.75 w-0.75 rounded-full bg-current"
                      />
                    ))}
                  </span>
                  Open to work
                </span>
              </div>
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
          <p className="mt-7! text-balance text-[clamp(1.625rem,3.4vw,2.3rem)] font-medium sm:mt-9! leading-[1.08] tracking-tighter text-foreground">
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
          <ul className="hidden items-center gap-1 sm:absolute sm:-right-2 sm:top-0 sm:flex sm:mt-0!">
            {socialLinks.map(({ name, href }) => {
              const Icon = SOCIAL_ICONS[name];
              return (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className="grid h-10 w-10 place-items-center rounded-lg text-subtle transition-colors duration-fast ease-out hover:bg-elevated hover:text-foreground sticker sticker-sm candy:rounded-full candy:text-foreground hover:candy:bg-white"
                  >
                    <Icon aria-hidden="true" className="h-5.5 w-5.5" />
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
