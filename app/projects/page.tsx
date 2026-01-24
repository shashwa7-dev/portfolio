import Link from "next/link";
import { ArrowLeft } from "feather-icons-react";
import { sideProjects } from "@/lib/projectsData";
import SideProjectCard from "@/components/SideProjectCard";

export const metadata = {
  title: "Side Projects",
  description: "Personal projects and experiments I've built.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        {/* Back link */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-4 pb-8 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src="/images/offcod8.webp"
              alt="offcod8"
              className="w-14 h-14 rounded-xl"
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Side Projects
              </h1>
              <p className="text-muted-foreground">
                offcod8 · Solo Founder & Engineer
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Personal projects and experiments I build to learn new technologies,
            solve my own problems, or just for fun.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sideProjects.map((project) => (
            <SideProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
}
