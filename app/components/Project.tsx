"use client";
import React, { useState } from "react";
export type TProject = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  preview?: string;
  links?: {
    github?: string;
    twitch?: string;
    twitter?: string;
    discord?: string;
    web?: string;
    other?: string;
  };
  stack: String[];
};

export const Social = ({
  link,
  type,
}: {
  link: string;
  type:
    | "github"
    | "twitter"
    | "web"
    | "twitch"
    | "discord"
    | "other"
    | "linked-in";
}) => {
  const icon =
    type === "linked-in"
      ? "/icons/linkedin.svg"
      : type === "github"
      ? "/icons/github.svg"
      : type === "twitter"
      ? "/icons/x.svg"
      : type === "twitch"
      ? "/icons/twitch.svg"
      : type === "discord"
      ? "/icons/discord.svg"
      : "/icons/link.svg";

  return (
    <a
      href={link}
      target="_blank"
      className="social border flex items-center  gap-1 p-[1px] px-2 rounded-md border-b-4 text-gray-600"
    >
      <span className="capitalize">{type}</span>
      <img src={icon} alt={link} className="w-[10px] h-[10px] text-gray-600" />
    </a>
  );
};

export const Stack = ({ name }: { name: String }) => {
  return (
    <div className="border p-[1px] px-2 rounded-md border-b-4 text-gray-600">
      <p className="capitalize">{name}</p>
    </div>
  );
};
const Project = ({ project }: { project: TProject }) => {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div className="border rounded-lg grid grid-rows-[250px,auto">
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
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover rounded-md transition-transform duration-300 hover:scale-[1.05]"
          />
        )}
      </div>
      <div className="project_details p-2">
        <p className="text-lg font-medium">{project.title}</p>
        <p>{project.description}</p>
        <div className="my-2 grid gap-2">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">FE Stack</p>
            <div className="flex flex-wrap gap-2">
              {project.stack?.map((tool, id) => (
                <Stack name={tool} key={tool + `tool-${id}`} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Links</p>
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
