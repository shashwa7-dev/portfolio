import About from "./components/About";
import Activity from "./components/Activity";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import KeyboardNavigation from "./components/KeyboardNavigation";
import Projects from "./components/Projects";
import Socials from "./components/Socials";
import TechStack from "./components/TechStack";
import Work from "./components/Work";

export default function Home() {
  return (
    <div className="container  max-w-xl p-4 grid gap-4 relative">
      <Intro />
      <About />
      <Work />
      <Projects />
      <TechStack />
      <Activity />
      <Socials />
      <Footer />
      <KeyboardNavigation />
    </div>
  );
}
