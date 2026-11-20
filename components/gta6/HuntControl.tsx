"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair } from "@phosphor-icons/react/ssr";
import { useHoleSink } from "@/components/gta6/holes";

type HuntModule = typeof import("@games/vice-hunt");

type Props = {
  /** Filled with the running game's exit while one runs, so `GtaMode` can end
   *  it first when the mode turns off (Exit, the palm, or unmounting). */
  stopRef: React.RefObject<(() => void) | null>;
  /** Runs after a game has fully ended (Esc, right click, or `stopRef`). */
  onStopped(): void;
  /** The mode is fading out: no new game. */
  leaving: boolean;
};

/** Touch has no pointer to aim with, so the game is not offered there. */
function coarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Vice Hunt's pistol in the mode's control cluster.
 *
 * The game package is fetched and its sprites decoded in the background as
 * soon as the mode is on; until then the button is disabled under a spinning
 * ring. A click scrolls to the top, locks the page, and starts the game on a
 * layer over the whole hero `<header>` (z-30, under the cluster's z-40, so
 * Exit stays clickable). That layer sits on the same box as the veil, so the
 * game's host-relative shot points are the veil's coordinates as they are.
 */
export default function HuntControl({ stopRef, onStopped, leaving }: Props) {
  const holes = useHoleSink();
  const [coarse] = useState(coarsePointer);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [playing, setPlaying] = useState(false);
  const game = useRef<HuntModule | null>(null);
  const button = useRef<HTMLButtonElement>(null);
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
        if (!live) return;
        game.current = m;
        setStatus("ready");
      })
      .catch(() => {
        if (live) setStatus("failed");
      });
    return () => {
      live = false;
    };
  }, [coarse]);

  if (coarse) return null;

  const start = () => {
    const m = game.current;
    const header = button.current?.closest("header");
    if (!m || !header || stopRef.current) return;

    window.scrollTo({ top: 0, behavior: "instant" });
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";

    const host = document.createElement("div");
    host.className = "absolute inset-0 z-30";
    host.setAttribute("data-vice-hunt", "");
    header.append(host);

    const exit = () => {
      // Esc and an outside stop can both arrive; only the first ends it.
      if (stopRef.current !== exit) return;
      stopRef.current = null;
      hunt.destroy();
      host.remove();
      html.style.overflow = overflow;
      holes.clear();
      setPlaying(false);
      stopped.current();
    };
    stopRef.current = exit;
    const hunt = m.startHunt(host, {
      onShot: (x, y) => holes.add(x, y),
      onExit: exit,
      muted: false,
    });
    setPlaying(true);
  };

  const loading = status === "loading";
  const title = loading ? "Loading the game" : status === "failed" ? "Game failed to load" : "Grab the gun";

  return (
    <button
      ref={button}
      type="button"
      onClick={start}
      disabled={status !== "ready" || leaving}
      title={title}
      aria-label={title}
      aria-busy={loading || undefined}
      aria-pressed={playing}
      className="relative grid h-5 w-5 place-items-center rounded-full transition-colors duration-fast ease-out hover:text-foreground disabled:opacity-60 disabled:hover:text-muted-foreground"
    >
      <Crosshair aria-hidden weight="bold" className="h-4 w-4" />
      {loading && (
        <span
          aria-hidden
          className="absolute inset-0 animate-[spin_var(--duration-gta-loader)_linear_infinite] rounded-full border-2 border-current/20 border-t-current"
        />
      )}
    </button>
  );
}
