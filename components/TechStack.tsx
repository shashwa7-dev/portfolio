import React from "react";
import StackIcon from "./common/StackIcon";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";

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
      <Bento className="grid-cols-1">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="bg-card p-4 sm:grid sm:grid-cols-[140px_1fr] sm:gap-4"
          >
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle sm:mb-0 sm:pt-0.5">
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
      </Bento>
    </Section>
  );
};

export default TechStack;
