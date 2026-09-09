import Image from "next/image";
import { Check, ArrowRight, Mail } from "lucide-react";
import Container from "@/components/layout/Container";
import AvatarHover from "@/components/AvatarHover";
import LocalTime from "@/components/LocalTime";
import Label from "@/components/layout/Label";
import { cn } from "@/lib/utils";
import { stats } from "@/lib/stats";
import { clients } from "@/lib/clients";

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
 * - The brand avatars in the stat cells. At 17px, greyscale, at 80% opacity,
 *   nobody can identify Coinbase or Polygon, so they did not read as proof,
 *   they read as smudges. `ClientStrip` already shows those logos at a legible
 *   size attached to the engagement that earned them, which is both more
 *   credible and the arrangement this repo already settled on.
 * - The bento box. A `rounded-2xl` bordered container with internal hairlines
 *   made no sense on a page whose structural idea is full-bleed bands crossing
 *   two rails. The stats are a band now, so the hero uses the page's own
 *   device instead of inventing a second one.
 * - The marker scribble. It was the least premium element on the screen and
 *   the only remaining use of `components/common/Marker.tsx`.
 * - The availability band on the portrait, and the portrait's shadow. The band
 *   put a fixed black scrim over the artwork to say one word that now sits in
 *   the meta row as text.
 * - The second button's fill. Two solid-looking buttons side by side is not a
 *   decision; the primary action is now the only thing that looks like one.
 *
 * What deliberately stayed: the name is still the h1 (the ProfilePage JSON-LD
 * declares this person the page's main entity, and the slogan outranking them
 * contradicted it), the verified mark, the live local time, and every number.
 */
