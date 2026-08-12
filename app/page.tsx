import About from "@/components/About";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Activity from "@/components/Activity";
import Faq from "@/components/Faq";
import Socials from "@/components/Socials";
import LaunchNudge from "@/components/LaunchNudge";

export default function Home() {
  return (
    <main>
      <About />
      <ExperienceWork />
      <Projects />
      <TechStack />
      <Activity />
      <Faq />
      <Socials />
      {/* Homepage only, deliberately: mounted here rather than in the layout so
          it never appears on a blog post or a case study. */}
      <LaunchNudge />
    </main>
  );
}
