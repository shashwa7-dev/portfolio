import Container from "@/components/layout/Container";
import CardNudge from "@/components/CardNudge";
import { SOCIAL_ICONS } from "@/components/common/socialIcons";
import { socialLinks, contactEmail } from "@/lib/siteLinks";

/**
 * The page's last word: one line, the address, the three profiles. No section
 * label: it closes the page rather than opening a section. The visitor-card
 * nudge stays beside the address, where someone who scrolled this far finds it.
 */
export default function Closing() {
  return (
    <section id="contact">
      <Container width="reading" className="py-14 md:py-20">
        <p className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">Let&apos;s build something good.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
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
      </Container>
    </section>
  );
}
