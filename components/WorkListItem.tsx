"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { TOrganization } from "@/lib/workData";
import { itemVariants } from "@/lib/motionVariants";
import { ActiveBadge } from "@/components/common/ActiveBadge";

interface WorkListItemProps {
  organization: TOrganization;
}

function isPresentRole(duration: string) {
  return /present/i.test(duration);
}

export default function WorkListItem({ organization: org }: WorkListItemProps) {
  const isActive = isPresentRole(org.duration);

  return (
    <motion.article
      variants={itemVariants}
      className="group border-b border-border/80 pb-5 last:border-b-0 last:pb-0"
    >
      {/* Organization header */}
      <div className="flex items-center gap-3 mb-5">
        {/* Logo */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
          <Image
            src={org.logo}
            alt={org.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="font-semibold text-foreground leading-tight">
                {org.name}
              </h3>
              {isActive && <ActiveBadge label="Present" variant="minimal" />}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0 sm:whitespace-nowrap">
              {org.duration}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {org.role}
          </p>
        </div>
      </div>

      {/* Description */}
      {org.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {org.description}
        </p>
      )}

      {/* Highlights */}
      <ul className="space-y-2.5 mb-0">
        {org.highlights.map((highlight, idx) => (
          <motion.li
            key={idx}
            variants={itemVariants}
            className="flex items-start gap-2.5 text-sm leading-relaxed"
          >
            <span className="mt-[0.4rem] w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
            <span className="text-muted-foreground">{highlight}</span>
          </motion.li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
        <Link
          href={`/work/${org.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors group/link"
        >
          <span>
            {org.projects.length > 0
              ? `View ${org.projects.length} project${org.projects.length === 1 ? "" : "s"}`
              : "Learn more"}
          </span>
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>

        {org.link && (
          <a
            href={org.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Company</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.article>
  );
}
