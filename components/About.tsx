import Image from "next/image";
import { Check, ArrowRight, Mail } from "lucide-react";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import Reveal from "@/components/layout/Reveal";
import Bento from "@/components/layout/Bento";
import { clients } from "@/lib/clients";

const stats = [
  { n: "1M+", c: "users reached" },
  { n: "100K", c: "day-one mints" },
  { n: "9+", c: "products shipped" },
  { n: "4+ yrs", c: "building frontend" },
];

export default function About() {
  return (
    <header className="pt-14 pb-6 md:pt-20">
      <Container width="reading">
        <Reveal className="space-y-6">
          {/* identity block */}
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/apple-touch-icon.png" alt="Shashwat Tripathi" className="h-full w-full object-cover" />
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
              <div className="text-[17px] font-semibold text-foreground">Shashwat Tripathi</div>
              <div className="mt-1"><Label>Frontend Engineer · Web3 · AI</Label></div>
            </div>
          </div>

          {/* availability pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border-strong px-3.5 py-1.5 text-[13px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
            Available for frontend / full-stack roles &amp; freelance
          </div>

          {/* headline */}
          <h1 className="font-serif text-[clamp(2.2rem,5.5vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
            I build interfaces that <span className="italic text-accent-hover">ship and scale</span> to millions.
          </h1>

          {/* lede (no em-dashes) */}
          <p className="max-w-[56ch] text-lg text-muted-foreground">
            I&apos;m Shashwat, a frontend engineer who&apos;s shipped 9+ production products with top Web3 and AI teams. I turn complex ideas into fast, polished, accessible UIs. Reach me at{" "}
            <a href="mailto:contact@shashwa7.in" className="text-foreground underline decoration-accent underline-offset-4 hover:decoration-2">
              contact@shashwa7.in
            </a>.
          </p>

          {/* worked with — brand logo avatars (aligned row) */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Worked with</span>
            <div className="flex items-center">
              {clients.map((c, i) => (
                <span
                  key={c.name}
                  title={c.name}
                  className={`group relative h-7 w-7 overflow-hidden rounded-full bg-secondary ring-2 ring-background ${i > 0 ? "-ml-2" : ""}`}
                >
                  <Image src={c.img} alt={c.name} fill sizes="28px" className="object-cover grayscale transition-[filter] duration-300 hover:grayscale-0" />
                </span>
              ))}
            </div>
          </div>

          {/* stats */}
          <Bento className="grid-cols-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.c} className="bg-card px-4 py-3.5">
                <div className="font-serif text-2xl text-foreground">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.c}</div>
              </div>
            ))}
          </Bento>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a href="/#projects" className="inline-flex items-center gap-2 rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover">
              View selected work <ArrowRight className="h-4 w-4" />
            </a>
            <a href="mailto:contact@shashwa7.in" className="inline-flex items-center gap-2 rounded-[9px] border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-elevated">
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>
        </Reveal>
      </Container>
    </header>
  );
}
