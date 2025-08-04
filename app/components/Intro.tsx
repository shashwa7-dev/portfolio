import DarkModeToggle from "./ThemeSwitch";
import ToolsAndStack from "./ToolStack";

const Intro = () => {
  return (
    <div className="py-2 sticky top-0  bg-background z-10">
      <div className="flex gap-6 justify-between">
        <div className="flex flex-col relative">
          <h1 className="text-2xl leading-none -md:text-2xl  text-secondary-foreground font-sans">
            {"Shashwat Tripathi"}
          </h1>
          <h2 className="font-bold w-fit text-muted-foreground mb-2">
            {"Frontend Focused . Fullstack Developer"}
          </h2>
          <ToolsAndStack />
        </div>
        <div className="relative w-[60px] h-[60px] flex-shrink-0 border p-[2px] rounded-xl bg-secondary">
          <img
            src="./new-prof.png"
            alt="shashwa7.in"
            className="rounded-lg w-full h-full"
          />
          <div className="absolute w-fit -bottom-[15px] mx-auto right-0 left-0">
            <DarkModeToggle />
          </div>
        </div>
      </div>
      {/* Bottom gradient mask */}
      <div className="absolute -bottom-4 rotate-180 left-0 right-0 h-4 trans bg-gradient-to-b from-transparent to-background pointer-events-none"></div>
    </div>
  );
};

export default Intro;
