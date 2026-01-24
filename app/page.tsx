import About from "../components/About";
import Projects from "../components/Projects";
import TechStack from "../components/TechStack";
import Work from "../components/Work";
import Clients from "@/components/Clients";
import Socials from "@/components/Socials";
import Activity from "@/components/Activity";
import Navbar from "@/components/Navbar";
import CurrentTime from "@/components/CurrentTime";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";

const S7Bot = dynamic(() => import("@/components/ChatBot"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-12 space-y-10">
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

      {/* Footer */}
      <Footer />

      <S7Bot />
    </main>
  );
}
