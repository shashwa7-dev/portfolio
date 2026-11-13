import About from "@/components/About";
import BrandBackdrop from "@/components/common/BrandBackdrop";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import Writing from "@/components/Writing";
import Currently from "@/components/Currently";
import Faq from "@/components/Faq";
import Closing from "@/components/Closing";
import LaunchNudge from "@/components/LaunchNudge";
import ChatBotMount from "@/components/ChatBotMount";
import StarterPackMount from "@/components/starter-pack/StarterPackMount";
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
      <BrandBackdrop />
      {/* The starter pack card on its lanyard, hanging into the right margin on
          wide screens. Takes no layout space; only the card itself takes the
          pointer. Contents: lib/starter-pack/config.ts. */}
      <div className="starter-pack-hang">
        <StarterPackMount variant="hang" />
      </div>
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
      {/* Tablets: the same card hangs just above the footer (phones get no
          card). The slot's height is reserved here, in server markup, so
          nothing moves when the card loads. */}
      <div className="starter-pack-slot">
        <StarterPackMount variant="footer" />
      </div>
      {/* Homepage only, deliberately: mounted here rather than in the layout so
          it never appears on a blog post or a case study. */}
      <LaunchNudge />
      <ChatBotMount />
    </main>
  );
}
