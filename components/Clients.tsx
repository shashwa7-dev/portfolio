import Image from "next/image";
import Section from "@/components/layout/Section";
import { clients } from "@/lib/clients";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/**
 * The brand row. Previously a two-column grid of bordered cards with 32px
 * logos, which made the recognisable names the smallest thing in the section.
 *
 * Two deliberate choices here:
 *
 * 1. No card chrome. Borders and backgrounds around each brand made five items
 *    read as a list of small chips. The logos carry the section on their own at
 *    64px, so the containers are gone.
 * 2. Logos render in full colour at rest, not grayscale. The rest of the
 *    interface is deliberately hueless, but a third-party brand mark is content
 *    rather than UI chrome, and colour is most of what makes Coinbase or Polygon
 *    recognisable before the name is read. The compact strip in About.tsx keeps
 *    its grayscale treatment on purpose: that one is a supporting detail at
 *    24px, this one is the feature.
 */
const Clients = () => {
  return (
    <Section
      id="clients"
      number="02"
      label="Trusted by"
      title="Teams I've worked with"
      width="reading"
    >
      {/* Proof line. Both figures are already claimed in the About stats bento,
          so this introduces no new assertion. It answers the "so what" that a
          row of logos on its own leaves open. */}
      <p className="mb-7 font-mono text-2xs uppercase tracking-label text-subtle">
        9+ products shipped
        <span className="mx-2 text-border-strong">·</span>
        1M+ users reached
      </p>

      <ul className="flex flex-wrap items-start gap-x-7 gap-y-6 sm:gap-x-9">
        {clients.map((client) => (
          <li key={client.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={client.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-16 flex-col items-center gap-2"
                >
                  <span className="relative h-16 w-16 overflow-hidden rounded-2xl bg-secondary ring-1 ring-border transition-[transform,box-shadow] duration-base ease-out group-hover:-translate-y-0.5 group-hover:ring-border-strong group-active:scale-[0.97]">
                    <Image
                      src={client.img}
                      alt={client.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <span className="text-center text-xs font-medium leading-tight text-muted-foreground transition-colors duration-base ease-out group-hover:text-foreground">
                    {client.name}
                  </span>
                </a>
              </TooltipTrigger>
              <TooltipContent>{client.contribution}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default Clients;
