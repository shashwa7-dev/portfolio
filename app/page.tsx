import About from "@/components/About";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import Writing from "@/components/Writing";
import Currently from "@/components/Currently";
import Faq from "@/components/Faq";
import Closing from "@/components/Closing";
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
      <Writing />
      <Currently />
      <Projects />
      <Faq />
      {/* The closing line, directly above the footer rendered from
          `app/layout.tsx`. It carries the visitor-card nudge at its foot:
          that copy is a parting note for someone who has scrolled the whole
          page, so it only reads honestly from here. */}
      <Closing />
      {/* Homepage only, deliberately: mounted here rather than in the layout so
          it never appears on a blog post or a case study. */}
      <LaunchNudge />
      <ChatBotMount />
    </main>
  );
}
