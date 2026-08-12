"use client";

import { useState } from "react";

/**
 * The hero avatar. Swaps to an animated GIF on hover.
 *
 * The GIF is roughly 1MB, which is a lot for a decorative flourish sitting above
 * the fold, so it is deliberately NOT part of the initial payload. Three guards
 * keep the cost off people who will never see it:
 *
 * 1. The <img> is not rendered until the first hover, so the file is only
 *    fetched when someone actually points at the avatar. Once armed it stays
 *    mounted, so repeat hovers are instant and it plays from cache.
 * 2. Arming is gated on `pointerType === "mouse"`. `onPointerEnter` also fires
 *    on touch, and a touch user would otherwise download 1MB for an effect they
 *    can never trigger, since the reveal itself is a `group-hover` rule and
 *    `hoverOnlyWhenSupported` is enabled in the Tailwind config.
 * 3. `motion-reduce:hidden` on the GIF layer. A GIF's loop cannot be paused by
 *    CSS, so `prefers-reduced-motion` has no effect on it otherwise. It is
 *    purely decorative, so hiding it costs those users nothing.
 *
 * The static image stays in the DOM underneath rather than being replaced, so
 * there is no flash of empty space while the GIF decodes, and the crossfade has
 * something to fade from.
 */
export default function AvatarHover() {
  const [armed, setArmed] = useState(false);

  return (
    <div
      className="group relative h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-border"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setArmed(true);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/apple-touch-icon.png"
        alt="Shashwat Tripathi"
        className="h-full w-full object-cover"
      />
      {armed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/avatar-hover.gif"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100 motion-reduce:hidden"
        />
      )}
    </div>
  );
}
