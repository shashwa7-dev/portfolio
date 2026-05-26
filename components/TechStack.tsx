import React from "react";
import StackIcon from "./common/StackIcon";
import Section from "@/components/layout/Section";

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

type CategoryRowProps = {
  label: string;
  children: React.ReactNode;
};

const CategoryRow = ({ label, children }: CategoryRowProps) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr] md:items-start">
    <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle pt-1">
      {label}
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const chipClass =
  "rounded-[9px] border border-border bg-card px-3 py-2 text-sm text-muted-foreground inline-flex items-center gap-2";

const TechStack = () => {
  return (
    <Section id="tech_stack" number="03" label="Toolkit" title="Tools I reach for" width="reading">
      <div className="space-y-6">
        <CategoryRow label="Frontend">
          {frontendStacks.map((name) => (
            <StackIcon key={name} name={name} className={chipClass} />
          ))}
        </CategoryRow>

        <CategoryRow label="Backend & DB">
          {backendStacks.map((name) => (
            <StackIcon key={name} name={name} className={chipClass} />
          ))}
        </CategoryRow>

        <CategoryRow label="DevOps & Infra">
          {devopsStacks.map((name) => (
            <StackIcon key={name} name={name} className={chipClass} />
          ))}
        </CategoryRow>

        <CategoryRow label="Protocols / APIs">
          {protocolStacks.map((name) => (
            <StackIcon key={name} name={name} className={chipClass} />
          ))}
        </CategoryRow>

        <CategoryRow label="AI Stack">
          {aiStacks.map((name) => (
            <StackIcon key={name} name={name} className={chipClass} />
          ))}
        </CategoryRow>

        <CategoryRow label="Tools">
          {toolStacks.map((name) => (
            <StackIcon key={name} name={name} className={chipClass} />
          ))}
        </CategoryRow>
      </div>
    </Section>
  );
};

export default TechStack;
