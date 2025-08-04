"use client";
import { useDarkMode } from "../hooks/useDarkMode";

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div
      className="flex items-center 
 overflow-hidden w-fit"
    >
      <div
        className={
          "w-6 h-6 overflow-hidden cursor-pointer rounded-md border border-b-[3px] transition"
        }
        onClick={toggleDarkMode}
        style={isDarkMode ? { transform: "scale(0.8)" } : {}}
      >
        <img
          src="/images/white-cat.jpg"
          alt="light-mode"
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className={
          "w-6 h-6 overflow-hidden cursor-pointer rounded-md border border-b-[3px] transition"
        }
        onClick={toggleDarkMode}
        style={!isDarkMode ? { transform: "scale(0.8)" } : {}}
      >
        <img
          src="/images/black-cat.jpg"
          alt="dark-mode"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
