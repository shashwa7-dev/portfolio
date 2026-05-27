import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
};

export default function ProjectsPage() {
  return (
    <main className="py-16 md:py-24">
      <Container width="reading" className="space-y-8">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="space-y-2">
          <Label>Projects</Label>
          <h1 className="font-serif text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]">
            Everything I&apos;ve shipped
          </h1>
        </div>
        <ProjectsIndex projects={sideProjects} />
      </Container>
    </main>
  );
}
