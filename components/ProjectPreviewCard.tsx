import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ProjectCardData } from "@/lib/projectCards";
import StackIcon, { type StackName } from "@/components/common/StackIcon";

export default function ProjectPreviewCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={project.href}
      className="group flex gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-border-strong"
    >
      <div className="relative h-12 w-[68px] shrink-0 overflow-hidden rounded-md bg-elevated">
        <Image src={project.thumbnail} alt={project.title} fill sizes="68px" className="object-cover" />
        {project.metric && (
          <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-0.5 pt-2 font-mono text-[8px] font-medium text-white">
            {project.metric}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">{project.title}</span>
          {project.badge && (
            <span className="shrink-0 font-mono text-[8px] uppercase tracking-wide text-accent">{project.badge}</span>
          )}
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-subtle transition-colors group-hover:text-accent" />
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">{project.tagline}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-subtle">
          {project.stack.slice(0, 4).map((t) => (
            <StackIcon key={t} name={t as StackName} size={13} showLabel={false} />
          ))}
        </div>
      </div>
    </Link>
  );
}
