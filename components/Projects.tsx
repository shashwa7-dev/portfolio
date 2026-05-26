import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sideProjects } from "@/lib/projectsData";
import Section from "@/components/layout/Section";

export default function Projects() {
  return (
    <Section
      id="projects"
      number="02"
      label="Side Projects"
      title="Things I build for fun"
      width="reading"
      action={
        <Link href="/projects" className="text-sm text-muted-foreground transition-colors hover:text-accent">
          View all →
        </Link>
      }
    >
      <ul className="space-y-1">
        {sideProjects.map((p) => {
          const stack = [...(p.stack.fe || []), ...(p.stack.be || [])];
          return (
            <li key={p.id}>
              <Link
                href={`/project/${p.slug}`}
                className="group -mx-3 flex items-baseline gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-elevated"
              >
                <span className="font-medium text-foreground">{p.title}</span>
                <span className="hidden truncate text-sm text-muted-foreground sm:block">{p.tagline}</span>
                <span className="ml-auto flex shrink-0 items-center gap-2.5">
                  <span className="hidden font-mono text-[10px] uppercase tracking-wide text-subtle sm:inline">
                    {stack.slice(0, 2).join(" · ")}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-subtle transition-colors group-hover:text-accent" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
