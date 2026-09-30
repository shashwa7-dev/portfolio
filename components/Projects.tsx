import { sideProjects } from "@/lib/projectsData";
import { sideProjectToCard } from "@/lib/projectCards";
import ProjectPreviewCard from "./ProjectPreviewCard";
import Section from "@/components/layout/Section";
import { ViewAllLink } from "@/components/common/ViewAllLink";

export default function Projects() {
  return (
    <Section
      id="projects"
      label="Projects"
      title="Things I build for fun"
      width="reading"
      action={
        // A bordered sticker pill so it reads as pressable, but still mono and
        // label-sized: it sits in the band beside the label, and body-sized
        // text here made the band read as a row of content rather than as page
        // structure.
        <ViewAllLink href="/projects">View all</ViewAllLink>
      }
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {sideProjects.map((p, i) => (
          <ProjectPreviewCard key={p.id} project={sideProjectToCard(p)} index={i} />
        ))}
      </div>
    </Section>
  );
}
