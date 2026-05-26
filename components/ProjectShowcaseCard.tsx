import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "feather-icons-react";
import type { TSideProject } from "@/lib/projectsData";
import { ActiveBadge } from "./common/ActiveBadge";

function hasCaseStudy(p: TSideProject) {
  return Boolean(p.caseStudy && Object.keys(p.caseStudy).length > 0);
}

export default function ProjectShowcaseCard({ project }: { project: TSideProject }) {
  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];
  return (
    <Link
      href={`/project/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 760px) 100vw, 520px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2.5">
          <h3 className="font-serif text-xl text-foreground">{project.title}</h3>
          {project.isRecent && <ActiveBadge variant="minimal" label="Recent" />}
        </div>
        <p className="line-clamp-2 text-[15px] text-muted-foreground">{project.tagline}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wide text-subtle">
            {stack.slice(0, 3).join(" · ")}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {project.links?.web && (
              <span className="inline-flex items-center gap-1 group-hover:text-accent">
                Live <ExternalLink className="h-3 w-3" />
              </span>
            )}
            {project.links?.github && (
              <span className="inline-flex items-center gap-1 group-hover:text-accent">
                GitHub <ExternalLink className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
        {hasCaseStudy(project) && (
          <div className="border-t border-border pt-3 text-[13px] text-accent">
            Read case study →
          </div>
        )}
      </div>
    </Link>
  );
}
