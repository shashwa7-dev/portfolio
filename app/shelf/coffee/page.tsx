import Link from "next/link";
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
  alternates: { canonical: `${baseUrl}shelf/coffee` },
  openGraph: {
    title: "How I got into coffee",
    description: DESCRIPTION,
    url: `${baseUrl}shelf/coffee`,
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
function Part({ label, title }: { label: string; title: string }) {
  return (
    <div
      data-part
      className="mt-16 border-t border-border pt-8 first:mt-0"
    >
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

const ROASTS = [
  { name: "Light", swatch: "hsl(30 25% 62%)", note: "Acidic and fruity. Origin flavours come through hardest here.", mine: false },
  { name: "Medium", swatch: "hsl(28 28% 44%)", note: "Balanced. Some fruit, some sweetness, more body.", mine: false },
  { name: "Medium-dark", swatch: "hsl(25 30% 28%)", note: "Chocolate and nut. Acidity mostly gone.", mine: true },
  { name: "Dark", swatch: "hsl(22 25% 16%)", note: "Smoke, cocoa, heavy body. Stands up to milk.", mine: true },
];

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
              { name: "Shelf", path: "shelf" },
              { name: "Coffee", path: "shelf/coffee" },
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
          This is what changed, and the handful of things I wish someone had
          explained to me at the start.
        </p>


        <Part label="Part one" title="How I got here" />

        <H2 id="instant">Where I actually started</H2>
        <P>
          There is a jar of Nescafé Dark Roast in my cupboard, and it is going
          at the top of this page rather than hidden at the bottom, because
          let us be honest, this is where all of us started.
        </P>
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
          None of what follows is me growing out of that. The jar has not moved.
          It is just what happened after I got curious.
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

        <H2 id="lever">Why a lever press, of all things</H2>
        <P>
          The next thing I bought was a <GearLink slug="flair-pro-2" />, and it is
          worth explaining what that actually is, because a lever press looks
          strange if you have only seen café machines.
        </P>
        <P>
          Espresso needs roughly nine bars of pressure pushed through finely
          ground coffee. A machine does that with an electric pump. A lever press
          does it with you. You load the basket, pour in hot water, and pull the
          arm down. Your own weight on that arm is the pressure, and because the
          arm is long you can feel exactly what is happening: where the
          resistance builds, where it eases off as the puck gives way.
        </P>
        <Aside>
          Hoffmann&apos;s argument was that a good lever gets you espresso
          genuinely close to machines costing many times more, because the
          expensive part of a machine is holding temperature and pressure steady,
          and a lever hands both of those jobs to you. Having used one for a
          while, I think that is right.
        </Aside>
        <P>
          There is no motor, nothing to break, and it taught me more about
          extraction in a month than reading would have in a year. When a shot
          ran fast and tasted thin, I could feel that it had run fast.
        </P>

        <H2 id="grinder">Then the grinder became the problem</H2>
        <P>
          Good press, bad grind, bad coffee. That is the order things go wrong
          in, and it is why <Strong>the grinder is usually the better upgrade</Strong>{" "}
          once your brewer is decent.
        </P>
        <P>
          I went for a <GearLink slug="1zpresso-jx-pro" />. It is a hand grinder
          with conical burrs, which means two cone-shaped cutters shear the beans
          into pieces of a similar size rather than smashing them. Even grounds
          matter because water flows through them evenly, so you get one
          extraction rather than some of it over-extracted and some of it under.
        </P>
        <P>
          The part I did not expect to care about is the stepped dial. Every
          click is a known amount coarser or finer, so espresso and pour over sit
          a fixed number of clicks apart. Dialling in stops being guesswork and
          becomes arithmetic.
        </P>

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

        <H2 id="roast">Roast levels, briefly</H2>
        <P>
          This is where personal taste lives, and it is the single most useful
          thing to understand when you are choosing a bag.
        </P>
        <div className="my-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {ROASTS.map((r) => (
            <div key={r.name} className="bg-card p-4">
              <div className="mb-3 h-1.5 rounded-full" style={{ background: r.swatch }} />
              <p className="text-sm font-semibold text-foreground">{r.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.note}</p>
              {r.mine && (
                <p className="mt-2 font-mono text-2xs uppercase tracking-label text-foreground">
                  I drink this
                </p>
              )}
            </div>
          ))}
        </div>
        <P>
          Longer in the roaster trades acidity for body. Neither end is better,
          and anyone telling you light roast is objectively superior is
          describing their own preference. Mine sits firmly at the dark end.
          Citrusy, high-acid coffees are not what I want at seven in the morning,
          so a light roast rarely makes it past one bag in my kitchen.
        </P>

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
          is expensive. Everything on my shelf came from one of two places, and I
          would send a friend to either.
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
