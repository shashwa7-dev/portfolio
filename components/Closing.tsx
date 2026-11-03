import Container from "@/components/layout/Container";
import CardNudge from "@/components/CardNudge";
import DotMarquee from "@/components/common/DotMarquee";
import { SOCIAL_ICONS } from "@/components/common/socialIcons";
import { socialLinks, contactEmail } from "@/lib/siteLinks";

/**
 * The page's last word: one line, the address, the three profiles. No section
 * label: it closes the page rather than opening a section. The visitor-card
 * nudge stays beside the address, where someone who scrolled this far finds it.
 *
 * A dot-matrix sign (DotMarquee) scrolls "LET'S BUILD" across the full
 * column, in the same dot language as the section glyphs. It is the section's
 * only headline (the written "Let's build something good." was dropped as a
 * repeat of it), so it carries an accessible name.
 * It replaced the graffiti hand, then a 9x9 panel.
 */
export default function Closing() {
  return (
    <section id="contact">
      <Container width="reading" className="pt-9 pb-4 md:pt-11">
        <div>
        <DotMarquee className="mb-6 h-16 text-foreground sm:h-21" />
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity duration-base ease-out hover:opacity-90"
          >
            {contactEmail}
          </a>
          <CardNudge />
        </div>
        <ul className="mt-6 flex gap-5 text-sm text-muted-foreground">
          {socialLinks.map(({ name, href }) => {
            const Icon = SOCIAL_ICONS[name];
            return (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors duration-fast ease-out hover:text-foreground"
                >
                  <Icon aria-hidden className="h-4 w-4" /> {name}
                </a>
              </li>
            );
          })}
        </ul>
        </div>
      </Container>
    </section>
  );
}
