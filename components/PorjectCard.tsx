"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Social, TProject } from "./Project";
import { cn } from "@/lib/utils";
import {
  Maximize,
  Minimize,
  PauseCircle,
  PlayCircle,
} from "feather-icons-react";
import StackIcon from "./common/StackIcon";
import { useVideoPreview } from "@/lib/useVideoPreview";

export default function ProjectCard({ project }: { project: TProject }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const stack = useMemo(
    () => [...(project.stack?.be || []), ...(project.stack?.fe || [])],
    []
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (!showControls) return;
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);
  const { bind, isPlaying, togglePlay } = useVideoPreview();

  return (
    <div className="relative flex flex-col  gap-1 cursor-pointer rounded-xl border border-border bg-primary transition-transform duration-300 ease-in-out hover:scale-[1.02] overflow-hidden h-[350px] group">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3">
        <h4
          className={`text-[4.5rem] -md-text-[2rem] absolute opacity-5 leading-tight tracking-tighter top-[-25px] right-[-5px] font-bold italic lowercase z-[0]  transition-all  ${
            project.isWork ? "text-muted-foreground" : "text-yellow-300"
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
          className="text-xs backdrop-blur-sm border rounded-lg bg-primary px-1.5 p-0.5 flex text-amber-500 w-fit justify-between items-center gap-1 hover:text-secondary-foreground transition-colors relative z-[1] font-medium"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
            setShowFullContent((prev) => !prev);
          }}
        >
          {showFullContent ? (
            <Minimize className="w-3 h-3" />
          ) : (
            <Maximize className="w-3 h-3" />
          )}
          {showFullContent ? "Read Less" : "Read More"}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-3 pt-0 gap-3 flex-1 overflow-y-auto relative z-[1]">
        <div className="flex flex-col flex-1 gap-1">
          <div className="space-y-1">
            {/* Title */}
            <h3 className="text-base font-medium text-secondary-foreground font-sans">
              {project?.title}
            </h3>
            <div className="flex justify-between items-center gap-2 ">
              {/*Stack */}
              <div className="flex items-center gap-2">
                {stack?.map((stack_name) => (
                  <StackIcon
                    name={stack_name}
                    showLabel={false}
                    size={15}
                    key={stack_name + project.title}
                  />
                ))}
              </div>
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
                {project.links?.opensea && (
                  <Social
                    link={project.links?.opensea}
                    type="opensea"
                    className="text-xs"
                  />
                )}
              </div>
            </div>
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
              {stack?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-secondary-foreground mb-1">
                    Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stack.map((tool, id) => (
                      <StackIcon
                        key={id}
                        name={tool}
                        className="text-xs"
                        showLabel={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        {!showFullContent && (
          <div
            ref={containerRef}
            tabIndex={0}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onClick={() => setShowControls((prev) => !prev)}
            className="relative rounded-md overflow-hidden w-full aspect-video group"
          >
            {/* Thumbnail when paused */}
            {!isPlaying && (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-0"
              />
            )}

            {/* Video */}
            {project?.preview && (
              <>
                <video
                  {...bind}
                  src={project.preview}
                  poster={project.thumbnail}
                  className="w-full h-full object-cover"
                />

                {/* Overlay controls (auto-hide after 3s) */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-500 bg-black/10 z-10",
                    showControls || !isPlaying
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                      setShowControls(false);
                    }}
                    className={cn(
                      "absolute  px-2 flex items-center justify-center p-1  gap-1 rounded-lg bg-black/80 border text-amber-500 shadow-sm focus:outline-none border-amber-500",
                      isPlaying
                        ? "right-full/2 bottom-full/2 p-1.5 text-sm"
                        : "bottom-2 right-2 text-xs"
                    )}
                  >
                    {isPlaying ? (
                      <>
                        <PauseCircle className="w-4 h-4 text-amber-500" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3 h-3 text-amber-500" />
                        Preview
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
