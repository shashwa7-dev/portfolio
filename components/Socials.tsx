"use client";
import React from "react";
import { SVGS } from "./SVGS";
import Section from "@/components/layout/Section";
import { socialLinks, contactEmail } from "@/lib/siteLinks";

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
    </Section>
  );
};

export default Socials;
