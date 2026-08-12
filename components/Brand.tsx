/**
 * The oversized wordmark bled off the bottom of the footer. It carries no
 * z-index of its own: the footer owns the layer order, because it also stacks
 * the scenery image behind this and the copy above it.
 */
export default function Brand() {
  return (
    <p className="pointer-events-none select-none text-center text-[10rem] font-black italic leading-none tracking-tighter text-muted-foreground opacity-[0.1] md:text-[18rem]">
      offcod8
    </p>
  );
}
