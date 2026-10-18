"use client";

import { useEffect, useRef, useState } from "react";
import Goggles, { GOGGLES } from "@/components/common/Goggles";
import { duration } from "@/lib/motionVariants";

/**
 * The hero avatar. On hover a pair of goggles slides down onto the portrait's
 * glasses, and slides back up out of frame when the pointer leaves.
 *
 * Each hover brings the next of four looks (`GOGGLES`: gold round, chrome
 * oval, stealth visor, volt hex). The swap waits until the goggles have slid
 * fully out, so nobody sees one pair turn into another. Every page load starts
 * on gold.
 *
 * The goggles sit inside this box's `overflow-hidden`, so at rest they are
 * simply above the frame, not hidden by opacity. They are placed in percent of
 * the photo, measured from the portrait's own glasses, so they line up at any
 * size. The motion and placement live in `.goggles` in globals.css. It is
 * hover only: touch never fires it, and under reduced motion the goggles fade
 * instead of sliding.
 *
 * This replaced an animated GIF on hover, about 1MB, which only played for
 * mouse users anyway.
 *
 * The size is fixed at 64px and deliberately not driven by the copy beside it.
 * Stretching it to the identity block's height was tried and abandoned twice
 * over: it drew far more attention than a supporting portrait should, and
 * `aspect-square` with `self-stretch` does not even do what it looks like, since
 * flex resolves an item's main size before its stretched cross size, so the
 * width came from content rather than from the height. The identity block is
 * tuned to 64px instead.
 *
 * The photo is greyscale at rest and returns to colour on hover, so this
 * matches every other image surface in the app. The goggles stay in colour.
 */
export default function AvatarHover() {
  const [look, setLook] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const pair = GOGGLES[look];

  return (
    <div
      /* No ring here. The visible edge is a `border` on the wrapper in About.tsx,
         which owns both this and the availability band and so traces the whole
         object. Two earlier attempts put it here and both were wrong: a plain
         `ring-3` is a box-shadow, so the wrapper's `overflow-hidden` clipped it away
         entirely, and `ring-inset` then drew a pixel inside the artwork rather
         than around it. */
      className="group relative h-16 w-16 overflow-hidden rounded-2xl"
      onPointerEnter={() => {
        // Back in before the last swap fired: keep the pair that is sliding out.
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        timer.current = setTimeout(() => {
          setLook((i) => (i + 1) % GOGGLES.length);
          timer.current = null;
        }, duration.gogglesOff * 1000);
      }}
    >
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
        className="h-full w-full object-cover grayscale candy:grayscale-0 transition-[filter] duration-base ease-out group-hover:grayscale-0"
      />
      <Goggles key={look} shape={pair.shape} colour={pair.colour} className="goggles" />
    </div>
  );
}
