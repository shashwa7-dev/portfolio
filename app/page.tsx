import About from "../components/About";
import Activity from "../components/Activity";
import S7Bot from "../components/ChatBot";
import Footer from "../components/Footer";
import Intro from "../components/Intro";
import KeyboardNavigation from "../components/KeyboardNavigation";
import Projects from "../components/Projects";
import Socials from "../components/Socials";
import Clients from "../components/Clients";
import TechStack from "../components/TechStack";
import Work from "../components/Work";

export default function Home() {
  return (
    <div className="container max-w-3xl  relative">
      <div className="p-4 grid gap-4">
        <Intro />
        <About />
        <Clients />
        <Work />
        <Projects />
        <TechStack />
        <Activity />
        <Socials />
      </div>
      <Footer />
      <KeyboardNavigation />
      <S7Bot />
    </div>
  );
}
