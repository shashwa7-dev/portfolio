"use client";

import { useEffect, useRef, useState } from "react";
import { MusicNotes } from "@phosphor-icons/react/ssr";
import { isTheme } from "@/lib/theme";

/**
 * The candy theme's soundtrack, mounted inside the Navbar beside the theme
 * toggle so its control sits in the header's control row.
 *
 * One pill, one job: the music is either on or off. Clicking it plays or pauses
 * the loop; there is no separate mute.
 *
 * The rule that shapes this component: the track auto-plays only on the
 * transition INTO candy, never on load. A browser blocks unmuted playback that
 * is not tied to a user gesture, and a refresh into candy is not one: the boot
 * script sets `data-theme` with nobody having clicked anything. So the audio is
 * started from the synchronous `themechange` handler, which runs inside the
 * click that flips the theme (the toggle, the command palette, the shortcut all
 * dispatch it), and mount records the current theme without ever calling play.
 * Land in candy by refresh and the pill simply sits in its off state until
 * clicked.
 *
 * The `<audio>` element is always in the tree (not gated on the theme) so its
 * ref is live the instant that handler fires; `preload="none"` keeps it from
 * fetching the 800KB track until something actually plays it. Only the pill is
 * candy-gated. Leaving candy pauses and rewinds, so re-entering starts the loop
 * from the top rather than mid-phrase.
 */
const TRACK_SRC = "/candy-vibe.opus";
const VOLUME = 0.55;

function readTheme() {
  const t = document.documentElement.dataset.theme;
  return isTheme(t) ? t : "light";
}

export default function CandyMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isCandy, setIsCandy] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = VOLUME;
  }, []);

  // Follow the theme, and auto-play only when it flips INTO candy from a click.
  useEffect(() => {
    let prev = readTheme();
    setIsCandy(prev === "candy");

    const onChange = () => {
      const next = readTheme();
      const enteringCandy = next === "candy" && prev !== "candy";
      const leavingCandy = next !== "candy" && prev === "candy";
      prev = next;
      setIsCandy(next === "candy");

      const audio = audioRef.current;
      if (!audio) return;
      if (enteringCandy) {
        // Synchronous with the toggle click, so the autoplay gate is open.
        void audio.play().catch(() => {});
      } else if (leavingCandy) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => {});
    else audio.pause();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={TRACK_SRC}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        hidden
      />
      {isCandy && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Turn music off" : "Turn music on"}
          aria-pressed={playing}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground transition-transform duration-fast ease-out active:scale-[0.94] sticker sticker-sm tilt-a"
        >
          <MusicNotes className="h-4 w-4" weight={playing ? "fill" : "regular"} />
        </button>
      )}
    </>
  );
}
