import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sideProjects } from "@/lib/projectsData";
import { sideProjectToCard } from "@/lib/projectCards";
import ProjectPreviewCard from "./ProjectPreviewCard";
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
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {sideProjects.map((p) => (
          <ProjectPreviewCard key={p.id} project={sideProjectToCard(p)} />
        ))}
      </div>
    </Section>
  );
}
