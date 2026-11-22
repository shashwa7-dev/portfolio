"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  MusicNotes,
  Playlist,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react/ssr";
import { PLAYLIST } from "@/components/gta6/track";
import { radio, radioProgress, useRadio } from "@/components/gta6/useMusic";
import { cover, names, nowPlaying, PlayPause } from "@/components/gta6/radioParts";
import { shownProgress, type ProgressReading } from "@/lib/gta6/radio";
import s from "@/components/gta6/Radio.module.css";

/** How often the progress line reads the player while it plays. */
const PROGRESS_EVERY = 1000; // ms

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
 * Vice FM. Its state lives in the music session (`useRadio`), so every copy
 * shows the same track and the track carries across. This is the hero
 * pill's popover; the game's HUD has its own disc (`game/HudRadio.tsx`).
 *
 * `card` (design A): the cover fills the left and fades into the dark card;
 * on the right, the station line ("VICE FM · n / 31", with an equaliser that
 * moves only while playing), the title, the artist, then previous,
 * play/pause, next, mute and the list button. A progress line along the
 * bottom edge reads the player once a second while it plays.
 *
 * The list shows the tracks in this session's play order (a listbox:
 * arrows, Home and End move, Enter or a click plays, Esc or a click outside
 * closes, focus goes back to the button). Esc is marked handled, so the game
 * does not also take it as "exit".
 *
 * If the YouTube API never loaded, it only says "Radio unavailable".
 */
export default function Radio() {
  const r = useRadio();
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
    if (open) focusOption(list.current, r.position);
    // Only on opening: moving through the list keeps its own focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The progress line. A reading belongs to its track (`shownProgress`), so
  // a change of track shows 0 until the next one. It reads at once on mount
  // (the popover's card mounts fresh mid track) and on every change of track
  // (a track cued while paused reads 0), then once a second while playing;
  // while paused it holds where it got to. No player (automation) reads 0.
  const [progress, setProgress] = useState<ProgressReading>(() => ({
    position: r.position,
    value: radioProgress(),
  }));
  useEffect(() => {
    const read = () => setProgress({ position: r.position, value: radioProgress() });
    const first = window.setTimeout(read, 0);
    const every = r.playing ? window.setInterval(read, PROGRESS_EVERY) : undefined;
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, [r.playing, r.position]);

  if (r.unavailable) {
    return (
      <div data-radio="" className={s.root}>
        <div className={`${s.unavailable} ${s.mono}`}>
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
      className={s.root}
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
            {/* Not a live region: the pill beside it announces. */}
            <div data-radio-title="" title={label}>
              <div className={s.title}>{title}</div>
              {artist && <div className={s.artist}>{artist}</div>}
            </div>
            {controls}
          </div>
          <div aria-hidden className={s.bar}>
            <i style={{ transform: `scaleX(${shownProgress(progress, r.position)})` }} />
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
