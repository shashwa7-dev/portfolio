"use client";

import { useState, useEffect } from "react";

export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (savedTheme === null && prefersDarkMode)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div
      className="flex items-center 
 overflow-hidden w-fit"
    >
      <div
        className={
          "w-5 h-5 overflow-hidden cursor-pointer rounded-md border border-b-[3px] transition"
        }
        onClick={() => toggleDarkMode(false)}
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
          "w-5 h-5 overflow-hidden cursor-pointer rounded-md border border-b-[3px] transition"
        }
        onClick={() => toggleDarkMode(true)}
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
