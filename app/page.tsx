import CurrentState from "./components/CurrentState";
import Footer from "./components/Footer";
import Intro from "./components/Intro";

export default function Home() {
  return (
    <div className="container grid grid-rows-[1fr_auto] h-full max-w-xl z-1 gap-2 place-items-center">
      <div className="grid p-4 h-fit gap-4 my-auto opacity-0 animate-fadeIn border transition-all hover:shadow-lg hover:shadow-blue-100 rounded-md w-11/12 relative z-1 overflow-hidden">
        <Intro />
        <CurrentState />
        <div className="absolute top-0 left-0 w-full h-full z-[-1] opacity-30 blur-sm">
          <img src="/bg2.gif" alt="bg" className="w-full h-full -z-1" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
