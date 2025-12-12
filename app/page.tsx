import About from "../components/About";
import Activity from "../components/Activity";
import Footer from "../components/Footer";
import Projects from "../components/Projects";
import Socials from "../components/Socials";
import Clients from "../components/Clients";
import TechStack from "../components/TechStack";
import Work from "../components/Work";
import Brand from "@/components/Brand";

export default function Home() {
  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Left - Main Content */}
        <div className="space-y-6">
          <About />
          <Work />
          <Projects />
          <TechStack />
        </div>

        {/* Right - Sidebar */}
        <aside className="space-y-6 sticky top-2 h-fit">
          <Clients />
          <Socials />
          <Activity />
        </aside>
      </div>
      <Brand />
    </div>
  );
}
