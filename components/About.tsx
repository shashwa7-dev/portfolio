import Image from "next/image";
import { Check, ArrowRight, Mail } from "lucide-react";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import Bento from "@/components/layout/Bento";
import HeroTitle from "@/components/HeroTitle";
import Marker from "@/components/common/Marker";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { clients } from "@/lib/clients";

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
    <header className="pt-14 pb-6 md:pt-20">
      <Container width="reading">
        <div className="space-y-6">
          {/* identity block */}
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/apple-touch-icon.png"
                  alt="Shashwat Tripathi"
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-white ring-[3px] ring-background"
                title="Verified engineer"
                aria-label="Verified"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </div>
            <div>
              <div className="text-[17px] font-semibold leading-tight text-foreground">
                Shashwat Tripathi
              </div>
              <div className="mt-0.5">
                <Label>Frontend Engineer · AI · Web3</Label>
              </div>
            </div>
          </div>

          {/* availability pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border-strong px-3.5 py-1.5 text-[13px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
            Available for frontend / full-stack roles &amp; freelance
          </div>

          {/* headline */}
          <HeroTitle />

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

          {/* worked with — brand logo avatars (aligned row) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm text-muted-foreground">
              Worked with{" "}
              <span className="font-semibold text-foreground">
                {clients.length}+ brands
              </span>
            </span>
            <TooltipProvider delayDuration={150}>
              <div className="flex items-center">
                {clients.map((c, i) => (
                  <Tooltip key={c.name}>
                    <TooltipTrigger asChild>
                      <span
                        className={`group relative h-6 w-6 overflow-hidden rounded-full bg-secondary ring-2 ring-background transition-[transform,box-shadow,outline-color] duration-200 ease-out outline outline-1 outline-border hover:z-10 hover:-translate-y-1 hover:scale-110 hover:outline-accent hover:shadow-md sm:h-7 sm:w-7 ${
                          i > 0 ? "-ml-2 sm:-ml-2.5" : ""
                        }`}
                      >
                        <Image
                          src={c.img}
                          alt={c.name}
                          fill
                          sizes="(max-width: 640px) 28px, 32px"
                          className="object-cover transition-[filter,opacity,transform] duration-300 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{c.name}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>

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
                              className="object-cover grayscale opacity-80"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{org.name}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
                <div className="font-serif text-2xl text-foreground">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.c}</div>
              </div>
            ))}
          </Bento>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#experience"
              className="inline-flex items-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              View selected work <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:contact@shashwa7.in"
              className="inline-flex items-center gap-2 rounded-[9px] border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-elevated"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
