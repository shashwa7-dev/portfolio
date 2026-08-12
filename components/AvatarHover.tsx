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
 *
 * The size is fixed at 64px and deliberately not driven by the copy beside it.
 * Stretching it to the identity block's height was tried and abandoned twice
 * over: it drew far more attention than a supporting portrait should, and
 * `aspect-square` with `self-stretch` does not even do what it looks like, since
 * flex resolves an item's main size before its stretched cross size, so the
 * width came from content rather than from the height. The identity block is
 * tuned to 64px instead.
 *
 * Both layers are greyscale at rest and return to colour together on hover, so
 * this matches every other image surface in the app. The GIF layer needs it too,
 * not just the static one: at rest it is transparent, but it becomes visible in
 * the same moment the hover fires, and if only the static layer desaturated the
 * reveal would flash from grey to colour mid-crossfade.
 */
export default function AvatarHover() {
  const [armed, setArmed] = useState(false);

  return (
    <div
      /* No ring here. The visible edge is a `border` on the wrapper in About.tsx,
         which owns both this and the availability band and so traces the whole
         object. Two earlier attempts put it here and both were wrong: a plain
         `ring` is a box-shadow, so the wrapper's `overflow-hidden` clipped it away
         entirely, and `ring-inset` then drew a pixel inside the artwork rather
         than around it. */
      className="group relative h-16 w-16 overflow-hidden rounded-2xl"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setArmed(true);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/apple-touch-icon.png"
        alt="Shashwat Tripathi"
        className="h-full w-full object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
      />
      {armed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/avatar-hover.gif"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-0 transition-[opacity,filter] duration-base ease-out group-hover:grayscale-0 group-hover:opacity-100 motion-reduce:hidden"
        />
      )}
    </div>
  );
}
