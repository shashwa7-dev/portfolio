import CurrentState from "./components/CurrentState";
import Footer from "./components/Footer";
import Intro from "./components/Intro";

export default function Home() {
  return (
    <div className="container grid grid-rows-[1fr_auto] h-full max-w-2xl z-1 gap-2">
      <div className="grid p-4 h-fit gap-4 my-auto opacity-0 animate-fadeIn">
        <Intro />
        <CurrentState />
      </div>
      <Footer />
      <div className="w-[100px] h-[100px] opacity-30 fixed bottom-2  right-2 -z-1 rounded-full overflow-hidden border-4">
        <img src={"/s7dev.png"} alt="" className="w-full h-full" />
      </div>
      <div className="w-full h-full opacity-30 blur-sm fixed left-0  bottom-0  -z-10 overflow-hidden">
        <img
          src={"/bg.gif"}
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
