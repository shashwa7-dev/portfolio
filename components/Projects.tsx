import Link from "next/link";
import Image from "next/image";
import { sideProjects } from "@/lib/projectsData";
import { homeProjects } from "@/lib/home";
import Section from "@/components/layout/Section";
import { ViewAllLink } from "@/components/common/ViewAllLink";
import MarginNote from "@/components/common/MarginNote";

/**
 * Two side projects, by name only. The thumbnail stays out of the way until
 * the row is hovered or focused, then fades in at the row's right end; touch
 * visitors get the names and the project page one tap away. The full list
 * lives on /projects.
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
        {homeProjects(sideProjects).map((p) => (
          <li key={p.id} className="relative">
            <Link
              href={`/project/${p.slug}`}
              className="group relative -mx-3 flex items-center rounded-lg px-3 py-3 text-lg font-medium text-foreground transition-colors duration-base ease-out hover:bg-muted"
            >
              {p.title}
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 aspect-[16/10] w-40 -translate-y-1/2 scale-95 overflow-hidden rounded-md opacity-0 shadow-lg ring-1 ring-border transition-[opacity,transform] duration-base ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
              >
                <Image src={p.thumbnail} alt="" fill sizes="160px" className="object-cover" />
              </span>
            </Link>
            <MarginNote id={p.slug} indent={false} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
