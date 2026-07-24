import Link from "next/link";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";
import Divider from "@/components/layout/Divider";
import DemoCard from "@/components/motion/DemoCard";
import SquashStretchDemo from "@/components/motion/principles/SquashStretchDemo";
import AnticipationDemo from "@/components/motion/principles/AnticipationDemo";
import StagingDemo from "@/components/motion/principles/StagingDemo";
import StraightAheadPoseDemo from "@/components/motion/principles/StraightAheadPoseDemo";
import FollowThroughDemo from "@/components/motion/principles/FollowThroughDemo";
import SlowInOutDemo from "@/components/motion/principles/SlowInOutDemo";
import ArcsDemo from "@/components/motion/principles/ArcsDemo";
import SecondaryActionDemo from "@/components/motion/principles/SecondaryActionDemo";
import TimingDemo from "@/components/motion/principles/TimingDemo";
import ExaggerationDemo from "@/components/motion/principles/ExaggerationDemo";
import SolidDrawingDemo from "@/components/motion/principles/SolidDrawingDemo";
import AppealDemo from "@/components/motion/principles/AppealDemo";

const linkClass = "underline decoration-accent/50 underline-offset-4 hover:decoration-accent";

export const metadata = {
  title: "12 Principles of Animation",
  description:
    "Disney's 12 principles of animation, translated into interface motion: squash and stretch, anticipation, arcs, and nine more, each with a live UI demo.",
  alternates: { canonical: `${baseUrl}motion/principles` },
  openGraph: {
    title: "12 Principles of Animation",
    description: "Disney's rules, applied to UI",
    images: [
      {
        url: ogUrl({
          title: "12 Principles of Animation",
          subtitle: "Disney's rules, applied to UI",
          type: "generic",
          label: "Motion",
        }),
      },
    ],
  },
};

