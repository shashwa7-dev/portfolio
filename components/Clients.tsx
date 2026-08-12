import Image from "next/image";
import { clients } from "@/lib/clients";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/**
 * The brand row at the top of the Experience section.
 *
 * A row of logos alone claims proximity to these companies. The outcomes that
 * make them a credential are rendered by the org rows below, where
 * `ProjectPreviewCard` shows each project's `metric`, so these set up the
 * specifics that follow rather than standing on their own.
 *
 * On the treatment, and why it is plain: earlier passes tried vinyl records,
 * brass plaques, black gallery frames and postage stamps. Every one of them
 * needed fixed non-palette colours to read as a physical object (cream paper,
 * gold bezels, near-black frames), and those are precisely what looked wrong on a
 * page whose whole premise is a restrained hueless palette. The ornament was
 * fighting the design rather than serving it.
 *
 * So this uses the same tokens as every other card in the app: `bg-card`,
 * `border-border`, `text-muted-foreground`, and the same hover idiom of a
 * hairline strengthening plus a small lift. The logos keep their real brand
 * colours, which is the one place colour belongs here, and since they are the
 * only saturated thing in the row they carry it on their own.
 *
 * Sizing steps down on mobile: 84px below the sm breakpoint, 104px above. At
 * 104px five tiles plus gaps overflow a 375px viewport.
 */
const Clients = () => {
  return (
    <div className="mb-9 border-b border-border pb-8">
      <ul className="flex flex-wrap items-start gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
        {clients.map((client) => (
          <li key={client.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={client.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-[84px] rounded-xl border border-border bg-card p-2 transition-[border-color,transform] duration-base ease-out hover:-translate-y-0.5 hover:border-border-strong active:scale-[0.98] motion-reduce:hover:translate-y-0 sm:w-[104px] sm:p-2.5"
                >
                  <span className="relative block aspect-square overflow-hidden rounded-lg bg-elevated ring-1 ring-border">
                    <Image
                      src={client.img}
                      alt={client.name}
                      fill
                      sizes="(max-width: 640px) 68px, 84px"
                      className="object-cover"
                    />
                  </span>
                  <span className="mt-2 block truncate text-center text-2xs font-medium text-muted-foreground transition-colors duration-base ease-out group-hover:text-foreground">
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
      <p className="mt-7 font-mono text-2xs uppercase tracking-label text-subtle">
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
