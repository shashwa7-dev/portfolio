import React from "react";
import StackIcon from "./common/StackIcon";
import { stackLabel, type StackName } from "./common/stackLabels";
import Section from "@/components/layout/Section";

type Tier = {
  label: string;
  items: StackName[];
};

/**
 * Twenty-seven tools in three tiers, down from forty-one in four categories.
 *
 * The old section grouped by what a tool IS: Frontend, AI, Backend & data,
 * Infra & tooling. Two problems came out of that, and they compounded.
 *
 * Thirteen items sat under Frontend and fifteen under Infra, so two rows
 * carried twenty-eight of the forty-one. At that length a row stops reading as
 * a group and starts reading as a paragraph of nouns, which people skim the way
 * they skim a footer.
 *
 * And every entry was drawn at the same size, so TypeScript and VS Code had
 * identical weight. A list where React and Postman look equally important tells
 * a reader the author has no centre of gravity, which is the opposite of what
 * this section is for.
 *
 * Grouping by frequency fixes both at once. It gives the rows a natural shape,
 * six then eight then twelve, and it licenses three different weights, so the
 * page can say which of these actually do the work. It also says something true
 * that a category cannot: "Backend & data" tells you what Postgres is, which
 * the reader already knew; "Every day" tells you what it is to him.
 *
 * Fourteen entries were cut, and the argument is the one this file already made
 * when it dropped `html` and `css`: listing table stakes invites the reader to
 * calibrate downwards. Git, GitHub and VS Code are that. `restAPI` is not a
 * tool but a shape of API. Two analytics entries are one and a half too many.
 * `javascript` is implied by `typescript`. `chakraui` is superseded here by
 * Tailwind and shadcn/ui, so keeping it suggests the list is historical rather
 * than current. Of two test runners only `playwright` stays.
 *
 * `zustand`, `sentry` and `posthog` are the borderline ones. They are real
 * claims rather than table stakes, and they came out to keep the third tier at
 * a length someone will actually finish reading. They are the first things to
 * add back.
 *
 * `aws` renders as a text-only pill beside eight that carry glyphs, and that
 * cannot be fixed by wiring up an icon: simple-icons ships 3,436 marks and none
 * of them is Amazon's, which was pulled from the set over trademark policy. So
 * the options are a hand-vendored path, a different label, or living with one
 * wordmark among nine. Living with it, since the top tier is a claim about what
 * gets used rather than a logo wall.
 *
 * Claude moved into the top tier deliberately. The hero sells "AI-adaptive
 * frontend engineer" and the old layout gave that claim three small pills in
 * its quietest row, which undercut the one line that differentiates him.
 */
const tiers: Tier[] = [
  {
    label: "Every day",
    // Ordered the way the work moves: language, UI, framework, styling,
    // components, then the AI in the loop, then where it ships and runs.
    items: [
      "typescript",
      "react",
      "next",
      "tailwind",
      "shadcn",
      "claude",
      "vercel",
      "cloudflare",
      "aws",
    ],
  },
  {
    label: "Often",
    items: [
      "motion",
      "node",
      "postgres",
      "supabase",
      "reactQuery",
      "wagmi",
      "gsap",
    ],
  },
  {
    label: "Shipped with",
    items: [
      "solana",
      "openai",
      "googleGemini",
      "bun",
      "mongodb",
      "firebase",
      "graphql",
      "websocket",
      "webrtc",
      "docker",
      "playwright",
    ],
  },
];

/**
 * Three tiers, three weights.
 *
 * The weights are the point. A tier that renders the same as the one above it
 * is just a heading, and headings were what made the old version long. So the
 * top tier gets real pills at `text-sm` on the strong border, the middle tier
 * gets the compact pill this section used throughout, and the last tier gets no
 * pills at all: twelve names as running text, which is how you list something
 * you want on the page but do not need anyone to stop at.
 *
 * That last tier is also why `stackLabel` exists. Printing the names as text
 * would otherwise mean a second hand-typed copy of strings `labelMap` already
 * owns.
 *
 * The count sits opposite each label rather than under it. It is the one number
 * that tells a reader how much of the row is left, and it costs no height where
 * it is.
 *
 * The pills are compacted through `className` rather than by changing
 * StackIcon's defaults. `cn` is tailwind-merge, so the passed utilities win
 * over the component's own, and the larger pill stays intact at its other call
 * site on the work case-study page.
 */
const TechStack = () => {
  return (
    <Section
      id="tech_stack"
      number="03"
      of="06"
      label="Toolkit"
      title="Tools I reach for"
      width="reading"
    >
      <div className="divide-y divide-border">
        {tiers.map((tier, i) => (
          <div key={tier.label} className="py-5 first:pt-0 last:pb-0">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <span className="font-mono text-2xs uppercase tracking-label text-subtle">
                {tier.label}
              </span>
              <span className="font-mono text-2xs text-border-strong">
                {String(tier.items.length).padStart(2, "0")}
              </span>
            </div>

            {i === 0 && (
              <ul className="flex flex-wrap gap-2">
                {tier.items.map((t) => (
                  <li key={t} className="flex">
                    <StackIcon
                      name={t}
                      showLabel
                      size={16}
                      className="gap-2 rounded-md border-border-strong bg-card px-3 py-1.5 text-sm font-medium text-foreground"
                    />
                  </li>
                ))}
              </ul>
            )}

            {i === 1 && (
              <ul className="flex flex-wrap gap-1.5">
                {tier.items.map((t) => (
                  <li key={t} className="flex">
                    <StackIcon name={t} showLabel size={14} className="px-2 py-0.5" />
                  </li>
                ))}
              </ul>
            )}

            {i === 2 && (
              <p className="max-w-[62ch] text-sm leading-relaxed text-subtle">
                {tier.items.map(stackLabel).join(", ")}.
              </p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
};

export default TechStack;
