"use client";

import Goggles from "@/components/common/Goggles";

/**
 * The hero avatar. On hover a pair of goggles (a matte black visor) slides
 * down onto the portrait's glasses, and slides back up out of frame when the
 * pointer leaves.
 *
 * A client component only because the drawings take ids from `useId`.
 *
 * The goggles sit inside their own `overflow-hidden` layer the size of the
 * photo, so at rest they are simply above the frame, not hidden by opacity.
 * They are placed in percent of the photo, measured from the portrait's own
 * glasses, so they line up at any size. The motion and placement live in
 * `.goggles` in globals.css. It is hover only: touch never fires it, and under
 * reduced motion the goggles fade instead of sliding.
 *
 * This replaced an animated GIF on hover, about 1MB, which only played for
 * mouse users anyway.
 *
 * It sits inside the hero's intro line ("Hi, I am (photo) Shashwat"),
 * so it is sized in `em`: about the height of the letters around it, whatever
 * size the line is set at. Round, and clipped to the circle.
 *
 * The photo is greyscale at rest and returns to colour on hover, so this
 * matches every other image surface in the app. The goggles stay in colour.
 */
export default function AvatarHover() {
  return (
    <span className="relative block h-[1.15em] w-[1.15em] overflow-hidden rounded-full bg-white">
      {/* The portrait has its own file. It used to be served from
          `/apple-touch-icon.png`, which meant the hero's face and the home
          screen icon were one asset: replacing the icon set silently replaced
          the face with the logo, and nothing in either file's name said the
          two were connected. A separate `/images/avatar.png` is the same bytes
          with the coupling removed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/avatar.png"
        alt="Shashwat Tripathi"
        className="block h-full w-full object-cover grayscale candy:grayscale-0 transition-[filter] duration-base ease-out group-hover:grayscale-0"
      />
      <span className="pointer-events-none absolute inset-0 overflow-hidden">
        <Goggles className="goggles" />
      </span>
    </span>
  );
}
