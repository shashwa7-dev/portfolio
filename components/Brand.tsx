/**
 * The wordmark, bleeding off the bottom edge of the footer.
 *
 * It carries no z-index of its own: the footer owns layer order, because it
 * also stacks the scenery image behind this and the copy above it.
 *
 * Sizing and opacity are a balance against the scenery below. Too large and it
 * spans the whole band, competing with the photograph for the same space and
 * reading as clutter. Too faint and it disappears against the flower detail.
 * `mix-blend-overlay` is what lets it hold presence at a low alpha: it takes
 * its contrast from whatever it sits on rather than needing to out-shout the
 * image, so it darkens the bright meadow and lightens the shadowed rock
 * instead of flattening both.
 */
export default function Brand() {
  return (
    <p className="pointer-events-none select-none text-center text-[6rem] font-black italic leading-none tracking-tighter text-foreground opacity-40 mix-blend-overlay md:text-[11rem]">
      offcod8
    </p>
  );
}
