import Image from "next/image";
import { clients } from "@/lib/clients";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/**
 * The brand row. No longer a section of its own: it renders at the top of the
 * Experience section as a credential strip that frames the work history below.
 *
 * The reason it stopped being standalone is worth recording, because it looks
 * like a demotion and is the opposite. A row of logos on its own only claims
 * proximity to these companies. The outcomes that turn proximity into a
 * credential already live one level down, in `ProjectPreviewCard`, which renders
 * each project's `metric`: "100K mints, day one" on the Coinbase x Polygon NFT,
 * "Featured by Polygon" on Polygon Copilot, "2,000+ attendees" on the Web3Conf
 * quest. So the selling was already happening in Experience, with the project
 * and stack alongside it. Duplicating the logos in a separate section, minus
 * those numbers, was strictly the weaker half of the story.
 *
 * Sitting at the top of Experience, the logos now set up the specifics that
 * follow instead of competing with them.
 *
 * Logos render in full colour rather than grayscale. The interface is
 * deliberately hueless, but a third-party brand mark is content, not UI chrome,
 * and colour is most of what makes Coinbase or Polygon recognisable before the
 * name is read. The compact 24px strip in About.tsx keeps grayscale on purpose:
 * that one is a supporting detail, this is a credential.
 */
const Clients = () => {
  return (
    <div className="mb-9 border-b border-border pb-8">
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

      {/* Both figures are already claimed in the About stats bento, so this
          asserts nothing new. It frames the logos as outcomes rather than a
          client list, and the org rows below carry the per-project specifics. */}
      <p className="mt-6 font-mono text-2xs uppercase tracking-label text-subtle">
        Shipped for {clients.length} brands
        <span className="mx-2 text-border-strong">·</span>
        100K day-one mints
        <span className="mx-2 text-border-strong">·</span>
        1M+ users reached
      </p>
    </div>
  );
};

export default Clients;
