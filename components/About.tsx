import Image from "next/image";
import { Check, ArrowRight, Mail } from "lucide-react";
import Container from "@/components/layout/Container";
import AvatarHover from "@/components/AvatarHover";
import Label from "@/components/layout/Label";
import Bento from "@/components/layout/Bento";
import Marker from "@/components/common/Marker";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Stat = {
  n: string;
  c: string;
  /** Brand logos anchoring the number — small overlapping avatars below the stat. */
  orgs?: { name: string; img: string }[];
};

const NFT_PARTNERS = [
  { name: "Coinbase", img: "/clients/client_coinbase.png" },
  { name: "Polygon", img: "/clients/client_polygon.jpg" },
];

const stats: Stat[] = [
  { n: "1M+", c: "users reached", orgs: NFT_PARTNERS },
  { n: "100K", c: "day-one mints", orgs: NFT_PARTNERS },
  {
    n: "9+",
    c: "products shipped",
    orgs: [
      { name: "ShopOS", img: "/images/shopos.jpeg" },
      { name: "Dehidden", img: "/images/dehidden_logo.jpeg" },
    ],
  },
  { n: "4+ yrs", c: "building frontend" },
];

export default function About() {
  return (
    <header className="pt-12 pb-10 md:pt-16">
      <Container width="reading">
        <div className="space-y-5 sm:space-y-7">
          {/* identity block */}
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <AvatarHover />
              <span
                className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-foreground text-background ring-[3px] ring-background"
                title="Verified engineer"
                aria-label="Verified"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight text-foreground">
                Shashwat Tripathi
              </div>
              <div className="mt-1">
                <Label>Frontend Engineer · AI · Web3</Label>
              </div>
              {/* Availability. Same treatment as the "Currently building" badge on
                  the active Experience role, so one signal reads one way
                  everywhere.

                  The green is now the dot only. A full emerald pill (green
                  border, green text, green dot) put a lot of hue on a page whose
                  premise is a restrained neutral palette, and it read as an
                  intrusion. The dot alone still carries the live-status meaning,
                  which is the part the colour actually earns; the label sits on
                  neutral tokens like every other pill in the app. */}
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border-strong px-2 py-0.5 font-mono text-2xs font-medium uppercase tracking-label text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open to work
              </div>
            </div>
          </div>

          {/* headline */}
          <h1 className="text-[clamp(2.2rem,5.5vw,3.4rem)] font-semibold leading-[1.02] tracking-tighter text-foreground">
            I build interfaces that{" "}
            <span className="font-semibold text-foreground">ship and scale</span> to
            millions.
          </h1>

          {/* lede (no em-dashes, no org names — generic AI-adaptive positioning) */}
          <p className="max-w-[56ch] text-lg text-muted-foreground">
            I&apos;m Shashwat, an{" "}
            <span className="text-foreground">AI-adaptive frontend engineer</span>.
            Across 9+ production products with top AI and Web3 teams, I turn
            complex ideas into fast, polished, accessible UIs. Reach me at{" "}
            <a href="mailto:contact@shashwa7.in" className="text-foreground">
              <Marker variant="marker">contact@shashwa7.in</Marker>
            </a>
            .
          </p>

          {/* stats — overlapping brand avatars float top-right (always greyscale),
              smaller on mobile, tooltips name them */}
          <Bento className="grid-cols-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.c}
                className="relative flex h-full flex-col bg-card px-4 py-3.5"
              >
                {s.orgs && s.orgs.length > 0 && (
                  <div className="absolute right-2 top-2 flex items-center sm:right-2.5 sm:top-2.5">
                    {s.orgs.map((org, i) => (
                      <Tooltip key={org.name}>
                        <TooltipTrigger asChild>
                          <span
                            className={`relative h-4 w-4 shrink-0 overflow-hidden rounded-full bg-secondary outline outline-1 outline-border ring-2 ring-card sm:h-5 sm:w-5 ${
                              i > 0 ? "-ml-1" : ""
                            }`}
                          >
                            <Image
                              src={org.img}
                              alt={org.name}
                              fill
                              sizes="(max-width: 640px) 16px, 20px"
                              className="object-cover grayscale opacity-80 transition-[filter] duration-base ease-out hover:grayscale-0"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{org.name}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
                <div className="text-2xl font-semibold text-foreground">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.c}</div>
              </div>
            ))}
          </Bento>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#experience"
              className="inline-flex items-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97]"
            >
              View selected work <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:contact@shashwa7.in"
              className="inline-flex items-center gap-2 rounded-[9px] border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.97]"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
