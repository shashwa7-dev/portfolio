"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "feather-icons-react";
import VideoModal from "@/components/common/VideoModal";

export default function ProjectMedia({
  thumbnail,
  preview,
  title,
}: {
  thumbnail: string;
  preview?: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="group relative aspect-[16/8] overflow-hidden rounded-2xl bg-elevated">
        <Image src={thumbnail} alt={title} fill priority className="object-cover" />
        {preview && (
          <button
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Watch demo"
          >
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
              <Play className="h-4 w-4 fill-current" /> Watch demo
            </span>
          </button>
        )}
      </div>
      {preview && (
        <VideoModal isOpen={open} onClose={() => setOpen(false)} videoUrl={preview} title={title} />
      )}
    </>
  );
}
