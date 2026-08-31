import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import Container from "@/components/layout/Container";
import { SVGS } from "./SVGS";
import { footerLinks, socialLinks, contactEmail } from "@/lib/siteLinks";

const SOCIAL_ICONS = {
  GitHub: SVGS.Github,
  LinkedIn: SVGS.LinkedIn,
  Twitter: SVGS.Twitter,
} as const;

/**
 * The footer, as a footer.
 *
 * It used to be a full-bleed illustrated band with the wordmark set at 36vw
 * running off the bottom edge. That is a poster, and it was doing the two
 * things a portfolio footer should not: taking more attention than the work
 * above it, and answering none of the questions a reader actually has at the
 * bottom of a page, which are where else to go, how to get in touch, and who
 * this is.
 *
 * Then it answered the first of those twice, listing every route in
 * `navLinks` in a tall column while the sticky header rendered the same list
 * at every width. Cutting the repetition was right; cutting navigation
 * altogether went a step too far, because a reader at the foot of a page is
 * exactly the reader looking for somewhere to go next.
 *
 * What is here now is the same handful of destinations set sideways instead
 * of stacked. A wrapping row of six is two short lines rather than a column
 * of seven, so the links cost the footer almost no height, and the profiles
 * become square icon buttons in the opposite corner rather than a second
 * column of labelled rows. `footerLinks` decides which routes appear (see
 * `lib/siteLinks.ts`); this file decides how they look.
 *
 * The cat is Muybridge, running along the bottom edge on a loop. It is
 * `unoptimized` because Next's image pipeline would re-encode it and a
 * re-encoded GIF is a still: the animation is the whole point. It is
 * positioned on the `<footer>` rather than inside the `Container`, so on a
 * wide screen it runs in the outer margin and never crosses the text column.
 *
 * Two blend modes rather than one opacity. The plate is a photograph on white
 * paper, so dropped in as-is its background would be a pale rectangle on the
 * dark theme and a slightly-wrong-white one on the light theme, since the
 * page is a warm neutral and the paper is not. `mix-blend-multiply` drops the
 * white and keeps the cat; in dark theme `invert` flips the plate so the
 * paper is black and the cat is light, and `mix-blend-screen` drops the black
 * instead. Either way only the animal survives, on whatever the page is.
 *
 * `motion-reduce:hidden` because a GIF cannot be paused. There is no static
 * frame to fall back to, so the honest answer for someone who asked for less
 * motion is to not show it.
 */
const Footer = () => {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border">
      <Image
        src="/footer-cat.gif"
        alt=""
        width={320}
        height={207}
        unoptimized
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[168px] select-none opacity-[0.14] mix-blend-multiply grayscale motion-reduce:hidden dark:opacity-[0.2] dark:mix-blend-screen dark:invert md:w-[232px]"
      />
      <Container width="wide" className="relative py-12 md:py-16">
        <div className="max-w-sm">
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
              className="block h-7 w-7 shrink-0 bg-foreground"
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

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Shashwat Tripathi. Frontend engineer building AI-first product
            surfaces, currently at ShopOS.
          </p>
        </div>

        {/* The two headed groups, side by side from `md` and stacked below it.
            `md:justify-between` rather than a grid: the left group is a
            wrapping row whose width depends on its own content, and pinning
            it to a column track would either crop the wrap or leave a gap
            when it happens to be short. */}
        <div className="mt-10 flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <nav aria-label="Footer" className="md:max-w-md">
            <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">
              Navigate
            </h2>
            {/* A row that wraps, not a list that stacks. `gap-x-6 gap-y-2.5`
                keeps the two lines it wraps onto readable as separate rows
                without the vertical rhythm of a column. */}
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
              {footerLinks.map((l) => (
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
            <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">
              Connect
            </h2>
            {/* Icon-only, so each one carries its name for assistive tech and
                as a title tooltip. 44px squares rather than the 36px the icon
                needs, because these are the smallest tap targets on the page
                and a footer is where a thumb is least precise. */}
            <ul className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map(({ name, href }) => {
                const Icon = SOCIAL_ICONS[name];
                return (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={name}
                      className="grid h-11 w-11 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-colors duration-fast ease-out hover:bg-elevated hover:text-foreground"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      <span className="sr-only">{name}</span>
                    </a>
                  </li>
                );
              })}
              {/* The address, as the fourth button. It reads as one of the
                  ways to reach him rather than as a line of body copy, which
                  is what it was competing with before. */}
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  title={contactEmail}
                  className="grid h-11 w-11 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-colors duration-fast ease-out hover:bg-elevated hover:text-foreground"
                >
                  <Mail aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Email {contactEmail}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Shashwat Tripathi. Built with
            Next.js.
          </p>
          <a
            href="https://github.com/shashwa7-dev/portfolio/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-fast ease-out hover:text-foreground"
          >
            MIT License
          </a>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
