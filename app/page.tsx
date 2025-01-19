import About from "./components/About";
import Activity from "./components/Activity";
import { BlogPosts } from "./components/BlogPosts";
import S7Bot from "./components/ChatBot";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import KeyboardNavigation from "./components/KeyboardNavigation";
import Projects from "./components/Projects";
import Socials from "./components/Socials";
import TechStack from "./components/TechStack";
import Work from "./components/Work";

export default function Home() {
  return (
    <div className="container  max-w-2xl p-4 grid gap-4 relative">
      <Intro />
      <About />
      <Work />
      <BlogPosts />
      <Projects />
      <TechStack />
      <Activity />
      <Socials />
      <Footer />
      <KeyboardNavigation />
      <S7Bot />
    </div>
  );
}
