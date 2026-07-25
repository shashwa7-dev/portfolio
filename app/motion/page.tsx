import Link from "next/link";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";
import Divider from "@/components/layout/Divider";
import DemoCard from "@/components/motion/DemoCard";
import EasingDemo from "@/components/motion/EasingDemo";
import DurationDemo from "@/components/motion/DurationDemo";
import RevealStaggerDemo from "@/components/motion/RevealStaggerDemo";
import SpringDemo from "@/components/motion/SpringDemo";
import WordCycleDemo from "@/components/motion/WordCycleDemo";
import TextSwapDemo from "@/components/motion/TextSwapDemo";
import SlidingTabsDemo from "@/components/motion/SlidingTabsDemo";
import PressDemo from "@/components/motion/PressDemo";
import MarkerDrawDemo from "@/components/motion/MarkerDrawDemo";
import AccordionDemo from "@/components/motion/AccordionDemo";

export const metadata = {
  title: "Motion System",
  description:
    "The animation tokens, variants, and interaction patterns behind this portfolio. One scale, two engines: motion/react for state, CSS for hovers.",
  alternates: { canonical: `${baseUrl}motion` },
  openGraph: {
    title: "Motion System",
    description: "The animation system behind this site, live and replayable.",
    images: [
      {
        url: ogUrl({
          title: "Motion System",
          subtitle: "Every animation, one scale",
          type: "generic",
          label: "Motion",
        }),
      },
    ],
  },
};

export default function MotionPage() {
  return (
    <main className="py-8 md:py-12">
      <Section number="01" label="foundation" title="One scale, two engines" width="reading">
        <p className="text-muted-foreground">
          Every animation on this site reads from the same tokens in{" "}
          <code className="rounded bg-card px-1 py-0.5 font-mono text-xs">lib/motionVariants.ts</code>, mirrored as CSS
          variables. motion/react drives anything with state or exits; plain CSS handles hovers and loops. Durations stay
          under 300ms for UI, exits run faster than enters, and keyboard-summoned surfaces barely animate at all.
        </p>
        <p className="mt-4 font-mono text-xs text-subtle">
          Every card below is live. Click a stage to replay it, or interact with the ones that invite it.
        </p>
        <Bento className="mt-10 grid-cols-1 md:mt-12">
          <DemoCard title="Easing curves" engine="motion/react" tokens={["ease.out", "ease.modal", "ease.expo"]} loop>
            <EasingDemo />
          </DemoCard>
          <DemoCard
            title="Duration scale"
            engine="motion/react"
            tokens={["duration.fast → hero"]}
            replayable={false}
          >
            <DurationDemo />
          </DemoCard>
        </Bento>
      </Section>
      <Divider />
      <Section number="02" label="primitives" title="Variants and springs" width="reading">
        <Bento className="grid-cols-1 md:grid-cols-2">
          <DemoCard
            title="Stagger reveal"
            engine="motion/react"
            tokens={["containerVariants", "itemVariants", "stagger.base"]}
          >
            <RevealStaggerDemo />
          </DemoCard>
          <DemoCard
            title="Springs"
            engine="motion/react"
            tokens={["spring.soft", "spring.pop", "spring.hoverIn"]}
            replayable={false}
            hint="click to toggle"
          >
            <SpringDemo />
          </DemoCard>
          <DemoCard
            title="Press feedback"
            engine="CSS"
            tokens={["active:scale-[0.97]", "tapPress"]}
            replayable={false}
            hint="press and hold"
          >
            <PressDemo />
          </DemoCard>
          <DemoCard
            title="Text swap"
            engine="motion/react"
            tokens={["duration.fast", "ease.out", "blur(2px)"]}
            replayable={false}
            hint="click to swap"
          >
            <TextSwapDemo />
          </DemoCard>
        </Bento>
      </Section>
      <Divider />
      <Section number="03" label="in the wild" title="Patterns used on this site" width="reading">
        <Bento className="grid-cols-1 md:grid-cols-2">
          <DemoCard
            title="Hero word cycle"
            engine="CSS"
            tokens={["wordCycle", "ease.expo", "duration.slow"]}
            replayable={false}
            hint="loops continuously"
          >
            <WordCycleDemo />
          </DemoCard>
          <DemoCard title="Marker draw" engine="motion/react" tokens={["duration.draw", "ease.out"]}>
            <MarkerDrawDemo />
          </DemoCard>
          <DemoCard
            title="Sliding tabs"
            engine="motion/react"
            tokens={["layoutId", "duration.base", "ease.out"]}
            replayable={false}
            hint="click a tab"
          >
            <SlidingTabsDemo />
          </DemoCard>
          <DemoCard
            title="Accordion"
            engine="CSS"
            tokens={["grid-template-rows", "duration.med", "ease.out"]}
            replayable={false}
            hint="click to expand"
          >
            <AccordionDemo />
          </DemoCard>
        </Bento>
        <p className="mt-8 text-sm text-muted-foreground">
          Color, type, and spacing live in the{" "}
          <Link href="/design" className="underline decoration-accent/50 underline-offset-4 hover:decoration-accent">
            design system
          </Link>
          . The rules encoding all of this for coding agents ship as skills on the{" "}
          <Link href="/skills" className="underline decoration-accent/50 underline-offset-4 hover:decoration-accent">
            skills page
          </Link>
          . For the theory behind these choices, read the{" "}
          <Link
            href="/motion/principles"
            className="underline decoration-accent/50 underline-offset-4 hover:decoration-accent"
          >
            12 principles applied to UI
          </Link>
          .
        </p>
      </Section>
    </main>
  );
}
