import { sideProjects } from "@/lib/projectsData";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import ProjectsIndex from "@/components/ProjectsIndex";
import { ogUrl } from "@/lib/seo";

export const metadata = {
  title: "Projects",
  description: "Personal projects and experiments I've built.",
  alternates: { canonical: `${baseUrl}projects` },
  openGraph: {
    title: "Projects",
    description: "Personal projects and experiments I've built.",
    images: [{ url: ogUrl({ title: "Projects", subtitle: "Things I've built", type: "generic", label: "Work" }) }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: "Personal projects and experiments I've built.",
    images: [ogUrl({ title: "Projects", subtitle: "Things I've built", type: "generic", label: "Work" })],
  },
};

export default function ProjectsPage() {
  return (
    <main className="pt-8 md:pt-12 pb-8 md:pb-12">
      <Container width="reading" className="space-y-8">
        <div className="space-y-2">
          <Label>Projects</Label>
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-tight">
            Everything I&apos;ve shipped
          </h1>
        </div>
        <ProjectsIndex projects={sideProjects} />
      </Container>
    </main>
  );
}
