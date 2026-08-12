/**
 * The wordmark, deliberately wider and taller than the space it sits in.
 *
 * It carries no z-index of its own: the footer owns layer order, because it also
 * stacks the scenery image behind this and the copy above it.
 *
 * Three things make the crop work:
 *
 * 1. `text-[36vw]`, not a rem size. The mark is meant to relate to the viewport
 *    rather than to a typographic scale, so it has to grow with the window: a
 *    fixed rem size is enormous on a phone and small on a wide monitor, which is
 *    the opposite of what a full-bleed mark wants.
 * 2. The size is what produces the crop, not a wider container. "offcod8" is
 *    seven mostly-narrow glyphs at roughly 0.52em each, less `tracking-tighter`,
 *    so the word occupies about 3.43em. At 36vw that is ~123vw, overflowing the
 *    viewport by ~11.5vw on each side, which `overflow-hidden` then cuts. An
 *    earlier attempt set a 120vw container at 22vw type and clipped nothing: the
 *    box was wide but the word inside it was only ~75vw.
 * 3. `translate-y-[14%]` drops it so the baseline and descenders are cut by the
 *    footer's bottom edge. Without it the glyphs sit fully inside the band and it
 *    reads as centred text that happens to be large, rather than a mark running
 *    off the page.
 *
 * `leading-[0.7]` collapses the line box so the glyphs, rather than the font's
 * default line height, decide how much vertical room this takes.
 *
 * `mix-blend-overlay` is what lets it hold presence at a low alpha: it takes its
 * contrast from whatever is behind rather than needing to out-shout the scenery,
 * so it darkens bright areas and lightens dark ones instead of flattening both.
 */
export default function Brand() {
  return (
    <span
      aria-hidden
      className="pointer-events-none block translate-y-[14%] select-none whitespace-nowrap text-center font-black italic leading-[0.7] tracking-tighter text-foreground opacity-40 mix-blend-overlay text-[36vw]"
    >
      offcod8
    </span>
  );
}
