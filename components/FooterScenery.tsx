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
 * The band is the width of the footer's own column, 1080px, not the viewport. It
 * used to bleed edge to edge, which read as a separate full-bleed section rather
 * than as backing for the footer it belongs to. Now it lines up with the
 * copyright line above it, and the side fades stop it ending on two hard vertical
 * edges.
 *
 * Greyscale, with no exception. The source is a gold duotone and an earlier pass
 * exempted it on the grounds that desaturating it changed the picture, which was
 * the wrong call: the site is black and white, and an exemption for the largest
 * decorative surface on the page is not an exception to that rule so much as an
 * end to it. The halftone reads as texture either way, which is all this band is.
 */
/**
 * Two mask layers intersected: the long top fade, and a shorter fade on each
 * side. Composited rather than combined into one gradient because a single
 * gradient only runs along one axis, and `intersect` keeps whichever layer is
 * more transparent at every pixel, so the corners fall away naturally.
 *
 * `-webkit-mask-composite: source-in` is the older WebKit spelling of the same
 * operation and is what Safari reads; both are set.
 *
 * The sides fade over 10% rather than the top's 28%. The top has to dissolve into
 * open page above it, while the sides only need to lose their edge against the
 * same background a few pixels away.
 */
const EDGE_MASK = [
  "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
].join(", ");

export default function FooterScenery() {
  return (
    <div aria-hidden className="pointer-events-none relative z-0 mx-auto w-full max-w-[1080px] select-none">
      <div className="relative h-[16rem] overflow-hidden md:h-[26rem]">
        <Image
          src="/images/footer-backdrop.webp"
          alt=""
          fill
          sizes="(max-width: 1080px) 100vw, 1080px"
          className="object-cover object-center opacity-90 grayscale dark:opacity-40"
          /* Back to the original stop: solid to 72%, softening across the top
             28%. Two shorter fades were tried on the way, 88% and 80%, chasing
             more visible sky; both left too hard an edge in dark mode, where a
             pale halftone meeting a near-black page needs a long ramp to read as
             a backdrop rather than as a pasted rectangle.

             The mask is the only fade. A second gradient overlay used to wash the
             top half toward the page background on top of this, and doubling up
             is what ate the sky originally. It stays gone: where the mask reaches
             transparent the page background already shows through, in whichever
             theme, which is what the overlay was re-creating by hand. */
          style={{
            maskImage: EDGE_MASK,
            WebkitMaskImage: EDGE_MASK,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />
      </div>
    </div>
  );
}
