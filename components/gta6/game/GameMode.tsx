"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Kind } from "@games/vice-hunt";
import BeachScene from "@/components/gta6/scene/BeachScene";
import Entry from "@/components/gta6/game/Entry";
import Hud, { type TimeChoice } from "@/components/gta6/game/Hud";
import Results from "@/components/gta6/game/Results";
import { timeOfDay } from "@/lib/gta6/timeOfDay";
import { callout, emptyTally, killLabel, recordKill, recordShot } from "@/lib/gta6/streak";
import s from "@/components/gta6/game/game.module.css";

type HuntModule = typeof import("@games/vice-hunt");
type Phase = "entry" | "play" | "results";
type Pop = { id: number; x: number; y: number; label: string };

const KIND_ORDER: Kind[] = ["rabbit", "iguana", "flamingo", "bigfoot"];

/** While the overlay is open the page under it is inert, but a few fixed
 *  pieces of it would still show at its edges or catch the eye on the way
 *  in and out: the dock, the chat bubble and the starter pack card. */
const PAGE_CSS = `html[data-vice-hunt-playing] :is(.dock-wrap, .dock-scrim, .starter-pack-hang, [data-chat-bubble]) { display: none !important; }`;

/** The keys the game (Esc, R) and the overlay's own buttons (Tab, Enter,
 *  Space) use, plus the radio's track list (arrows, Home, End) while focus
 *  is in it. Every other key stops at the window, so the page's shortcuts
 *  (the command palette, g-navigation, the theme key, the spinner's F) stay
 *  asleep while the hunt is open: `inert` stops focus and clicks, not
 *  window key listeners. */
