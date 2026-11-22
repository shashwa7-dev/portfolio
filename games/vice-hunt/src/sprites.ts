import { EXTRA, type ExtraId } from "./art/rares";
import { SPRITES } from "./art/sprites";
import { KINDS, type Kind } from "./creatures";

export type { ExtraId } from "./art/rares";

export type Art = {
  /** Every kind's frames; Bigfoot's two are for icons and the reduced-motion
   *  fallback (in play he is a rig). */
  sprites: Record<Kind, readonly HTMLImageElement[]>;
  /** Special states and props: the cow's garland, the shark rocket, the
   *  empty UFO, the alien's parachute, the tiger's face and paw, the pile, a fish. */
  extra: Record<ExtraId, HTMLImageElement>;
};

let art: Art | null = null;
let pending: Promise<void> | null = null;

export const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

async function decode(svg: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = svgUrl(svg);
  await img.decode();
  return img;
}

// Decodes every sprite frame and extra once per page; later calls share the
// same promise. A failed load clears it so the next call can retry.
export function preloadHunt(): Promise<void> {
  pending ??= (async () => {
    const ids = Object.keys(EXTRA) as ExtraId[];
    const [frames, extras] = await Promise.all([
      Promise.all(KINDS.map((k) => Promise.all(SPRITES[k].map(decode)))),
      Promise.all(ids.map((id) => decode(EXTRA[id]))),
    ]);
    const sprites = {} as Art["sprites"];
    KINDS.forEach((k, i) => (sprites[k] = frames[i]));
    const extra = {} as Art["extra"];
    ids.forEach((id, i) => (extra[id] = extras[i]));
    art = { sprites, extra };
  })().catch((err) => {
    pending = null;
    throw err;
  });
  return pending;
}

export const loadedArt = (): Art | null => art;
