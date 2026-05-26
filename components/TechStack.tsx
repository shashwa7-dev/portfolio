import React from "react";
import StackIcon from "./common/StackIcon";
import Section from "@/components/layout/Section";
import GridPanel from "@/components/layout/GridPanel";
import { cn } from "@/lib/utils";

const frontendStacks = [
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
] as const;

const aiStacks = ["openai", "googleGemini", "claude"] as const;
const protocolStacks = ["restAPI", "graphql", "websocket", "webrtc"] as const;
const backendStacks = [
  "node",
  "bun",
  "postgres",
  "mongodb",
  "firebase",
  "supabase",
] as const;
const devopsStacks = [
  "git",
  "github",
  "docker",
  "aws",
  "cloudflare",
  "vercel",
] as const;
const toolStacks = ["vscode", "figma", "notion", "postman"] as const;

type Category = {
  label: string;
  stacks: readonly string[];
};

const categories: Category[] = [
  { label: "Frontend", stacks: frontendStacks },
  { label: "Backend & DB", stacks: backendStacks },
  { label: "DevOps & Infra", stacks: devopsStacks },
  { label: "Protocols / APIs", stacks: protocolStacks },
  { label: "AI Stack", stacks: aiStacks },
  { label: "Tools", stacks: toolStacks },
];

const TechStack = () => {
  return (
    <Section id="tech_stack" number="03" label="Toolkit" title="Tools I reach for" width="reading">
      <GridPanel>
        {categories.map((cat, i) => (
          <div
            key={cat.label}
            className={cn(
              "p-4 sm:grid sm:grid-cols-[140px_1fr] sm:gap-4 border-border",
              i >= 1 && "border-t"
            )}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle mb-2 sm:mb-0 sm:pt-0.5">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {cat.stacks.map((name) => (
                <StackIcon
                  key={name}
                  name={name as Parameters<typeof StackIcon>[0]["name"]}
                  showLabel={false}
                />
              ))}
            </div>
          </div>
        ))}
      </GridPanel>
    </Section>
  );
};

export default TechStack;
