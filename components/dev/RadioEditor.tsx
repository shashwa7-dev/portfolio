"use client";

import { useEffect, useState } from "react";
import type { TrackEntry } from "@/lib/gta6/playlistFile";

const API = "/api/dev/playlist";

const btn =
  "rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent";
const input =
  "w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border-strong";

/**
 * The dev-only Vice FM editor (`/dev/radio`). Loads the list from track.ts,
 * lets you preview a song (a YouTube embed under its row), edit its title and
 * artist, move it, remove it or add a new one from a pasted link, and writes
 * the whole list back on Save. "Create update PR on GitHub" sends the list as
 * it is on screen (saved or not) as a pull request that changes only
 * track.ts, without touching your checkout (`app/api/dev/playlist/pr`). The
 * first song is the theme: it always plays first; the rest are shuffled.
 */
export default function RadioEditor() {
  const [saved, setSaved] = useState<TrackEntry[] | null>(null);
  const [list, setList] = useState<TrackEntry[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [draft, setDraft] = useState<TrackEntry | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [pr, setPr] = useState<string | null>(null);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json() as Promise<TrackEntry[]>)
      .then((l) => {
        setSaved(l);
        setList(l);
      })
      .catch(() => setNote("Could not read track.ts."));
  }, []);

  const dirty = saved !== null && JSON.stringify(saved) !== JSON.stringify(list);
  const update = (i: number, patch: Partial<TrackEntry>) =>
    setList((l) => l.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const move = (i: number, by: number) =>
    setList((l) => {
      const j = i + by;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const lookUp = async () => {
    setNote("");
    setBusy(true);
    try {
      const r = await fetch(`${API}?lookup=${encodeURIComponent(link)}`);
      const body = (await r.json()) as TrackEntry & { error?: string };
      if (!r.ok) setNote(body.error ?? "Lookup failed.");
      else if (list.some((t) => t.id === body.id)) setNote("That song is already on the list.");
      else setDraft({ id: body.id, title: body.title, artist: body.artist });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setNote("");
    try {
      const r = await fetch(API, { method: "PUT", body: JSON.stringify(list) });
      const body = (await r.json()) as TrackEntry[] | { error: string };
      if (!r.ok || !Array.isArray(body)) setNote("error" in body ? body.error : "Save failed.");
      else {
        setSaved(body);
        setList(body);
        setNote("Saved to components/gta6/track.ts. Commit it when you are happy.");
      }
    } finally {
      setBusy(false);
    }
  };

  const openPr = async () => {
    setBusy(true);
    setNote("Opening a PR…");
    setPr(null);
    try {
      const r = await fetch(`${API}/pr`, { method: "POST", body: JSON.stringify(list) });
      const body = (await r.json()) as { url?: string; base?: string; error?: string };
      if (!r.ok || !body.url) setNote(body.error ?? "Could not open the PR.");
      else {
        setPr(body.url);
        setNote(`PR opened against ${body.base}.`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="font-label text-2xs uppercase tracking-label text-subtle">Dev only</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Vice FM editor</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The first song is the theme and always plays first; the rest are shuffled. Changes are only written to
        track.ts when you press Save.
      </p>

      <div className="sticky top-0 z-10 mt-6 flex items-center gap-3 border-b border-border bg-background py-3">
        <button type="button" className={btn} disabled={!dirty || busy} onClick={save}>
          Save {list.length} songs
        </button>
        <button type="button" className={btn} disabled={!dirty || busy} onClick={() => saved && setList(saved)}>
          Undo changes
        </button>
        <button type="button" className={btn} disabled={busy || saved === null} onClick={openPr}>
          Create update PR on GitHub
        </button>
        <span className="text-xs text-muted-foreground" role="status">
          {note || (dirty ? "Unsaved changes" : saved ? "Up to date" : "Loading…")}
          {pr && (
            <>
              {" "}
              <a className="underline decoration-border-strong underline-offset-4" href={pr} target="_blank" rel="noreferrer">
                {pr}
              </a>
            </>
          )}
        </span>
      </div>

      <section className="mt-6 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Add a song</h2>
        <div className="mt-3 flex gap-2">
          <input
            className={input}
            placeholder="Paste a YouTube link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && link && lookUp()}
          />
          <button type="button" className={btn} disabled={!link || busy} onClick={lookUp}>
            Look up
          </button>
        </div>
        {draft && (
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input className={input} aria-label="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <input className={input} aria-label="Artist" value={draft.artist} onChange={(e) => setDraft({ ...draft, artist: e.target.value })} />
            <div className="flex gap-2">
              <button type="button" className={btn} onClick={() => setPlaying(playing === draft.id ? null : draft.id)}>
                {playing === draft.id ? "Stop" : "Preview"}
              </button>
              <button
                type="button"
                className={btn}
                disabled={!draft.title.trim()}
                onClick={() => {
                  setList((l) => [...l, draft]);
                  setDraft(null);
                  setLink("");
                }}
              >
                Add to list
              </button>
            </div>
            {playing === draft.id && <Preview id={draft.id} />}
          </div>
        )}
      </section>

      <ol className="mt-6 divide-y divide-border rounded-lg border border-border">
        {list.map((t, i) => (
          <li key={t.id} className="p-3">
            <div className="grid items-center gap-2 md:grid-cols-[2.5rem_1fr_1fr_auto]">
              <span className="font-label text-xs text-subtle">{i === 0 ? "Theme" : i + 1}</span>
              <input className={input} aria-label={`Title of song ${i + 1}`} value={t.title} onChange={(e) => update(i, { title: e.target.value })} />
              <input className={input} aria-label={`Artist of song ${i + 1}`} value={t.artist} onChange={(e) => update(i, { artist: e.target.value })} />
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className={btn} onClick={() => setPlaying(playing === t.id ? null : t.id)}>
                  {playing === t.id ? "Stop" : "Preview"}
                </button>
                <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${t.title} up`}>
                  ↑
                </button>
                <button type="button" className={btn} disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${t.title} down`}>
                  ↓
                </button>
                <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -i)}>
                  Make theme
                </button>
                <button
                  type="button"
                  className={btn}
                  disabled={list.length === 1}
                  onClick={() => setList((l) => l.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            </div>
            {playing === t.id && <Preview id={t.id} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A YouTube player for one song, playing straight away. */
function Preview({ id }: { id: string }) {
  return (
    <iframe
      className="mt-3 aspect-video w-full max-w-md rounded-md md:col-span-full"
      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
      title="Song preview"
      allow="autoplay; encrypted-media"
    />
  );
}
