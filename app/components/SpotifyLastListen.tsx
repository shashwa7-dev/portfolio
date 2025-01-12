"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface TrackData {
  id: string;
  name: string;
  artist: string;
  preview_url: string;
  link: string;
  image: string;
  played_at: string;
}

export default function SpotifyLastListen() {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    fetch("/api/last-listened")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const track_data = data.items[0].track;
          const track: TrackData = {
            id: track_data.id,
            name: track_data.name,
            artist: track_data.artists[0].name ?? "N/A",
            preview_url: track_data.preview_url ?? "N/A",
            link: track_data.external_urls.spotify ?? "N/A",
            image: track_data.album.images[1].url ?? "N/A",
            played_at: data.items[0].played_at ?? "N/A",
          };
          setTrack(track);
          if (track.preview_url) setAudio(new Audio(track.preview_url));
        }
      })
      .catch((err) => {
        setError("Failed to fetch user profile");
        console.error(err);
      });
  }, []);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setIsPlaying(false);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const handleClick = useCallback(() => {
    if (!audio) return;
    setIsPlaying((prev) => !prev);
    try {
      if (audio) {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    } catch (err) {
      console.log("audio err", err);
    }
  }, [audio]);

  const formatRelativeTime = (dateString: string) => {
    if (dateString === "N/A") return "N/A";
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  console.log("track", track);
  return (
    <div className="flex align-middle text-sm lg:text-normal">
      {track ? (
        <div className="flex align-middle justify-center gap-1">
          <div
            className={`flex flex-col cursor-pointer gap-0 relative hover:scale-150 transition-all`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              e.stopPropagation();
              if (track.preview_url === "N/A") return;
              handleClick();
            }}
          >
            <img
              src={track.image}
              alt={track.name}
              className={`${"animate-spin-slow  object-cover object-center w-5 h-5 min-w-5 rounded-full"} border-2 ${
                isPlaying ? "border-green-500" : ""
              }`}
              style={{ transition: "transform 0.5s ease-in-out" }}
            />
            {showTooltip && !isPlaying && track.preview_url !== "N/A" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 bg-s7-gray100 font-bold text-s7-gray_graphite text-[0.5rem] rounded whitespace-nowrap ">
                Click to play
              </div>
            )}
          </div>{" "}
          <p
            className="text-sm lg:text-normal cursor-pointer hover:text-s7-gray_graphite hover:font-bold"
            onClick={() => window.open(track.link, "_blank")}
          >
            <span>{track.name}</span>
            <span>
              {" by "} {track.artist}
            </span>
            {track.played_at !== "N/A" ? (
              <span className="text-xs text-s7-gray200 ml-2">
                {`(${formatRelativeTime(track.played_at)})`}
              </span>
            ) : null}
          </p>{" "}
        </div>
      ) : error ? (
        "Rocky Theme Song"
      ) : (
        "Loading..."
      )}
    </div>
  );
}
