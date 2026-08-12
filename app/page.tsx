import About from "@/components/About";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Clients from "@/components/Clients";
import Activity from "@/components/Activity";
import Faq from "@/components/Faq";
import Socials from "@/components/Socials";

export default function Home() {
  return (
    <main>
      <About />
      <ExperienceWork />
      <Projects />
      <TechStack />
      <Clients />
      <Activity />
      <Faq />
      <Socials />
    </main>
  );
}
