"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GameMode from "@/components/gta6/game/GameMode";
import { useMusic } from "@/components/gta6/useMusic";
import s from "@/components/gta6/ViceHuntRoute.module.css";

type HuntModule = typeof import("@games/vice-hunt");
const noSubscribe = () => () => {};
const coarsePointer = () => window.matchMedia("(pointer: coarse)").matches;

type State = "loading" | "failed" | "ready";

/**
 * The `/vice-hunt` route's client side: fetches the game package, decodes
 * its sprites, then opens `GameMode` over a dark cover. Touch has no pointer
 * to aim with, so a coarse pointer gets a note and a way home instead, as
 * the revolver is not offered there either.
 *
 * Vice FM: on the homepage GTA mode starts the radio, from the click that
 * turned the mode on. This route has no GTA mode, so it starts the radio
 * itself, on the visitor's first press or key on the page (the start
 * button, in practice): browsers only let a page play sound after one.
 * Leaving the route stops it, and Bigfoot dips it as in the mode.
 */
export default function ViceHuntRoute() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [game, setGame] = useState<HuntModule | null>(null);
  // False on the server; the real answer from the first client render on.
  const coarse = useSyncExternalStore(noSubscribe, coarsePointer, () => false);
  const [tuned, setTuned] = useState(false);
  const music = useMusic(tuned);

  useEffect(() => {
    if (state !== "ready") return;
    const tune = () => setTuned(true);
    const opts = { capture: true, once: true } as const;
    window.addEventListener("pointerdown", tune, opts);
    window.addEventListener("keydown", tune, opts);
    return () => {
      window.removeEventListener("pointerdown", tune, opts);
      window.removeEventListener("keydown", tune, opts);
    };
  }, [state]);

  useEffect(() => {
    if (coarse) return;
    let live = true;
    import("@games/vice-hunt")
      .then(async (m) => {
        await m.preloadHunt();
        if (!live) return;
        setGame(m);
        setState("ready");
      })
      .catch(() => {
        if (live) setState("failed");
      });
    return () => {
      live = false;
    };
  }, [coarse]);

  return (
    <div className={s.cover}>
      {!coarse && state === "loading" && (
        <p role="status" className={s.note}>
          <span aria-hidden className={s.ring} />
          Loading Vice Hunt
        </p>
      )}
      {coarse && (
        <p className={s.note}>
          Vice Hunt needs a mouse to aim. <Link href="/">Back to site</Link>
        </p>
      )}
      {state === "failed" && (
        <p role="alert" className={s.note}>
          The game failed to load. <Link href="/">Back to site</Link>
        </p>
      )}
      {state === "ready" && game && (
        <GameMode game={game} onBigfoot={music.setDuck} onClose={() => router.push("/")} />
      )}
    </div>
  );
}
