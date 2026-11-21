"use client";

import { useEffect, useRef, useState } from "react";
import GameMode from "@/components/gta6/game/GameMode";

type HuntModule = typeof import("@games/vice-hunt");

type Props = {
  /** Filled with a close for the open game while one is open, so `GtaMode`
   *  can end it first when the mode turns off (Exit, the palm, or unmounting). */
  stopRef: React.RefObject<(() => void) | null>;
  /** Runs after the game has fully closed (Back to site, or `stopRef`). */
  onStopped(): void;
  /** The mode is fading out: no new game. */
  leaving: boolean;
  /** Bigfoot is on (true) or gone (false), for the music to dip under him. */
  onBigfoot(active: boolean): void;
};

/** Touch has no pointer to aim with, so the game is not offered there. */
function coarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * The pick-up revolver, a side view drawn small. A placeholder until the
 * owner's own icon set arrives.
 */
function RevolverIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      {/* barrel, frame and cylinder, then the grip angled down and back */}
      <path d="M7 6.2h14.6a.9.9 0 0 1 .9.9v1.3a.6.6 0 0 1-.6.6H13.2v1.6a1.7 1.7 0 0 1-1.7 1.7H10l-.7 1.3a1 1 0 0 1-.9.5h-.5l-2 5.4a1 1 0 0 1-.9.6H2.7a.6.6 0 0 1-.6-.8l2.5-6.6c.2-.4.3-.9.3-1.3V8.2a2 2 0 0 1 2-2Z" />
      {/* hammer */}
      <path d="M5.6 6.4 4.4 4.6h1.7l1.3 1.6Z" />
      {/* trigger guard */}
      <path
        d="M8.6 12.7c-.1 1.5.8 2.5 2.3 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Vice Hunt's revolver in the mode's control cluster.
 *
 * The game package is fetched and its sprites decoded in the background as
 * soon as the mode is on; until then the button is disabled under a spinning
 * ring. A click opens the full-screen game mode (`GameMode`), portalled over
 * the whole page; Back to site closes it and puts focus back on this button.
 */
export default function HuntControl({ stopRef, onStopped, leaving, onBigfoot }: Props) {
  const [coarse] = useState(coarsePointer);
  const [game, setGame] = useState<HuntModule | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  // Set by Back to site, the one close that hands focus back here (the mode
  // turning off takes this button away with it).
  const returnFocus = useRef(false);
  const wasOpen = useRef(false);
  const stopped = useRef(onStopped);
  useEffect(() => {
    stopped.current = onStopped;
  });

  useEffect(() => {
    if (coarse) return;
    let live = true;
    import("@games/vice-hunt")
      .then(async (m) => {
        await m.preloadHunt();
        if (live) setGame(m);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [coarse]);

  // While open, `GtaMode` can close it from outside.
  useEffect(() => {
    if (!open) return;
    stopRef.current = () => setOpen(false);
    return () => {
      stopRef.current = null;
    };
  }, [open, stopRef]);

  // After a close. `GameMode`'s own cleanup (page un-inerted, scroll
  // unlocked) has already run by now, so the button can take focus.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    if (returnFocus.current) {
      returnFocus.current = false;
      button.current?.focus();
    }
    stopped.current();
  }, [open]);

  if (coarse) return null;

  const loading = !game && !failed;
  const title = loading ? "Loading the game" : failed ? "Game failed to load" : "Pick up the revolver";

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(true)}
        disabled={!game || leaving || open}
        title={title}
        aria-label={title}
        aria-busy={loading || undefined}
        className="relative grid h-5 w-5 place-items-center rounded-full transition-colors duration-fast ease-out hover:text-foreground disabled:opacity-60 disabled:hover:text-muted-foreground"
      >
        <RevolverIcon />
        {loading && (
          <span
            aria-hidden
            className="absolute inset-0 animate-[spin_var(--duration-gta-loader)_linear_infinite] rounded-full border-2 border-current/20 border-t-current"
          />
        )}
      </button>
      {open && game && (
        <GameMode
          game={game}
          onBigfoot={onBigfoot}
          onClose={() => {
            returnFocus.current = true;
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
