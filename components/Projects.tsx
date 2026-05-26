import Link from "next/link";
import { sideProjects } from "@/lib/projectsData";
import Section from "@/components/layout/Section";
import Reveal from "@/components/layout/Reveal";
import ProjectShowcaseCard from "./ProjectShowcaseCard";

export default function Projects() {
  return (
    <Section
      id="projects"
      width="wide"
      label="Selected Work"
      title="Things I've built"
      action={
        <Link href="/projects" className="text-sm text-muted-foreground transition-colors hover:text-accent">
          View all projects →
        </Link>
      }
    >
      <Reveal stagger className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sideProjects.map((p) => (
          <ProjectShowcaseCard key={p.id} project={p} />
        ))}
        <Link
          href="/projects"
          className="flex items-center justify-center rounded-2xl border border-dashed border-border-strong p-8 text-center text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          + more on the projects page →
        </Link>
      </Reveal>
    </Section>
  );
}
