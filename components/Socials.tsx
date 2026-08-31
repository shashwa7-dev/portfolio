import React from "react";
import { SVGS } from "./SVGS";
import Section from "@/components/layout/Section";
import CardNudge from "@/components/CardNudge";
import { socialLinks, contactEmail, location } from "@/lib/siteLinks";

const ICONS = {
  GitHub: SVGS.Github,
  LinkedIn: SVGS.LinkedIn,
  Twitter: SVGS.Twitter,
} as const;


const Socials = () => {
  return (
    <Section number="06" label="Contact" title="Let's build something good" width="reading">
      <div className="space-y-4">
        <a
          href={`mailto:${contactEmail}`}
          className="inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
        >
          {contactEmail}
        </a>
        {/* Where and when, in text rather than with the hero's flag.
            This is the point in the page where someone decides to write, and
            "will they overlap with my hours" is a live question right then. The
            hero is a full scroll back by now, so it is not a repeat so much as
            the answer arriving where it is needed.

            No flag, deliberately. The palette is a restrained neutral and the
            tricolour is the most saturated thing on the site, so it reads as a
            deliberate accent at one instance and as a motif at two. The hero
            keeps it; this says the same thing quietly. */}
        <p className="font-mono text-2xs uppercase tracking-label text-subtle">
          {location.name} · {location.tzLabel}
        </p>

        <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
          {socialLinks.map(({ name, href }) => {
            const Icon = ICONS[name];
            return (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{name}</span>
            </a>
            );
          })}
        </div>
      </div>

      {/* The parting note, inside the section that is already the parting
          note, rather than as a section of its own below it. Outside the
          `space-y-4` above so it takes this spacing and not that rhythm: the
          contact details are one tight block of related lines, and the card
          is a separate thought that follows them. */}
      <CardNudge className="mt-10 md:mt-12" />
    </Section>
  );
};

export default Socials;
