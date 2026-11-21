"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
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
import { radio, radioProgress, useRadio } from "@/components/gta6/useMusic";
import { trackTitle } from "@/lib/gta6/radio";
import s from "@/components/gta6/Radio.module.css";

/** How often the progress line reads the player while it plays. */
const PROGRESS_EVERY = 1000; // ms

function cover(id: string): string {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

/** Playlist entry `i`'s names; "Track N" only if the entry is missing. */
function names(i: number): { title: string; artist: string } {
  const track = PLAYLIST[i];
  return { title: trackTitle(i, track?.title), artist: track?.artist ?? "" };
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

/**
 * How many HUD cards are mounted. While the game is open its HUD copy is the
 * one in view, so only it announces track changes: one live region at a
 * time, never the hero's (under the overlay) as well.
 */
let huds = 0;
const hudWatchers = new Set<() => void>();
function watchHuds(fn: () => void) {
  hudWatchers.add(fn);
  return () => {
    hudWatchers.delete(fn);
  };
}
function countHud(delta: number) {
  huds += delta;
  for (const fn of hudWatchers) fn();
}

/** The two places the card lives: under the mode's cluster in the hero
 *  (scaled down, or in the right margin on wide screens), and the game's
 *  HUD, top left. Same card, same state. */
type Place = "hero" | "hud";

/**
 * Vice FM's card, design A. The same component sits in the hero while the
 * mode is on and in the game's HUD (top left) while it is open; its state
 * lives in the music session (`useRadio`), so the track carries across.
 *
 * The cover fills the left and fades into the dark card; on the right, the
 * station line ("VICE FM · n / 31", with an equaliser that moves only while
 * playing), the title, the artist, then previous, play/pause, next, mute and
 * the list button. A progress line along the bottom edge reads the player
 * once a second while it plays.
 *
 * The list drops down the tracks in this session's play order (a listbox:
 * arrows, Home and End move, Enter or a click plays, Esc or a click outside
 * closes, focus goes back to the button). Esc is marked handled, so the game
 * does not also take it as "exit".
 *
 * If the YouTube API never loaded, the card only says "Radio unavailable".
 */
export default function Radio({ place }: { place: Place }) {
  const r = useRadio();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const hudOpen = useSyncExternalStore(watchHuds, () => huds > 0, () => false);
  const live = place === "hud" || !hudOpen;

  useEffect(() => {
    if (place !== "hud") return;
    countHud(1);
    return () => countHud(-1);
  }, [place]);

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
    if (open) focusOption(list.current, r.position);
    // Only on opening: moving through the list keeps its own focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [progress, setProgress] = useState(0);

  // The progress line: read once a second while playing; it holds where it
  // got to while paused (and stays at 0 with no player, as under automation).
  useEffect(() => {
    if (!r.playing) return;
    const read = () => setProgress(radioProgress());
    read();
    const t = window.setInterval(read, PROGRESS_EVERY);
    return () => window.clearInterval(t);
  }, [r.playing, r.position]);

  const placeClass = place === "hero" ? `${s.root} ${s.hero}` : s.root;

  if (r.unavailable) {
    return (
      <div data-radio="" className={placeClass}>
        <div role={live ? "status" : undefined} className={`${s.unavailable} ${s.mono}`}>
          <MusicNotes aria-hidden weight="fill" />
          Radio unavailable
        </div>
      </div>
    );
  }

  const index = r.order[r.position];
  const id = PLAYLIST[index]?.id ?? "";
  const { title, artist } = names(index);
  const showPause = !r.paused && !r.blocked;

  function close() {
    setOpen(false);
    toggle.current?.focus();
  }

  function onListKey(e: React.KeyboardEvent<HTMLUListElement>) {
    const at = Array.prototype.indexOf.call(list.current?.children ?? [], document.activeElement);
    const last = r.order.length - 1;
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
      data-track={id}
      data-position={r.position}
      className={placeClass}
      onKeyDown={(e) => {
        // Esc anywhere in the card closes an open list, and only that: it is
        // marked handled so the game does not also exit.
        if (e.key !== "Escape" || !open) return;
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
    >
      <div className={s.card}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube cover thumbnail; next/image adds nothing here */}
        <img src={cover(id)} alt="" loading="lazy" decoding="async" className={s.cover} />
        <div aria-hidden className={s.fade} />
        <div className={s.body}>
          <div className={`${s.eyebrow} ${s.mono}`}>
            <span aria-hidden className={s.eq} data-on={r.playing ? "" : undefined}>
              <i />
              <i />
              <i />
            </span>
            <span data-radio-count="">
              VICE FM · {r.position + 1} / {r.order.length}
            </span>
          </div>
          <div data-radio-title="" aria-live={live ? "polite" : undefined} title={artist ? `${title}, ${artist}` : title}>
            <div className={s.title}>{title}</div>
            {artist && <div className={s.artist}>{artist}</div>}
          </div>
          <div className={s.controls}>
            <button type="button" aria-label="Previous track" title="Previous track" onClick={radio.prev}>
              <SkipBack aria-hidden weight="fill" />
            </button>
            <button
              type="button"
              aria-label={showPause ? "Pause" : "Play"}
              title={showPause ? "Pause" : "Play"}
              onClick={r.blocked ? radio.retry : radio.togglePause}
              className={s.big}
            >
              {showPause ? <Pause aria-hidden weight="fill" /> : <Play aria-hidden weight="fill" />}
            </button>
            <button type="button" aria-label="Next track" title="Next track" onClick={radio.next}>
              <SkipForward aria-hidden weight="fill" />
            </button>
            <span className={s.spacer} />
            <button
              type="button"
              aria-label={r.muted ? "Unmute" : "Mute"}
              aria-pressed={r.muted}
              title={r.muted ? "Unmute" : "Mute"}
              onClick={radio.toggleMute}
            >
              {r.muted ? <SpeakerSlash aria-hidden weight="fill" /> : <SpeakerHigh aria-hidden weight="fill" />}
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
            >
              <Playlist aria-hidden weight="bold" />
            </button>
          </div>
        </div>
        <div aria-hidden className={s.bar}>
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      {open && (
        <div className={s.list}>
          <div aria-hidden className={`${s.head} ${s.mono}`}>
            <span>UP NEXT · SHUFFLED</span>
            <span>{r.order.length} TRACKS</span>
          </div>
          <ul ref={list} id={listId} role="listbox" aria-label="Vice FM tracks" onKeyDown={onListKey} className={s.rows}>
            {r.order.map((index, i) => {
              const n = names(index);
              return (
                <li
                  key={index}
                  role="option"
                  aria-selected={i === r.position}
                  tabIndex={-1}
                  onClick={() => {
                    radio.select(i);
                    close();
                  }}
                  className={s.row}
                >
                  <span className={`${s.n} ${s.mono}`}>{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube cover thumbnail */}
                  <img src={cover(PLAYLIST[index]?.id ?? "")} alt="" loading="lazy" decoding="async" className={s.thumb} />
                  <span className={s.names}>
                    <b>{n.title}</b>
                    {n.artist && <span>{n.artist}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
