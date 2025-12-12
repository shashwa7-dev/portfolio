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
      <div className="max-w-6xl mx-auto p-6 pb-0 md:p-0 grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Left - Main Content */}
        <div className="space-y-6 backdrop-blur-sm md:border-x md:p-6">
          <About />
          <Work />
          <Projects />
          <TechStack />
        </div>

        {/* Right - Sidebar */}
        <aside className="space-y-6 sticky top-0 h-fit backdrop-blur-sm pb-4 md:pt-6">
          <Clients />
          <Socials />
          <Activity />
        </aside>
      </div>
      <Brand />
    </div>
  );
}
