import React from "react";
import StackIcon, { StackName } from "./common/StackIcon";
import Section from "@/components/layout/Section";

const frontendStacks: StackName[] = [
  "html",
  "css",
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
];

const aiStacks: StackName[] = ["openai", "googleGemini", "claude"];
const protocolStacks: StackName[] = ["restAPI", "graphql", "websocket", "webrtc"];
const backendStacks: StackName[] = [
  "node",
  "bun",
  "postgres",
  "mongodb",
  "firebase",
  "supabase",
];
const devopsStacks: StackName[] = [
  "git",
  "github",
  "docker",
  "aws",
  "cloudflare",
  "vercel",
];
const toolStacks: StackName[] = ["vscode", "figma", "notion", "postman"];
const testingTrackingStacks: StackName[] = [
  "playwright",
  "vitest",
  "posthog",
  "sentry",
  "googleAnalytics",
  "vercelAnalytics",
];

type Category = {
  label: string;
  items: StackName[];
};

const categories: Category[] = [
  { label: "Frontend", items: frontendStacks },
  { label: "Backend & DB", items: backendStacks },
  { label: "DevOps & Infra", items: devopsStacks },
  { label: "Protocols / APIs", items: protocolStacks },
  { label: "AI Stack", items: aiStacks },
  { label: "Testing & Tracking", items: testingTrackingStacks },
  { label: "Tools", items: toolStacks },
];

/**
 * The toolkit, as one row per category.
 *
 * It used to stack each category vertically: a label on its own line, a 10px gap,
 * then a wrapped row of pills, with 24px between categories. Seven categories
 * meant seven labels and six gaps costing roughly 250px of height before a single
 * pill was drawn, on a section that is a scan-and-move-on list rather than
 * something anyone reads.
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
