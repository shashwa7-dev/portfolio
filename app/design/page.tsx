import Link from "next/link";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";
import Section from "@/components/layout/Section";
import Label from "@/components/layout/Label";
import Bento from "@/components/layout/Bento";
import Divider from "@/components/layout/Divider";
import StackIcon from "@/components/common/StackIcon";
import Marker from "@/components/common/Marker";

export const metadata = {
  title: "Design System",
  description:
    "The color tokens, typography, spacing, layout primitives, and motion guidelines behind this portfolio.",
  alternates: { canonical: `${baseUrl}design` },
  openGraph: {
    title: "Design System",
    description:
      "The color tokens, typography, spacing, layout primitives, and motion guidelines behind this portfolio.",
    images: [
      {
        url: ogUrl({
          title: "Design System",
          subtitle: "The system behind this site",
          type: "generic",
          label: "Design",
        }),
      },
    ],
  },
};

// ─── small helpers (no hooks, so server-safe) ─────────────────────────────────

function SwatchRow({
  bg,
  name,
  hex,
  use,
}: {
  bg: string;
  name: string;
  hex: string;
  use: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`h-12 w-12 shrink-0 rounded-xl border border-border-strong ${bg}`}
      />
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-foreground">{name}</p>
        <p className="font-mono text-[10px] text-subtle">{hex}</p>
        <p className="text-xs text-muted-foreground">{use}</p>
      </div>
    </div>
  );
}

function TypeRow({
  label,
  classNames,
  children,
}: {
  label: string;
  classNames: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-4 last:border-0">
      <div className={classNames}>{children}</div>
      <div className="flex flex-wrap gap-2">
        <Label>{label}</Label>
        <code className="font-mono text-[10px] text-subtle">{classNames}</code>
      </div>
    </div>
  );
}

