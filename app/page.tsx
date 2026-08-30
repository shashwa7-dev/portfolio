import About from "@/components/About";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import CardNudge from "@/components/CardNudge";
import TechStack from "@/components/TechStack";
import Activity from "@/components/Activity";
import Faq from "@/components/Faq";
import Socials from "@/components/Socials";
import LaunchNudge from "@/components/LaunchNudge";
import ChatBotMount from "@/components/ChatBotMount";
import { profilePageLd } from "@/lib/seo";


export default function Home() {
  return (
    <main>
      {/* The homepage is the entity page for this portfolio. `mainEntity`
          references the Person node emitted from the root layout by @id, so both
          resolve to one entity rather than two. */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageLd()) }}
      />
      <About />
      <ExperienceWork />
      <Projects />
      <TechStack />
      <Activity />
      <Faq />
      <Socials />
      {/* Last section on the page, directly above the footer rendered from
          `app/layout.tsx`: its copy is a parting note for someone who has
          scrolled the whole page, not a mid-scroll pitch, so it only makes
          sense here. */}
      <CardNudge />
      {/* Homepage only, deliberately: mounted here rather than in the layout so
          it never appears on a blog post or a case study. */}
      <LaunchNudge />
      <ChatBotMount />
    </main>
  );
}
