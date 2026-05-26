import React from "react";
import StackIcon, { StackName } from "./common/StackIcon";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";

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
  { label: "Tools", items: toolStacks },
];

const TechStack = () => {
  return (
    <Section id="tech_stack" number="03" label="Toolkit" title="Tools I reach for" width="reading">
      <Bento className="grid-cols-1">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="bg-card p-4 sm:grid sm:grid-cols-[120px_1fr] sm:gap-4"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
              {cat.label}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2 sm:mt-0">
              {cat.items.map((t) => (
                <StackIcon key={t} name={t} showLabel />
              ))}
            </div>
          </div>
        ))}
      </Bento>
    </Section>
  );
};

export default TechStack;
