import { useEffect, useRef, useState } from "react";

export function useVideoPreview<T extends HTMLVideoElement>() {
  const videoRef = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  //on video end
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0; // rewind
      setIsPlaying(false);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!inView && !video.paused) {
      video.pause();
      setIsPlaying(false);
    }
  }, [inView]);

  const togglePlay = (forcePause?: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    if (forcePause) {
      video.currentTime = 0; // reset video
      setIsPlaying(false);
      return;
    }
    if (video.paused) {
      document.querySelectorAll("video[data-preview]").forEach((v) => {
        if (v !== video) (v as HTMLVideoElement).pause();
      });
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return {
    ref: videoRef,
    isPlaying,
    togglePlay,
    setIsPlaying,
    bind: {
      ref: videoRef,
      "data-preview": true,
      muted: true,
      playsInline: true,
      preload: "metadata",
    },
  };
}
