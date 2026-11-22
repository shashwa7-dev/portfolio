/**
 * Everything on the starter pack card, in one place.
 *
 * To add a project bubble, add a row to `bubbles` (and its logo under
 * `public/starter-pack/logos/`). To swap an ESSENTIALS pod, change its row in
 * `pods`. Nothing else needs touching. Spec:
 * docs/superpowers/specs/2026-11-13-starter-pack-design.md
 */
export type ThemeId = "card-stock" | "sky";

export type BubbleDef = {
  id: string;
  name: string;
  src: string;
  /**
   * Radius in card pixels. Together the bubbles fill 50 to 60% of
   * BUBBLE_BOX (a test holds this); Swoopy and Sloosh are the biggest.
   */
  r: number;
  bg: string;
  fit: "cover" | "contain";
};

/** `label` is not drawn on the pod; it names the pod in the card's screen-reader description. */
export type PodDef = { id: string; label: string; art: string };

export type StarterPackConfig = {
  title: string;
  subtitle: string;
  greeting: string;
  badge: string;
  stamp: string;
  sideLabel: string;
  shippedLabel: string;
  warning: { struck: string; rest: string; line2: string };
  /** `shadowSrc` is the mascot's silhouette, pre-blurred and padded; regenerate it whenever `src` changes. */
  mascot: { src: string; shadowSrc: string; width: number; height: number; alt: string };
  bubbles: BubbleDef[];
  pods: PodDef[];
  ticket: { url: string; qr: string; tag: string; location: string };
  themes: ThemeId[];
};

/** The 'SHIPPED' pod's inner box in card pixels: the 222 x 150 pod less its 7px inset. */
export const BUBBLE_BOX = { w: 208, h: 136 } as const;

const logo = (id: string, ext = "png") => `/starter-pack/logos/${id}.${ext}`;

export const starterPack: StarterPackConfig = {
  title: "OFFCOD8",
  subtitle: "STARTER PACK",
  greeting: "HI :)",
  badge: "OPEN TO WORK",
  stamp: "BLR",
  sideLabel: "ESSENTIALS",
  shippedLabel: "SHIPPED",
  warning: { struck: "FR", rest: "AGILE!!!", line2: "SHIPS IN SPRINTS" },
  mascot: {
    src: "/starter-pack/mascot.webp",
    shadowSrc: "/starter-pack/mascot-shadow.webp",
    width: 262,
    height: 829,
    alt: "Shashwat as a toy figure in an orange cap, round glasses, an offcod8 T-shirt and high-top sneakers",
  },
  bubbles: [
    { id: "swoopy", name: "Swoopy", src: logo("swoopy", "svg"), r: 40, bg: "#ffffff", fit: "contain" },
    { id: "sloosh", name: "Sloosh", src: logo("sloosh"), r: 34, bg: "#ffd84a", fit: "cover" },
    { id: "shopos", name: "ShopOS", src: logo("shopos"), r: 20, bg: "#ffffff", fit: "cover" },
    { id: "coinbase", name: "Coinbase", src: logo("coinbase"), r: 19, bg: "#0052ff", fit: "cover" },
    { id: "dehidden", name: "DeHidden", src: logo("dehidden"), r: 20, bg: "#b0224f", fit: "cover" },
    { id: "polygon", name: "Polygon", src: logo("polygon"), r: 19, bg: "#7b3fe4", fit: "cover" },
    { id: "santul", name: "Santul", src: logo("santul"), r: 20, bg: "#111410", fit: "cover" },
    { id: "playai", name: "Play AI", src: logo("playai"), r: 19, bg: "#000000", fit: "cover" },
  ],
  pods: [
    { id: "anime", label: "ANIME", art: "/starter-pack/pods/anime.webp" },
    { id: "coffee", label: "COFFEE", art: "/starter-pack/pods/coffee.webp" },
    { id: "music", label: "MUSIC", art: "/starter-pack/pods/music.webp" },
    { id: "gaming", label: "GAMING", art: "/starter-pack/pods/gaming.webp" },
  ],
  ticket: {
    url: "https://www.youtube.com/watch?v=YlbvZ542Ijo&list=RDYlbvZ542Ijo&start_radio=1",
    qr: "/starter-pack/qr.svg",
    tag: "SCAN ME",
    location: "BLR",
  },
  // Which themes the card picks from at random on each load. Only card stock
  // for now; the sky and navy theme is kept and styled, so add "sky" back
  // here to put it in rotation again.
  themes: ["card-stock"],
};

const two = (n: number) => String(n).padStart(2, "0");

/** The barcode's digits: today's date, `DD MM YY`. */
export function formatTicketDate(d: Date): string {
  return `${two(d.getDate())} ${two(d.getMonth() + 1)} ${two(d.getFullYear() % 100)}`;
}
