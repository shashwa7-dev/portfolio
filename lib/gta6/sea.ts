// Where the beach scene's water is on screen, for Vice Hunt's sea lane.
//
// BeachScene's art layers (`.layer` in components/gta6/scene/scene.module.css)
// sit at `inset: -2%` and draw their 16:9 art `center bottom / cover`, so the
// water's height on screen depends on the window's shape. On a wide window
// the art is scaled to the width, crops off the top and the shoreline rises;
// a fixed fraction of the height then lands on the sand.

/** The art's size (public/gta6/beach/*.webp, 16:9). */
const ART_W = 1920;
const ART_H = 1080;
/** The layers' overhang on every side, as a fraction of the box. */
const INSET = 0.02;
/**
 * The merman's water line, as a fraction of the art's height. The water
 * shows from about 0.52 (the sea layer's mask) to the sand, whose highest
 * point is 0.694 (land.webp, near the right); 0.665 is in open water across
 * the whole width.
 */
export const BEACH_WATER_LINE = 0.665;

/** The art's scale and placement for a scene box of `width` x `height` px. */
function cover(width: number, height: number) {
  const boxW = width * (1 + 2 * INSET);
  const boxH = height * (1 + 2 * INSET);
  const scale = Math.max(boxW / ART_W, boxH / ART_H);
  const bottom = height * (1 + INSET); // the layer's bottom edge, from the scene's top
  return { scale, bottom };
}

/** The y (px from the scene's top) of a point at `fraction` of the art's height. */
export function artY(fraction: number, width: number, height: number): number {
  const { scale, bottom } = cover(width, height);
  return bottom - (1 - fraction) * ART_H * scale;
}

/** Vice Hunt's `seaLine` option for a game laid over BeachScene. */
export const beachSeaLine = (width: number, height: number): number => artY(BEACH_WATER_LINE, width, height);
