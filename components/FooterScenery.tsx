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
 * **This one keeps its colour, deliberately, against the site-wide greyscale rule
 * for decorative artwork.** That rule exists so brand logos and screenshots cannot
 * drag arbitrary hues onto a hueless page. It does not fit here: the image is a
 * gold duotone chosen for that gold, and desaturating it leaves a grey halftone
 * that is a different picture. Greyscale was applied first and looked so unlike the
 * source that it read as the wrong file having been used.
 *
 * The rule still holds everywhere else, including the two other decorative
 * surfaces. Nothing about this is a precedent for un-greyscaling a logo.
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
          className="object-cover object-center opacity-90 dark:opacity-75"
          /* The fade holds solid to 88% and only softens across the top 12%.
             It used to hold to 72%, and a second gradient overlay washed the
             top half toward the page background on top of that, so the image
             was being faded twice and lost most of its sky. One mechanism is
             enough: where the mask reaches transparent, the page background
             already shows through, which is exactly what the overlay was
             re-creating by hand. */
          style={{
            maskImage:
              "linear-gradient(to top, black 0%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 88%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}
