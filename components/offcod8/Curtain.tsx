"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react/ssr";

/**
 * The threshold in front of the letter.
 *
 * It exists because of a browser rule, and then turned out to be the better
 * way in anyway. Audio cannot start unasked: a browser will refuse an unmute
 * that has no user activation behind it, and refuse it silently. One deliberate
 * click is the only thing that is guaranteed to work, everywhere, first time.
 *
 * Having to ask is not a cost here. A song that begins on its own is something
 * done to a reader; a song that begins because they said yes is an invitation
 * they accepted, and this page is an invitation. Six words and a button: the
 * greeting, the way in, and a warning that sound is coming, which is the
 * difference between a welcome and an ambush.
 *
 * It buys something technical too. The player needs a few seconds to load
 * before it will take commands, and a command sent early is dropped rather than
 * queued. The seconds someone spends reading this are seconds the player spends
 * warming up, so by the time the click lands it is ready to be told to play.
 *
 * Server-rendered rather than raised after hydration, so there is no moment
 * where the letter is visible behind it and then covered.
 */
export default function Curtain({ onEnter }: { onEnter: () => void }) {
  const button = useRef<HTMLButtonElement | null>(null);

  /**
   * Focus the one control, and hold the page still behind it.
   *
   * The scroll lock is not a nicety. Scrolling is one of the things that starts
   * the song, so a page that could be scrolled behind this would let the music
   * begin while the invitation to begin it was still on screen.
   *
   * `autoFocus` as a JSX prop is unreliable here (React drops it in some
   * hydration paths), so the focus is taken explicitly. Without it the first
   * Tab goes somewhere in the letter underneath, which is the one place a
   * reader at this moment has not agreed to be.
   */
  useEffect(() => {
    button.current?.focus();

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  return (
    <>
      {/* With scripting off nothing can ever dismiss this, and the letter would
          be sealed behind it forever. The rule below is inert in every browser
          that runs the component. */}
      <noscript>
        <style>{`[data-curtain]{display:none!important}`}</style>
      </noscript>

      {/* An overlay, not a wall. At 85% the letter and the video carry on
          underneath, faintly, so this reads as something laid over the page
          rather than as a different page that happens to come first.

          No `backdrop-blur`. There is a video playing behind this, and a
          viewport-sized backdrop filter over moving pixels re-rasterises every
          frame to soften something the scrim has already taken most of the
          detail out of. */}
      <div
        data-curtain
        role="dialog"
        aria-modal="true"
        aria-labelledby="curtain-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-6"
      >
        <div className="flex w-full max-w-[30ch] flex-col items-center gap-6 text-center">
          <h2
            id="curtain-title"
            className="text-2xl font-medium tracking-tight text-foreground md:text-3xl"
          >
            I&apos;m glad you&apos;re here.
          </h2>

          <button
            ref={button}
            type="button"
            onClick={onEnter}
            className="group flex items-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-fast ease-out hover:bg-muted"
          >
            Take me there
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 transition-transform duration-fast ease-out group-hover:translate-x-0.5"
            />
          </button>

          {/* Two words, and they earn their place: sound is about to start, and
              a reader who is somewhere they cannot have that should find out
              before it happens rather than after. */}
          <p className="font-mono text-2xs uppercase tracking-label text-subtle">
            Plays with sound
          </p>
        </div>
      </div>
    </>
  );
}
