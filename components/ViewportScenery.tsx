import Image from "next/image";

/**
 * Ambient scenery pinned to the bottom of the viewport, behind every layer of
 * the page including the footer.
 *
 * Two details are load-bearing:
 *
 * 1. `z-0`, not a negative z-index. A negative value would paint this behind
 *    `body`'s own `bg-background` and it would vanish entirely. Content sits
 *    above it via the `relative z-10` wrappers in the layout instead.
 * 2. The mask fades the top edge to transparent so the image dissolves into the
 *    page rather than starting with a hard horizon line. The gradient wash on
 *    top pulls it toward `--background`, so it reads as part of the surface and
 *    follows whichever theme is active.
 *
 * Decorative only: `aria-hidden` and `pointer-events-none`.
 */
export default function ViewportScenery() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[50vh] select-none md:h-[60vh]"
    >
      <Image
        src="/images/footer-scenery.jpg"
        alt=""
        fill
        sizes="100vw"
        quality={85}
        priority={false}
        className="object-cover object-center opacity-50 dark:opacity-[0.35]"
        style={{
          maskImage:
            "linear-gradient(to top, black 0%, black 30%, transparent 95%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 30%, transparent 95%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/30 to-background" />
    </div>
  );
}
