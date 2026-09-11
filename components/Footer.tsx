import Link from "next/link";
import { Envelope, GithubLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react/ssr";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import {
  footerLinks,
  socialLinks,
  contactEmail,
  location,
} from "@/lib/siteLinks";

const SOCIAL_ICONS = {
  GitHub: GithubLogo,
  LinkedIn: LinkedinLogo,
  Twitter: XLogo,
} as const;

/**
 * The footer, as labelled columns closed by a specimen plate.
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
 * and it existed to give the foot of the page some weight, which the plate now
 * does with type. `public/footer-panther.jpg` is no longer referenced by
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
    <footer className="mt-24 border-t border-border">
      <Container className="grid grid-cols-2 gap-x-10 gap-y-9 pt-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Label className="mb-3 block">Studio</Label>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition-opacity duration-fast ease-out hover:opacity-80"
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
          {/* Two lines, and the column decides what fits. At four tracks this
              cell is about 148px wide, roughly twenty characters a line, so the
              old `max-w-[34ch]` never engaged and the previous sentence ran to
              four lines. Measured: this is the longest wording that lands on
              two. The positioning belongs to the hero anyway; the footer only
              needs to say what he does and where he is doing it. */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Frontend engineer. Currently at ShopOS.
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

      <Container className="grid grid-cols-2 gap-x-10 gap-y-9 pb-10 pt-9 md:grid-cols-4">
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

      </Container>

      {/* The plate.

          Full bleed so its rules cross the page rails, like every band above
          it. Outline type rather than a filled wordmark: filled, it would be a
          second logo competing with the navbar's; drawn, it reads as a
          specimen of the mark, which is the language the visitor card already
          speaks.

          `aria-hidden` on the whole thing. It is the word "offcod8" for the
          third time in one footer, and a screen reader has already had it from
          the Studio link above. */}
      <div
        aria-hidden
        className="relative select-none overflow-hidden border-t border-border py-9"
      >
        <span className="plate-rule pointer-events-none absolute inset-x-6 top-3 h-1.5" />
        <span className="plate-rule pointer-events-none absolute inset-x-6 bottom-3 h-1.5" />
        {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map(
          (pos) => (
            <span
              key={pos}
              className={`pointer-events-none absolute ${pos} font-mono text-xs leading-none text-border-strong`}
            >
              +
            </span>
          )
        )}
        <p className="plate-wordmark px-8 text-center text-[clamp(2.75rem,11vw,8rem)] font-bold leading-[0.86] tracking-tight">
          offcod8
        </p>
        <p className="mt-4 text-center font-mono text-2xs uppercase tracking-label text-subtle">
          shashwa7.in
          <span className="px-2 text-border-strong">·</span>
          Built with Next.js
        </p>
      </div>

      <div className="border-t border-border">
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
