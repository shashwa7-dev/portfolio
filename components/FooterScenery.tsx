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
 * Dark mode gets a much lower opacity, 40 against 90. The halftone is a light
 * image: a cream sky over a mid-toned mountain. At the same weight it used to
 * carry in dark mode it read as a bright band glowing off a near-black page,
 * which is the opposite of a backdrop. Dimming it is the fix rather than
 * inverting, because `dark:invert` would darken the sky but light up the treeline
 * along the bottom edge, which is precisely where the wordmark and the copyright
 * line sit.
 *
 * Greyscale, with no exception. The source is a gold duotone and an earlier pass
 * exempted it on the grounds that desaturating it changed the picture, which was
 * the wrong call: the site is black and white, and an exemption for the largest
 * decorative surface on the page is not an exception to that rule so much as an
 * end to it. The halftone reads as texture either way, which is all this band is.
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
          className="object-cover object-center opacity-90 grayscale dark:opacity-40"
          /* The fade holds solid to 80% and softens across the top 20%.
             It used to hold to 72% with a second gradient overlay washing the
             top half toward the page background on top of that, so the image
             was being faded twice and lost most of its sky. One mechanism is
             enough: where the mask reaches transparent, the page background
             already shows through, which is exactly what the overlay was
             re-creating by hand. */
          style={{
            maskImage:
              "linear-gradient(to top, black 0%, black 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 80%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}