function SpacingBar({ size, label }: { size: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`h-5 bg-accent/30 border border-accent/50 rounded ${size}`}
      />
      <span className="font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function RadiusSwatch({
  radius,
  label,
}: {
  radius: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`h-14 w-14 bg-card border border-border ${radius}`}
      />
      <span className="font-mono text-[10px] text-subtle">{label}</span>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DesignPage() {
  return (
    <main className="relative py-8 md:py-12">
      {/* Intro — zero only the TOP padding so main's py-8/12 controls spacing
          against the nav; keep Section's bottom padding so the Divider below
          isn't flush against the paragraph. */}
      <Section width="reading" className="pt-0 md:pt-0">
        <div className="space-y-4">
          <Label>Design System</Label>
          <h1 className="font-serif text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em] text-foreground">
            The system behind this site
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-prose">
            Every color, typeface, spacing step, and interaction on this
            portfolio is driven by the tokens and primitives documented here.
            The full reference lives in{" "}
            <span className="font-mono text-[13px] text-foreground">
              <Marker variant="marker">docs/design-system.md</Marker>
            </span>{" "}
            and a reusable Claude Code skill in{" "}
            <Link
              href="/skills/design-system"
              className="font-mono text-[13px] text-foreground transition-colors hover:text-accent"
            >
              <Marker variant="marker" delay={0.15}>
                .claude/skills/design-system/SKILL.md
              </Marker>
            </Link>
            . Feel free to learn from, fork, or adapt any of it.
          </p>
        </div>
      </Section>

      <Divider />

      {/* 01 Color */}
      <Section
        number="01"
        label="Color"
        title="Graphite + Indigo"
        width="reading"
      >
        <p className="mb-8 text-sm text-muted-foreground">
          All colors are CSS custom properties exposed as Tailwind tokens. Dark
          mode (graphite) is the default; light mode mirrors the same semantic
          roles with brighter values. Use semantic tokens, never raw hex in
          components.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SwatchRow
            bg="bg-background"
            name="bg-background"
            hex="#0B0B0F (dark) / #FAFAFF (light)"
            use="Page background"
          />
          <SwatchRow
            bg="bg-card"
            name="bg-card"
            hex="#15151B (dark) / #FFFFFF (light)"
            use="Card and panel surfaces"
          />
          <SwatchRow
            bg="bg-elevated"
            name="bg-elevated"
            hex="#1C1C24 (dark) / #F3F3F9 (light)"
            use="Elevated overlays and popovers"
          />
          <SwatchRow
            bg="bg-muted"
            name="bg-muted"
            hex="#232330 (dark) / #F3F3F9 (light)"
            use="Muted / low-emphasis backgrounds"
          />
          <SwatchRow
            bg="bg-border"
            name="bg-border"
            hex="#232330 (dark) / #E5E5F0 (light)"
            use="Default hairline borders"
          />
          <SwatchRow
            bg="bg-foreground"
            name="bg-foreground"
            hex="#EDEDEF (dark) / #17171A (light)"
            use="Primary text and icons"
          />
          <SwatchRow
            bg="bg-accent"
            name="bg-accent"
            hex="#6E6BF2 (dark) / #5B58DD (light)"
            use="Brand accent, CTAs, highlights"
          />
          <SwatchRow
            bg="bg-accent-hover"
            name="bg-accent-hover"
            hex="#807DF5 (dark) / #6E6BF2 (light)"
            use="Accent on hover"
          />
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle mb-3">
            Additional semantic tokens
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { token: "text-muted-foreground", role: "Secondary text" },
              { token: "text-subtle", role: "Tertiary / placeholder" },
              { token: "border-strong", role: "Emphasized borders" },
              { token: "text-accent", role: "Brand links / labels" },
              { token: "bg-secondary", role: "Chip backgrounds" },
              { token: "text-destructive", role: "Error states" },
            ].map(({ token, role }) => (
              <div key={token} className="space-y-0.5">
                <code className="font-mono text-[10px] text-foreground">
                  {token}
                </code>
                <p className="text-[11px] text-muted-foreground">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* 02 Typography */}
      <Section
        number="02"
        label="Type"
        title="Three families, one voice"
        width="reading"
      >
        <p className="mb-6 text-sm text-muted-foreground">
          Fraunces (variable serif) for display and headings, Inter for
          body and UI, JetBrains Mono for code labels and eyebrows. All
          are loaded via Next.js font optimization with{" "}
          <code className="font-mono text-[12px] bg-card px-1 py-0.5 rounded border border-border">
            font-display: swap
          </code>
          .
        </p>

        {/* Family blocks */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { family: "Fraunces", cls: "font-serif", role: "Headings" },
            { family: "Inter", cls: "font-sans", role: "Body / UI" },
            { family: "JetBrains Mono", cls: "font-mono", role: "Code / Labels" },
          ].map(({ family, cls, role }) => (
            <div
              key={family}
              className="rounded-xl border border-border bg-card px-5 py-4"
            >
              <p
                className={`${cls} text-xl text-foreground leading-none mb-2`}
              >
                Aa
              </p>
              <p className="text-xs text-foreground font-medium">{family}</p>
              <p className="text-[11px] text-muted-foreground">{role}</p>
              <code className="font-mono text-[10px] text-subtle">{cls}</code>
            </div>
          ))}
        </div>

        {/* Type scale */}
        <div>
          <TypeRow
            label="Display"
            classNames="font-serif text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em] text-foreground"
          >
            The craft of software
          </TypeRow>
          <TypeRow
            label="H2"
            classNames="font-serif text-2xl md:text-[1.75rem] text-foreground"
          >
            Section heading
          </TypeRow>
          <TypeRow
            label="H3"
            classNames="font-serif text-xl text-foreground"
          >
            Sub-section heading
          </TypeRow>
          <TypeRow
            label="Body lede"
            classNames="text-lg text-muted-foreground leading-relaxed"
          >
            A larger intro paragraph to ease readers in.
          </TypeRow>
          <TypeRow
            label="Body"
            classNames="text-base text-muted-foreground"
          >
            Regular body copy at 16px with a 1.65 line-height for comfortable
            reading on both desktop and mobile.
          </TypeRow>
          <TypeRow
            label="Small"
            classNames="text-sm text-muted-foreground"
          >
            Captions, helper text, timestamps.
          </TypeRow>
          <TypeRow
            label="Mono label"
            classNames="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle"
          >
            Section eyebrow / label
          </TypeRow>
        </div>
      </Section>

      <Divider />

      {/* 03 Spacing */}
      <Section
        number="03"
        label="Spacing"
        title="4px grid, generous rhythm"
        width="reading"
      >
        <p className="mb-8 text-sm text-muted-foreground">
          All spacing follows Tailwind's 4px base. Sections use{" "}
          <code className="font-mono text-[12px] bg-card px-1 py-0.5 rounded border border-border">
            py-10 md:py-14
          </code>{" "}
          (~40-56px) vertical padding, creating a calm reading rhythm. Component
          gaps use multiples of 4px.
        </p>

        {/* Spacing bars */}
        <div className="mb-8 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle mb-4">
            Gap scale
          </p>
          <SpacingBar size="w-2" label="gap-2 / 8px" />
          <SpacingBar size="w-4" label="gap-4 / 16px" />
          <SpacingBar size="w-6" label="gap-6 / 24px" />
          <SpacingBar size="w-8" label="gap-8 / 32px" />
          <SpacingBar size="w-12" label="gap-12 / 48px" />
          <SpacingBar size="w-16" label="gap-16 / 64px" />
        </div>

        {/* Radius */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle mb-4">
            Border radius
          </p>
          <div className="flex flex-wrap gap-6">
            <RadiusSwatch radius="rounded" label="rounded / 4px" />
            <RadiusSwatch radius="rounded-md" label="rounded-md" />
            <RadiusSwatch radius="rounded-lg" label="rounded-lg (--radius)" />
            <RadiusSwatch radius="rounded-xl" label="rounded-xl" />
            <RadiusSwatch radius="rounded-2xl" label="rounded-2xl" />
            <RadiusSwatch radius="rounded-full" label="rounded-full" />
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            <code className="font-mono bg-card px-1 py-0.5 rounded border border-border">
              --radius: 0.75rem
            </code>{" "}
            (CSS custom property). Cards use{" "}
            <code className="font-mono bg-card px-1 py-0.5 rounded border border-border">
              rounded-2xl
            </code>
            , buttons use{" "}
            <code className="font-mono bg-card px-1 py-0.5 rounded border border-border">
              rounded-full
            </code>
            .
          </p>
        </div>
      </Section>

      <Divider />

      {/* 04 Primitives */}
      <Section
        number="04"
        label="Primitives"
        title="Layout building blocks"
        width="reading"
      >
        <p className="mb-8 text-sm text-muted-foreground">
          Four server-safe primitives handle nearly all layout needs. They live
          in{" "}
          <code className="font-mono text-[12px] bg-card px-1 py-0.5 rounded border border-border">
            components/layout/
          </code>
          .
        </p>

        {/* Primitive docs */}
        <div className="mb-8 space-y-4">
          {[
            {
              name: "Container",
              props: 'width="reading" | "wide"',
              desc:
                "Centers content. reading = 760px max-width for prose; wide = 1080px for full layouts.",
            },
            {
              name: "Section",
              props: "number, label, title, width, action",
              desc:
                "Wraps a Container with py-10/md:py-14 rhythm and an optional numbered eyebrow + serif h2 header.",
            },
            {
              name: "Bento",
              props: "className (grid cols/rows)",
              desc:
                "A grid wrapper with hairline border and 1px gap rendered via bg-border. Use for feature card grids.",
            },
            {
              name: "Divider",
              props: "(none)",
              desc:
                "A full-width faded hairline (gradient from transparent to border-strong to transparent) separating sections.",
            },
          ].map(({ name, props, desc }) => (
            <div
              key={name}
              className="rounded-xl border border-border bg-card p-5 space-y-1"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-sm text-foreground font-medium">
                  {name}
                </span>
                <code className="font-mono text-[10px] text-subtle">
                  {props}
                </code>
              </div>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* Live Bento example */}
        <div className="mb-4">
          <Label className="mb-3 block">Live Bento example</Label>
          <Bento className="grid-cols-1 sm:grid-cols-3">
            <div className="bg-card p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle mb-2">
                Cell A
              </p>
              <p className="text-sm text-muted-foreground">
                Any content goes here. The 1px gap between cells is the
                bg-border color.
              </p>
            </div>
            <div className="bg-card p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle mb-2">
                Cell B
              </p>
              <p className="text-sm text-muted-foreground">
                Cells share a parent overflow-hidden rounded-2xl container.
              </p>
            </div>
            <div className="bg-card p-6 flex items-center justify-center">
              <span className="font-serif text-3xl text-muted-foreground/30">
                C
              </span>
            </div>
          </Bento>
        </div>

        {/* Live Divider example */}
        <div className="mt-8">
          <Label className="mb-3 block">Live Divider</Label>
          <Divider />
        </div>
      </Section>

      <Divider />

      {/* 05 Components */}
      <Section
        number="05"
        label="Components"
        title="UI patterns"
        width="reading"
      >
        <p className="mb-8 text-sm text-muted-foreground">
          These patterns are composed from the tokens above. Prefer these shapes
          when adding new UI so the visual language stays consistent.
        </p>

        <div className="space-y-8">
          {/* Buttons */}
          <div>
            <Label className="mb-4 block">Buttons</Label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                Primary action
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-transparent px-5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Ghost action
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Secondary action
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              <code className="font-mono text-[10px] text-subtle">
                bg-accent rounded-full text-accent-foreground
              </code>
              <code className="font-mono text-[10px] text-subtle">
                border-border-strong rounded-full
              </code>
              <code className="font-mono text-[10px] text-subtle">
                bg-muted rounded-full
              </code>
            </div>
          </div>

          {/* Label + Badge */}
          <div>
            <Label className="mb-4 block">Labels and badges</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Label>Eyebrow label</Label>
              <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                Badge
              </span>
              <span className="rounded-full border border-border-strong px-3 py-1 text-xs text-muted-foreground">
                Chip
              </span>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Tag
              </span>
            </div>
          </div>

          {/* StackIcon chips */}
          <div>
            <Label className="mb-4 block">StackIcon chips</Label>
            <div className="flex flex-wrap gap-2">
              <StackIcon name="react" />
              <StackIcon name="typescript" />
              <StackIcon name="tailwind" />
              <StackIcon name="next" />
              <StackIcon name="motion" />
              <StackIcon name="figma" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Import from{" "}
              <code className="font-mono bg-card px-1 rounded border border-border">
                components/common/StackIcon
              </code>
              . Pass a{" "}
              <code className="font-mono bg-card px-1 rounded border border-border">
                name: StackName
              </code>{" "}
              and optionally{" "}
              <code className="font-mono bg-card px-1 rounded border border-border">
                showLabel={false}
              </code>{" "}
              for icon-only.
            </p>
          </div>

          {/* Links */}
          <div>
            <Label className="mb-4 block">Inline links</Label>
            <p className="text-sm text-muted-foreground">
              Text with an{" "}
              <a
                href="#"
                className="text-foreground underline decoration-accent/50 underline-offset-4 transition-all hover:decoration-accent"
              >
                accent-tinted underline
              </a>{" "}
              that deepens on hover. This is the default prose link style.
            </p>
            <code className="mt-2 block font-mono text-[10px] text-subtle">
              underline decoration-accent/50 underline-offset-4 hover:decoration-accent
            </code>
          </div>

          {/* Input */}
          <div>
            <Label className="mb-4 block">Text input</Label>
            <input
              type="text"
              placeholder="Focus to see ring..."
              className="w-full max-w-sm rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none ring-ring/0 transition-all focus:ring-2 focus:ring-ring/60"
              readOnly
            />
            <code className="mt-2 block font-mono text-[10px] text-subtle">
              border-border bg-card focus:ring-2 focus:ring-ring/60
            </code>
          </div>
        </div>
      </Section>

      <Divider />

      {/* 06 Motion */}
      <Section
        number="06"
        label="Motion"
        title="Purposeful, not decorative"
        width="reading"
      >
        <p className="mb-6 text-sm text-muted-foreground">
          Animations guide attention and confirm interactions. They are kept
          short (200-400ms) and always respect{" "}
          <code className="font-mono text-[12px] bg-card px-1 py-0.5 rounded border border-border">
            prefers-reduced-motion
          </code>
          , which collapses all durations to 0.01ms.
        </p>

        <div className="space-y-4">
          {[
            {
              name: "Primary easing",
              value: "cubic-bezier(0.22, 1, 0.36, 1)",
              note: "--ease-out. Fast start, smooth settle. Used for entrances.",
            },
            {
              name: "In-out easing",
              value: "cubic-bezier(0.77, 0, 0.175, 1)",
              note: "--ease-in-out. Slow start and end. Used for transitions between states.",
            },
            {
              name: "Spring easing",
              value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              note: "--ease-spring. Slight overshoot. Used for playful micro-interactions.",
            },
            {
              name: "Duration range",
              value: "200ms - 400ms",
              note: "200ms for hover/micro; 300-400ms for layout and reveal animations.",
            },
            {
              name: "Stagger",
              value: "~60ms per item",
              note: "List items and grid cells stagger with a ~60ms delay between each.",
            },
            {
              name: "Hover lifts",
              value: "translateY(-2px)",
              note: "Cards and interactive tiles lift 2px on hover to indicate affordance.",
            },
          ].map(({ name, value, note }) => (
            <div
              key={name}
              className="rounded-xl border border-border bg-card p-4 space-y-1"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-sm font-medium text-foreground">
                  {name}
                </span>
                <code className="font-mono text-[11px] text-accent">
                  {value}
                </code>
              </div>
              <p className="text-[13px] text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/40 px-5 py-4">
          <p className="text-[13px] text-muted-foreground">
            All motion is powered by{" "}
            <strong className="text-foreground font-medium">
              Motion (Framer Motion)
            </strong>{" "}
            via the{" "}
            <code className="font-mono text-[11px] bg-card px-1 rounded border border-border">
              Reveal
            </code>{" "}
            primitive in{" "}
            <code className="font-mono text-[11px] bg-card px-1 rounded border border-border">
              components/layout/Reveal.tsx
            </code>
            . Wrap any element in{" "}
            <code className="font-mono text-[11px] bg-card px-1 rounded border border-border">
              &lt;Reveal&gt;
            </code>{" "}
            to get a fade-up on first viewport entry.
          </p>
        </div>
      </Section>

      <Divider />

      {/* Footer note */}
      <Section width="reading" className="pt-8 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            All tokens live in{" "}
            <code className="font-mono text-[12px] bg-card px-1.5 py-0.5 rounded border border-border">
              app/globals.css
            </code>{" "}
            and{" "}
            <code className="font-mono text-[12px] bg-card px-1.5 py-0.5 rounded border border-border">
              tailwind.config.ts
            </code>
            .
          </p>
        </div>
      </Section>
    </main>
  );
}
