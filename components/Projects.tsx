import Link from "next/link";
import { sideProjects } from "@/lib/projectsData";
import { sideProjectToCard } from "@/lib/projectCards";
import ProjectShowcaseCard from "./ProjectShowcaseCard";
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sideProjects.map((p) => (
          <ProjectShowcaseCard key={p.id} project={sideProjectToCard(p)} />
        ))}
      </div>
    </Section>
  );
}
