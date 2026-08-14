/**
 * Proof points, shared by the About hero and the OG card.
 *
 * These lived inside `components/About.tsx` until the share card started
 * quoting them too. A second hand-typed copy in the OG route would have been a
 * copy that drifts: the hero is edited when positioning changes and the card is
 * not, so within a release or two a shared link would be advertising numbers
 * the site no longer claims. Per CLAUDE.md, a fact about Shashwat gets one
 * home, and `data/agent-memory.md` mirrors this list for the chat assistant.
 */
export type Stat = {
  n: string;
  c: string;
  /** Brand logos anchoring the number — small overlapping avatars below the stat. */
  orgs?: { name: string; img: string }[];
};

const NFT_PARTNERS = [
  { name: "Coinbase", img: "/clients/client_coinbase.png" },
  { name: "Polygon", img: "/clients/client_polygon.jpg" },
];

export const stats: Stat[] = [
  { n: "1M+", c: "users reached", orgs: NFT_PARTNERS },
  { n: "100K", c: "day-one mints", orgs: NFT_PARTNERS },
  {
    n: "9+",
    c: "products shipped",
    orgs: [
      { name: "ShopOS", img: "/images/shopos.jpeg" },
      { name: "Dehidden", img: "/images/dehidden_logo.jpeg" },
    ],
  },
  { n: "4+ yrs", c: "building frontend" },
];
