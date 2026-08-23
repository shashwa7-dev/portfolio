import Image from "next/image";
import { Check, ArrowRight, Mail } from "lucide-react";
import Container from "@/components/layout/Container";
import AvatarHover from "@/components/AvatarHover";
import LocalTime from "@/components/LocalTime";
import Shimmer from "@/components/common/Shimmer";
import Label from "@/components/layout/Label";
import Bento from "@/components/layout/Bento";
import Marker from "@/components/common/Marker";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { stats } from "@/lib/stats";

export default function About() {
  return (
    <header className="pt-12 pb-10 md:pt-16">
      <Container width="reading">
        <div className="space-y-5 sm:space-y-7">
          {/* Identity block.

              The avatar stays 64px and the copy is fitted to it, rather than the
              other way round: growing the image to the copy's height made a
              supporting portrait the loudest thing in the hero.

              Alignment is by construction, not by arithmetic. The text column is
              pinned to the avatar's exact height with `justify-between`, so the
              first row's top and the last row's bottom sit on the avatar's edges
              whatever the type sizes turn out to be. An earlier version summed
              the three rows by hand to land near 64px; that held only until any
              one size changed, and a near-match reads as a mistake in a way a
              deliberate difference does not.

              `leading-none` on the name is load-bearing. At `leading-tight` its
              glyphs sit inside a line box about a quarter taller, so the
              half-leading pushed the letters below the avatar's top edge even
              when the boxes themselves lined up. Aligning boxes is not the same
              as aligning what you can see. */}
          <div className="flex items-start gap-3.5">
            {/* Availability rides the avatar, LinkedIn style, instead of taking a
                row of its own as a pill.

                The band is a fixed dark scrim, not a palette token, and that is
                the point: it sits on photographic content, so it has to stay
                legible against pixels nobody controls. Page-surface tokens all
                assume a known background. `bg-foreground` was tried and failed
                exactly there, inverting to near-white in dark mode against avatar
                art that is already light, so the band lost its edge. A scrim
                works in both themes with one value, and the codebase already does
                this over media: see the `bg-black/40` play overlay on the work
                case-study page.

                A solid emerald band was tried before that and dropped for a
                different reason: it contradicted a decision recorded in this
                file, that green is the dot and nothing else, because a filled hue
                on a deliberately hueless page reads as an intrusion. The dot
                survives, since a live-status colour is the one thing the hue
                genuinely earns.

                The shadow is the avatar's "pop", split by theme because a black
                shadow does very little against a near-black page: light mode gets
                a soft one, dark mode a deeper one that reads as depth rather than
                as a smudge.

                The edge is a plain `border` on this wrapper. Earlier attempts put
                a ring inside `AvatarHover` instead, which was the wrong place
                twice over: a non-inset ring is a box-shadow and this wrapper's
                `overflow-hidden` clipped it away entirely, and once inset it sat
                a pixel inside the artwork rather than describing the shape. A
                border on the wrapper is not clipped by that wrapper's own
                overflow, and it traces the avatar and its band as one object,
                which is what they are.

                The visible word is just "Open". At `text-2xs` in mono, "Open to
                work" measures about 84px against a 64px avatar, so the full
                phrase needs either an off-scale type size or a band wider than
                the image it sits on, and an overhang is what made this edge look
                wrong to begin with. The tooltip and the `sr-only` text carry the
                full phrase, so nothing is lost to a pointer or to assistive tech.

                The whole avatar is the hover target, not just the band. It is a
                far larger area to hit, and it keeps the band `pointer-events-none`
                so it cannot swallow the hover that arms the avatar's own GIF. */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative shrink-0 overflow-hidden rounded-2xl border border-border-strong shadow-md shadow-black/10 dark:shadow-lg dark:shadow-black/40">
                  <AvatarHover />
                  <Shimmer className="absolute inset-x-0 bottom-0 block">
                    <span className="pointer-events-none flex items-center justify-center gap-1 bg-black/65 py-px font-mono text-2xs font-medium uppercase tracking-label text-white backdrop-blur-[2px]">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      <span aria-hidden>Open</span>
                      <span className="sr-only">Open to work</span>
                    </span>
                  </Shimmer>
                </div>
              </TooltipTrigger>
              <TooltipContent>Open to work</TooltipContent>
            </Tooltip>
            {/* `min-h-[4rem]`, not `h-16`. It is the avatar's exact height so the
                edges still line up, but a fixed height would overflow instead of
                growing if the availability row ever wrapped on a narrow screen. */}
            <div className="flex min-h-[4rem] flex-col justify-between">
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

          {/* The positioning statement. Still the visually dominant line and
              still the thing doing the selling, but a `p` rather than the h1: a
              page gets one h1 and it is the person, not the slogan. Sized down
              slightly from clamp(2.2rem, 5.5vw, 3.4rem) so the name above has
              room to read as the heading it now is. */}
          <p className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.02] tracking-tighter text-foreground">
            I build interfaces that{" "}
            <span className="font-semibold text-foreground">ship and scale</span> to
            millions.
          </p>

          {/* lede (no em-dashes, no org names — generic AI-adaptive positioning) */}
          <p className="max-w-[56ch] text-lg text-muted-foreground">
            I&apos;m Shashwat, an{" "}
            <span className="text-foreground">AI-adaptive frontend engineer</span>.
            Across 9+ production products with top AI and Web3 teams, I turn
            complex ideas into fast, polished, accessible UIs. Reach me at{" "}
            <a href="mailto:contact@shashwa7.in" className="text-foreground">
              <Marker>contact@shashwa7.in</Marker>
            </a>
            .
          </p>

          {/* stats — overlapping brand avatars float top-right (always greyscale),
              smaller on mobile, tooltips name them */}
          <Bento className="grid-cols-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.c}
                className="relative flex h-full flex-col bg-card px-4 py-3.5"
              >
                {s.orgs && s.orgs.length > 0 && (
                  <div className="absolute right-2 top-2 flex items-center sm:right-2.5 sm:top-2.5">
                    {s.orgs.map((org, i) => (
                      <Tooltip key={org.name}>
                        <TooltipTrigger asChild>
                          <span
                            className={`relative h-4 w-4 shrink-0 overflow-hidden rounded-full bg-secondary outline outline-1 outline-border ring-2 ring-card sm:h-5 sm:w-5 ${
                              i > 0 ? "-ml-1" : ""
                            }`}
                          >
                            <Image
                              src={org.img}
                              alt={org.name}
                              fill
                              sizes="(max-width: 640px) 16px, 20px"
                              className="object-cover grayscale opacity-80 transition-[filter] duration-base ease-out hover:grayscale-0"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{org.name}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
                <div className="text-2xl font-semibold text-foreground">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.c}</div>
              </div>
            ))}
          </Bento>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#experience"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97]"
            >
              View selected work <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:contact@shashwa7.in"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.97]"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
