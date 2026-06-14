import About from "@/components/About";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Clients from "@/components/Clients";
import Activity from "@/components/Activity";
import Faq from "@/components/Faq";
import Socials from "@/components/Socials";
import Divider from "@/components/layout/Divider";

export default function Home() {
  return (
    <main className="relative">
      <About />
      <Divider />
      <ExperienceWork />
      <Divider />
      <Projects />
      <Divider />
      <TechStack />
      <Divider />
      <Clients />
      <Divider />
      <Activity />
      <Divider />
      <Faq />
      <Divider />
      <Socials />
    </main>
  );
}
