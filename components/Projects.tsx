import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { sideProjects } from "@/lib/projectsData";
import { homeProjects } from "@/lib/home";
import Section from "@/components/layout/Section";
import { ViewAllLink } from "@/components/common/ViewAllLink";
import MarginNote from "@/components/common/MarginNote";

/**
 * Three side projects: the name on the left and when it shipped on the right,
 * set like the dates in Writing. On hover or focus an underline draws in under
 * the name, a small arrow appears, and the thumbnail fades in at the row's
 * right end in place of the date; touch visitors get the names, the dates and
 * the project page one tap away. The full list lives on /projects.
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
              className="group relative -mx-3 flex items-center gap-1.5 rounded-lg px-3 py-3 text-lg font-medium text-foreground"
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_1px] bg-bottom-left bg-no-repeat pb-0.5 transition-[background-size] duration-med ease-out group-hover:bg-size-[100%_1px] group-focus-visible:bg-size-[100%_1px]">
                {p.title}
              </span>
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 -translate-x-1 translate-y-0.5 text-subtle opacity-0 transition-[opacity,transform] duration-base ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              />
              {p.date && (
                <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-subtle transition-opacity duration-base ease-out group-hover:opacity-0 group-focus-visible:opacity-0">
                  {p.date}
                </span>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 aspect-16/10 w-40 -translate-y-1/2 scale-95 overflow-hidden rounded-md opacity-0 shadow-lg ring-1 ring-border transition-[opacity,transform] duration-base ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
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
