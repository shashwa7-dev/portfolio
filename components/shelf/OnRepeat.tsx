"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Track } from "@/lib/playlist";

/** Fifteen seconds. Long enough to place a song, short enough not to be a player. */
const PREVIEW_MS = 15_000;

/** Five bars, read from the bottom half of the spectrum where music actually is. */
const BARS = 5;

/**
 * The listening section, with a fifteen second taste of each track.
 *
 * Audio comes from Apple's preview clips rather than from YouTube. Playing
 * through YouTube would mean their iframe player, a third-party script on a
 * page that has none, cookies alongside it, and a genuine chance of serving an
 * advert to somebody who asked to hear fifteen seconds of a song. Apple's clips
 * are plain audio files served with `access-control-allow-origin: *`, and that
 * header is the whole reason the bars below are real.
 *
 * One `<audio>` element for the whole list, not one per row. `createMediaElementSource`
 * can only ever be called once on a given element, so a per-row element would
 * mean a per-row graph, and the second track to play would find its element
 * already claimed.
 */
export default function OnRepeat({ tracks }: { tracks: Track[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    timerRef.current = null;
    frameRef.current = null;
    audioRef.current?.pause();
    setPlaying(null);
  }, []);

  /* Nothing here survives the component. A preview still running after the
     reader has navigated away is a browser tab that mysteriously sings. */
  useEffect(() => stop, [stop]);

  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const spectrum = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(spectrum);
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        /* Spread the bars across the lower half of the bins. The top half is
           mostly air: cymbals and hiss, which barely move and would leave two
           of five bars looking broken. */
        const bin = Math.floor(((i + 0.5) / BARS) * (spectrum.length / 2));
        const level = spectrum[bin] / 255;
        // A floor, so a quiet passage reads as quiet rather than as stopped.
        bar.style.transform = `scaleY(${0.15 + level * 0.85})`;
      });
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const play = useCallback(
    async (track: Track) => {
      if (!track.preview) return;
      if (playing === track.url) return stop();

      stop();
      const audio = audioRef.current;
      if (!audio) return;

      /* Built on the first press and never again, and it has to be a press:
         browsers refuse to start an AudioContext without a gesture behind it. */
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (Ctor) {
          const ctx = new Ctor();
          const analyser = ctx.createAnalyser();
          // 64 bins is coarse, which is what five bars want. A finer transform
          // would cost more and then be averaged away.
          analyser.fftSize = 64;
          // Without smoothing the bars strobe rather than move.
          analyser.smoothingTimeConstant = 0.75;
          ctx.createMediaElementSource(audio).connect(analyser);
          analyser.connect(ctx.destination);
          ctxRef.current = ctx;
          analyserRef.current = analyser;
        }
      }
      // Suspended is the normal state for a context built in a background tab.
      await ctxRef.current?.resume().catch(() => {});

      audio.src = track.preview;
      try {
        await audio.play();
      } catch {
        // Autoplay refused, or the clip would not load. Say nothing and stay put.
        return;
      }

      setPlaying(track.url);
      timerRef.current = setTimeout(stop, PREVIEW_MS);
      draw();
    },
    [playing, stop, draw]
  );

  return (
    <>
      {/* `crossOrigin` is load-bearing, not hygiene. Without it the element is
          treated as tainted, `createMediaElementSource` yields silence, and the
          bars would sit at zero while the song plays perfectly well. */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="none" hidden />

      {/* Rows on air, tinted on hover. See the note in GearTimeline: a rule
          between every row separates things that were not running together,
          and the tint only appears where it is useful. */}
      <ul className="-mx-3">
        {tracks.map((track) => {
          const isPlaying = playing === track.url;
          return (
            <li
              key={track.url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-base ease-out",
                // The playing row keeps the tint whether or not anyone is
                // pointing at it, since it is the row making the noise.
                isPlaying ? "bg-elevated" : "hover:bg-elevated"
              )}
            >
              {/* The sleeve is the play button when there is something to play,
                  and a plain picture when there is not. A control that does
                  nothing is worse than no control. */}
              {track.preview ? (
                <button
                  type="button"
                  onClick={() => play(track)}
                  aria-label={
                    isPlaying
                      ? `Stop ${track.title}`
                      : `Play 15 seconds of ${track.title}`
                  }
                  className="group relative block h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-border transition-transform duration-fast ease-out active:scale-95"
                >
                  <Sleeve track={track} spinning={isPlaying} />
                  {/* Dark wash under the icon, because a sleeve can be any
                      colour and a bare white glyph disappears on half of them. */}
                  <span
                    className={cn(
                      "absolute inset-0 grid place-items-center bg-black/45 text-white transition-opacity duration-fast ease-out",
                      isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {isPlaying ? (
                      <Square className="h-3 w-3 fill-current" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                  </span>
                </button>
              ) : (
                <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                  <Sleeve track={track} spinning={false} />
                </span>
              )}

              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    {track.title}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {track.artist}
                  </span>
                </span>

                {isPlaying ? (
                  /* Driven by the analyser through refs rather than state. At
                     sixty frames a second a `setState` per frame would rerender
                     this list sixty times a second to move five bars. */
                  <span
                    aria-hidden
                    className="flex h-4 shrink-0 items-center gap-[2px]"
                  >
                    {Array.from({ length: BARS }, (_, i) => (
                      <span
                        key={i}
                        ref={(el) => {
                          barRefs.current[i] = el;
                        }}
                        className="h-full w-[2px] origin-center rounded-full bg-foreground"
                        style={{ transform: "scaleY(0.15)" }}
                      />
                    ))}
                  </span>
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-subtle transition-transform duration-base ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * The sleeve itself.
 *
 * Greyscale at rest like every other image on the site, and in full colour
 * while it is playing, which makes the row that is making noise the only
 * coloured thing on the page.
 *
 * It turns while it plays. That is a loop, which this site otherwise avoids,
 * and it earns the exception by reporting a state rather than decorating one:
 * it starts on a press, it stops fifteen seconds later, and it is the only
 * thing on screen saying which of five rows is the one you can hear. Under
 * `prefers-reduced-motion` the global rule cuts every animation to a single
 * near-instant pass, so it simply does not turn.
 */
function Sleeve({ track, spinning }: { track: Track; spinning: boolean }) {
  return (
    <Image
      src={track.artwork}
      alt=""
      fill
      sizes="44px"
      className={cn(
        "object-cover transition-[filter] duration-base ease-out",
        spinning ? "animate-spin-record grayscale-0" : "grayscale"
      )}
    />
  );
}
