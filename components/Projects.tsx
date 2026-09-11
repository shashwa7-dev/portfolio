import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { sideProjects } from "@/lib/projectsData";
import { sideProjectToCard } from "@/lib/projectCards";
import ProjectPreviewCard from "./ProjectPreviewCard";
import Section from "@/components/layout/Section";

export default function Projects() {
  return (
    <Section
      id="projects"
      number="02"
      of="06"
      label="Side Projects"
      title="Things I build for fun"
      width="reading"
      action={
        // Mono and label-sized, because it now sits in the band beside the
        // label rather than beside the title. Body-sized text in here made the
        // band read as a row of content instead of as page structure.
        <Link
          href="/projects"
          className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-label text-subtle transition-colors duration-fast ease-out hover:text-foreground"
        >
          View all <ArrowRight className="h-3 w-3" />
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
