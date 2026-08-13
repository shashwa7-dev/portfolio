import Image from "next/image";

/**
 * The footer's backdrop: a halftone mountain, masked so it dissolves upward into
 * the page.
 *
 * This replaced two animated GIFs picked at random per load, and losing the
 * animation removed most of what made the old version expensive and awkward:
 *
 * 1. **It is a server component now.** The random pick had to happen in the
 *    browser, because the homepage is statically generated and a `Math.random()`
 *    during render would have been evaluated once at build time and baked in. That
 *    forced a client component, a mount effect, and a deterministic first render to
 *    avoid a hydration mismatch. One image needs none of it.
 * 2. **`unoptimized` is gone, which is the real win.** Next's optimiser re-encodes
 *    to webp/avif and drops GIF animation, so the old band had to bypass it and
 *    ship a full-size file: a ~500px-wide source upscaled roughly 3x to reach
 *    viewport width, soft as a result. A still is optimised normally, so this 4096px
 *    source is resized and served at the width each viewport actually needs.
 * 3. **`motion-reduce:hidden` is gone.** It existed because a GIF's loop cannot be
 *    paused by CSS, so `prefers-reduced-motion` had no effect on it otherwise.
 *    Nothing moves here, so there is nothing to opt out of.
 *
 * Greyscale follows the site-wide rule for decorative artwork: permanently
 * desaturated, no hover restore, since it is texture rather than something to
 * reveal. Worth knowing this image is a gold duotone, so that rule costs it more
 * than it cost the GIFs. Dropping `grayscale` from the className below is the whole
 * change if the colour should stay.
 */
export default function FooterScenery() {
  return (
    <div aria-hidden className="pointer-events-none relative z-0 w-full select-none">
      <div className="relative h-[16rem] overflow-hidden md:h-[26rem]">
        <Image
          src="/images/footer-backdrop.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-90 grayscale dark:opacity-75"
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
