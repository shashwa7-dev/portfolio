import Link from "next/link";
import Container from "@/components/layout/Container";
import { SVGS } from "./SVGS";
import { socialLinks, contactEmail } from "@/lib/siteLinks";

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
 * It then answered the first of those twice. A "Navigate" column listed every
 * route in `navLinks`, which is the list the sticky header renders on every
 * page at every width, its mobile menu included: seven links repeating a bar
 * that is still on screen. What is left is the part no other surface carries.
 * Who this is, the address, the profiles, and the card.
 */
const Footer = () => {
  return (
    <footer className="mt-24 border-t border-border">
      <Container width="wide" className="py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-16">
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

            <a
              href={`mailto:${contactEmail}`}
              className="mt-4 inline-block text-sm text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:decoration-foreground"
            >
              {contactEmail}
            </a>

            {/* The one route with no other way in. The header is for the work
                and the card is a toy, so it is deliberately absent from
                `navLinks`. An unlinked route is an undiscovered one, and this
                is where it gets discovered. Set as an aside rather than a
                fourth link in a list, so trimming the lists did not cost the
                card the only entrance it has. Block-level, not inline-flex:
                the address above it is an inline-block, so at this column
                width the two shared a line and the top margin had nothing to
                push against. `w-fit` keeps the hover target on the text. */}
            <Link
              href="/card"
              className="mt-6 flex w-fit items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-subtle transition-colors duration-fast ease-out hover:text-foreground"
            >
              Mint a visitor card
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <nav aria-label="Social profiles">
            <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">
              Elsewhere
            </h2>
            <ul className="mt-4 space-y-2.5">
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
                      <Icon className="h-3.5 w-3.5" />
                      {name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
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
