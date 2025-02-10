import DarkModeToggle from "./ThemeSwitch";

const Intro = () => {
  return (
    <div className="mt-2">
      <div className="grid grid-cols-[1fr_auto]">
        <div className="flex flex-col relative">
          <h1 className=" text-3xl -md:text-2xl  text-secondary-foreground font-sans">
            {"Shashwat Tripathi"}
          </h1>
          <h2 className="font-bold w-fit text-muted-foreground">
            {"Frontend Focused . Fullstack Developer"}
          </h2>
        </div>
        <div className="relative w-[65px] h-[65px] border p-[2px] rounded-md bg-secondary">
          <img src="./new-prof.png" alt="shashwa7.in" className="rounded-[4px] w-full h-full" />
          <div className="absolute w-fit -bottom-[15px] mx-auto right-0 left-0">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
