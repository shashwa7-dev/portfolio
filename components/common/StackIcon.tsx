"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type StackName =
  | "html"
  | "css"
  | "typescript"
  | "react"
  | "next"
  | "tailwind"
  | "express"
  | "shadcn"
  | "gsap"
  | "motion"
  | "reactQuery"
  | "apollo"
  | "zustand"
  | "node"
  | "graphql"
  | "websocket"
  | "webrtc"
  | "postgres"
  | "mongodb"
  | "firebase"
  | "aws"
  | "docker"
  | "solana"
  | "web3js"
  | "wagmi"
  | "styledComponents"
  | "chakraui"
  | "electron"
  | "googleGemini"
  | "javascript"
  | "bun"
  | "vercel"
  | "cloudflare"
  | "supabase"
  | "postgress"
  | "vscode"
  | "notion"
  | "git"
  | "github"
  | "postman"
  | "figma"
  | "canva"
  | "openai"
  | "claude"
  | "spotify"
  | "youtube"
  | "restAPI"
  | "playstation"
  | "coffee"
  | "opensea";

type StackProps = {
  name: StackName;
  size?: number;
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
};

const iconMap: Record<StackName, { icon: string; label: string }> = {
  vscode: { icon: "devicon-plain:vscode", label: "VS Code" },
  restAPI: { icon: "dashicons:rest-api", label: "REST API" },
  figma: { icon: "simple-icons:figma", label: "Figma" },
  playstation: { icon: "simple-icons:playstation", label: "PlayStation" },
  canva: { icon: "simple-icons:canva", label: "Canva" },
  coffee: { icon: "line-md:coffee-half-empty-twotone-loop", label: "Coffee" },
  openai: { icon: "simple-icons:openai", label: "OpenAI" },
  claude: { icon: "simple-icons:claude", label: "Claude" },
  postman: { icon: "simple-icons:postman", label: "Postman" },
  notion: { icon: "devicon-plain:notion", label: "Notion" },
  html: { icon: "simple-icons:html5", label: "HTML5" },
  github: { icon: "simple-icons:github", label: "GitHub" },
  spotify: { icon: "dashicons:spotify", label: "Spotify" },
  youtube: { icon: "simple-icons:youtube", label: "YouTube" },
  git: { icon: "simple-icons:git", label: "Git" },
  css: { icon: "simple-icons:css", label: "CSS3" },
  bun: { icon: "simple-icons:bun", label: "Bun" },
  javascript: { icon: "simple-icons:javascript", label: "JavaScript" },
  typescript: { icon: "simple-icons:typescript", label: "TypeScript" },
  googleGemini: { icon: "simple-icons:googlegemini", label: "Google Gemini" },
  vercel: { icon: "simple-icons:vercel", label: "Vercel" },
  zustand: { icon: "devicon-plain:zustand", label: "Zustand" },
  supabase: { icon: "simple-icons:supabase", label: "Supabase" },
  mongodb: { icon: "simple-icons:mongodb", label: "MongoDB" },
  opensea: { icon: "simple-icons:opensea", label: "OpenSea" },
  postgress: { icon: "simple-icons:postgresql", label: "PostgreSQL" },
  cloudflare: { icon: "simple-icons:cloudflare", label: "Cloudflare" },
  chakraui: { icon: "simple-icons:chakraui", label: "Chakra UI" },
  electron: { icon: "simple-icons:electron", label: "Electron" },
  wagmi: { icon: "simple-icons:wagmi", label: "Wagmi" },
  solana: { icon: "simple-icons:solana", label: "Solana" },
  shadcn: { icon: "simple-icons:shadcnui", label: "shadcn/ui" },
  react: { icon: "simple-icons:react", label: "React" },
  express: { icon: "simple-icons:express", label: "Express" },
  web3js: { icon: "simple-icons:web3dotjs", label: "Web3.js" },
  next: { icon: "simple-icons:nextdotjs", label: "Next.js" },
  styledComponents: {
    icon: "devicon-plain:styledcomponents",
    label: "Styled Components",
  },
  tailwind: { icon: "simple-icons:tailwindcss", label: "Tailwind CSS" },
  gsap: { icon: "simple-icons:gsap", label: "GSAP" },
  motion: { icon: "simple-icons:framer", label: "Framer Motion" },
  reactQuery: { icon: "simple-icons:reactquery", label: "React Query" },
  apollo: { icon: "simple-icons:apollographql", label: "Apollo GraphQL" },
  node: { icon: "simple-icons:nodedotjs", label: "Node.js" },
  graphql: { icon: "simple-icons:graphql", label: "GraphQL" },
  websocket: { icon: "simple-icons:socketdotio", label: "WebSocket" },
  webrtc: { icon: "simple-icons:webrtc", label: "WebRTC" },
  postgres: { icon: "simple-icons:postgresql", label: "PostgreSQL" },
  firebase: { icon: "simple-icons:firebase", label: "Firebase" },
  aws: { icon: "simple-icons:amazonwebservices", label: "AWS" },
  docker: { icon: "simple-icons:docker", label: "Docker" },
};

export default function StackIcon({
  name,
  size = 14,
  showLabel = true,
  showTooltip = false,
  className = "",
}: StackProps) {
  const stack = iconMap[name];
  if (!stack) return null;

  // Icon only with tooltip
  if (!showLabel) {
    const icon = (
      <span
        className={cn("inline-flex cursor-default", className)}
      >
        <Icon icon={stack.icon} width={size} height={size} />
      </span>
    );
    if (showTooltip) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{icon}</TooltipTrigger>
          <TooltipContent>{stack.label}</TooltipContent>
        </Tooltip>
      );
    }
    return icon;
  }

  // With label (pill style)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground",
        className
      )}
    >
      <Icon icon={stack.icon} width={size} height={size} />
      <span>{stack.label}</span>
    </span>
  );
}
