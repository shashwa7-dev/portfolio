import About from "./components/About";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import Projects from "./components/Projects";
import Socials from "./components/Socials";
import TechStack from "./components/TechStack";
import Work from "./components/Work";

export default function Home() {
  return (
    <div className="container  max-w-xl p-4 grid gap-4">
      <Intro />
      <About />
      <Work />
      <Projects />
      <TechStack />
      <Socials />
      <Footer />
    </div>
  );
}