export default function About() {
  return (
    <header className="pt-10 pb-8 md:pt-14 md:pb-12">
      <Container width="reading">
        <div className="space-y-7 sm:space-y-8">
          {/* Identity, on one row.

              The old block forced a name, a mono role line and a mono location
              line into the portrait's 64px with `min-h-[4rem]` and
              `justify-between`. Two of those three were the same size and the
              same colour, so they blurred into a single grey mass instead of
              reading as two facts. The role stays with the name; availability
              and the clock move to the end of the row, where they read as
              status rather than as more of the title. */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-4">
            {/* No shadow and no band, so the border is the only thing
                describing the portrait's edge. `AvatarHover` is a fixed 64px
                because the GIF it swaps in needs the size to be legible, so
                this stays 64 rather than the smaller portrait the mock drew. */}
            <div className="relative shrink-0 overflow-hidden rounded-2xl border border-border-strong">
              <AvatarHover />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-medium leading-none tracking-tight text-foreground">
                  Shashwat Tripathi
                </h1>
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-foreground text-background"
                  title="Verified engineer"
                  /* `role="img"` is load-bearing, not decoration: `aria-label`
                     on a bare span is a prohibited attribute, so without a role
                     the label is dropped and the mark reads as nothing. */
                  role="img"
                  aria-label="Verified"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              </div>
              <Label className="mt-2 block">Frontend Engineer · AI · Web3</Label>
            </div>

            {/* On a phone this wraps to its own line, indented past the
                portrait so it still reads as belonging to the name rather than
                as a new block. 4.875rem is the portrait plus the row gap. */}
            <div className="flex w-full items-center gap-2.5 pl-[4.875rem] sm:w-auto sm:pl-0">
              <span className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-label text-subtle">
                {/* Green is the dot and nothing else. A filled emerald pill was
                    tried and dropped: a hue that loud is an intrusion on a
                    deliberately hueless page, and the dot alone carries the
                    live-status meaning that the colour actually earns. */}
                <span className="h-1.5 w-1.5 rounded-full bg-good" />
                Open to work
              </span>
              <span aria-hidden className="text-border-strong">
                ·
              </span>
              <LocalTime />
            </div>
          </div>

          {/* The positioning statement. Still the line doing the selling, but a
              `p` rather than the h1: a page gets one h1 and it is the person.

              Sized down from clamp(2rem, 5vw, 3rem) and dropped from semibold
              to medium. At 48px and 600 it was shouting; the claim is stronger
              said quietly, and the smaller size leaves the emphasis span
              somewhere to go, which it had nowhere to do when the whole line
              was already semibold. */}
          <p className="text-[clamp(1.625rem,3.4vw,2.3rem)] font-medium leading-[1.08] tracking-tighter text-foreground">
            I build interfaces that{" "}
            <span className="font-semibold">ship and scale</span> to millions.
          </p>

          {/* lede (no em-dashes, no org names — generic AI-adaptive positioning) */}
          <p className="max-w-[56ch] text-lg text-muted-foreground">
            I&apos;m Shashwat, an{" "}
            <span className="text-foreground">AI-adaptive frontend engineer</span>.
            Across 9+ production products with top AI and Web3 teams, I turn
            complex ideas into fast, polished, accessible UIs. Reach me at{" "}
            <a
              href="mailto:contact@shashwa7.in"
              className="text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:decoration-foreground"
            >
              contact@shashwa7.in
            </a>
            .
          </p>

          {/* One action that looks like an action, and one that does not. */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="/#experience"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-[color,background-color,transform] duration-fast ease-out hover:bg-accent-hover active:scale-[0.97]"
            >
              View selected work <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:contact@shashwa7.in"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>
        </div>
      </Container>

      {/* The proof points, as a band rather than a box.

          `band-gutters` is the same class `Band` uses, so the dotted gutters
          match every section header on the site. There is no tick: that mark
          means "a labelled division starts here", and this band carries numbers
          rather than a label.

          The grid pulls itself out of the Container's `px-6` on mobile and
          hands that padding to the cells instead. That is what makes the rule
          between the two rows run edge to edge. Left inside the padded column
          it stopped 24px short at each end, which reads as a broken line
          sitting between two full-width ones. */}
      <div className="band-gutters relative mt-10 border-y border-border md:mt-12">
        <Container width="reading">
          <div className="-mx-6 grid grid-cols-2 md:mx-0 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.c}
                className={cn(
                  "px-6 py-4 md:px-0",
                  i > 0 && "md:border-l md:border-border md:pl-4",
                  i % 2 === 1 && "border-l border-border",
                  i >= 2 && "border-t border-border md:border-t-0"
                )}
              >
                <div className="text-xl font-medium tabular-nums tracking-tight text-foreground">
                  {s.n}
                </div>
                <div className="mt-1.5 font-mono text-2xs uppercase tracking-label text-subtle">
                  {s.c}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Worked with.

          One line, not cards. A card per brand was tried and dropped: five
          bordered boxes under a band that is itself a row of bordered cells
          turned the foot of the hero into a second grid, and the hero's whole
          problem was too many containers.

          It is also not the five-card row this repo removed once before. That
          row put each brand's contribution in a tooltip, which a touch device
          cannot reach, so its strongest fact was the one nobody on a phone
          could get to. Here the names are plain text, and the row links to the
          section where each contribution is written out.

          `alt=""` on the logos is correct rather than lazy: the names sit in
          text in the same link, so labelling the images too would make a screen
          reader announce each brand twice. */}
      <Container width="reading">
        <a href="/#experience" className="group mt-6 block text-center md:mt-8">
          <span className="flex items-center justify-center">
            {clients.map((c, i) => (
              <span
                key={c.name}
                className={cn(
                  "relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-secondary outline outline-1 outline-border ring-2 ring-background",
                  i > 0 && "-ml-2.5"
                )}
              >
                {/* Explicit dimensions, well above the 44px this renders at,
                    rather than `fill` with `sizes="32px"`.

                    That was the pixelation: `sizes` tells the browser how much
                    space the image occupies, so a fixed `32px` had it request a
                    32-pixel-wide file, which a 2x display then upscaled. The
                    sources are 367 to 400px square, so nothing was ever wrong
                    with the artwork. Asking for 128 gives every reasonable
                    display more pixels than it needs, and these files are 4 to
                    24KB, so the margin is free. */}
                <Image
                  src={c.img}
                  alt=""
                  width={128}
                  height={128}
                  quality={90}
                  className="h-full w-full object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
                />
              </span>
            ))}
          </span>
          <span className="mt-3 block font-mono text-2xs uppercase tracking-label text-subtle">
            Worked with
          </span>
          <span className="mt-1 block text-sm text-muted-foreground transition-colors duration-fast ease-out group-hover:text-foreground">
            {clients.map((c) => c.name).join(", ")}
          </span>
        </a>
      </Container>
    </header>
  );
}
