import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/layout/Container";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, breadcrumbLd } from "@/lib/seo";
import { communities } from "@/lib/coffee";
import { gear } from "@/lib/gear";
import {
  GrindEvennessFigure,
  GrindSizeFigure,
  RatioFigure,
  PortafilterFigure,
  RedditMark,
} from "@/components/shelf/CoffeeFigures";
import RoastExplorer from "@/components/shelf/RoastExplorer";

const DESCRIPTION =
  "How I got into coffee, and the handful of things I wish someone had explained at the start: roast levels, grind size, portafilters, brew ratios, and why instant is fine.";

/**
 * The card gets its own subtitle rather than reusing DESCRIPTION.
 *
 * DESCRIPTION opens by restating the page's name, which is right for a search
 * result, where the snippet has to stand on its own. On the card the title is
 * already set in 76px directly above it, so those first four words were spent
 * saying it again, and the sentence then ran past the clamp and lost "why
 * instant is fine" off the end. This is the same list with the repetition
 * removed, and it fits without truncating.
 */
const COFFEE_OG = ogUrl({
  title: "How I got into coffee",
  subtitle:
    "Roast levels, grind size, portafilters, brew ratios, and why instant is fine.",
  type: "generic",
  label: "Coffee",
  meta: "A long read",
});

export const metadata = {
  title: "How I got into coffee",
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}coffee` },
  openGraph: {
    title: "How I got into coffee",
    description: DESCRIPTION,
    url: `${baseUrl}coffee`,
    images: [{ url: COFFEE_OG }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How I got into coffee",
    description: DESCRIPTION,
    images: [COFFEE_OG],
  },
};

/**
 * The page runs to about 2,800 words, so it needs more than one level of
 * heading to stay navigable. Three levels: a part label that splits the story
 * from the reference material, section headings inside each part, and a
 * subheading for the two places a section needs to break in half.
 *
 * All of it runs on one vertical scale, and every value below comes from it:
 *
 *   16  mt-4   between paragraphs
 *   24  my-6   a block set into the prose: aside, figure, table, list
 *   32  mt-8   a subheading, and the two blocks heavy enough to need the room
 *   48  mt-12  a section heading
 *   96  mt-16 + pt-8 over a rule, a part
 *
 * It was previously nine values between 16 and 112 with no relationship
 * between them, which is what made the gaps read as arbitrary: a section
 * heading sat at 56 and a subheading at 40, close enough that the two levels
 * looked like the same break rendered inconsistently, while both were large
 * enough to strand the text above them. The ladder here roughly doubles at
 * each step, so a reader can tell the levels apart by the space alone.
 */
/**
 * A drawn illustration, as opposed to the SVG diagrams in `CoffeeFigures`.
 *
 * The diagrams explain a mechanism and are drawn in code so they inherit the
 * theme. These are scene illustrations and carry their own labelling inside the
 * picture, which is why the alt text has to restate what the picture says
 * rather than just naming it: a screen reader gets nothing from text baked into
 * a bitmap.
 */
function Illus({
  src,
  alt,
  height = 873,
}: {
  src: string;
  alt: string;
  height?: number;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-border bg-card">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={height}
        sizes="(max-width: 760px) 100vw, 712px"
        className="h-auto w-full"
      />
    </figure>
  );
}

function Part({ label, title }: { label: string; title: string }) {
  return (
    <div data-part className="mt-16 border-t border-border pt-8">
      <p className="font-mono text-2xs uppercase tracking-label text-subtle">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </p>
    </div>
  );
}

/** Section heading with a stable anchor, so the shelf can deep-link into it. */
function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight text-foreground md:text-2xl"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 text-base font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-relaxed text-muted-foreground">{children}</p>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

/**
 * A piece of my gear, named in prose and linked to where I bought it.
 *
 * Resolved from `lib/gear.ts` by slug rather than taking a URL, so the vendor
 * link lives in exactly one place. The shelf timeline reads the same entry, and
 * a moved product page is a one-line fix rather than a hunt through prose.
 *
 * Falls back to plain bold text if the slug ever stops matching, because a
 * missing link should not take a paragraph down with it.
 */
function GearLink({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const item = gear.find((g) => g.slug === slug);
  if (!item) return <Strong>{children ?? slug}</Strong>;
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${item.name}, ${item.vendor}`}
      className="font-semibold text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children ?? item.name}
    </a>
  );
}

function Aside({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 border-l-2 border-border-strong pl-6">
      <p className="text-base leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children}
    </a>
  );
}

function Def({ term, children }: { term: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-4">
      <dt className="font-semibold tracking-tight text-foreground">{term}</dt>
      <dd className="mt-1 text-base leading-relaxed text-muted-foreground">
        {children}
      </dd>
    </div>
  );
}

const SIZES = [
  { mm: 58, name: "58mm", note: "The commercial standard. Nearly every café machine uses it, so tampers, distributors and baskets are easy to find and cheap." },
  { mm: 54, name: "54mm", note: "Common on home machines from Breville and others. Good gear exists, but you have fewer options." },
  { mm: 51, name: "51mm and under", note: "Entry-level and portable brewers. Smaller dose, and accessories get genuinely hard to find." },
];

