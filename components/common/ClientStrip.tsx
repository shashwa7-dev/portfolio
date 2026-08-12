import Image from "next/image";
import { clients } from "@/lib/clients";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/**
 * The brands worked with under one organisation, rendered inline on that org's
 * Experience entry. Returns null when nothing matches, so callers can mount it
 * unconditionally the way `EmploymentTag` already does.
 *
 * This replaces a standalone five-card brand row that sat above the work
 * history. That row claimed proximity to five logos without saying what was
 * built for any of them, and it put the strongest fact (each brand's
 * contribution) in a tooltip, which is unreachable on touch. Attaching the
 * brands to the engagement that earned them is both more credible and less
 * surface.
 *
 * Three things here are deliberate and easy to get wrong:
 *
 * 1. The label is "Worked with", matching what `app/markdown/route.ts` already
 *    publishes. A stronger phrasing would assert a partner relationship, and at
 *    least one of these entries is a product line Dehidden builds rather than a
 *    third-party client: four Dehidden projects are PlayAI products on
 *    playai.network subdomains. "Worked with" is true either way.
 * 2. The separating ring is `ring-background`, not the `ring-card` used by the
 *    same avatar idiom in `About.tsx`. There the avatars sit on a bento tile;
 *    here they sit on the page background, and copying `ring-card` would put a
 *    faintly wrong-coloured halo around each logo.
 * 3. Greyscale by default, colour on hover. Five brand palettes at full
 *    saturation are what made four earlier ornamental treatments of this row
 *    fail (vinyl, brass plaques, gallery frames, postage stamps): each needed
 *    fixed non-palette colour to read as a physical object, on a page whose
 *    premise is a restrained hueless palette. Removing the colour and giving it
 *    back as a hover reward solves it from the other direction.
 */
export default function ClientStrip({ orgSlug }: { orgSlug: string }) {
  const owned = clients.filter((c) => c.org === orgSlug);
  if (owned.length === 0) return null;

  return (
    <div className="group flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="font-mono text-2xs uppercase tracking-label text-subtle">
        Worked with
      </span>

      <span className="flex items-center">
        {owned.map((c, i) => (
          <Tooltip key={c.name}>
            <TooltipTrigger asChild>
              <span
                className={`relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-secondary outline outline-1 outline-border ring-2 ring-background ${
                  i > 0 ? "-ml-1" : ""
                }`}
              >
                <Image
                  src={c.img}
                  alt={c.name}
                  fill
                  sizes="20px"
                  className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>{c.contribution}</TooltipContent>
          </Tooltip>
        ))}
      </span>

      <span className="min-w-0 text-xs text-muted-foreground">
        {owned.map((c, i) => (
          <span key={c.name}>
            {i > 0 && <span className="text-border-strong">, </span>}
            <a
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-base ease-out hover:text-foreground"
            >
              {c.name}
            </a>
          </span>
        ))}
      </span>
    </div>
  );
}
