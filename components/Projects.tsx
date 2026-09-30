import Link from "next/link";
import Image from "next/image";
import { sideProjects } from "@/lib/projectsData";
import Section from "@/components/layout/Section";
import { ViewAllLink } from "@/components/common/ViewAllLink";
import MarginNote from "@/components/common/MarginNote";

/**
 * Side projects as light rows: a small thumbnail, the name, a "New" tag on the
 * most recent one, and the date. The big cards live on /projects.
 */
export default function Projects() {
  return (
    <Section
      id="projects"
      label="Projects"
      title="Things I build for fun"
      action={<ViewAllLink href="/projects">View all</ViewAllLink>}
    >
      <ul className="space-y-1">
        {sideProjects.map((p) => (
          <li key={p.id} className="relative">
            <Link
              href={`/project/${p.slug}`}
              className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-base ease-out hover:bg-muted"
            >
              <span className="relative h-8 w-12 shrink-0 overflow-hidden rounded ring-1 ring-border">
                <Image
                  src={p.thumbnail}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
                />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {p.title}
                {p.isRecent && (
                  <span className="ml-2 rounded-full border border-border px-1.5 py-px font-mono text-2xs uppercase tracking-label text-subtle">
                    New
                  </span>
                )}
              </span>
              {p.date && <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">{p.date}</span>}
            </Link>
            <MarginNote id={p.slug} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
