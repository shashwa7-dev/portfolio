"use client";
import React, { useState } from "react";
import { SVGS } from "./SVGS";
import { cn } from "@/lib/utils";
import { StackName } from "./common/StackIcon";
import { Icon as Iconify } from "@iconify/react";
export type Feature = {
  title: string;
  points: string[];
};
export type TProject = {
  id: string;
  isWork?: boolean;
  title: string;
  isActive?: boolean;
  description: string;
  features?: Feature[];
  thumbnail: string;
  preview?: string;
  embedPreview?: string;
  date?: string;
  links?: {
    github?: string;
    twitch?: string;
    twitter?: string;
    discord?: string;
    web?: string;
    opensea?: string;
    other?: string;
  };
  stack: { fe?: StackName[]; be?: StackName[] };
};

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
      className={cn(
        "social border flex items-center  gap-1 p-[1px] text-sm px-2 rounded-md border-b-4 text-secondary-foreground",
        className
      )}
    >
      {type === "opensea" ? (
        <Iconify icon="simple-icons:opensea" className="w-[10px] h-[10px]" />
      ) : (
        <Icon className="w-[10px] h-[10px]" />
      )}
      <span className="capitalize">{type}</span>
    </a>
  );
};

export const Stack = ({
  name,
  className,
}: {
  name: String;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "border p-[1px] px-2 rounded-md border-b-4  text-sm text-secondary-foreground bg-card",
        className
      )}
    >
      <p className="capitalize">{name}</p>
    </div>
  );
};
const Project = ({ project }: { project: TProject }) => {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div className="border rounded-lg grid grid-rows-[auto_250px_auto] bg-card">
      <div className="p-2 flex gap-2 items-center">
        <div className="bg-secondary w-[10px] h-[10px] rounded-full"></div>
        <div className="bg-secondary w-[10px] h-[10px] rounded-full"></div>
        <div className="bg-secondary w-[10px] h-[10px] rounded-full"></div>
        {project?.isActive && (
          <div className="ml-auto flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Dev/IP</span>
          </div>
        )}
      </div>

      <div
        className="project_thumb overflow-hidden relative curso-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {project?.preview && isHovering ? (
          <video
            src={project?.preview}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : project?.embedPreview && isHovering ? (
          <iframe
            src={project?.embedPreview}
            width="100%"
            height="100%"
            allow="autoplay"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]"
          />
        )}
      </div>
      <div className="project_details p-2">
        <p className="text-lg font-medium text-secondary-foreground border-b mb-1 font-sans">
          {project.title}
        </p>
        <p>{project.description}</p>
        {project?.features ? (
          <div className="border-y mt-1 py-1">
            <p className="font-medium underline text-secondary-foreground mb-1 font-sans">
              {project.features[0].title}
            </p>
            <ul className="grid gap-1">
              {project.features[0].points.map((content, id) => (
                <li key={id}>{`${id + 1}. ${content}`}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="my-2 grid gap-2">
          {project.stack.fe ? (
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 font-sans">
                FE Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.stack.fe?.map((tool, id) => (
                  <Stack name={tool} key={tool + `tool-${id}`} />
                ))}
              </div>
            </div>
          ) : null}
          {project.stack.be ? (
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 font-sans">
                BE Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.stack.be?.map((tool, id) => (
                  <Stack name={tool} key={tool + `tool-${id}`} />
                ))}
              </div>
            </div>
          ) : null}
          <div>
            <p className="text-sm font-medium text-secondary-foreground mb-1 font-sans">
              Links
            </p>
            <div className="flex gap-2 flex-wrap">
              {project.links?.web && (
                <Social link={project.links?.web} type="web" />
              )}
              {project.links?.github && (
                <Social link={project.links?.github} type="github" />
              )}
              {project.links?.twitter && (
                <Social link={project.links?.twitter} type="twitter" />
              )}
              {project.links?.twitch && (
                <Social link={project.links?.twitch} type="twitch" />
              )}
              {project.links?.discord && (
                <Social link={project.links?.discord} type="discord" />
              )}
              {project.links?.other && (
                <Social link={project.links?.other} type="other" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
