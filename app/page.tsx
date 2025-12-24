import MetaContent from "@/components/MetaContent";
import About from "../components/About";
import Projects from "../components/Projects";
import TechStack from "../components/TechStack";
import Work from "../components/Work";
import Brand from "@/components/Brand";
import S7Bot from "@/components/ChatBot";
import dynamic from "next/dynamic";

const LazyLoadTruffy = dynamic(() => import("@/components/Drocto"));
export default function Home() {
  return (
    <div className="relative">
      <div className="max-w-screen-xl mx-auto pb-0 md:p-0 grid lg:grid-cols-[1fr_325px] xl:grid-cols-[225px_1fr_325px]">
        <div className="hidden xl:flex flex-col justify-end sticky top-0 p-2 py-4  h-[100dvh] items-end">
          <LazyLoadTruffy />
        </div>
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
