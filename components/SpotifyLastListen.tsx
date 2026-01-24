"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ExternalLink, Music } from "feather-icons-react";

interface TrackData {
  id: string;
  name: string;
  artist: string;
  link: string;
  image: string;
  played_at: string;
}

export default function SpotifyLastListen() {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/last-listened")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const trackData = data.items[0].track;
          setTrack({
            id: trackData.id,
            name: trackData.name,
            artist: trackData.artists[0].name ?? "N/A",
            link: trackData.external_urls.spotify ?? "N/A",
            image: trackData.album.images[1].url ?? "N/A",
            played_at: data.items[0].played_at ?? "N/A",
          });
        }
      })
      .catch((err) => {
        setError("Failed to fetch");
        console.error(err);
      });
  }, []);

  const formatRelativeTime = (dateString: string) => {
    if (dateString === "N/A") return "";
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-3 py-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Music className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Can&apos;t load now playing
        </p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-3 py-2.5">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <a
      href={track.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-card/50 px-3 py-2.5 transition-all duration-200",
        "hover:border-accent/30 hover:bg-card"
      )}
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={track.image}
          alt=""
          className="size-full object-cover object-center"
        />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-accent">
          {track.name}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">{track.artist}</span>
          {formatRelativeTime(track.played_at) && (
            <>
              <span className="text-border">·</span>
              <span className="shrink-0">
                {formatRelativeTime(track.played_at)}
              </span>
            </>
          )}
        </span>
      </div>

      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
