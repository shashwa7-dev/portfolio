/**
 * The wordmark, bleeding off the bottom edge of the footer.
 *
 * It carries no z-index of its own: the footer owns layer order, because it
 * also stacks the scenery image behind this and the copy above it.
 *
 * Sizing is deliberately restrained now that the scenery below it renders at
 * high opacity. At the original 10rem / 18rem it spanned the whole band and
 * competed with the photograph for the same space, which read as clutter
 * rather than as a mark. Roughly half that size, it sits in the upper part of
 * the band where the image is masked toward transparent, so it reads against
 * the page surface instead of against busy flower detail.
 */
export default function Brand() {
  return (
    <p className="pointer-events-none select-none text-center text-[5rem] font-black italic leading-none tracking-tighter text-muted-foreground opacity-[0.16] md:text-[9rem]">
      offcod8
    </p>
  );
}
