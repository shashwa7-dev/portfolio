import AvatarWithThemeSwitch from "./AvatarWithThemeSwitch";
import DarkModeToggle from "./AvatarWithThemeSwitch";
import ToolsAndStack from "./ToolStack";

const Intro = () => {
  return (
    <div className="pt-2 pb-4 sticky top-0  bg-background z-10">
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
        <AvatarWithThemeSwitch />
      </div>
      {/* Bottom gradient mask */}
      <div className="absolute -bottom-4 rotate-180 left-0 right-0 h-4 trans bg-gradient-to-b from-transparent to-background pointer-events-none"></div>
    </div>
  );
};

export default Intro;
