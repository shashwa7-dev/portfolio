"use client";
import React from "react";
import { SVGS } from "./SVGS";
import Section from "@/components/layout/Section";

const socials = [
  {
    name: "GitHub",
    link: "https://github.com/shashwa7-dev",
    Icon: SVGS.Github,
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/shashwa7/",
    Icon: SVGS.LinkedIn,
  },
  {
    name: "Twitter",
    link: "https://x.com/offcod8",
    Icon: SVGS.Twitter,
  },
];

const Socials = () => {
  return (
    <Section number="06" label="Contact" title="Let's build something good" width="reading">
      <div className="space-y-4">
        <a
          href="mailto:contact@shashwa7.in"
          className="inline-block rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
        >
          contact@shashwa7.in
        </a>
        <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
          {socials.map(({ name, link, Icon }) => (
            <a
              key={name}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{name}</span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Socials;
