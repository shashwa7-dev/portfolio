import Image from "next/image";
import Link from "next/link";
import { Envelope } from "@phosphor-icons/react/ssr";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import { SOCIAL_ICONS } from "@/components/common/socialIcons";
import {
  footerLinks,
  socialLinks,
  contactEmail,
  location,
} from "@/lib/siteLinks";

/**
 * The footer, as labelled columns over a copyright row.
 *
 * It was closed by a "specimen plate", a full-bleed outlined "offcod8"
 * wordmark between two rules. That was removed: it was the loudest thing at the
 * foot of the page and said nothing the navbar's mark does not. Do not re-add
 * it; the `.plate-*` styles went with it.
 *
 * It used to be a paragraph with links under it, over a panther photograph
 * washed in at 16% and 28%. Two things were wrong with that by the time the
 * rest of the site had rails and bands.
 *
 * It was the only surface on the page with no rules in it. Every section above
 * opens with a band crossing two rails, and the footer opened with a logo and a
 * sentence, so the page's structural idea stopped one screen before the page
 * did. Each fact now gets a mono label and a column of its own, which is
 * `Band`'s vocabulary laid out in columns.
 *
 * Columns, not boxed cells. The references this came from draw a border around
 * every cell; copying that here would put a third and fourth line weight on a
 * surface that already carries two rails and a full-bleed rule. Alignment does
 * the same work, and nothing can collide with a border that is not there.
 *
 * The photograph is gone. It was the only photographic element in the design,
 * and it existed to give the foot of the page some weight. `public/footer-panther.jpg` is no longer referenced by
 * anything.
 *
 * Two facts move down here from the hero: the address and the location. Both
 * were in the identity row, the most crowded block on the page, and a footer is
 * where a reader looks for them anyway.
 *
 * Availability deliberately did NOT come with them. The hero already says it,
 * on the portrait, where it is the first thing a visitor sees; repeating it at
 * the foot of the page made the same claim twice and put a second green dot on
 * a palette that allows exactly one. The footer states where he is and how to
 * reach him, and leaves whether he is looking to the top of the page.
 */
const Footer = () => {
  // Six links, split down the middle so neither column runs longer than the
  // three-item ones beside it. Slicing rather than two hand-kept lists: the
  // source of truth stays `footerLinks`, and a seventh entry lands in "More"
  // instead of silently going missing.
  const half = Math.ceil(footerLinks.length / 2);
  const navPrimary = footerLinks.slice(0, half);
  const navSecondary = footerLinks.slice(half);

  return (
    <footer className="site-footer mt-12 border-t border-border candy:border-0 candy:mt-16">
      <Container className="grid grid-cols-2 gap-x-10 gap-y-9 pt-10 md:grid-cols-4 candy:pt-8">
        <div className="col-span-2 md:col-span-1">
          <Label className="mb-3 block">Studio</Label>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition-opacity duration-fast ease-out hover:opacity-80 sticker sticker-sm candy:rounded-tag candy:px-2 candy:py-1 tilt-i"
          >
            {/* Masked rather than drawn as an <img>: the asset is one flat
                colour on transparency, so as an image it would stay #0E0D0C
                and disappear into the dark theme. The same treatment the
                header uses. */}
            <span
              aria-hidden
              className="block h-6 w-6 shrink-0 bg-foreground"
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
            <span className="text-base font-semibold tracking-tight text-foreground">
              offcod8
            </span>
          </Link>
          {/* Role, then one tagline. Two lines, and the column decides what
              fits: at four tracks this cell is 148px, roughly twenty characters
              a line, which is why an earlier `max-w-[34ch]` never engaged and
              the original sentence ran to four.

              Measured against the rendered element rather than guessed. The
              full hero line, "interfaces that ship and scale", runs to three
              here; dropping "and scale" is what buys the second line back.

              No employer. The current role is already in Experience and on the
              org page, and a footer that names it becomes a thing to remember
              to edit on the day it changes. */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Frontend engineer. Interfaces that ship.
          </p>
        </div>

        <nav aria-label="Footer">
          <Label className="mb-3 block">Navigate</Label>
          <ul className="space-y-1.5">
            {navPrimary.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <Label className="mb-3 block">More</Label>
          <ul className="space-y-1.5">
            {navSecondary.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Named links, not icon buttons. The four 44px squares that used to
            sit here were a third button style, after the hero's solid CTA and
            the toolkit's pills, and they made the reader decode three glyphs to
            find out where they led. */}
        <div>
          <Label className="mb-3 block">Connect</Label>
          <ul className="space-y-1.5">
            {socialLinks.map(({ name, href }) => {
              const Icon = SOCIAL_ICONS[name];
              return (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground"
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-subtle transition-colors duration-fast ease-out group-hover:text-foreground"
                    />
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>

      <Container className="relative grid grid-cols-2 gap-x-10 gap-y-9 pb-10 pt-9 md:grid-cols-4 candy:pb-8 candy:pt-7">
        <div className="col-span-2 md:col-span-1">
          <Label className="mb-3 block">Email</Label>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors duration-fast ease-out hover:text-muted-foreground"
          >
            <Envelope
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-subtle"
            />
            {contactEmail}
          </a>
        </div>

        <div>
          <Label className="mb-3 block">Based in</Label>
          <p className="text-sm text-muted-foreground">{location.name}</p>
        </div>

        {/* A tear in the footer: a ripped hole with a stack of $100 bills
            looking back out through it. It has its own transparency, and in
            the light theme its white torn edge melts into the off-white
            footer, so it reads as this page being ripped open.

            From `sm` up it sits at the far right of this row, in the space the
            two facts leave empty. On a phone it is a row of its own under
            "Based in", aligned left: the bottom-right corner there belongs to the
            fixed chat launcher and its greeting at the foot of the page. Decorative (`alt=""`); below the
            fold, so `next/image` lazy-loads it. */}
        <Image
          src="/images/footer-tear.webp"
          alt=""
          width={640}
          height={232}
          sizes="(min-width: 640px) 260px, 220px"
          draggable={false}
          className="col-span-2 w-[220px] -rotate-3 select-none transition-transform duration-med ease-out hover:-rotate-1 hover:scale-[1.03] sm:absolute sm:bottom-7 sm:right-6 sm:w-[260px] md:col-span-1"
        />
      </Container>

      <div className="border-t border-border candy:border-0">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 font-mono text-2xs uppercase tracking-label text-subtle">
          <span className="mr-auto">
            &copy; {new Date().getFullYear()} Shashwat Tripathi
          </span>
          <a
            href="https://github.com/shashwa7-dev/portfolio/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-fast ease-out hover:text-foreground"
          >
            MIT License
          </a>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
