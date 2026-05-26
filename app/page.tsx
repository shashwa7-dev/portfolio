import About from "@/components/About";
import Projects from "@/components/Projects";
import Work from "@/components/Work";
import Clients from "@/components/Clients";
import TechStack from "@/components/TechStack";
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
      <Projects />
      <Work />
      <Clients />
      <TechStack />
      <Activity />
      <Socials />
      <S7Bot />
      <CommandPalette />
    </main>
  );
}
