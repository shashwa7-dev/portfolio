"use client";

import React, { useState } from "react";
import { Social, Stack, TProject } from "./Project";
import { cn } from "@/lib/utils";
import { Maximize, Minimize } from "feather-icons-react";

export default function ProjectCard({ project }: { project: TProject }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <div
      className="relative flex flex-col cursor-pointer rounded-xl border border-border bg-primary transition-transform duration-300 ease-in-out hover:scale-[1.02] overflow-hidden h-[350px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3">
        <h4
          className={`text-[4.5rem] -md-text-[2rem] absolute opacity-5 leading-tight tracking-tighter top-[-25px] right-[-5px] font-bold italic lowercase z-[0]  ${
            project.isWork ? "text-muted-foreground" : "text-cyan-300"
          }`}
        >
          {project.isWork ? "Work" : "offcod8"}
        </h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground border p-0.5 px-1.5 rounded-xl relative z-[1]">
          {project?.isActive ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>New</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>{project?.date}</span>
            </>
          )}
        </div>
        <button
          className="text-xs backdrop-blur-sm border rounded-lg bg-primary px-1.5 p-0.5 flex text-muted-foreground w-fit justify-between items-center gap-1 hover:text-secondary-foreground transition-colors relative z-[1] font-medium"
          onClick={() => setShowFullContent((prev) => !prev)}
        >
          {showFullContent ? "Minimize" : "Expand"}
          {showFullContent ? (
            <Minimize className="w-3 h-3" />
          ) : (
            <Maximize className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-3 pt-0 flex-1 overflow-hidden">
        <div className="flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-base font-medium text-secondary-foreground font-sans mb-1">
            {project?.title}
          </h3>

          {/* Links */}
          <div className="flex gap-2 flex-wrap mb-2">
            {project.links?.web && (
              <Social
                link={project.links?.web}
                type="web"
                className="text-xs"
              />
            )}
            {project.links?.github && (
              <Social
                link={project.links?.github}
                type="github"
                className="text-xs"
              />
            )}
            {project.links?.twitter && (
              <Social
                link={project.links?.twitter}
                type="twitter"
                className="text-xs"
              />
            )}
            {project.links?.twitch && (
              <Social
                link={project.links?.twitch}
                type="twitch"
                className="text-xs"
              />
            )}
            {project.links?.discord && (
              <Social
                link={project.links?.discord}
                type="discord"
                className="text-xs"
              />
            )}
            {project.links?.other && (
              <Social
                link={project.links?.other}
                type="other"
                className="text-xs"
              />
            )}
          </div>

          {/* Description */}
          <p
            className={cn(
              "text-sm font-normal leading-4 text-muted-foreground transition-all duration-300",
              !showFullContent && "line-clamp-2"
            )}
          >
            {project.description}
          </p>

          {/* Tech Stack (expanded view) */}
          {showFullContent && (
            <div className="space-y-2 mt-2">
              {project.stack.fe && (
                <div>
                  <p className="text-sm font-medium text-secondary-foreground mb-1">
                    FE Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.fe.map((tool, id) => (
                      <Stack key={id} name={tool} className="text-xs" />
                    ))}
                  </div>
                </div>
              )}
              {project.stack.be && (
                <div>
                  <p className="text-sm font-medium text-secondary-foreground mb-1">
                    BE Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.be.map((tool, id) => (
                      <Stack key={id} name={tool} className="text-xs" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        {!showFullContent && (
          <div className="relative rounded-md overflow-hidden h-[200px] w-full">
            {project?.preview && isHovering ? (
              <video
                src={project.preview}
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
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