const LIST_KEYS = new Set(["ArrowUp", "ArrowDown", "Home", "End"]);
function overlayKey(e: KeyboardEvent): boolean {
  if (e.key === "Escape" || e.key === "Tab" || e.key === "Enter" || e.key === " ") return true;
  if (LIST_KEYS.has(e.key)) return e.target instanceof Element && !!e.target.closest('[role="listbox"]');
  return (e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey && !e.altKey;
}

type Props = {
  /** The loaded game package (preloaded). */
  game: HuntModule;
  /** Back to site: the host unmounts this and returns focus. */
  onClose(): void;
  /** Bigfoot is on (true) or gone (false): the music dips under him. */
  onBigfoot(active: boolean): void;
};

/**
 * Vice Hunt's full-screen game mode (spec, revision 2), portalled to
 * `<body>` over everything. While it is open the rest of the page is `inert`
 * and `aria-hidden`, `<html>` does not scroll, and the dock, chat bubble
 * and starter pack card are hidden (`data-vice-hunt-playing` on `<html>`);
 * all of it is put back exactly as it was when this unmounts.
 *
 * The flow: a cinematic entry (letterbox, push-in, the title), then play
 * (the game on its own layer over the beach scene, with the HUD), then Esc
 * or right click brings up the results card. Play again starts a fresh
 * game at zero with no entry; Back to site closes.
 *
 * Kills, accuracy and streaks are counted here from the game's callbacks
 * (`lib/gta6/streak.ts`); the game's own score strip is off.
 */
export default function GameMode({ game, onClose, onBigfoot }: Props) {
  const overlay = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("entry");
  // Bumped by Play again, so the game effect starts a fresh one.
  const [round, setRound] = useState(0);
  const [tally, setTally] = useState(emptyTally);
  const [ammo, setAmmo] = useState({ rounds: game.ROUNDS, reloading: false });
  const [pops, setPops] = useState<Pop[]>([]);
  const [shout, setShout] = useState<{ id: number; text: string } | null>(null);
  const [bigfoot, setBigfoot] = useState(false);
  // Counts Bigfoot's entrances: each one sweeps the banner across once.
  const [banner, setBanner] = useState(0);
  const [timeChoice, setTimeChoice] = useState<TimeChoice>("auto");
  const [autoTime] = useState(() => timeOfDay(new Date().getHours()));
  const [icons] = useState(
    () => Object.fromEntries(KIND_ORDER.map((k) => [k, game.iconUrl(k)])) as Record<Kind, string>,
  );
  const nextId = useRef(0);

  const close = useRef(onClose);
  const duck = useRef(onBigfoot);
  useEffect(() => {
    close.current = onClose;
    duck.current = onBigfoot;
  });

  // Hide and lock the page under the overlay; put it all back on the way out.
  useEffect(() => {
    const root = overlay.current;
    if (!root) return;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    html.setAttribute("data-vice-hunt-playing", "");
    // Only what this made inert is given back, never something that already was.
    const hidden = Array.from(document.body.children)
      .filter((el): el is HTMLElement => el instanceof HTMLElement && el !== root && !el.inert)
      .filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE")
      .map((el) => ({ el, aria: el.getAttribute("aria-hidden") }));
    for (const { el } of hidden) {
      el.inert = true;
      el.setAttribute("aria-hidden", "true");
    }
    const guard = (e: KeyboardEvent) => {
      if (!overlayKey(e)) e.stopPropagation();
    };
    window.addEventListener("keydown", guard, true);
    root.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", guard, true);
      for (const { el, aria } of hidden) {
        el.inert = false;
        if (aria === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", aria);
      }
      html.removeAttribute("data-vice-hunt-playing");
      html.style.overflow = overflow;
    };
  }, []);

  // One game per round of play; the results card (or closing) ends it.
  useEffect(() => {
    if (phase !== "play" || !host.current) return;
    overlay.current?.focus({ preventScroll: true });
    let hunt: import("@games/vice-hunt").Hunt;
    try {
      hunt = game.startHunt(host.current, {
        muted: false,
        showScore: false,
        onShot: (_x, _y, hit) => setTally((t) => recordShot(t, hit !== null)),
        onKill: (kind, x, y, streak) => {
          setTally((t) => recordKill(t, kind, streak));
          const id = ++nextId.current;
          setPops((p) => [...p, { id, x, y, label: killLabel(kind) }]);
          const text = callout(streak);
          if (text) setShout({ id, text });
        },
        onAmmo: (rounds, reloading) => setAmmo({ rounds, reloading }),
        onBigfoot: (present) => {
          setBigfoot(present);
          if (present) setBanner((n) => n + 1);
        },
        onExit: () => {
          setBanner(0);
          setPhase("results");
        },
      });
    } catch {
      // A game that cannot start must not leave the page locked under a
      // dead overlay.
      close.current();
      return;
    }
    return () => {
      hunt.destroy();
      setBigfoot(false);
    };
  }, [phase, round, game]);

  // The music steps back while Bigfoot is on, and always comes back up.
  useEffect(() => {
    if (!bigfoot) return;
    duck.current(true);
    return () => duck.current(false);
  }, [bigfoot]);

  const playAgain = () => {
    setTally(emptyTally());
    setAmmo({ rounds: game.ROUNDS, reloading: false });
    setPops([]);
    setShout(null);
    setRound((n) => n + 1);
    setPhase("play");
  };

  return createPortal(
    <div
      ref={overlay}
      data-vice-hunt-overlay=""
      data-phase={phase}
      role="region"
      aria-label="Vice Hunt"
      tabIndex={-1}
      onKeyDown={(e) => {
        // Nothing to shoot yet: Esc during the entry goes straight back
        // (unless something inside, the radio's list, already took it).
        if (phase === "entry" && e.key === "Escape" && !e.defaultPrevented) close.current();
      }}
      className={s.overlay}
    >
      <style>{PAGE_CSS}</style>
      <div className={s.stage}>
        <BeachScene time={timeChoice === "auto" ? autoTime : timeChoice} />
      </div>
      <div aria-hidden className={s.vignette} />
      <div ref={host} className={s.host} />
      <div aria-hidden className={s.edge} data-on={bigfoot ? "" : undefined} />

      <div aria-hidden className={s.pops}>
        {pops.map((p) => (
          <div
            key={p.id}
            className={`${s.pop} ${s.display}`}
            // Kept clear of the screen's edges, where an animal can die half
            // off screen.
            style={{
              left: `clamp(4rem, ${Math.round(p.x)}px, calc(100% - 4rem))`,
              top: `clamp(6rem, ${Math.round(p.y)}px, 100%)`,
            }}
            onAnimationEnd={() => setPops((all) => all.filter((q) => q.id !== p.id))}
          >
            +1<em>{p.label}</em>
          </div>
        ))}
        {shout && (
          <div
            key={shout.id}
            className={`${s.callout} ${s.display}`}
            onAnimationEnd={() => setShout(null)}
          >
            {shout.text}
          </div>
        )}
      </div>

      <Hud
        shown={phase !== "entry"}
        kills={tally.kills}
        rounds={ammo.rounds}
        capacity={game.ROUNDS}
        reloading={phase === "play" && ammo.reloading}
        time={timeChoice}
        onTime={setTimeChoice}
        icons={icons}
      />

      {banner > 0 && phase === "play" && (
        <div key={banner} role="status" className={s.banner} onAnimationEnd={() => setBanner(0)}>
          <b className={s.display}>BIGFOOT SPOTTED</b>
          <small className={s.mono}>THREE HITS TO TAKE HIM DOWN</small>
        </div>
      )}

      <div aria-hidden className={`${s.bar} ${s.barTop}`} />
      <div aria-hidden className={`${s.bar} ${s.barBottom}`} />
      {phase === "entry" && <Entry onDone={() => setPhase("play")} />}

      {phase === "results" && (
        <Results tally={tally} icons={icons} onAgain={playAgain} onBack={() => close.current()} />
      )}
    </div>,
    document.body,
  );
}
