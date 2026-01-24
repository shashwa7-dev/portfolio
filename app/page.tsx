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
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <CurrentTime />
            <p>
              &copy; {new Date().getFullYear()} Shashwat Tripathi •{" "}
              <a
                href="https://github.com/shashwa7-dev/my-portfolio/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-accent transition-colors underline underline-offset-4"
              >
                MIT License
              </a>
            </p>
          </div>
        </div>
      </footer>

      <S7Bot />
    </main>
  );
}
