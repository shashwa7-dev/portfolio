"use client";

import { useEffect, useRef } from "react";
import { Star, X } from "@phosphor-icons/react/ssr";
import Container from "@/components/layout/Container";
import { gtaMode } from "@/lib/gta6/store";
import { MOD_CSS } from "@/components/gta6/modStyles";
import { useMusic } from "@/components/gta6/useMusic";
import HuntControl from "@/components/gta6/HuntControl";
import Radio from "@/components/gta6/Radio";
import { VICE_HUNT_ENABLED } from "@/lib/gta6";

const WALLPAPERS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
const STARS = [0, 1, 2, 3, 4];

/** The fade time from the element's computed transition (`--duration-gta-fade`). */
function fadeMs(el: HTMLElement | null): number {
  if (!el) return 0;
  const d = getComputedStyle(el).transitionDuration.split(",")[0].trim();
  return d.endsWith("ms") ? parseFloat(d) : (parseFloat(d) || 0) * 1000;
}

type Props = {
  /** The mode has turned off: fade out, then call `onGone`. */
  leaving: boolean;
  onGone(): void;
};

/**
 * Vice City mode in the hero (the `<header>` in About.tsx, which is `relative
 * isolate` so this stays inside it).
 *
 * Behind the content: the wallpaper slideshow under a frosted veil in the
 * page's own paper colour, heavy on the left where the text is and thin on
 * the right where the art is, then a fade at the bottom so the hero melts
 * into the next section. On top, in the header's top padding at the right
 * of the measure: a small cluster with the full wanted row and Exit, with
 * the Vice FM card (`Radio`; the same card moves to the game's HUD) below
 * it, led by Vice Hunt's revolver (`HuntControl`, which opens the
 * full-screen game) when the game is on (`data-gta-cluster`).
 */
export default function GtaMode({ leaving, onGone }: Props) {
  const backdrop = useRef<HTMLDivElement>(null);
  const gone = useRef(onGone);
  useEffect(() => {
    gone.current = onGone;
  });

  // The running Vice Hunt game's exit, if one is running.
  const stopGame = useRef<(() => void) | null>(null);

  // The radio plays for as long as the mode is on; a track ending only moves
  // it to the next.
  const music = useMusic(!leaving);

  // The mode turning off (Exit, the palm) or going away ends a game first,
  // so the page never stays locked under a vanished hero.
  useEffect(() => {
    if (leaving) stopGame.current?.();
  }, [leaving]);
  useEffect(() => () => stopGame.current?.(), []);

  // Fade out, then leave. Turning back on mid-fade cancels it.
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => gone.current(), fadeMs(backdrop.current));
    return () => window.clearTimeout(t);
  }, [leaving]);

  const leavingAttr = leaving ? "" : undefined;

  return (
    <>
      <style>{MOD_CSS}</style>

      <div
        ref={backdrop}
        aria-hidden
        data-leaving={leavingAttr}
        className="gta-fade pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0">
          {WALLPAPERS.map((n, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- full-bleed art fetched only when the mode turns on; next/image adds nothing here
            <img
              key={n}
              src={`/gta6/wallpapers/${n}.webp`}
              alt=""
              decoding="async"
              style={{ "--i": i } as React.CSSProperties}
              className="gta-wall absolute inset-0 h-full w-full object-cover"
            />
          ))}
        </div>
        <div className="gta-veil absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(transparent,hsl(var(--background)))]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-2 z-40">
        <Container width="reading">
          <div className="relative">
            <div
              data-gta-cluster
              data-leaving={leavingAttr}
              className="gta-fade pointer-events-auto absolute right-0 top-0 flex h-6 items-center gap-2.5 rounded-full border border-border bg-background/85 px-2.5 font-label text-2xs uppercase tracking-label text-muted-foreground backdrop-blur-sm"
            >
              {VICE_HUNT_ENABLED && (
                <HuntControl
                  stopRef={stopGame}
                  leaving={leaving}
                  onBigfoot={music.setDuck}
                />
              )}
              <span role="img" aria-label="Wanted: five stars" className="flex gap-0.5 text-accent">
                {STARS.map((n) => (
                  <Star key={n} aria-hidden weight="fill" className="h-2.5 w-2.5" />
                ))}
              </span>
              <button
                type="button"
                onClick={() => {
                  stopGame.current?.();
                  gtaMode.set(false);
                }}
                className="inline-flex items-center gap-1 uppercase transition-colors duration-fast ease-out hover:text-foreground"
              >
                <X aria-hidden weight="bold" className="h-2.5 w-2.5" />
                Exit
              </button>
            </div>
            {/* Vice FM, under the cluster (or beside the measure on wide screens). */}
            <div data-leaving={leavingAttr} className="gta-fade pointer-events-auto">
              <Radio place="hero" />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
