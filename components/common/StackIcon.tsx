"use client";

import React from "react";
import { stackLabel, type StackName } from "./stackLabels";
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
  siPython,
  siSqlite,
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
  siPosthog,
  siSentry,
  siGoogleanalytics,
  siVitest,
} from "simple-icons";


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
  python: siPython,
  sqlite: siSqlite,
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
  posthog: siPosthog,
  sentry: siSentry,
  googleAnalytics: siGoogleanalytics,
  vitest: siVitest,
  // canva, openai, aws, zustand, vscode, restAPI, coffee, playwright,
  // vercelAnalytics → text fallback (no simple-icons entry)
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
  const label = stackLabel(name);
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
          <span className="font-mono text-2xs uppercase tracking-label">
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
        /* `bg-card`, not `bg-secondary`. In dark mode secondary is
           hsl(30 6% 15%) and the border is hsl(30 6% 16%): one percent apart,
           so the pill had no visible edge and read as a soft grey blob. Card is
           hsl(30 7% 8.5%), darker than the border on a dark page and lighter
           than it on a light one, so the outline does its job in both themes.

           The rest is breathing room. 4px of vertical padding around a 14px
           icon left a 26px pill with 18px of usable height, which is why these
           felt cramped next to the same component's larger variants. */
        "group inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-base ease-out hover:border-border-strong hover:bg-elevated hover:text-foreground",
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

export type { StackName };
