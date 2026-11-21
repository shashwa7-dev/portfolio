"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  MusicNotes,
  Pause,
  Play,
  Playlist,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react/ssr";
import { PLAYLIST } from "@/components/gta6/track";
import { radio, useRadio } from "@/components/gta6/useMusic";
import { trackTitle } from "@/lib/gta6/radio";

function cover(id: string): string {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

/** Focuses option `index`, keeping it in view inside the list without
 *  scrolling the page. */
function focusOption(ul: HTMLUListElement | null, index: number) {
  const li = ul?.children[index] as HTMLElement | undefined;
  if (!ul || !li) return;
  li.focus({ preventScroll: true });
  if (li.offsetTop < ul.scrollTop) ul.scrollTop = li.offsetTop;
  else if (li.offsetTop + li.offsetHeight > ul.scrollTop + ul.clientHeight)
    ul.scrollTop = li.offsetTop + li.offsetHeight - ul.clientHeight;
}

/** The two places the card lives. The hero's is one row inside the mode's
 *  cluster, in the page's own colours; the HUD's is the approved R1 glass
 *  card (cover, title, station line, buttons). */
type Place = "hero" | "hud";

const SKIN: Record<
  Place,
  { root: string; button: string; icon: string; list: string; option: string }
> = {
  hero: {
    root: "flex items-center gap-1.5",
    button:
      "grid h-4 w-4 place-items-center rounded-sm transition-colors duration-fast ease-out hover:text-foreground",
    icon: "h-2.5 w-2.5",
    list: "right-0 top-full mt-2.5 w-64 border border-border bg-background/95 text-foreground shadow-lg",
    option: "hover:bg-muted aria-selected:text-accent",
  },
  hud: {
    root: "flex w-60 items-center gap-2.5 rounded-xl border border-white/15 bg-[rgba(14,12,22,0.62)] p-2.5 text-white backdrop-blur-md",
    button:
      "grid h-6 w-6 place-items-center rounded-md bg-white/10 transition-colors duration-fast ease-out hover:bg-white/20",
    icon: "h-3 w-3",
    list: "inset-x-0 top-full mt-2 border border-white/15 bg-[rgba(14,12,22,0.86)] text-white",
    option: "hover:bg-white/10 aria-selected:text-[#f49ea3]",
  },
};

/**
 * Vice FM's card. The same component sits in the hero cluster while the mode
 * is on and in the game's HUD (top left) while it is open; its state lives in
 * the music session (`useRadio`), so the track carries across.
 *
 * Previous, play/pause, next, mute and a list button that drops down all
 * thirty tracks (a listbox: arrows, Home and End move, Enter or a click
 * plays, Esc or a click outside closes, focus goes back to the button). Esc
 * is marked handled, so the game does not also take it as "exit".
 *
 * If the YouTube API never loaded, the card only says "Radio unavailable".
 */
export default function Radio({ place }: { place: Place }) {
  const r = useRadio();
  const skin = SKIN[place];
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  // A click anywhere else closes the list.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away, true);
    return () => document.removeEventListener("pointerdown", away, true);
  }, [open]);

  // Opening puts focus on the current track.
  useEffect(() => {
    if (open) focusOption(list.current, r.index);
    // Only on opening: moving through the list keeps its own focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (r.unavailable) {
    return (
      <div
        data-radio=""
        role="status"
        className={`${skin.root} ${place === "hud" ? "w-auto font-mono text-2xs tracking-label opacity-80" : ""}`}
      >
        <MusicNotes aria-hidden weight="fill" className={skin.icon} />
        Radio unavailable
      </div>
    );
  }

  const id = PLAYLIST[r.index];
  const title = trackTitle(r.index, r.titles[id]);
  const count = `${r.index + 1} / ${PLAYLIST.length}`;
  const showPause = !r.paused && !r.blocked;

  function close() {
    setOpen(false);
    toggle.current?.focus();
  }

  function onListKey(e: React.KeyboardEvent<HTMLUListElement>) {
    const at = Array.prototype.indexOf.call(list.current?.children ?? [], document.activeElement);
    const last = PLAYLIST.length - 1;
    let to: number | null = null;
    if (e.key === "ArrowDown") to = at < 0 ? 0 : Math.min(at + 1, last);
    else if (e.key === "ArrowUp") to = at < 0 ? last : Math.max(at - 1, 0);
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = last;
    else if ((e.key === "Enter" || e.key === " ") && at >= 0) {
      radio.select(at);
      close();
    } else if (e.key === "Tab") {
      setOpen(false);
      return;
    } else return;
    // Handled here: never also the game's Esc or Space, or a page scroll.
    e.preventDefault();
    e.stopPropagation();
    if (to !== null) focusOption(list.current, to);
  }

  return (
    <div
      ref={root}
      data-radio=""
      className={`relative ${skin.root}`}
      onKeyDown={(e) => {
        // Esc anywhere in the card closes an open list, and only that: it is
        // marked handled so the game does not also exit.
        if (e.key !== "Escape" || !open) return;
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube cover thumbnail; next/image adds nothing here */}
      <img
        src={cover(id)}
        alt=""
        loading="lazy"
        decoding="async"
        className={
          place === "hud"
            ? "h-12 w-12 flex-none rounded-lg object-cover"
            : "h-3.5 w-5 flex-none rounded-sm object-cover"
        }
      />
      <div className={place === "hud" ? "min-w-0 flex-1" : "flex min-w-0 items-center gap-1.5"}>
        <div
          aria-live="polite"
          className={
            place === "hud"
              ? "truncate text-xs font-semibold leading-tight"
              : "max-w-32 truncate normal-case"
          }
          title={title}
        >
          {title}
        </div>
        {place === "hud" && (
          <div className="mt-0.5 font-mono text-2xs tracking-label text-[#f49ea3]">
            VICE FM · {count}
          </div>
        )}
        <div className={place === "hud" ? "mt-1.5 flex gap-1" : "flex items-center gap-0.5"}>
          <button type="button" aria-label="Previous track" title="Previous track" onClick={radio.prev} className={skin.button}>
            <SkipBack aria-hidden weight="fill" className={skin.icon} />
          </button>
          <button
            type="button"
            aria-label={showPause ? "Pause" : "Play"}
            title={showPause ? "Pause" : "Play"}
            onClick={r.blocked ? radio.retry : radio.togglePause}
            className={skin.button}
          >
            {showPause ? (
              <Pause aria-hidden weight="fill" className={skin.icon} />
            ) : (
              <Play aria-hidden weight="fill" className={skin.icon} />
            )}
          </button>
          <button type="button" aria-label="Next track" title="Next track" onClick={radio.next} className={skin.button}>
            <SkipForward aria-hidden weight="fill" className={skin.icon} />
          </button>
          <button
            type="button"
            aria-label={r.muted ? "Unmute" : "Mute"}
            aria-pressed={r.muted}
            title={r.muted ? "Unmute" : "Mute"}
            onClick={radio.toggleMute}
            className={skin.button}
          >
            {r.muted ? (
              <SpeakerSlash aria-hidden weight="fill" className={skin.icon} />
            ) : (
              <SpeakerHigh aria-hidden weight="fill" className={skin.icon} />
            )}
          </button>
          <button
            ref={toggle}
            type="button"
            aria-label="Track list"
            title="Track list"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            onClick={() => setOpen((o) => !o)}
            className={skin.button}
          >
            <Playlist aria-hidden weight="bold" className={skin.icon} />
          </button>
        </div>
      </div>

      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-label="Vice FM tracks"
          onKeyDown={onListKey}
          className={`absolute z-10 max-h-72 overflow-y-auto rounded-xl p-1 font-sans text-xs normal-case tracking-normal ${skin.list}`}
        >
          {PLAYLIST.map((track, i) => (
            <li
              key={track}
              role="option"
              aria-selected={i === r.index}
              tabIndex={-1}
              onClick={() => {
                radio.select(i);
                close();
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring ${skin.option}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube cover thumbnail */}
              <img
                src={cover(track)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-6 w-10 flex-none rounded object-cover"
              />
              <span className="truncate">
                {i + 1}. {trackTitle(i, r.titles[track])}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
