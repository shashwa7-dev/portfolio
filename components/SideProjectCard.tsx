import type { TSideProject } from "@/lib/projectsData";
import ProjectShowcaseCard from "./ProjectShowcaseCard";

export default function SideProjectCard({ project }: { project: TSideProject; index?: number }) {
  return <ProjectShowcaseCard project={project} />;
}
