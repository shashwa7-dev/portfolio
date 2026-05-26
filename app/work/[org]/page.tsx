import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { organizations, getOrganization } from "@/lib/workData";
import CompactProjectCard from "@/components/CompactProjectCard";

export async function generateStaticParams() {
  return organizations.map((org) => ({
    org: org.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) return { title: "Not Found" };
  return {
    title: `${org.name} Projects`,
    description: `Projects built at ${org.name} - ${org.role}`,
  };
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);

  if (!org) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-10">
        {/* Back link */}
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Organization header */}
        <header className="space-y-5">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
              <Image
                src={org.logo}
                alt={org.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>

            {/* Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {org.name}
                </h1>
                {org.link && (
                  <a
                    href={org.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md hover:bg-secondary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {org.role}
                <span className="mx-1.5 text-border">·</span>
                <span className="tabular-nums">{org.duration}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          {org.description && (
            <p className="text-muted-foreground leading-relaxed">
              {org.description}
            </p>
          )}
        </header>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Key highlights */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Key Contributions
          </h2>
          <ul className="space-y-2.5">
            {org.highlights.map((highlight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <span className="mt-[0.4rem] w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                <span className="text-muted-foreground">{highlight}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Projects grid */}
        <section className="space-y-5">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Projects ({org.projects.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {org.projects.map((project,index) => (
              <CompactProjectCard
                key={project.id}
                project={project}
                index={index}
                href={`/work/${org.slug}/${project.slug}`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
