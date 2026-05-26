import About from "@/components/About";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Clients from "@/components/Clients";
import Activity from "@/components/Activity";
import Socials from "@/components/Socials";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const S7Bot = dynamic(() => import("@/components/ChatBot"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <About />
      <ExperienceWork />
      <Projects />
      <TechStack />
      <Clients />
      <Activity />
      <Socials />
      <S7Bot />
      <CommandPalette />
    </main>
  );
}
