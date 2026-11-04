/**
 * public/brand-mark.png sampled onto a 31x31 grid ("#" lit, "." unlit, " " no
 * dot, which rounds the panel's corners). Re-sample if the mark changes.
 */
const ROWS = [
  "   .........................   ",
  "  ..........................#  ",
  " ..........................### ",
  "..........................###..",
  "...................#####.###...",
  "..................#########....",
  ".................###...###.....",
  ".................##...#####....",
  "................###..###.##....",
  "................##..###..##....",
  "................######...##....",
  ".......#####.....####...###....",
  "......######.....####..###.....",
  ".....###........#########......",
  "....###........###..####.......",
  "...###........###..............",
  "...##........###...............",
  "...##.......###................",
  "...##......###.................",
  "..###.....###......#...........",
  "...##....###......###..........",
  "...##...###.......##...........",
  "...##..###........##...........",
  "....#####........###...........",
  "....####........###............",
  "....####.......####............",
  "...########..#####.............",
  "..###..#########...............",
  " ###......###................. ",
  "  #..........................  ",
  "   .........................   ",
];

export const BRAND_SIZE = ROWS.length;

/** Both layers of the backdrop share this box, so their dots line up exactly. */
export const BRAND_BOX_CLASS =
  "absolute right-0 top-0 aspect-square w-[clamp(20rem,43vw,38.75rem)] translate-x-[18%] -translate-y-[15%] text-foreground";

/**
 * One SVG path holding every dot of a kind, as zero-length round-capped strokes.
 * Pass `diagonal` to take only the dots on that diagonal (row + column).
 */
export function dotsPath(kind: "#" | ".", diagonal?: number) {
  let d = "";
  ROWS.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === kind && (diagonal === undefined || r + c === diagonal)) {
        d += `M${c + 0.5} ${r + 0.5}h0`;
      }
    });
  });
  return d;
}
