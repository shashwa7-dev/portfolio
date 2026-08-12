import React from "react";
import StackIcon, { StackName } from "./common/StackIcon";
import Section from "@/components/layout/Section";

type Category = {
  label: string;
  items: StackName[];
};

/**
 * Four categories and forty-one tools, down from seven categories and
 * forty-four.
 *
 * Seven headings over forty-four tools read as an inventory rather than a claim,
 * and three of them were thin enough to be rounding errors: "AI Stack" held three
 * items, "Protocols / APIs" four, "Tools" four. A heading that labels three things
 * costs a row to say almost nothing.
 *
 * Three entries were also dropped, and for a reason that is about positioning
 * rather than space: `html` and `css` are table stakes for a senior frontend
 * engineer, so listing them beside `typescript` and `wagmi` invites the reader to
 * calibrate downwards. `notion` is not a technical tool. Everything remaining is
 * something a reader could reasonably ask a follow-up question about.
 *
 * The merges are meant rather than convenient. Protocols moved in with backend
 * because they are how you talk to one. Testing, analytics and editors joined
 * devops because they are all things that surround shipping rather than things
 * the product is built from.
 *
 * AI stayed separate at three items, alone among the small groups, because it is
 * the positioning in the hero ("AI-adaptive frontend engineer") and folding it
 * into Frontend would bury the one line that differentiates him.
 *
 * Order is deliberate: the craft, then the differentiator, then the range, then
 * the breadth. It degrades gracefully, since a reader who stops after two rows
 * has still seen the part that matters.
 */
const categories: Category[] = [
  {
    label: "Frontend",
    items: [
      "javascript",
      "typescript",
      "react",
      "next",
      "tailwind",
      "shadcn",
      "chakraui",
      "gsap",
      "motion",
      "reactQuery",
      "zustand",
      "wagmi",
      "solana",
    ],
  },
  { label: "AI", items: ["openai", "googleGemini", "claude"] },
  {
    label: "Backend & data",
    items: [
      "node",
      "bun",
      "postgres",
      "mongodb",
      "firebase",
      "supabase",
      "restAPI",
      "graphql",
      "websocket",
      "webrtc",
    ],
  },
  {
    label: "Infra & tooling",
    items: [
      "git",
      "github",
      "docker",
      "aws",
      "cloudflare",
      "vercel",
      "playwright",
      "vitest",
      "sentry",
      "posthog",
      "googleAnalytics",
      "vercelAnalytics",
      "vscode",
      "figma",
      "postman",
    ],
  },
];

/**
 * The toolkit, as one row per category.
 *
 * It used to stack each category vertically: a label on its own line, a 10px gap,
 * then a wrapped row of pills, with 24px between categories. Seven categories
 * meant seven labels and six gaps costing roughly 250px of height before a single
 * pill was drawn, on a section that is a scan-and-move-on list rather than
 * something anyone reads. Merging to four categories removed most of the rest.
 *
 * Putting the label in its own column takes that height to zero: the label now
 * sits beside the pills it names instead of above them, and a hairline between
 * rows does the grouping that whitespace was doing. Adapted from the `stack`
 * section in ncdai/chanhdai.com, minus its dashed column rule, since ruled
 * dividers are an aesthetic this project has already turned down.
 *
 * Below `sm` it falls back to stacked, because a fixed label column plus wrapped
 * pills does not fit 375px without shrinking the pills past legibility.
 *
 * The pills are compacted through `className` rather than by changing StackIcon's
 * defaults. `cn` is tailwind-merge, so the passed utilities win over the
 * component's own, and the larger pill stays intact at its other call site on the
 * work case-study page.
 */
const TechStack = () => {
  return (
    <Section id="tech_stack" number="03" label="Toolkit" title="Tools I reach for" width="reading">
      <div className="border-t border-border">
        {categories.map((cat, i) => (
          <div
            key={cat.label}
            className="grid items-start gap-y-2 border-b border-border py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-x-4"
          >
            <div className="font-mono text-2xs uppercase leading-5 tracking-label text-subtle">
              <span aria-hidden className="mr-1.5 text-border-strong">
                {String(i + 1).padStart(2, "0")}
              </span>
              {cat.label}
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {cat.items.map((t) => (
                <li key={t} className="flex">
                  <StackIcon
                    name={t}
                    showLabel
                    size={14}
                    className="px-2 py-0.5 text-2xs"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default TechStack;
