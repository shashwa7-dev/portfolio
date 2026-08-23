export type Traits = Record<string, unknown> & {
  hairStyle: string;
  glasses: string;
  headwear: string;
  present: string;
};

export type PortraitOpts = {
  present?: "any" | "femme" | "masc" | "fluid";
  variant?: number;
  scale?: number;
  force?: Partial<Traits>;
};

export type Engine = {
  portrait(name: string, cell: { x: number; y: number; w: number; h: number }, opts?: PortraitOpts): Traits;
  handwrite(R: () => number, text: string, cx: number, cy: number, size: number, o?: Record<string, unknown>): number;
  castTraits(R: () => number, present?: string): Traits;
};

export function createEngine(
  ctx: CanvasRenderingContext2D,
  opts?: { hand?: string }
): Engine;