export default function MotionPrinciplesPage() {
  return (
    <main className="py-8 md:py-12">
      <Section number="00" label="library" title="12 principles of animation" width="reading">
        <p className="text-muted-foreground">
          In 1981, Disney animators Frank Thomas and Ollie Johnston published{" "}
          <em>The Illusion of Life</em>, distilling decades of hand-drawn animation into twelve
          principles: rules for making drawings feel like they have weight, intention, and
          momentum. They were written for cel animation, but they describe physics, not pencils.
        </p>
        <p className="mt-3 text-muted-foreground">
          Interfaces move through the same physics. A button that squashes on press, a menu that
          anticipates its own opening, a card that settles into place instead of stopping dead:
          all of it is the same twelve ideas, applied to divs instead of drawings. Below, each
          principle gets its original definition, its interface translation, and a live demo
          pulled from{" "}
          <Link href="/motion" className={linkClass}>
            this site&apos;s own motion system
          </Link>
          .
        </p>
      </Section>
      <Divider />

      <Section number="01" label="principle" title="Squash and stretch" width="reading">
        <p className="text-muted-foreground">
          The original principle: a ball flattens as it hits the ground and elongates as it
          rebounds, and that deformation is what sells mass and rigidity before the eye ever
          registers speed.
        </p>
        <p className="mt-3 text-muted-foreground">
          On screen, squash and stretch shows up as a scale wobble on press or on arrival: a
          button compresses under the cursor, a card overshoots slightly as it lands. The
          deformation has to be small and the volume has to hold, or the element stops feeling
          solid.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard title="Squash and stretch" engine="motion/react" tokens={["duration.hero", "ease.out"]}>
            <SquashStretchDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: past a few percent it stops reading as weight and starts reading as cartoon.
        </p>
      </Section>
      <Divider />

      <Section number="02" label="principle" title="Anticipation" width="reading">
        <p className="text-muted-foreground">
          Before the big move, animators draw a small move the other way: the golfer draws the
          club back before swinging through. The wind-up tells the eye where to look and makes
          the payoff read as caused, not sudden.
        </p>
        <p className="mt-3 text-muted-foreground">
          A destructive action earns the same courtesy. A delete button that dips or tightens for
          a beat before the item leaves gives the eye a half-second of warning, and gives the user
          a last chance to see it coming.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard
            title="Anticipation"
            engine="motion/react"
            tokens={["x keyframes", "ease.out"]}
            replayable={false}
            hint="click delete"
          >
            <AnticipationDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: a wind-up that is too long makes the interface feel hesitant.
        </p>
      </Section>
      <Divider />

      <Section number="03" label="principle" title="Staging" width="reading">
        <p className="text-muted-foreground">
          Staging is choosing what the eye looks at. A good animator stages a scene so there is
          never a question of where attention should go, by isolating the one thing that matters
          and quieting everything else.
        </p>
        <p className="mt-3 text-muted-foreground">
          In UI, staging is a hover or a selection dimming the rest of a list so the chosen card
          comes forward on its own. It costs nothing to build and it is the fastest way to make an
          interface feel directed instead of noisy.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard
            title="Staging"
            engine="motion/react"
            tokens={["duration.base", "blur(2px)"]}
            replayable={false}
            hint="click a card"
          >
            <StagingDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">Caution: if everything is emphasized, nothing is.</p>
      </Section>
      <Divider />

      <Section number="04" label="principle" title="Straight ahead and pose to pose" width="reading">
        <p className="text-muted-foreground">
          Two ways to animate: draw every frame in sequence and let the motion discover itself
          (straight ahead), or plan the key poses first and fill the frames between them (pose to
          pose). One is spontaneous, the other is controlled.
        </p>
        <p className="mt-3 text-muted-foreground">
          A spring is the straight-ahead engine: it settles wherever physics takes it, which feels
          alive but is hard to time exactly. A tween between two states is pose to pose: it hits an
          exact frame at an exact millisecond, which is predictable but can feel stiff.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard title="Straight ahead and pose to pose" engine="motion/react" tokens={["duration.slow", "spring.pop"]}>
            <StraightAheadPoseDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: springs feel alive but resist precise timing, tweens are the reverse.
        </p>
      </Section>
      <Divider />

      <Section number="05" label="principle" title="Follow through and overlapping action" width="reading">
        <p className="text-muted-foreground">
          When a body stops, not everything stops at once: hair and clothing keep moving for a
          beat after the torso settles. That lag between the parts is what makes a stop look like
          the end of a motion instead of a freeze frame.
        </p>
        <p className="mt-3 text-muted-foreground">
          A list of items animating in one after another, each trailing the one before it by a
          few milliseconds, is overlapping action. Icons, labels, and badges settling on their own
          slightly staggered springs is follow through, applied to a component instead of a
          character.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard title="Follow through and overlapping action" engine="motion/react" tokens={["spring.pop", "stagger.loose"]}>
            <FollowThroughDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: overlap adds life, but too much lag looks like lag.
        </p>
      </Section>
      <Divider />

      <Section number="06" label="principle" title="Slow in and slow out" width="reading">
        <p className="text-muted-foreground">
          Nothing in the physical world starts or stops at a constant speed. Animators cluster
          more drawings near the beginning and end of a move and fewer in the middle, so motion
          eases into and out of its poses instead of snapping between them.
        </p>
        <p className="mt-3 text-muted-foreground">
          This is the single most load-bearing principle for interfaces, and the one most often
          skipped: a linear transition, all speed and no taper, is usually the fastest way to make
          a UI feel unfinished. An eased curve, even a subtle one, is what makes motion read as
          designed.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard title="Slow in and slow out" engine="motion/react" tokens={["ease.out", "ease.expo", "linear"]}>
            <SlowInOutDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: linear motion is the tell of an unconsidered animation.
        </p>
      </Section>
      <Divider />

      <Section number="07" label="principle" title="Arcs" width="reading">
        <p className="text-muted-foreground">
          Living things do not move in straight lines. A thrown ball, a swinging arm, a turning
          head: all of it travels an arc, because joints rotate and gravity curves a trajectory.
          Animators plot motion along that curve on purpose.
        </p>
        <p className="mt-3 text-muted-foreground">
          A tooltip or a dropdown that travels a slight curve on its way to its resting position,
          instead of a straight vertical or horizontal line, borrows the same trick. The path
          costs a few extra keyframes and buys back the sense that something moved rather than
          teleported.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard title="Arcs" engine="motion/react" tokens={["y keyframes", "ease.out"]}>
            <ArcsDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: straight-line motion feels mechanical because real things travel in arcs.
        </p>
      </Section>
      <Divider />

      <Section number="08" label="principle" title="Secondary action" width="reading">
        <p className="text-muted-foreground">
          A secondary action is a smaller motion that supports the main one without stealing focus
          from it: a character whistling while they walk. It adds richness to a scene that is
          already doing its primary job correctly.
        </p>
        <p className="mt-3 text-muted-foreground">
          A like button that fills in while a small burst of particles fires around it is a
          secondary action layered on a primary state change. The heart filling is the message,
          the particles are the flourish, and the flourish only works because it never arrives
          first.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard
            title="Secondary action"
            engine="motion/react"
            tokens={["spring.pop", "particles"]}
            replayable={false}
            hint="click the heart"
          >
            <SecondaryActionDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: secondary motion supports the main action, it never competes with it.
        </p>
      </Section>
      <Divider />

      <Section number="09" label="principle" title="Timing" width="reading">
        <p className="text-muted-foreground">
          Timing is how many frames a move takes, and it is the difference between a boulder and a
          bird: the same arc animated over two frames reads as light and fast, animated over
          twenty it reads as heavy and slow. The drawings can be identical, only the count changes
          the meaning.
        </p>
        <p className="mt-3 text-muted-foreground">
          A menu that opens in 120ms and a modal that opens in 300ms are communicating different
          weight on purpose: the menu is disposable and immediate, the modal is a bigger
          interruption and earns a slower entrance. Swap their durations and both start to feel
          wrong even though nothing else changed.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard
            title="Timing"
            engine="motion/react"
            tokens={["duration.fast", "duration.hero"]}
            replayable={false}
            hint="open both"
          >
            <TimingDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: the same motion at the wrong speed reads as broken.
        </p>
      </Section>
      <Divider />

      <Section number="10" label="principle" title="Exaggeration" width="reading">
        <p className="text-muted-foreground">
          Animation is not a copy of reality, it is a caricature of it: an emotion or an impact is
          pushed slightly past what actually happened so the audience feels it as strongly as the
          character does. Restraint reads as nothing; a touch too much reads as intent.
        </p>
        <p className="mt-3 text-muted-foreground">
          An error state that shakes a form field harder than a real bump would ever warrant is
          exaggeration doing its job: the wrongness of a mistyped PIN needs to be felt, not just
          noted in red text underneath. The shake is disproportionate on purpose.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard
            title="Exaggeration"
            engine="motion/react"
            tokens={["x keyframes", "border-destructive"]}
            replayable={false}
            hint="submit a wrong pin"
          >
            <ExaggerationDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: exaggerate the signal, not the whole interface.
        </p>
      </Section>
      <Divider />

      <Section number="11" label="principle" title="Solid drawing" width="reading">
        <p className="text-muted-foreground">
          Solid drawing means a character has real volume and weight in three dimensions, even
          though it is drawn on a flat sheet of paper. Animators check every pose from an implied
          camera to make sure nothing looks like a paper cutout.
        </p>
        <p className="mt-3 text-muted-foreground">
          A card that tilts in perspective as the pointer moves across it borrows the same
          conviction: a flat rectangle briefly behaves like an object with a front and a back,
          catching a highlight as it turns. It is a small trick that makes an interface feel like
          it occupies space rather than sitting on glass.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard
            title="Solid drawing"
            engine="motion/react"
            tokens={["perspective", "useSpring"]}
            replayable={false}
            hint="move your pointer"
          >
            <SolidDrawingDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: 3D depth is a spice, and a flat interface tilting too hard feels gimmicky.
        </p>
      </Section>
      <Divider />

      <Section number="12" label="principle" title="Appeal" width="reading">
        <p className="text-muted-foreground">
          Appeal is not about being cute or pretty, it is about being watchable: a design the eye
          wants to keep looking at, built from clarity and charisma rather than decoration.
          Thomas and Johnston considered it the hardest principle to teach because it is really a
          verdict on all the others.
        </p>
        <p className="mt-3 text-muted-foreground">
          A save button that confirms with a quiet checkmark swap instead of a loud banner is
          appealing because it trusts the user and gets out of the way. Appeal in an interface is
          the moment eleven small decisions about weight, timing, and staging stop being visible
          as technique and start feeling like good taste.
        </p>
        <Bento className="mt-8 grid-cols-1">
          <DemoCard
            title="Appeal"
            engine="motion/react"
            tokens={["duration.med", "AnimatePresence"]}
            replayable={false}
            hint="click save"
          >
            <AppealDemo />
          </DemoCard>
        </Bento>
        <p className="mt-4 text-sm text-subtle">
          Caution: appeal is the sum of the other eleven done with restraint, not an effect you add
          on top.
        </p>
      </Section>
      <Divider />

      <p className="mx-auto max-w-[760px] px-6 py-10 text-sm text-muted-foreground md:py-14">
        See the underlying tokens on the{" "}
        <Link href="/motion" className={linkClass}>
          motion system page
        </Link>
        .
      </p>
    </main>
  );
}
