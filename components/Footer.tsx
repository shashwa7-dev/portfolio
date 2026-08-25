import Link from "next/link";
import Container from "@/components/layout/Container";
import { SVGS } from "./SVGS";
import { navLinks, footerOnlyLinks, socialLinks, contactEmail } from "@/lib/siteLinks";

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
 * So: a rule, a brand block, two columns of links, and a baseline. The
 * navigation and profiles come from `lib/siteLinks`, the same lists the header
 * and the contact section read, because a footer that has quietly fallen a
 * route behind is the usual way this component rots.
 */
const Footer = () => {
  return (
    <footer className="mt-24 border-t border-border">
      <Container width="wide" className="py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
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
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-12 gap-y-8 sm:gap-x-20"
          >
            <div>
              <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">
                Navigate
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[...navLinks, ...footerOnlyLinks].map((l) => (
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

            <div>
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
            </div>
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
