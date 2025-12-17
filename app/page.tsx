import MetaContent from "@/components/MetaContent";
import About from "../components/About";
import Projects from "../components/Projects";
import TechStack from "../components/TechStack";
import Work from "../components/Work";
import Brand from "@/components/Brand";
import S7Bot from "@/components/ChatBot";


export default function Home() {
  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto pb-0 md:p-0 grid lg:grid-cols-[1fr_325px] md:gap-2">
        <div className="space-y-6 p-4 backdrop-blur-sm md:border-x">
          <About />
          <Work />
          <Projects />
          <TechStack />
        </div>
        <MetaContent />
      </div>
      <Brand />
      <S7Bot />
    </div>
  );
}
