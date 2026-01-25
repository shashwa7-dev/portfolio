import About from "../components/About";
import Projects from "../components/Projects";
import TechStack from "../components/TechStack";
import Work from "../components/Work";
import Clients from "@/components/Clients";
import Socials from "@/components/Socials";
import Activity from "@/components/Activity";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";

const S7Bot = dynamic(() => import("@/components/ChatBot"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-10 space-y-10">
        {/* Hero / About */}
        <section>
          <About />
        </section>
        <Separator />

        {/* Side Projects — show work first */}
        <section>
          <Projects />
        </section>
        <Separator />

        {/* Work Experience */}
        <section>
          <Work />
        </section>
        <Separator />

        {/* Clients — prominent full-width */}
        <section>
          <Clients />
        </section>

        {/* Tech Stack */}
        <section>
          <TechStack />
        </section>
        <Separator />

        {/* Meta: Socials | Activity */}
        <section className="space-y-8">
          <Activity />
          <Socials />
        </section>
      </div>

      <S7Bot />
    </main>
  );
}
