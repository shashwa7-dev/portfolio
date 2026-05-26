import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import Reveal from "@/components/layout/Reveal";
import Bento from "@/components/layout/Bento";

const stats = [
  { n: "1M+", c: "users reached" },
  { n: "9+", c: "products shipped" },
  { n: "4+ yrs", c: "building frontend" },
  { n: "3", c: "major-brand partners" },
];

export default function About() {
  return (
    <header className="pt-14 pb-6 md:pt-20">
      <Container width="reading">
        <Reveal className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/apple-touch-icon.png" alt="Shashwat Tripathi" className="h-full w-full object-cover" />
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
              Available for senior frontend / full-stack &amp; freelance
            </span>
          </div>

          <div className="space-y-3">
            <Label>Frontend Engineer · Web3 · AI</Label>
            <h1 className="font-serif text-[clamp(2.2rem,5.5vw,3.4rem)] font-medium leading-[1.03] tracking-[-0.02em] text-foreground">
              I build interfaces that <span className="italic text-accent-hover">ship and scale</span> to millions.
            </h1>
          </div>

          <p className="max-w-[56ch] text-lg text-muted-foreground">
            I&apos;m Shashwat — a frontend engineer who&apos;s shipped 9+ production products with Coinbase, Polygon &amp; Sentient. I turn complex AI &amp; Web3 ideas into fast, polished, accessible UIs. Reach me at{" "}
            <a href="mailto:contact@shashwa7.in" className="text-foreground underline decoration-accent underline-offset-4 hover:decoration-2">
              contact@shashwa7.in
            </a>.
          </p>

          <Bento className="grid-cols-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.c} className="bg-card px-4 py-3.5">
                <div className="font-serif text-2xl text-foreground">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.c}</div>
              </div>
            ))}
          </Bento>

          <div className="flex flex-wrap items-center gap-3">
            <a href="/#projects" className="rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover">
              View selected work →
            </a>
            <a href="mailto:contact@shashwa7.in" className="rounded-[9px] border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-elevated">
              Get in touch
            </a>
          </div>
        </Reveal>
      </Container>
    </header>
  );
}
