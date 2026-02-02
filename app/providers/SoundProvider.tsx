"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const SOUND_MUTED_KEY = "soundMuted";
const CLICK_SOUND_SRC = "/sound/mouse-click.wav";
const INTRO_SOUND_SRC = "/sound/intro.mp3";

type SoundContextValue = {
  muted: boolean;
  toggleMuted: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}

const isInteractive = (el: HTMLElement | null) =>
  el?.closest(
    'button, a, input, textarea, select, [role="button"], [data-click-sound]'
  );

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load mute state
  useEffect(() => {
    const stored = localStorage.getItem(SOUND_MUTED_KEY);
    setMuted(stored === "true");
  }, []);

  // Play intro sound once when provider is initialized (respects saved mute preference)
  const hasPlayedIntroRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || hasPlayedIntroRef.current) return;
    if (localStorage.getItem(SOUND_MUTED_KEY) === "true") return;

    hasPlayedIntroRef.current = true;
    const intro = new Audio(INTRO_SOUND_SRC);
    intro.volume = 1;
    intro.play().catch(() => {});
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_MUTED_KEY, String(next));
      return next;
    });
  }, []);

  // Init + global listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      audioRef.current = new Audio(CLICK_SOUND_SRC);
      audioRef.current.volume = 0.5;
    }

    const audio = audioRef.current;

    const play = () => {
      if (muted) return;
      audio.currentTime = 0;
      audio.play().catch(() => { });
    };

    const onClick = (e: MouseEvent) => {
      if (isInteractive(e.target as HTMLElement)) play();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (isInteractive(e.target as HTMLElement)) play();
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [muted]);

  return (
    <SoundContext.Provider value={{ muted, toggleMuted }}>
      {children}
    </SoundContext.Provider>
  );
}