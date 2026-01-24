"use client";

import { useEffect, useState } from "react";

const BOTTOM_THRESHOLD = 32;

function isAtBottom(): boolean {
  if (typeof window === "undefined") return false;
  const { scrollY, innerHeight } = window;
  const { scrollHeight } = document.documentElement;
  return scrollY + innerHeight >= scrollHeight - BOTTOM_THRESHOLD;
}

export function BottomFadeMask() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const check = () => setVisible(!isAtBottom());
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-10 transition-opacity duration-300"
      style={{
        background:
          "linear-gradient(to top, hsl(var(--background)), transparent)",
        opacity: visible ? 1 : 0,
      }}
      aria-hidden="true"
    />
  );
}
