"use client";

import React, { useMemo, useState } from "react";
import { TSideProject } from "@/lib/projectsData";
import { ExternalLink, Play } from "feather-icons-react";
import { ActiveBadge } from "./common/ActiveBadge";
import StackIcon from "./common/StackIcon";
import VideoModal from "./common/VideoModal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

interface SideProjectCardProps {
  project: TSideProject;
}

export default function SideProjectCard({ project }: SideProjectCardProps) {
  const router = useRouter();
  const [videoOpen, setVideoOpen] = useState(false);
  const stack = useMemo(
    () => [...(project.stack?.fe || []), ...(project.stack?.be || [])],
    [project.stack]
  );

  const primaryLink = project.links?.web || project.links?.github;

  const handleCardClick = () => {
    router.push(`/project/${project.slug}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <motion.div
          onClick={handleCardClick}
          className="block rounded-xl border border-border bg-card hover:bg-card/90 overflow-hidden transition-all duration-200 hover:border-accent/30 shadow-sm hover:shadow-md cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-secondary overflow-hidden">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Preview play button */}
            {project.preview && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setVideoOpen(true);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 text-foreground text-sm font-medium border border-border shadow-lg">
                  <Play className="w-4 h-4 fill-current" />
                  Preview
                </div>
              </button>
            )}

            {/* Status badge */}
            {project.isActive && (
              <ActiveBadge
                variant="overlay"
                className="absolute left-2 top-2"
              />
            )}

            {/* Date badge */}
            {project.date && (
              <span className="absolute top-2 right-2 text-xs px-2.5 py-1 rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm border border-border">
                {project.date}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold leading-tight group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {project.tagline}
                </p>
              </div>
              {primaryLink && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(primaryLink, "_blank", "noopener,noreferrer");
                  }}
                  className="shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-accent"
                  aria-label={`Open ${project.title}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Stack icons */}
            <div className="flex items-center gap-2 flex-wrap">
              {stack.map((stackName) => (
                <StackIcon
                  key={stackName + project.id}
                  name={stackName}
                  showLabel={false}
                  showTooltip
                  size={14}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {project.preview && (
        <VideoModal
          isOpen={videoOpen}
          onClose={() => setVideoOpen(false)}
          videoUrl={project.preview}
          title={project.title}
        />
      )}
    </>
  );
}
