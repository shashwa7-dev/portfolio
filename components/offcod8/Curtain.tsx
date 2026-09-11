"use client";

import { useEffect, useRef } from "react";

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
 * they accepted, and this page is an invitation. Two lines and nothing else on
 * it: the whole overlay is the door, so there is no label to write and no
 * control to aim at, and whatever else might be said here is said better by the
 * letter showing faintly underneath than by more type on top of it.
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
   * reader at this moment has not agreed to be. With it, Enter or Space opens
   * the letter, which is the keyboard equivalent of clicking anywhere.
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

          No `backdrop-blur`. There is a video playing back there, and a
          viewport-sized backdrop filter over moving pixels re-rasterises every
          frame to soften something the scrim has already taken most of the
          detail out of. */}
      <div
        data-curtain
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-background/85"
      >
        {/* The whole overlay is the way in, so there is nothing to aim at and
            nothing that needs a label telling the reader what to do. It is a
            real `<button>` rather than a div with a handler, so it is reachable
            by keyboard and announces itself as something that can be pressed,
            and its two lines are its accessible name. */}
        <button
          ref={button}
          type="button"
          onClick={onEnter}
          className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <span className="text-balance text-[clamp(2rem,5vw,2.75rem)] font-medium leading-tight tracking-tight text-foreground">
            I&apos;m glad you&apos;re here.
          </span>
          {/* The second line is the invitation and the instruction at once. A
              separate "click to continue" would be a third line saying what
              this one already implies. */}
          <span className="text-balance text-lg leading-relaxed text-muted-foreground">
            Come on in, whenever you&apos;re ready.
          </span>
        </button>
      </div>
    </>
  );
}
