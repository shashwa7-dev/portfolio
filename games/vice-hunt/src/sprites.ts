import { SPRITES } from "./art/sprites";
import type { Kind } from "./types";

export type Art = {
  sprites: Record<Kind, readonly [HTMLImageElement, HTMLImageElement]>;
};

const KINDS: Kind[] = ["rabbit", "iguana", "flamingo", "bigfoot"];

let art: Art | null = null;
let pending: Promise<void> | null = null;

export const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

async function decode(svg: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = svgUrl(svg);
  await img.decode();
  return img;
}

// Decodes every sprite frame once per page; later calls share the
// same promise. A failed load clears it so the next call can retry.
export function preloadHunt(): Promise<void> {
  pending ??= (async () => {
    const frames = await Promise.all(KINDS.flatMap((k) => SPRITES[k].map(decode)));
    const sprites = {} as Art["sprites"];
    KINDS.forEach((k, i) => (sprites[k] = [frames[i * 2], frames[i * 2 + 1]]));
    art = { sprites };
  })().catch((err) => {
    pending = null;
    throw err;
  });
  return pending;
}

export const loadedArt = (): Art | null => art;
