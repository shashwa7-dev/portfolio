// /lib/useVideoPreview.ts
import { useCallback, useEffect, useRef, useState } from "react";

export function useVideoPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = true; // REQUIRED (browser policy)
      video.playsInline = true;
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      // autoplay may fail silently — ignore
      console.warn("Video play blocked", err);
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  }, []);

  // keep state in sync if user pauses via native controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  return {
    isPlaying,
    play,
    pause,
    bind: {
      ref: videoRef,
      muted: true,
      playsInline: true,
      preload: "metadata",
    },
  };
}
