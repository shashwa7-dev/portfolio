"use client";

import React, { useState } from "react";
import { Social, Stack, TProject } from "./Project";
import { cn } from "@/lib/utils";
import { SVGS } from "./SVGS";

export default function ProjectCard({ project }: { project: TProject }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  return (
    <div
      className="relative flex overflow-hidden w-[344px] h-[382px] flex-col items-center cursor-pointer transition-transform duration-300 ease-in-out group hover:rotate-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Card Base */}
      <div className="absolute top-0">
        <img
          src={"/images/card.png"}
          alt="card"
          className="hidden dark:block dark-card"
        />
        <img
          src={"/images/white_card.png"}
          alt="card"
          className="dark:hidden light-card"
        />
      </div>

      {/* Credit */}
      <h4 className="absolute -left-4 rotate-[-90deg] top-1/4 text-xs uppercase tracking-[3px]  credit-shadow">
        Project
      </h4>

      {/* Plugin Logo */}
      <div className="absolute top-2.5 right-5 flex text-xs">
        {project?.isActive ? (
          <div className="ml-auto flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>New</span>
          </div>
        ) : (
          <div className="ml-auto flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>{project?.date}</span>
          </div>
        )}
      </div>
      <button
        className="absolute text-xs bottom-0 right-0 border  border-b-0 p-1 h-fit rounded-tl-lg  rounded-br-lg bg-card w-[90px]"
        onClick={() => setShowFullContent((prev) => !prev)}
      >
        {showFullContent ? "- Show Less" : "+ Read More"}
      </button>
      <button
        className={
          "absolute text-xs bottom-2 left-[47%] p-2  bg-card rounded-xl"
        }
        onClick={() => setShowFullContent((prev) => !prev)}
      >
        <SVGS.Chevdown
          className={cn(
            "w-8 h-8 transition-all",
            showFullContent && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      <div className="relative flex flex-col justify-between  translate-x-[10px] p-2.5 translate-y-[60px] h-[260px] w-[260px] overflow-y-auto rounded-xl content-bg content-shadow">
        <div className="flex flex-col gap-1">
          {/* Plugin Title */}
          <div className="space-y-1">
            <h3 className="text-base font-medium text-secondary-foreground font-sans">
              {project?.title}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {project.links?.web && (
                <Social link={project.links?.web} type="web"  className="text-xs"/>
              )}
              {project.links?.github && (
                <Social link={project.links?.github} type="github" className="text-xs" />
              )}
              {project.links?.twitter && (
                <Social link={project.links?.twitter} type="twitter"  className="text-xs"/>
              )}
              {project.links?.twitch && (
                <Social link={project.links?.twitch} type="twitch" className="text-xs" />
              )}
              {project.links?.discord && (
                <Social link={project.links?.discord} type="discord"  className="text-xs"/>
              )}
              {project.links?.other && (
                <Social link={project.links?.other} type="other" className="text-xs" />
              )}
            </div>
          </div>

          {/* Plugin Description */}
          <div className="p-1">
            <p
              className={cn(
                "text-sm font-normal leading-4 tracking-[-0.5px] overflow-hidden max-h-[200px]",
                !showFullContent && "line-clamp-2"
              )}
            >
              {project.description}
            </p>
            {showFullContent && (
              <div className="my-2 grid gap-2">
                {project.stack.fe ? (
                  <div>
                    <p className="text-sm font-medium text-secondary-foreground mb-1 font-sans">
                      FE Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.fe?.map((tool, id) => (
                        <Stack name={tool} key={tool + `tool-${id}`} className="text-xs"/>
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
                        <Stack name={tool} key={tool + `tool-${id}`} className="text-xs"/>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        {!showFullContent && (
          <div
            className={cn(
              "relative curso-pointer rounded-lg mt-1 overflow-hidden"
            )}
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
            ) : (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
