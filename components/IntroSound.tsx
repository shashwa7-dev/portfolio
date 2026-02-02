"use client";

import { useEffect, useRef } from "react";

const INTRO_PLAYED_KEY = "introPlayed";
const SOUND_MUTED_KEY = "soundMuted";
const INTRO_SOUND_SRC = "/sound/intro.mp3";

export function IntroSoundOnScroll() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const firedRef = useRef(false);

    const initAudio = () => {
        if (!audioRef.current) {
            const a = new Audio(INTRO_SOUND_SRC);
            a.volume = 0.2;
            a.preload = "none";
            audioRef.current = a;
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        // if (localStorage.getItem(SOUND_MUTED_KEY) === "true") return;
        // if (localStorage.getItem(INTRO_PLAYED_KEY) === "true") return;
        if (window.matchMedia("(prefers-reduced-motion)").matches) return;

        const playOnce = () => {
            if (firedRef.current) return;
            firedRef.current = true;

            initAudio();
            audioRef.current?.play().catch(() => { });
            localStorage.setItem(INTRO_PLAYED_KEY, "true");

            cleanup();
        };

        const cleanup = () => {
            window.removeEventListener("scroll", playOnce);
            window.removeEventListener("wheel", playOnce);
            window.removeEventListener("touchmove", playOnce);
            document.removeEventListener("pointerdown", playOnce);
        };

        window.addEventListener("scroll", playOnce, { passive: true });
        window.addEventListener("wheel", playOnce, { passive: true });
        window.addEventListener("touchmove", playOnce, { passive: true });
        document.addEventListener("pointerdown", playOnce, { once: true });

        return cleanup;
    }, []);

    return null;
}