"use client";

import React from "react";
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
  size?: number; // kept for API compatibility, unused
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
};

const labelMap: Record<StackName, string> = {
  vscode: "VS Code",
  restAPI: "REST API",
  figma: "Figma",
  playstation: "PlayStation",
  canva: "Canva",
  coffee: "Coffee",
  openai: "OpenAI",
  claude: "Claude",
  postman: "Postman",
  notion: "Notion",
  html: "HTML5",
  github: "GitHub",
  spotify: "Spotify",
  youtube: "YouTube",
  git: "Git",
  css: "CSS3",
  bun: "Bun",
  javascript: "JavaScript",
  typescript: "TypeScript",
  googleGemini: "Google Gemini",
  vercel: "Vercel",
  zustand: "Zustand",
  supabase: "Supabase",
  mongodb: "MongoDB",
  opensea: "OpenSea",
  postgress: "PostgreSQL",
  cloudflare: "Cloudflare",
  chakraui: "Chakra UI",
  electron: "Electron",
  wagmi: "Wagmi",
  solana: "Solana",
  shadcn: "shadcn/ui",
  react: "React",
  express: "Express",
  web3js: "Web3.js",
  next: "Next.js",
  styledComponents: "Styled Components",
  tailwind: "Tailwind CSS",
  gsap: "GSAP",
  motion: "Framer Motion",
  reactQuery: "React Query",
  apollo: "Apollo GraphQL",
  node: "Node.js",
  graphql: "GraphQL",
  websocket: "WebSocket",
  webrtc: "WebRTC",
  postgres: "PostgreSQL",
  firebase: "Firebase",
  aws: "AWS",
  docker: "Docker",
};

export default function StackIcon({
  name,
  showLabel = true,
  showTooltip = false,
  className = "",
}: StackProps) {
  const label = labelMap[name];
  if (!label) return null;

  if (!showLabel) {
    const chip = (
      <span
        className={cn(
          "inline-flex cursor-default font-mono text-[10px] uppercase tracking-wide text-subtle",
          className
        )}
      >
        {label}
      </span>
    );
    if (showTooltip) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{chip}</TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      );
    }
    return chip;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border bg-secondary px-2 py-1 text-xs text-secondary-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}
