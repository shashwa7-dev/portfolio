"use client";

import { useEffect, useRef } from "react";
import { DoorOpen } from "@phosphor-icons/react/ssr";

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
 * they accepted, and this page is an invitation. Two lines and a door on it: the
 * whole overlay is the way in, so there is no control to aim at, and whatever
 * else might be said is said better by the letter showing faintly underneath
 * than by more type on top of it.
 *
 * It buys something technical too. The player needs a few seconds to load
 * before it will take commands, and a command sent early is dropped rather than
 * queued. The seconds someone spends reading this are seconds the player spends
 * warming up, so by the time the click lands it is ready to be told to play.
 *
 * Server-rendered rather than raised after hydration, so there is no moment
 * where the letter is visible behind it and then covered.
 *
 * It leaves on a fade, and only when it is pressed. An earlier pass carried the
 * brand mark from the middle of this into its slot on the letter, measuring
 * both and closing the gap, and another lifted the curtain on its own once the
 * browser allowed sound. Both worked. Both were the wrong amount of ceremony in
 * front of a letter that opens by saying its writer does not know how to start,
 * and the second one read as a glitch besides: an overlay that leaves without
 * being touched looks like something misfiring.
 */

export default function Curtain({
  leaving,
  onEnter,
}: {
  /**
   * Fading out, which only ever follows a press. The parent unmounts once the
   * transition has had its time.
   */
  leaving: boolean;
  onEnter: () => void;
}) {
  const button = useRef<HTMLButtonElement | null>(null);

  /**
   * Focus the one control.
   *
   * `autoFocus` as a JSX prop is unreliable here (React drops it in some
   * hydration paths), so the focus is taken explicitly. Without it the first
   * Tab goes somewhere in the letter underneath, which is the one place a
   * reader at this moment has not agreed to be. With it, Enter or Space opens
   * the letter, which is the keyboard equivalent of clicking anywhere.
   */
  useEffect(() => {
    button.current?.focus();
  }, []);

  /**
   * Hold the page still, and let go the moment the curtain starts leaving.
   *
   * Locking is not a nicety: scrolling is one of the things that starts the
   * song, so a page that could be scrolled behind this would let the music
   * begin with the invitation to begin it still on screen.
   *
   * Releasing on `leaving` rather than on unmount matters just as much. The
   * fade outlasts the click by more than a second, and a page that ignored the
   * scroll wheel that long after being pressed would read as broken rather than
   * as gentle.
   */
  useEffect(() => {
    if (leaving) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [leaving]);

  return (
    <>
      {/* With scripting off nothing can ever dismiss this, and the letter would
          be sealed behind it forever. The rule below is inert in every browser
          that runs the component. */}
      <noscript>
        <style>{`[data-curtain]{display:none!important}`}</style>
      </noscript>

      <div
        data-curtain
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 ${leaving ? "pointer-events-none" : ""}`}
      >
        {/* The ground, on a layer of its own so it can fade while the mark
            above it keeps its opacity the whole way across.

            An overlay, not a wall: at 85% the letter and the video carry on
            underneath, faintly, so this reads as something laid over the page
            rather than as a different page that happens to come first.

            No `backdrop-blur`. There is a video playing back there, and a
            viewport-sized backdrop filter over moving pixels re-rasterises
            every frame to soften something the scrim has already taken most of
            the detail out of. */}
        <span
          aria-hidden
          className={`absolute inset-0 bg-background/85 transition-opacity duration-curtain ease-out ${
            leaving ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* The whole overlay is the way in, so there is nothing to aim at and
            nothing that needs a label telling the reader what to do. A real
            `<button>` rather than a div with a handler, so it is reachable by
            keyboard and announces itself as pressable. */}
        <button
          ref={button}
          type="button"
          onClick={onEnter}
          className="group relative flex h-full w-full flex-col items-center justify-center gap-7 px-6 text-center"
        >
          {/* The copy fades with the ground rather than on its own layer. There
              is nothing on this overlay that carries over to the letter, so
              there is nothing that has to survive the transition. */}
          <span
            className={`flex flex-col items-center gap-4 transition-opacity duration-curtain ease-out ${
              leaving ? "opacity-0" : "opacity-100"
            }`}
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

            {/* The part that says this is a thing you press.

                Two warm lines are an invitation, not an affordance: nothing in
                them looks like it can be clicked, and on a phone there is no
                hover to discover it with either. The pill is what makes this
                read as pressable; the glyph inside it says where pressing goes.

                An open door rather than an arrow. The line above says "come on
                in", so the page already has a better word for this than "next",
                and an arrow in a circle is the shape every site uses for every
                destination. "Enter" beside it because a glyph alone still asks
                the reader to guess, and one plain word costs nothing: this is
                the CTA, not an eyebrow, so it is sentence case in the sans
                family rather than the mono small caps the site puts on labels.

                Still not a second control. The button is the whole overlay, so
                a click anywhere works and this only shows where to aim. */}
            <span className="mt-2 flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-base ease-out group-hover:bg-muted">
              <DoorOpen aria-hidden="true" className="h-4 w-4 shrink-0" />
              Enter
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
