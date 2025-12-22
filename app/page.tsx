import MetaContent from "@/components/MetaContent";
import About from "../components/About";
import Projects from "../components/Projects";
import TechStack from "../components/TechStack";
import Work from "../components/Work";
import Brand from "@/components/Brand";
import S7Bot from "@/components/ChatBot";
import dynamic from "next/dynamic";
import Image from "next/image";

const LazyLoadTruffy = dynamic(() => import("@/components/Truffy"));
export default function Home() {
  return (
    <div className="relative">
      <div className="max-w-screen-xl mx-auto pb-0 md:p-0 grid lg:grid-cols-[1fr_325px] xl:grid-cols-[225px_1fr_325px]">
        <LazyLoadTruffy />
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
      <div className="fixed top-0 left-0 z-[-1] opacity-5 w-full h-full">
        <Image
          src="/stardew_2.png"
          alt=""
          fill
          placeholder="blur"
          blurDataURL="/stardew_2.png"
          className="object-cover"
        />
      </div>
    </div>
  );
}
