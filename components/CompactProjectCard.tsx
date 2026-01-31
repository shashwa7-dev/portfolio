"use client";

import React, { useMemo, useState } from "react";
import { TProject } from "@/lib/workData";
import { cn } from "@/lib/utils";
import { ExternalLink, Play } from "feather-icons-react";
import { ActiveBadge } from "./common/ActiveBadge";
import StackIcon from "./common/StackIcon";
import VideoModal from "./common/VideoModal";
import Image from "next/image";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface CompactProjectCardProps {
  project: TProject;
  href?: string;
  index: number;
}

export default function CompactProjectCard({
  project,
  href,
  index,
}: CompactProjectCardProps) {
  const router = useRouter();
  const [videoOpen, setVideoOpen] = useState(false);
  const stack = useMemo(
    () => [...(project.stack?.be || []), ...(project.stack?.fe || [])],
    [project.stack]
  );

  const primaryLink = project.links?.web || project.links?.github;

  const handleCardClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.15 }}
        className="group"
      >
        <div
          onClick={handleCardClick}
          className={cn(
            "block rounded-lg border border-border bg-card/50 hover:bg-card overflow-hidden transition-all duration-200",
            href && "cursor-pointer hover:border-accent/30"
          )}
        >
          {/* Thumbnail */}
          <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
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
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-black text-sm font-medium">
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
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Title and external link */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm leading-tight line-clamp-1">
                {project.shortTitle || project.title}
              </h4>
              {primaryLink && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(primaryLink, "_blank", "noopener,noreferrer");
                  }}
                  className="shrink-0 p-1 rounded hover:bg-secondary transition-colors"
                  aria-label={`Open ${project.title}`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Date */}
            {project.date && (
              <p className="text-xs text-muted-foreground">{project.date}</p>
            )}

            {/* Stack icons with tooltips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {stack.slice(0, 4).map((stackName) => (
                <StackIcon
                  key={stackName + project.id}
                  name={stackName}
                  showLabel={false}
                  showTooltip
                  size={12}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                />
              ))}
              {stack.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{stack.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
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
