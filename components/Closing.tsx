import Container from "@/components/layout/Container";
import CardNudge from "@/components/CardNudge";
import GraffitiHand from "@/components/common/GraffitiHand";
import { SOCIAL_ICONS } from "@/components/common/socialIcons";
import { socialLinks, contactEmail } from "@/lib/siteLinks";

/**
 * The page's last word: one line, the address, the three profiles. No section
 * label: it closes the page rather than opening a section. The visitor-card
 * nudge stays beside the address, where someone who scrolled this far finds it.
 *
 * The graffiti hand rises out of this section's bottom edge on the right, at
 * every width: a little smaller on a phone, where it stands below the social links. The section is
 * `relative overflow-hidden` for it: the artwork's forearm is cut flat and has
 * to stay below the edge. The section also pulls down over the footer's
 * `mt-12` (`-mb-12`, with that much more bottom padding), so its
 * clipped edge is the footer's top border and the hand grows out of that line
 * instead of stopping in mid-air above it.
 */
export default function Closing() {
  return (
    <section id="contact" className="relative -mb-12 overflow-hidden">
      <Container width="reading" className="relative pt-11 pb-40 sm:pb-28 md:pt-[3.3rem] md:pb-32">
        <GraffitiHand className="-bottom-10 right-6 h-48 sm:-bottom-12 sm:right-2 sm:h-60 md:-bottom-14 md:right-0 md:h-72" />
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
