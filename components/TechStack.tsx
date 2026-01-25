import React from "react";
import SectionTitle from "./common/SectionTitle";
import { Layers } from "feather-icons-react";
import StackIcon from "./common/StackIcon";
import { Icon } from "@iconify/react";

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

const StackSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {title}
    </p>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

const TechStack = () => {
  return (
    <div className="space-y-8" id="tech_stack">
      <SectionTitle
        title="Tech Stack"
        icon={<Icon icon='solar:layers-minimalistic-line-duotone' className="w-5 h-5" />}
      />

      <div className="space-y-6">
        {/* Frontend - full width */}
        <StackSection title="Frontend">
          {frontendStacks.map((name) => (
            <StackIcon key={name} name={name} />
          ))}
        </StackSection>

        {/* Two column grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <StackSection title="Backend & Database">
            {backendStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </StackSection>

          <StackSection title="DevOps & Infra">
            {devopsStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </StackSection>

          <StackSection title="Protocols / APIs">
            {protocolStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </StackSection>

          <StackSection title="AI Stack">
            {aiStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </StackSection>

          <StackSection title="Tools">
            {toolStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </StackSection>
        </div>
      </div>
    </div>
  );
};

export default TechStack;