export default function CoffeePage() {
  return (
    <main className="py-8 md:py-12">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", path: "" },
              { name: "Coffee", path: "coffee" },
            ])
          ),
        }}
      />

      {/* The first heading after a part header sits at the block step, not the
          section step. The rule and the part title have already announced the
          break, so a section heading adding its own 48 on top left the part
          label stranded above a gap it had just created. */}
      <Container width="reading" className="[&>[data-part]+h2]:mt-6">
        <Link
          href="/shelf"
          className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-subtle transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Shelf
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight md:text-4xl">
          How I got into coffee
        </h1>
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
          I drank instant coffee for most of my life and thought nothing of it.
          Café coffee always tasted different to mine, and I could never work
          out why. This is what happened when I went looking, and the handful of
          things I wish someone had explained to me at the start.
        </p>


        <Part label="Part one" title="How I got here" />

        <H2 id="instant">Where I actually started</H2>
        <P>
          There is a jar of Nescafé Dark Roast in my cupboard, and it is going
          at the top of this page rather than hidden at the bottom, because
          let us be honest, this is where all of us started.
        </P>
        <Illus
          src="/coffee/kitchen-table-instant.webp"
          alt="A family at a kitchen table with steel tumblers of coffee, biscuits on a plate, a kettle, a carton of milk and a jar of Nescafé Classic."
        />
        <P>
          <Strong>Instant is how almost every Indian meets coffee.</Strong> It is
          in the house before you have heard the word specialty, before you know
          what a roast level is, before you have any idea that beans have
          origins. A spoon, hot water, milk, sugar if you take it. That was
          coffee in my home growing up, and it stayed my coffee right up until a
          few years ago. If you are reading this with a mug of it going cold
          beside you, no need to be shy. Same, most weeks.
        </P>
        <P>
          So when I read people online talking about instant as though it were a
          failure of character, I find it hard to take seriously. They are
          describing my childhood, and the daily cup of most people I know, and
          honestly a fair chunk of my own adult life. I am not going to stand on
          the other side of a door I walked through myself and pull a face at it.
        </P>
        <P>
          It also helps to know what instant actually is. It is{" "}
          <Strong>brewed coffee that has been dried into granules</Strong> so you
          can bring it back later with hot water. A different product with a
          different job, and the job is real: some mornings I have eleven minutes
          before a call, and the choice is between instant and nothing.
        </P>
        <P>
          What sent me looking was cafés. Coffee from a café always tasted
          different to what I made at home. Not better exactly, just different,
          and it was a difference I could not get anywhere near on my own. I
          wanted to know how they were doing it, and that question turned out to
          have a whole world behind it.
        </P>
        <P>
          None of what follows is me growing out of instant. The jar has not
          moved. It is just what happened after I got curious.
        </P>

        <H2 id="start">It started with a YouTube video</H2>
        <P>
          For years coffee was just the thing that happened before work. Then I
          came across{" "}
          <A href="https://www.youtube.com/@jameshoffmann">James Hoffmann</A>,
          and it turned out there was a whole craft sitting underneath something
          I did every morning without thinking. If you only take one thing from
          this page, take his channel.
        </P>
        <P>
          My first piece of gear was a <GearLink slug="nanopresso" /> and a
          very basic grinder. The Nanopresso is a hand pump. You put in the
          grounds, add hot water, and pump until espresso comes out. It costs
          very little and it makes a genuinely good shot, which is exactly the
          problem, because it makes you wonder how much further this goes.
        </P>
        <Illus
          src="/coffee/nanopresso-beginning.webp"
          alt="A man at a kitchen table pressing a Nanopresso hand pump into a small glass, a hand grinder and a bag of beans beside him, a coffee video playing on a laptop behind, and family watching with mild bemusement."
        />

        <H2 id="lever">Why a lever press, of all things</H2>
        <P>
          The next thing I bought was a <GearLink slug="flair-pro-2" />, and it is
          worth explaining what that actually is, because a lever press looks
          strange if you have only seen café machines.
        </P>
        <P>
          Espresso is hot water pushed through finely ground coffee under
          pressure. Pressure is measured in <Strong>bars</Strong>, where one bar
          is roughly the air pressure you are standing in right now.
        </P>
        <P>
          <Strong>Nine bars is the number everyone quotes</Strong>, and nearly
          every machine ever built is designed around it. It is worth knowing
          that it is a convention rather than a law of physics. In practice
          anywhere from <Strong>six to nine bars</Strong> makes good espresso,
          and plenty of people who have thought about it harder than me prefer
          the lower end, on the grounds that gentler pressure is less likely to
          punch a channel straight through the coffee. Nine is the default, not
          the target.
        </P>
        <P>
          A pump machine settles that question for you. It pushes at whatever
          pressure it was built to push at, and you do not get a vote.{" "}
          <Strong>A lever press hands the job to your arm.</Strong> You load the
          basket, pour in hot water, and pull the arm down. Your own weight is
          the pressure, and because the arm is long you can feel exactly what is
          happening: where the resistance builds, where it eases as the coffee
          gives way.
        </P>
        <P>
          That sounds like a downgrade until you notice what it buys you.{" "}
          <Strong>
            You are not just supplying the pressure, you are shaping it over the
            course of the shot.
          </Strong>{" "}
          On most machines that is fixed in the factory. Better ones give you
          control of temperature and timing, and the genuinely expensive ones
          let you vary pressure as the shot runs. On a lever, that last one is
          just how it works.
        </P>

        <H3>Pre-infusion, the bit worth learning</H3>
        <P>
          Dry coffee does not absorb water evenly. Hit a dry puck with full
          pressure and the water finds the path of least resistance, carves a
          channel, and rushes through it while the rest of the coffee sits there
          barely touched. That is the sour and bitter cup at the same time.
        </P>
        <P>
          The fix is to wet it gently first.{" "}
          <Strong>
            Ease in at around three or four bars, hold there for a few seconds
            while the coffee soaks and swells shut, and only then push on to six,
            seven, eight, nine.
          </Strong>{" "}
          The trade is a few seconds against a much more even extraction.
        </P>
        <P>
          The word for this is <Strong>pre-infusion</Strong>. On espresso
          machines it is a feature, sometimes a costly one. On a lever you simply
          do it with your hand, and after a while you stop counting seconds and
          start going by feel.
        </P>
        <Aside>
          Hoffmann&apos;s argument was that a good lever gets you espresso
          genuinely close to machines costing many times more, because the
          expensive parts of a machine are the ones holding temperature and
          pressure steady, and a lever hands both of those jobs to you. Having
          used one for a while, I think that is right. You are the pump, and the
          pump is the part you were going to pay for.
        </Aside>
        <P>
          There is no motor and nothing to break, and it taught me more about
          extraction in a month than reading would have in a year. When a shot
          ran fast and tasted thin, I could feel that it had run fast.
        </P>

        <H2 id="grinder">Then the grinder became the problem</H2>
        <P>
          So I had a press that let me set the pressure exactly, and my coffee
          did not improve. The shots gushed out in about ten seconds and tasted
          like brown water, and leaning harder on the arm changed nothing.
        </P>
        <P>
          <Strong>You do not apply nine bars. You generate them.</Strong>{" "}
          Pressure is what happens when you push against something that pushes
          back, and the thing pushing back is the bed of coffee. Grind too coarse
          and there is nothing to push against: the water leaves as fast as you
          supply it, the pressure never builds, and it is gone before it has
          taken much flavour with it. A fast, thin shot is almost never fixed at
          the lever. It is fixed at the grinder.
        </P>
        <Illus
          src="/coffee/old-grinder-limits.webp"
          alt="Three panels. Pulling a lever press with a basic grinder beside it, labelled peak pressure nine bars and limited range. Then tasting the shot and asking why it is so sour. Then a cut-away of the coffee basket where water carves a channel through an uneven bed of boulders and dust, giving sour and bitter at once."
        />
        <P>
          Except I could not fix it. My old grinder was already on its finest
          setting, and there was simply no more dial to turn.{" "}
          <Strong>
            That is the quiet limit of a cheap grinder: not that it grinds badly,
            but that it runs out of road right where espresso starts.
          </Strong>
        </P>
        <P>
          I went for a <GearLink slug="1zpresso-jx-pro" />. It is a hand
          grinder with conical burrs, which means two cone-shaped cutters shear
          the beans into pieces of a similar size rather than smashing them. Even
          grounds matter because water flows through them evenly, so you get one
          extraction rather than some of it over-extracted and some of it under.
        </P>
        <P>
          It also has range to spare. Espresso sits comfortably inside its dial
          rather than at the very end of it, and if you keep turning you go past
          espresso, past flour, and somewhere into splitting the atom. I will
          never use that end. Knowing it is there is the point.
        </P>
        <P>
          The part I did not expect to care about is the stepped dial. Every
          click is a known amount coarser or finer, so espresso and pour over sit
          a fixed number of clicks apart. Dialling in stops being guesswork and
          becomes arithmetic.
        </P>
        <Illus
          src="/coffee/jx-pro-resolution.webp"
          alt="Three panels. Setting the clicks on a 1Zpresso JX-Pro hand grinder, noting its conical burrs and stepped dial. Then pulling a shot where the pressure gauge finally reads nine bars because the coffee bed is providing resistance. Then drinking it, tasting chocolate and nutty sweetness with no sourness."
        />

        {/* The one block on the page allowed to raise its voice. */}
        <div className="my-8 rounded-2xl border border-foreground bg-card p-6 md:p-8">
          <p className="font-mono text-2xs uppercase tracking-label text-subtle">
            If you remember one thing from this page
          </p>
          <p className="mt-3 text-lg leading-snug text-foreground md:text-xl">
            <Strong>Your grinder matters more than your machine.</Strong> A
            modest brewer and a good grinder will beat an expensive machine and a
            bad one, every time, and it is not close.
          </p>
          <P>
            The reason is simple once you see it. Water takes the path of least
            resistance. If your grounds are a mix of boulders and dust, water
            rushes past the big pieces and floods the small ones, so the same
            shot is under-extracted and over-extracted at once. You taste that as
            sour and bitter together, and no amount of machine will fix it,
            because the machine is not the thing making the mess.
          </P>
          <P>
            A good grinder produces particles of a similar size. Water moves
            through them evenly, everything extracts at about the same rate, and
            the cup tastes like one thing instead of three. That is the whole
            mechanism.
          </P>
          <GrindEvennessFigure />
          <P>
            So if you are choosing where the money goes, put it in the grinder
            first. You can pull genuinely excellent coffee out of very ordinary
            equipment once the grind is right.
          </P>
        </div>

        <H2 id="budan">And then time became the problem</H2>
        <P>
          The manual workflow is lovely, and it is also about fifteen minutes I
          do not have on a Tuesday morning. So I bought a <GearLink slug="budan" />,
          a semi-automatic machine made here in India. It heats itself while I do
          something else, and a weekday coffee stops being a project.
        </P>
        <P>
          The part that sold me was what is underneath it. The Budan is built on
          the <Strong>CRM3605</Strong>, a chassis made by Gemilai and sold all
          over the world rebadged under a dozen different names. That sounds like
          a knock and it is the opposite of one.
        </P>
        <P>
          A platform that many brands share is a platform that many people own,
          which means it has been taken apart, photographed, argued about on
          forums and fixed in kitchens for years. Gaskets, shower screens,
          solenoids and pumps are commodity parts you can order without hunting.
          It carries a <Strong>58mm group</Strong>, so every tamper, distributor
          and basket made for café machines fits it. When something eventually
          goes, I can open it rather than post it somewhere.
        </P>
        <P>
          I did not stop doing it by hand. Weekends I still go the long way
          round, heating the apparatus, weighing everything, pulling the lever.
          The slow version is the part I actually enjoy. The machine is for the
          mornings when enjoying it is not the point.
        </P>


        <H2 id="kit">Everything on my shelf, in order</H2>
        <Illus
          src="/coffee/the-whole-shelf.webp"
          alt="A kitchen counter lined up with, left to right, a jar of Nescafé, a Nanopresso hand pump, a Flair lever press, a JX-Pro hand grinder, a semi-automatic espresso machine and a Kalita pour over set, with bags of Indian coffee on the shelves behind."
          height={819}
        />
        <P>
          The whole list in one place, since it is scattered through the story
          above. Each one links to where I bought it.
        </P>
        <ol className="mt-6 border-t border-border">
          {gear.map((g) => (
            <li
              key={g.slug}
              className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="font-mono text-2xs uppercase tracking-label text-subtle sm:w-40 sm:shrink-0">
                {g.when}
              </span>
              <span className="min-w-0">
                <a
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {g.name}
                </a>
                <span className="ml-2 text-sm text-subtle">{g.kind}</span>
              </span>
            </li>
          ))}
        </ol>

        <H2 id="both">I still drink both</H2>
        <Aside>
          I pick by mood and by clock as much as by taste. Weekend, unhurried,
          happy to fuss: the lever and the <GearLink slug="kalita-wave-185">Kalita</GearLink>. Weekday, thinking about
          something else: the <GearLink slug="budan">Budan</GearLink>. Running
          for the door: the jar. All three are
          me, and the jar has been me for the longest.
        </Aside>
        <P>
          If you drink instant and you are happy, you are done. Nothing on this
          page is asking you to change.
        </P>

        <Part label="Part two" title="What I learnt along the way" />

        <H2 id="roast">Roast levels, from the beginning</H2>
        <P>
          Start here, because this is the word on the front of every bag and it
          decides more about how your coffee tastes than almost anything else
          you can buy.
        </P>

        <H3>What a roaster is actually doing</H3>
        <P>
          A coffee bean is a seed. It grows inside a small red fruit, and before
          anyone roasts it, it is green, it smells faintly of hay, and it tastes
          of nothing you would want. <Strong>Roasting is cooking it.</Strong>{" "}
          That is the entire craft: applying heat to a seed until it becomes
          something worth drinking.
        </P>
        <P>
          Heat does two useful things. It drives the water out, and it browns the
          sugars inside the bean, which is the same reaction that makes bread
          crust taste different from bread dough.
        </P>
        <P>
          While that happens, the roaster is listening. Beans make two distinct
          sounds as they cook, and those two sounds are the landmarks the whole
          craft is built around.
        </P>
        <dl className="my-6 border-t border-border">
          <Def term="First crack">
            Steam builds up until it bursts the bean open, with a loud pop that
            sounds like popcorn. The bean is now drinkable. Stop here or just
            after, and you have a <Strong>light roast</Strong>.
          </Def>
          <Def term="Second crack">
            Keep going and there is a second, quieter, cracklier round of popping
            as the structure gives way further and oil is pushed out to the
            surface. Around here you are at <Strong>medium-dark</Strong>. Go
            through it and you are at <Strong>dark</Strong>.
          </Def>
        </dl>
        <P>
          That is all a roast level is: <Strong>how long the roaster waited,
          measured against those two sounds.</Strong> Light, medium, medium-dark
          and dark are four names for four places to stop.
        </P>
        <Illus
          src="/coffee/roast-levels.webp"
          alt="Four coffee beans in a row getting darker. A pale green raw seed. A light roast stopped after first crack, tasting of green apple, citrus and flowers. A medium roast, balanced, tasting of chocolate and toasted nut. A dark roast taken through second crack, tasting of molasses, deep caramel and smoky spice."
        />
        <Aside>
          A useful shorthand for the whole picture above:{" "}
          <Strong>you lose farm and you gain fire.</Strong>
        </Aside>
        <Aside>
          You will see roast temperatures quoted, usually around 200°C for first
          crack. Treat them loosely. That number is a probe reading, and because
          every machine puts its probe in a slightly different place, first crack
          is reported anywhere from 170°C to 207°C by people who all know exactly
          what they are doing. The sounds are the same on every machine. The
          numbers are not.
        </Aside>
        <P>
          And there is a trade running underneath all of it.{" "}
          <Strong>
            The longer a bean roasts, the more of the farm you lose and the more
            of the fire you gain.
          </Strong>{" "}
          Acidity falls, body rises, and the flavours that came from the soil and
          the altitude give way to flavours that came from the roaster. Neither
          end is better. Anyone telling you light roast is objectively superior
          is describing their own preference. Mine sits firmly at the dark end.
        </P>

        <H3>Acidity is not sourness</H3>
        <P>
          This one word confuses more beginners than anything else on this page,
          so it is worth thirty seconds.
        </P>
        <P>
          When coffee people say <Strong>acidity</Strong>, they mean brightness.
          The snap of a green apple, the lift of orange juice. It is a compliment.
          It is a thing people pay more for.
        </P>
        <P>
          <Strong>Sourness is a different thing and it is a mistake.</Strong> It
          is what you get when water has not pulled enough out of the coffee,
          which is nearly always a grind problem rather than a bean problem. If a
          light roast tastes sharp and unpleasant and thin, the honest first
          assumption is not that you dislike light roast. It is that you
          under-extracted it. Grind finer and try again before you blame the bag.
        </P>

        <H3>Pick a roast and see what to do with it</H3>
        <P>
          Drag the slider. This is the part that took me the longest to work out
          by trial and error, and it fits on one screen.
        </P>
        <RoastExplorer />

        <H3>One warning about the labels</H3>
        <P>
          Nobody agrees on what these words mean. There is no standards body
          checking that your medium is the same as my medium, so every roaster
          calibrates their own scale, and some of them calibrate it hot.
        </P>
        <P>
          <Strong>Starbucks are the famous example.</Strong> Buy their medium and
          you will get something sitting roughly where most roasters would print
          dark on the bag. Buy their dark and you are in a different conversation
          entirely, one where the beans have clearly had a long and difficult
          afternoon.
        </P>
        <Aside>
          I am not saying this to be rude about them. I keep buying it. Just
          shift your expectation one notch darker than the label promises, and if
          you already know you dislike smoky, heavy coffee, their medium is where
          you should start rather than where you should stop.
        </Aside>
        <P>
          The wider lesson is more useful than the joke. Treat roast labels as
          one roaster talking about their own range, never as a measurement you
          can carry between brands. The only reliable calibration is a bag you
          have already drunk.
        </P>
        <P>
          This is not me being cynical, incidentally. There is a lab measurement
          for roast colour, and when people run it, Starbucks Pike Place, sold as
          a medium, and Peet&apos;s Major Dickason, sold as a dark, land in the
          same very dark band. Two different words on two bags for effectively
          the same roast.
        </P>

        <H3>While we are killing myths: caffeine</H3>
        <P>
          You will hear that dark roast has more caffeine because it is stronger,
          and you will hear the opposite from the other half of the internet.
          Here is the boring truth.
        </P>
        <P>
          Caffeine barely cares about roasting. It survives the temperatures
          involved almost untouched, so{" "}
          <Strong>
            if you weigh your coffee on a scale, roast level makes almost no
            difference
          </Strong>
          . One study that brewed five roast levels carefully found the peak in
          the cup was somewhere around medium, and concluded that how you brew
          matters more than how it was roasted.
        </P>
        <P>
          The popular claim is only true if you measure by the scoop. Light roast
          beans spend less time expanding, so they stay denser, and a scoop of
          them weighs more than a scoop of dark. More bean, more caffeine. Weigh
          instead and the whole argument disappears.
        </P>

        <H2 id="bag">Reading the rest of the bag</H2>
        <P>
          Roast level is the word you notice first. The rest of a specialty bag
          reads like a form somebody forgot to explain, so here is a short
          decoder. You do not need all of it to buy good coffee. You need enough
          that the bag stops being intimidating.
        </P>

        <H3>Single origin, or a blend</H3>
        <P>
          <Strong>Single origin</Strong> means the coffee came from one place.
          The catch is that nobody has agreed how big &ldquo;one place&rdquo; is,
          and there is no official definition. It can mean one country, one
          region, one co-operative, one farm, or one specific plot on one farm.
          &ldquo;Single origin, Brazil&rdquo; tells you almost nothing, because
          Brazil grows about a third of the world&apos;s coffee. A named estate
          tells you a great deal.
        </P>
        <P>
          <Strong>A blend</Strong> is coffee from more than one place, mixed on
          purpose. Anything that is not single origin is a blend. There is no
          such thing as a &ldquo;double origin&rdquo;, and no triple either. Two
          origins in a bag is simply a blend of two.
        </P>
        <P>
          Blends have a reputation for being the cheap option, and that
          reputation is out of date. Roasters blend for real reasons: coffee is a
          crop, so a single farm&apos;s lot runs out and tastes different next
          harvest, while a blend can be adjusted to taste the same all year.
          Blends are also built deliberately to have enough body to cut through
          milk. If you want proof this is not a compromise, the coffee that won
          the World Barista Championship in 2023 was a blend.
        </P>
        <Aside>
          Which should you buy first? If you mostly make lattes, buy a
          roaster&apos;s house espresso blend, because it was designed for
          exactly that job. If you brew filter and want to learn what origins
          actually taste like, buy two contrasting single origins at once, say an
          Ethiopian and a Colombian, and drink them the same week. The
          difference is the lesson.
        </Aside>

        <H3>Arabica and robusta</H3>
        <P>
          These are two species of coffee plant. <Strong>Arabica</Strong> is the
          one specialty coffee is mostly built on: sweeter, more acidic, more
          aromatic, fussier to grow, more expensive.{" "}
          <Strong>Robusta</Strong> has roughly twice the caffeine, more
          bitterness, less sugar, grows lower and hotter, and resists disease
          far better.
        </P>
        <P>
          Robusta&apos;s bad reputation is real but is also partly a story about
          money rather than the plant. For decades nobody paid for good robusta,
          so nobody grew good robusta. There is now a defined{" "}
          <Strong>fine robusta</Strong> grade with its own graders and standards,
          and it matters here more than most places:{" "}
          <Strong>
            roughly 70% of the coffee India grows is robusta
          </Strong>
          , and Indian roasters sell single-origin robusta that is genuinely
          good, which is still unusual worldwide.
        </P>
        <P>
          Which brings up the label you have definitely seen.{" "}
          <Strong>&ldquo;100% arabica&rdquo; is not a quality claim.</Strong> It
          is a statement about species and nothing else, and there is an enormous
          amount of mediocre arabica in the world. It meant something when the
          alternative was cheap robusta padding out a supermarket tin. Notice
          that the bags you most want to buy usually do not bother saying it.
        </P>

        <H3>How the fruit was removed</H3>
        <P>
          Every coffee bean starts inside a fruit, and somebody has to get it
          out. How they did it changes the taste as much as the roast does, which
          is why it is printed on the bag.
        </P>
        <dl className="my-6 border-t border-border">
          <Def term="Washed">
            The fruit is stripped off before drying. You taste the seed and the
            place it grew, with nothing in the way. Cleaner and brighter, and the
            usual choice when a roaster wants chocolate and caramel to lead.
          </Def>
          <Def term="Natural">
            The whole fruit is dried with the seed still inside, so the sugars
            soak in. Much fruitier, heavier, sometimes almost like wine or berry
            jam. Harder to do well, because fruit left on a drying bed can go
            wrong.
          </Def>
          <Def term="Honey, or pulped natural">
            The middle path. The skin comes off but the sticky layer underneath
            stays on to dry. Sweet, between the other two.{" "}
            <Strong>There is no honey involved.</Strong> That sticky layer just
            looks and behaves like honey, and the name stuck.
          </Def>
        </dl>
        <P>
          For a beginner&apos;s palate, this is often a louder difference than
          the country on the bag. A washed Ethiopian and a natural Ethiopian can
          taste less alike than two washed coffees from opposite sides of the
          world.
        </P>

        <H3>The date that matters</H3>
        <P>
          Look for a <Strong>roast date</Strong>, not a best before date.
        </P>
        <P>
          Coffee does not spoil the way milk does. It is shelf stable, so a best
          before date twelve months out is a legal formality that tells you
          nothing about flavour. What coffee does is go flat, and it starts the
          day it is roasted.
        </P>
        <P>
          Fresher is not automatically better either, which surprises people.
          Fresh coffee is full of carbon dioxide, and that gas physically pushes
          water away from the grounds and gives you a sour, uneven cup.{" "}
          <Strong>
            Give filter coffee about three to seven days after roasting, and
            espresso about seven to fourteen
          </Strong>
          , then drink it within a month or so. Every good roaster publishes
          slightly different numbers, so treat that as a window rather than a
          rule.
        </P>
        <Aside>
          The single biggest freshness fact, and the reason a grinder is worth
          more than a machine: whole beans stay good for around three weeks.
          Ground coffee stays good for about an hour. Grinding multiplies the
          surface exposed to air by an enormous factor, and most of the trapped
          gas escapes within five minutes.
        </Aside>

        <H3>What you can safely ignore for now</H3>
        <P>
          <Strong>Altitude.</Strong> &ldquo;1600 MASL&rdquo; means metres above
          sea level. Higher usually means colder, which means the fruit ripens
          more slowly and develops more flavour, so it is weak evidence that the
          roaster buys carefully. It is not comparable between countries, because
          1,600 metres near the equator and 1,600 metres far from it are
          completely different climates.
        </P>
        <P>
          <Strong>Cupping scores.</Strong> A number like &ldquo;86
          points&rdquo; comes from a tasting protocol where 80 and above counts
          as specialty. On a retail bag it is usually self-assigned by the
          roaster or their importer, and one point is inside the margin of error
          for most professional tasters. It carries real weight when it comes
          from a competition or a public auction, and very little otherwise.
        </P>
        <P>
          <Strong>Variety names.</Strong> Bourbon, Typica, SL28, Gesha and the
          rest are to coffee what Granny Smith is to apples. Worth knowing later.
          Worth ignoring while you are still working out whether you like fruit
          or chocolate.
        </P>

        <H2 id="portafilters">Portafilters, and why 58mm keeps coming up</H2>
        <P>
          The <Strong>portafilter</Strong> is the handle you lock into an
          espresso machine. It holds a metal basket, the basket holds the coffee,
          and the whole thing seals against the machine so pressurised water has
          nowhere to go except through the puck.
        </P>
        <P>
          The number is the diameter of that basket in millimetres, and it
          matters more than it sounds like it should.
        </P>
        <div className="my-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {SIZES.map((s) => (
            <div key={s.name} className="bg-card p-6 text-center">
              {/* Fixed-height band with the circle sitting on its floor. The
                  three circles are deliberately different sizes, so centring
                  them in auto-height boxes left the labels underneath at three
                  different heights. */}
              <div className="mb-4 flex h-16 items-end justify-center">
                <div
                  className="rounded-full border border-foreground"
                  style={{ width: s.mm, height: s.mm }}
                />
              </div>
              <p className="text-sm font-semibold text-foreground">{s.name}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {s.note}
              </p>
            </div>
          ))}
        </div>
        <PortafilterFigure />
        <P>
          A wider basket spreads the same dose into a shallower bed, so water
          travels through less coffee and does it more evenly. That is the real
          reason 58mm became the standard rather than tradition.{" "}
          <Strong>
            If you are buying a machine, check the size before you check anything
            else
          </Strong>
          , because it decides what accessories you can ever buy for it.
        </P>

        <H2 id="methods">Ways to make it</H2>
        <P>Three families, and they want different grinds.</P>
        <dl className="my-6 border-t border-border">
          <Def term="Espresso based">
            Hot water forced through a compacted puck at pressure, in about
            thirty seconds. Fine grind. This is the base for a cortado, a latte,
            a flat white. Everything on a café menu is espresso plus milk in some
            ratio.
          </Def>
          <Def term="Pour over and filter">
            Water poured over a bed of coffee and allowed to drain through, over
            two to four minutes. Coarser grind, no pressure, lighter body. A
            Kalita Wave and a V60 both sit here. Cleaner in the cup, and far more
            forgiving of a small mistake.
          </Def>
          <Def term="Immersion">
            Coffee sits in water for a set time, then gets separated. A French
            press is the obvious one. Coarsest grind, heaviest body, and the
            hardest one to get badly wrong.
          </Def>
        </dl>
        <P>
          None of these is the correct way. They pull different things out of the
          same beans, and the one you like is the right one.
        </P>

        <H2 id="grind">Grind size, and the one rule behind it</H2>
        <P>
          Espresso wants a fine grind. Pour over wants a coarser one. Almost
          everyone learns those two facts as things to memorise, which is a
          shame, because they both fall out of a single idea.
        </P>
        <P>
          <Strong>
            Grind size is set by how long the water and the coffee spend
            together.
          </Strong>
        </P>
        <P>
          Break a bean into smaller pieces and you create far more surface for
          water to work on, so it gives up its flavour faster. Leave the pieces
          large and there is less surface, so extraction is slower. That is the
          whole lever you are pulling.
        </P>
        <GrindSizeFigure />
        <P>
          Put an espresso grind in a French press for four minutes and you
          extract everything, including all the bitter compounds you were hoping
          to leave behind. Put a French press grind in an espresso basket and the
          water runs straight through in eight seconds and tastes of almost
          nothing.
        </P>

        <H3>When to move it</H3>
        <P>Taste first, then adjust one thing.</P>
        <dl className="my-6 border-t border-border">
          <Def term="Sour, thin, and it ran fast">
            Under-extracted. You did not get enough out. <Strong>Grind finer.</Strong>{" "}
            That slows the water down and gives it more surface to work on.
          </Def>
          <Def term="Bitter, harsh, drying, and it ran slow">
            Over-extracted. You pulled out too much. <Strong>Grind coarser.</Strong>{" "}
            Water moves through faster and takes less with it.
          </Def>
          <Def term="Both at once">
            Usually not a grind size problem. That is the channeling in the
            picture further up, so look at your distribution and your tamp before
            you touch the dial.
          </Def>
        </dl>
        <P>
          A stepped grinder makes this much easier to live with. On my <GearLink slug="1zpresso-jx-pro">JX-Pro</GearLink>,
          espresso and pour over sit a fixed number of clicks apart, so moving
          between them is a count rather than a memory, and a change I liked is a
          change I can find again.
        </P>

        <H2 id="ratios">Ratios, so you have somewhere to start</H2>
        <P>
          A brew ratio is coffee in against liquid out, both by weight. Weighing
          is the single change that makes your coffee repeatable, because volume
          lies and a scale does not.
        </P>
        <H3>Espresso</H3>
        <RatioFigure />
        <P>
          The <A href="https://sca.coffee">Specialty Coffee Association</A> puts
          the sweet spot at 1:2 to 1:2.5, and that is where I live. Start at 18g
          in and 36g out in about 30 seconds. If it tastes sour, grind finer. If
          it tastes harsh and bitter, grind coarser. Change one thing at a time.
        </P>
        <H3>Pour over and filter</H3>
        <P>
          Much more water, much longer contact, so the numbers look completely
          different. <Strong>1:16 to 1:17</Strong> is the reliable starting
          point: 20g of coffee to 320g of water.
        </P>
        <P>
          The SCA Golden Cup standard is 55g of coffee per litre with a 10%
          tolerance either way, which works out at roughly 1:17 to 1:20. Most
          people I know brew stronger than the middle of that. The useful thing
          about a ratio is not that it is correct, it is that it is repeatable,
          so when a cup is good you can make it again.
        </P>

        <H2 id="curious">If you have ever been curious</H2>
        <P>
          It is far less precious than it looks from outside. A hand grinder and
          a plastic dripper get you a long way, and the whole hobby can start for
          about what you would spend on two coffees out. We also have very good
          roasters here now, which was not true when I was growing up. Try a bag
          from one of them and see whether you notice anything.
        </P>
        <P>
          If you do, welcome, it is a lovely rabbit hole. If you do not, the jar
          is still in the cupboard and it was never the problem.
        </P>

        <H2 id="buying">Where I buy</H2>
        <P>
          Coffee gear is a category with a lot of noise in it, and buying badly
          is expensive. Nearly everything on my shelf came from one of two
          places, and I would send a friend to either. The grinder is the
          exception: that one came direct from 1Zpresso.
        </P>
        <dl className="my-6 border-t border-border">
          <Def term={<A href="https://somethingsbrewing.in">Something&apos;s Brewing</A>}>
            Where the Budan and the Nanopresso came from. Broad range across
            machines, grinders and brewers, and they carry the Indian brands as
            well as the imports. Good first stop if you are not yet sure what you
            want.
          </Def>
          <Def term={<A href="https://www.benkibrewingtools.com">Benki Brewing Tools</A>}>
            Where the Flair and the Kalita came from. More focused, more of a
            specialist selection, and the sort of place that stocks the specific
            thing rather than twelve near-misses.
          </Def>
        </dl>
        <P>
          Neither of them pays me anything and these are not affiliate links.
          They are simply where my money went.
        </P>

        <H2 id="communities">Where people actually talk about this</H2>
        <P>
          Most of what I know past the basics came from reading other people
          argue about it. These are the corners of Reddit I follow, and they are
          a genuinely warm bunch. If you want to go further than this page does,
          your time is better spent there than on more of me.
        </P>
        <ul className="my-6 border-t border-border">
          {communities.map((c) => (
            <li key={c.url} className="border-b border-border py-4">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
              >
                <RedditMark className="h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
                {c.handle}
              </a>
              <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                {c.what}
              </p>
            </li>
          ))}
        </ul>
        <P>
          Worth saying plainly: nobody there is precious about it. Turn up with a
          bad shot and a question and you will get five careful answers.
        </P>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <p className="text-base leading-relaxed text-muted-foreground">
            Nearly all of this I picked up from{" "}
            <A href="https://www.youtube.com/@jameshoffmann">James Hoffmann</A>,
            who explains it far better and with actual measurements. If any of it
            made you want the longer answer, start there. If you want to talk
            about coffee, I am easy to find.
          </p>
        </div>
      </Container>
    </main>
  );
}
