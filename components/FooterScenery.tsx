"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Both are ~1.7:1, so they crop identically in the band. */
const SCENERY = [
  "/images/footer-scenery.gif",
  "/images/footer-scenery-2.gif",
] as const;

/**
 * The footer's animated band, picking one of two GIFs at random per page load.
 *
 * Why this is a client component and why it starts on a fixed index: the choice
 * has to be made in the browser. The homepage is statically generated, so a
 * `Math.random()` on the server would be evaluated once at build time and then
 * baked into the HTML, giving the same GIF forever until the next deploy, which
 * is the opposite of what "switch on every reload" means.
 *
 * So the first render is deterministic (index 0, matching what the server
 * emitted) and the roll happens in an effect after mount. That ordering is
 * deliberate: randomising during the initial render would make the server and
 * client markup disagree and trip a hydration mismatch. The swap is invisible in
 * practice because this band sits at the very bottom of the page, well below the
 * fold, so it has almost always resolved before anyone scrolls to it.
 *
 * Three things about serving animated GIFs here:
 *
 * 1. `unoptimized` is required. Next's image optimizer re-encodes to webp/avif,
 *    which drops GIF animation, so without it the band renders one frozen frame.
 * 2. Because the optimizer is bypassed, each file ships at full size and the
 *    ~500px-wide source is upscaled roughly 3x to reach viewport width. The
 *    softness is tolerable for lo-fi anime artwork in a decorative band; it would
 *    not be for a photograph. Only the chosen GIF is ever fetched, so a visitor
 *    pays for one, not both.
 * 3. `motion-reduce:hidden` is the accessibility escape hatch. A GIF's loop
 *    cannot be paused by CSS, so `prefers-reduced-motion` has no effect on it
 *    otherwise. The band is purely decorative, so hiding it costs nothing.
 */
export default function FooterScenery() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * SCENERY.length));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none relative z-0 w-full select-none">
      <div className="relative h-[16rem] overflow-hidden md:h-[26rem]">
        <Image
          key={SCENERY[index]}
          src={SCENERY[index]}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="object-cover object-center opacity-90 motion-reduce:hidden dark:opacity-75"
          style={{
            maskImage:
              "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-background" />
      </div>
    </div>
  );
}
