"use client";
import { useDarkMode } from "../app/hooks/useDarkMode";
import Avatar from "./Avatar";
import { SVGS } from "./SVGS";

export default function AvatarWithThemeSwitch() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="relative h-fit">
      <div className="w-[80px] h-[80px] overflow-hidden rounded-full border-4">
        <Avatar isDarkMode={isDarkMode} />{" "}
      </div>
      <div className="flex items-center w-fit absolute -bottom-3 left-0 right-0 mx-auto rounded-xl border-4 overflow-hidden bg-card p-1 gap-2">
        <div
          onClick={toggleDarkMode}
          className="w-3 h-3 cursor-pointer transition-transform duration-500 ease-in-out hover:scale-110"
        >
          {isDarkMode ? (
            <SVGS.Moon className="w-full h-full" />
          ) : (
            <SVGS.Sun className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
