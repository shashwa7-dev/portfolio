"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Play, Github } from "feather-icons-react";
import { getSideProject } from "@/lib/projectsData";
import { ActiveBadge } from "@/components/common/ActiveBadge";
import StackIcon from "@/components/common/StackIcon";
import VideoModal from "@/components/common/VideoModal";
import { motion } from "motion/react";
import { useState } from "react";

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const project = getSideProject(slug);
  const [videoOpen, setVideoOpen] = useState(false);

  if (!project) {
    notFound();
  }

  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-10">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Meta badges */}
          <div className="flex items-center gap-2">
            {project.isActive && (
              <ActiveBadge variant="pill" />
            )}
            {project.date && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {project.date}
              </span>
            )}
          </div>

          {/* Title & Tagline */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.title}
            </h1>
            <p className="text-muted-foreground mt-1.5 leading-relaxed">
              {project.tagline}
            </p>
          </div>

          {/* Quick links */}
          {project.links && (
            <div className="flex items-center gap-3 pt-1">
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm font-medium"
                >
                  <Github className="w-4 h-4" />
                  Source
                </a>
              )}
              {project.links.web && (
                <a
                  href={project.links.web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
            </div>
          )}
        </motion.header>

        {/* Thumbnail / Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative aspect-video rounded-xl overflow-hidden bg-secondary group"
        >
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          {project.preview && (
            <button
              onClick={() => setVideoOpen(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
                <Play className="w-4 h-4 fill-current" />
                Watch Demo
              </div>
            </button>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-10"
        >
          {/* Long description */}
          {project.longDescription && (
            <section className="space-y-4">
              {project.longDescription.split("\n\n").map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          )}

          {/* Divider */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="h-px bg-border" />
          )}

          {/* Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Key Features
              </h2>
              <ul className="space-y-2.5">
                {project.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm leading-relaxed"
                  >
                    <span className="mt-[0.4rem] w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Tech Stack */}
          <section className="space-y-4">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Built With
            </h2>
            <div className="flex flex-wrap gap-2">
              {stack.map((tech) => (
                <StackIcon key={tech} name={tech} showLabel />
              ))}
            </div>
          </section>
        </motion.div>
      </div>

      {/* Video Modal */}
      {project.preview && (
        <VideoModal
          isOpen={videoOpen}
          onClose={() => setVideoOpen(false)}
          videoUrl={project.preview}
          title={project.title}
        />
      )}
    </main>
  );
}
