import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { organizations, getOrganization } from "@/lib/workData";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import ProjectShowcaseCard from "@/components/ProjectShowcaseCard";
import { workProjectToCard } from "@/lib/projectCards";

export async function generateStaticParams() {
  return organizations.map((org) => ({ org: org.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) return { title: "Not Found" };
  return {
    title: `${org.name} · Work`,
    description: `Projects built at ${org.name}, ${org.role}`,
  };
}

export default async function OrgPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) notFound();

  return (
    <main className="py-16 md:py-24">
      <Container width="wide" className="space-y-10">
        <Link href="/#experience" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-elevated ring-1 ring-border">
              <Image src={org.logo} alt={org.name} fill className="object-cover" sizes="48px" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{org.name}</h1>
                {org.link && (
                  <a href={org.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-accent">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {org.role}
                <span className="mx-1.5 text-border-strong">·</span>
                <span className="font-mono text-xs tabular-nums text-subtle">{org.duration}</span>
              </p>
            </div>
          </div>
          {org.description && <p className="max-w-[62ch] text-muted-foreground">{org.description}</p>}
        </header>

        <section className="space-y-3">
          <Label>Key contributions</Label>
          <ul className="space-y-2">
            {org.highlights.map((h, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                {h}
              </li>
            ))}
          </ul>
        </section>

        {org.projects.length > 0 && (
          <section className="space-y-4">
            <Label>Projects ({org.projects.length})</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {org.projects.map((p) => (
                <ProjectShowcaseCard key={p.id} project={workProjectToCard(org.slug, p)} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
