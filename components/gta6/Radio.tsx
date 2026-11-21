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
import { radio, radioProgress, useRadio, type RadioState } from "@/components/gta6/useMusic";
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

/** The current track's id and names. */
function nowPlaying(r: RadioState) {
  const index = r.order[r.position];
  return { id: PLAYLIST[index]?.id ?? "", ...names(index) };
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
 * How many HUD radios are mounted. While the game is open its HUD radio is
 * the one in view, so only it announces track changes: one live region at a
 * time, never the hero pill's (under the overlay) as well.
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
function useHudOpen(): boolean {
  return useSyncExternalStore(watchHuds, () => huds > 0, () => false);
}

/** Play/pause, or a retry while the browser has refused playback. */
function PlayPause({ r, className }: { r: RadioState; className?: string }) {
  const showPause = !r.paused && !r.blocked;
  return (
    <button
      type="button"
      aria-label={showPause ? "Pause" : "Play"}
      title={showPause ? "Pause" : "Play"}
      onClick={r.blocked ? radio.retry : radio.togglePause}
      className={className}
    >
      {showPause ? <Pause aria-hidden weight="fill" /> : <Play aria-hidden weight="fill" />}
    </button>
  );
}

/** Two sizes of card A: the full one (the hero pill's popover) and the
 *  compact one in the game's HUD, bottom left. Same state. */
type Variant = "card" | "compact";

/**
 * Vice FM. Its state lives in the music session (`useRadio`), so every copy
 * shows the same track and the track carries across.
 *
 * `card` (design A): the cover fills the left and fades into the dark card;
 * on the right, the station line ("VICE FM · n / 31", with an equaliser that
 * moves only while playing), the title, the artist, then previous,
 * play/pause, next, mute and the list button. A progress line along the
 * bottom edge reads the player once a second while it plays.
 *
 * `compact` (the HUD, layout L1, bottom left): the same card A, smaller
 * (about 300x96, the cover over the left 45%). Its list opens upward, since
 * it sits at the bottom of the screen. It is the live region while it is
 * mounted.
 *
 * The list shows the tracks in this session's play order (a listbox:
 * arrows, Home and End move, Enter or a click plays, Esc or a click outside
 * closes, focus goes back to the button). Esc is marked handled, so the game
 * does not also take it as "exit".
 *
 * If the YouTube API never loaded, it only says "Radio unavailable".
 */
export default function Radio({ variant }: { variant: Variant }) {
  const r = useRadio();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const compact = variant === "compact";

  useEffect(() => {
    if (!compact) return;
    countHud(1);
    return () => countHud(-1);
  }, [compact]);

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

  // The progress line: read once a second while playing; it
  // holds where it got to while paused, and a reading belongs to its track,
  // so next or prev while paused starts the line again from 0 (as does no
  // player, under automation).
  const [progress, setProgress] = useState({ position: -1, value: 0 });
  useEffect(() => {
    if (!r.playing) return;
    const read = () => setProgress({ position: r.position, value: radioProgress() });
    read();
    const t = window.setInterval(read, PROGRESS_EVERY);
    return () => window.clearInterval(t);
  }, [r.playing, r.position]);
  const shownProgress = progress.position === r.position ? progress.value : 0;

  const rootClass = compact ? `${s.root} ${s.compact}` : s.root;

  if (r.unavailable) {
    return (
      <div data-radio="" className={rootClass}>
        <div role={compact ? "status" : undefined} className={`${s.unavailable} ${s.mono}`}>
          <MusicNotes aria-hidden weight="fill" />
          Radio unavailable
        </div>
      </div>
    );
  }

  const { id, title, artist } = nowPlaying(r);
  const label = artist ? `${title}, ${artist}` : title;

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

  const controls = (
    <div className={s.controls}>
      <button type="button" aria-label="Previous track" title="Previous track" onClick={radio.prev}>
        <SkipBack aria-hidden weight="fill" />
      </button>
      <PlayPause r={r} className={s.big} />
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
  );

  return (
    <div
      ref={root}
      data-radio=""
      data-track={id}
      data-position={r.position}
      className={rootClass}
      onKeyDown={(e) => {
        // Esc anywhere in the radio closes an open list, and only that: it
        // is marked handled so the game (or the hero popover) does not also
        // take it.
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
            {/* The HUD's copy is the live region; the hero card is not, since
                the pill beside it announces. */}
            <div data-radio-title="" aria-live={compact ? "polite" : undefined} title={label}>
              <div className={s.title}>{title}</div>
              {artist && <div className={s.artist}>{artist}</div>}
            </div>
            {controls}
          </div>
          <div aria-hidden className={s.bar}>
            <i style={{ transform: `scaleX(${shownProgress})` }} />
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

/**
 * The hero's corner while the mode is on (M1): one slim dark pill holding a
 * spinning vinyl with the current cover, the track as "Title · Artist", and
 * play/pause, followed by `children` (the mode's own buttons: Vice Hunt's
 * revolver and exit). The vinyl stops when paused, and under reduced motion.
 *
 * Clicking the vinyl opens the full card (`Radio variant="card"`) as a
 * popover under the pill; a click outside, Esc, or pressing one of the
 * mode's buttons closes it. The track text is the live region while no HUD
 * radio is mounted.
 */
export function RadioPill({ children }: { children: React.ReactNode }) {
  const r = useRadio();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const vinyl = useRef<HTMLButtonElement>(null);
  const popId = useId();
  const hudOpen = useHudOpen();

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away, true);
    return () => document.removeEventListener("pointerdown", away, true);
  }, [open]);

  const extras = (
    // Starting the game or leaving the mode puts the popover away first.
    <span className={s.extras} onClickCapture={() => setOpen(false)}>
      {children}
    </span>
  );

  if (r.unavailable) {
    return (
      <div className={s.pill}>
        <span className={`${s.pillNote} ${s.mono}`}>
          <MusicNotes aria-hidden weight="fill" />
          Radio unavailable
        </span>
        {extras}
      </div>
    );
  }

  const { id, title, artist } = nowPlaying(r);
  const spinning = !r.paused && !r.blocked;

  return (
    <div
      ref={root}
      className={s.pill}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open || e.defaultPrevented) return;
        e.preventDefault();
        setOpen(false);
        vinyl.current?.focus();
      }}
    >
      <button
        ref={vinyl}
        type="button"
        aria-label="Vice FM radio"
        title="Vice FM radio"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={s.vinyl}
        data-spin={spinning ? "" : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube cover thumbnail; next/image adds nothing here */}
        <img src={cover(id)} alt="" decoding="async" />
      </button>
      <span
        data-radio-title=""
        aria-live={hudOpen ? undefined : "polite"}
        title={artist ? `${title}, ${artist}` : title}
        className={s.pillTrack}
      >
        {title}
        {artist && <span> · {artist}</span>}
      </span>
      <PlayPause r={r} className={s.pillButton} />
      {extras}
      {open && (
        <div id={popId} className={s.popover}>
          <Radio variant="card" />
        </div>
      )}
    </div>
  );
}
