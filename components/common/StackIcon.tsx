"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

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
  | "mongodb"
  | "zustand"
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
  | "playstation"
  | "coffee";

type StackProps = {
  name: StackName;
  size?: number;
  showLabel?: boolean;
  className?: string;
};

const iconMap: Record<StackName, { icon: string; label: string }> = {
  vscode: { icon: "devicon-plain:vscode", label: "VS Code" },
  figma: { icon: "simple-icons:figma", label: "Figma" },
  playstation: { icon: "simple-icons:playstation", label: "PS" },
  canva: { icon: "simple-icons:canva", label: "Canva" },
  coffee: { icon: "line-md:coffee-half-empty-twotone-loop", label: "Coffee" },
  openai: { icon: "simple-icons:openai", label: "Openai" },
  claude: { icon: "simple-icons:claude", label: "Claude" },
  postman: { icon: "simple-icons:postman", label: "Postman" },
  notion: { icon: "devicon-plain:notion", label: "Notion" },
  html: { icon: "simple-icons:html5", label: "HTML" },
  github: { icon: "simple-icons:github", label: "Github" },
  spotify: { icon: "dashicons:spotify", label: "Spotify" },
  youtube: { icon: "simple-icons:youtube", label: "Youtube" },
  git: { icon: "simple-icons:git", label: "Git" },
  css: { icon: "simple-icons:css", label: "CSS" },
  bun: { icon: "simple-icons:bun", label: "Bun" },
  javascript: { icon: "simple-icons:javascript", label: "Javascript" },
  typescript: { icon: "simple-icons:typescript", label: "Typescript" },
  googleGemini: { icon: "simple-icons:googlegemini", label: "Google Gemini" },
  vercel: { icon: "simple-icons:vercel", label: "Vercel" },
  zustand: { icon: "devicon:zustand", label: "Zustand" },
  supabase: { icon: "simple-icons:supabase", label: "Supabase" },
  mongodb: { icon: "simple-icons:mongodb", label: "Mongo DB" },
  postgress: { icon: "simple-icons:postgresql", label: "PostgreSQL" },
  cloudflare: { icon: "simple-icons:cloudflare", label: "Cloudflare" },
  chakraui: { icon: "simple-icons:chakraui", label: "Chakra UI" },
  electron: { icon: "simple-icons:electron", label: "Electron" },
  wagmi: { icon: "simple-icons:wagmi", label: "Wagmi/Ethers" },
  solana: { icon: "simple-icons:solana", label: "Solana" },
  shadcn: { icon: "simple-icons:shadcnui", label: "Shadcn" },
  react: { icon: "simple-icons:react", label: "React" },
  express: { icon: "simple-icons:react", label: "Express" },
  web3js: { icon: "simple-icons:web3dotjs", label: "Web3 JS" },
  next: { icon: "simple-icons:nextdotjs", label: "Next.js" },
  styledComponents: {
    icon: "simple-icons:styledcomponents",
    label: "Styled Components",
  },
  tailwind: { icon: "simple-icons:tailwindcss", label: "Tailwind CSS" },
  gsap: { icon: "simple-icons:greensock", label: "GSAP" },
  motion: { icon: "simple-icons:framer", label: "Framer Motion" },
  reactQuery: { icon: "simple-icons:reactquery", label: "React Query" },
  apollo: { icon: "simple-icons:apollographql", label: "Apollo GraphQL" },
  node: { icon: "simple-icons:nodedotjs", label: "Node.js" },
  graphql: { icon: "simple-icons:graphql", label: "GraphQL" },
  websocket: { icon: "mdi:web", label: "WebSocket" },
  webrtc: { icon: "simple-icons:webrtc", label: "WebRTC" },
  postgres: { icon: "simple-icons:postgresql", label: "PostgreSQL" },
  firebase: { icon: "simple-icons:firebase", label: "Firebase" },
  aws: { icon: "simple-icons:amazonwebservices", label: "AWS" },
  docker: { icon: "simple-icons:docker", label: "Docker" },
};

export default function StackIcon({
  name,
  size = 12,
  showLabel = true,
  className = "",
}: StackProps) {
  const stack = iconMap[name];
  if (!stack) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md  text-muted-foreground hover:text-foreground transition-colors text-xs",
        showLabel &&
          "p-1 px-2 rounded-md border-b-4 border  text-sm text-secondary-foreground bg-card",
        className
      )}
      title={stack.label}
    >
      <Icon icon={stack.icon} width={size} height={size} />
      {showLabel && <span>{stack.label}</span>}
    </div>
  );
}
