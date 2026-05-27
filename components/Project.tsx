"use client";

import React from "react";
import { SVGS } from "./SVGS";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// Re-export types from data files for backward compatibility
export type { TProject } from "@/lib/workData";
export type { TSideProject } from "@/lib/projectsData";

export const Social = ({
  link,
  type,
  className,
}: {
  link: string;
  type:
    | "github"
    | "twitter"
    | "web"
    | "twitch"
    | "discord"
    | "other"
    | "linkedIn"
    | "opensea";
  className?: string;
}) => {
  const Icon =
    type === "linkedIn"
      ? SVGS.LinkedIn
      : type === "github"
      ? SVGS.Github
      : type === "twitter"
      ? SVGS.Twitter
      : type === "twitch"
      ? SVGS.Twitch
      : SVGS.Link;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "secondary", size: "sm" }), className)}
    >
      {type === "opensea" ? (
        <ExternalLink className="w-3 h-3" />
      ) : (
        <Icon className="w-3 h-3" />
      )}
      <span className="capitalize">{type}</span>
    </a>
  );
};
