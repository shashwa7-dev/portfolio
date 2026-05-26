"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  siReact,
  siTypescript,
  siNextdotjs,
  siTailwindcss,
  siFramer,
  siGreensock,
  siReactquery,
  siNodedotjs,
  siGraphql,
  siExpress,
  siPostgresql,
  siMongodb,
  siFirebase,
  siSolana,
  siWeb3dotjs,
  siStyledcomponents,
  siChakraui,
  siElectron,
  siGooglegemini,
  siJavascript,
  siHtml5,
  siBun,
  siVercel,
  siCloudflare,
  siSupabase,
  siGit,
  siGithub,
  siPostman,
  siFigma,
  siSpotify,
  siYoutube,
  siDocker,
  siApollographql,
  siSocketdotio,
  siOpensea,
  siShadcnui,
  siWebrtc,
  siCss,
  siAnthropic,
  siPlaystation,
  siWagmi,
  siNotion,
} from "simple-icons";

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

type SI = { path: string; title: string };

const iconMap: Partial<Record<StackName, SI>> = {
  react: siReact,
  typescript: siTypescript,
  next: siNextdotjs,
  tailwind: siTailwindcss,
  motion: siFramer,
  gsap: siGreensock,
  reactQuery: siReactquery,
  node: siNodedotjs,
  graphql: siGraphql,
  express: siExpress,
  postgres: siPostgresql,
  postgress: siPostgresql,
  mongodb: siMongodb,
  firebase: siFirebase,
  solana: siSolana,
  web3js: siWeb3dotjs,
  styledComponents: siStyledcomponents,
  chakraui: siChakraui,
  electron: siElectron,
  googleGemini: siGooglegemini,
  javascript: siJavascript,
  html: siHtml5,
  bun: siBun,
  vercel: siVercel,
  cloudflare: siCloudflare,
  supabase: siSupabase,
  git: siGit,
  github: siGithub,
  postman: siPostman,
  figma: siFigma,
  spotify: siSpotify,
  youtube: siYoutube,
  docker: siDocker,
  apollo: siApollographql,
  websocket: siSocketdotio,
  opensea: siOpensea,
  shadcn: siShadcnui,
  webrtc: siWebrtc,
  css: siCss,
  claude: siAnthropic,
  playstation: siPlaystation,
  wagmi: siWagmi,
  notion: siNotion,
  // canva, openai, aws, zustand, vscode, restAPI, coffee → text fallback
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

type StackProps = {
  name: StackName;
  size?: number;
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
};

export default function StackIcon({
  name,
  size = 14,
  showLabel = true,
  showTooltip = false,
  className = "",
}: StackProps) {
  const label = labelMap[name];
  if (!label) return null;

  const si = iconMap[name];
  const glyph = si ? (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className="shrink-0"
    >
      <path d={si.path} />
    </svg>
  ) : null;

  if (!showLabel) {
    const node = (
      <span
        className={cn(
          "inline-flex items-center text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
      >
        {glyph || (
          <span className="font-mono text-[10px] uppercase tracking-wide">
            {label}
          </span>
        )}
      </span>
    );
    if (showTooltip) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{node}</TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      );
    }
    return node;
  }

  return (
    <span
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
        className
      )}
    >
      <span className="text-subtle transition-colors group-hover:text-foreground">
        {glyph}
      </span>
      <span>{label}</span>
    </span>
  );
}
