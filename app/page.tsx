import CurrentState from "./components/CurrentState";
import Footer from "./components/Footer";
import Intro from "./components/Intro";

export default function Home() {
  return (
    <div
      className="container p-5 lg:p-10 lg:pb-5 flex flex-col gap-6 h-full opacity-0 animate-fadeIn max-w-2xl"
      style={{ zIndex: 1 }}
    >
      <Intro />
      <CurrentState />
      <Footer />
    </div>
  );
}
