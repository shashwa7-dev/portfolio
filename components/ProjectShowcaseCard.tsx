import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import type { ProjectCardData } from "@/lib/projectCards";

export default function ProjectShowcaseCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={project.href}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 760px) 100vw, 380px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {project.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-border-strong bg-background/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-accent backdrop-blur">
            {project.badge}
          </span>
        )}
        {project.metric && (
          <span className="absolute bottom-3 left-3 rounded-full border border-border-strong bg-background/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-accent backdrop-blur">
            {project.metric}
          </span>
        )}
        {project.preview && (
          <span className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
        )}
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-lg text-foreground">{project.title}</h3>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-accent" />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{project.tagline}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wide text-subtle">
            {project.stack.slice(0, 3).join(" · ")}
          </span>
          {project.caseStudy && <span className="text-[12px] text-accent">Case study →</span>}
        </div>
      </div>
    </Link>
  );
}
