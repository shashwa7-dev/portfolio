"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TSideProject } from "@/lib/projectsData";
import { deriveFilters } from "@/lib/projectFilters";
import ProjectShowcaseCard from "./ProjectShowcaseCard";
import { sideProjectToCard } from "@/lib/projectCards";
import { duration, ease } from "@/lib/motionVariants";

export default function ProjectsIndex({ projects }: { projects: TSideProject[] }) {
  const filters = useMemo(() => deriveFilters(projects), [projects]);
  const [active, setActive] = useState<string>("all");
  const shown = active === "all" ? projects : projects.filter((p) => (p.tags || []).includes(active));

  return (
    <div className="space-y-7">
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[{ tag: "all", count: projects.length }, ...filters].map((f) => (
            <button
              key={f.tag}
              onClick={() => setActive(f.tag)}
              className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-label
                transition-[color,background-color,border-color,transform]
                duration-fast ease-out active:scale-[0.97] ${
                active === f.tag
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.tag}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast, ease: ease.out }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {shown.map((p) => (
            <ProjectShowcaseCard key={p.id} project={sideProjectToCard(p)} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
