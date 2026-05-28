"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import {  getOrganization, getProjectFromOrg } from "@/lib/workData";
import { ActiveBadge } from "@/components/common/ActiveBadge";
import StackIcon from "@/components/common/StackIcon";
import VideoModal from "@/components/common/VideoModal";
import Container from "@/components/layout/Container";
import { motion } from "motion/react";
import { useState } from "react";
import { slideUpVariants } from "@/lib/motionVariants";

export default function WorkProjectPage({
  params,
}: {
  params: { org: string; project: string };
}) {
  const { org: orgSlug, project: projectSlug } = params;
  const org = getOrganization(orgSlug);
  const project = getProjectFromOrg(orgSlug, projectSlug);
  const [videoOpen, setVideoOpen] = useState(false);

  if (!org || !project) {
    notFound();
  }

  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];

  return (
    <main className="min-h-screen py-16">
      <Container width="reading" className="space-y-8">
        {/* Back link */}
        <Link
          href={`/work/${org.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {org.name}
        </Link>

        {/* Header */}
        <motion.div
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {project.isActive && (
                  <ActiveBadge variant="pill" label="Active Project" />
                )}
                {project.date && (
                  <span className="text-sm text-muted-foreground">
                    {project.date}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {project.title}
              </h1>
            </div>
          </div>

          {/* Organization badge */}
          <div className="flex items-center gap-2">
            <img
              src={org.logo}
              alt={org.name}
              className="w-6 h-6 rounded-lg"
            />
            <span className="text-sm text-muted-foreground">
              Built at {org.name}
            </span>
          </div>
        </motion.div>

        {/* Thumbnail / Video */}
        <motion.div
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
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
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-medium">
                <Play className="w-5 h-5 fill-current" />
                Watch Preview
              </div>
            </button>
          )}
        </motion.div>

        {/* Description */}
        <motion.div
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <p className="text-muted-foreground leading-relaxed">
            {project.description}
          </p>

          {/* Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Key Features
              </h2>
              <ul className="space-y-2">
                {project.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack */}
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {stack.map((tech) => (
                <StackIcon key={tech} name={tech} showLabel />
              ))}
            </div>
          </div>

          {/* Links */}
          {project.links && Object.keys(project.links).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Links
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.links.web && (
                  <a
                    href={project.links.web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {project.links.twitter && (
                  <a
                    href={project.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {project.links.opensea && (
                  <a
                    href={project.links.opensea}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    OpenSea
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </Container>

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
