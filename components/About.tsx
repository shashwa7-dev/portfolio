import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import Reveal from "@/components/layout/Reveal";
import ToolsAndStack from "./ToolStack";

export default function About() {
  return (
    <header className="pt-16 pb-8 md:pt-24">
      <Container width="reading">
        <Reveal className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/apple-touch-icon.png" alt="Shashwat Tripathi" className="h-full w-full object-cover" />
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
              Available for freelance &amp; full-time
            </span>
          </div>

          <div className="space-y-3">
            <Label>Frontend Engineer · Full-stack</Label>
            <h1 className="font-serif text-[clamp(2.4rem,6vw,3.6rem)] font-medium leading-[1.03] tracking-[-0.02em] text-foreground">
              I craft <span className="italic text-accent-hover">quality interfaces</span>, end to end.
            </h1>
          </div>

          <p className="max-w-[54ch] text-lg text-muted-foreground">
            Hi, I&apos;m Shashwat — a frontend engineer who works across the stack. I build clean,
            fast, accessible web apps with a focus on great design and seamless UX. Reach me at{" "}
            <a
              href="mailto:contact@shashwa7.in"
              className="text-foreground underline decoration-accent underline-offset-4 hover:decoration-2"
            >
              contact@shashwa7.in
            </a>
            .
          </p>

          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
            Shipped products used by 1M+ · Coinbase · Polygon · Sentient
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#projects"
              className="rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              View selected work →
            </a>
            <a
              href="mailto:contact@shashwa7.in"
              className="rounded-[9px] border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-elevated"
            >
              Get in touch
            </a>
          </div>

          <div className="pt-2">
            <ToolsAndStack />
          </div>
        </Reveal>
      </Container>
    </header>
  );
}
