"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ActiveBadge } from "./common/ActiveBadge";
import SectionTitle from "./common/SectionTitle";
import { ArrowRight, ExternalLink, Folder } from "feather-icons-react";
import { sideProjects } from "@/lib/projectsData";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import StackIcon from "./common/StackIcon";
import { Icon } from "@iconify/react";

const Projects = () => {
  const router = useRouter();
  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent, slug: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(`/project/${slug}`);
      }
    },
    [router]
  );
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-8"
      id="projects"
    >
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Projects"
          icon={<Icon icon='solar:backpack-line-duotone' className="w-5 h-5" />}
        />
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Brand header */}
      <div className="flex items-center gap-3 mb-5">
        {/* Logo */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
          <Image
            src="/images/offcod8.webp"
            alt="offcod8"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="font-semibold text-foreground leading-tight">
                offcod8
              </h3>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0 sm:whitespace-nowrap">
              {"Jun 2025 — Present"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {"Solo Founder & Engineer"}
          </p>
        </div>
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {sideProjects.map((project) => (
          <motion.div key={project.id} variants={itemVariants}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/project/${project.slug}`)}
              onKeyDown={(e) => handleRowKeyDown(e, project.slug)}
              className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-card/80 hover:border-accent/30 transition-all duration-200 cursor-pointer"
            >
              <div className="relative hidden md:block md:w-28 aspect-video rounded-lg overflow-hidden bg-secondary shrink-0">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold group-hover:text-accent transition-colors">
                      {project.title}
                    </h4>
                    {project.isRecent && (
                      <ActiveBadge variant="minimal" label="Recent" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {project.date || "Present"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {project.tagline}
                </p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {[...(project.stack.fe || []), ...(project.stack.be || [])]
                      .slice(0, 5)
                      .map((tech) => (
                        <StackIcon
                          key={tech}
                          name={tech}
                          size={12}
                          showLabel={false}
                          showTooltip
                          className="text-muted-foreground"
                        />
                      ))}
                  </div>
                  {project.links && (project.links.github || project.links.web) && (
                    <div className="flex items-center gap-2">
                      {project.links.github && (
                        <a
                          href={project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1"
                        >
                          GitHub
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {project.links.web && (
                        <a
                          href={project.links.web}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1"
                        >
                          Live
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Projects;
