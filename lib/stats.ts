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

// Order matters: the OG card quotes the first three. 12+ is the nine
// Dehidden projects plus ShopOS's three products (Sloosh, Spacelab, the ShopOS
// app). 30+ is Spacelab's model catalog. "100K day-one mints" was dropped for
// it: it was the second stat from the same launch as 1M+, and the band had
// nothing from the current role.
export const stats: Stat[] = [
  { n: "1M+", c: "users reached", orgs: NFT_PARTNERS },
  {
    n: "12+",
    c: "products shipped",
    orgs: [
      { name: "ShopOS", img: "/images/shopos.jpeg" },
      { name: "Dehidden", img: "/images/dehidden_logo.jpeg" },
    ],
  },
  {
    n: "30+",
    c: "AI models shipped",
    orgs: [
      { name: "Sloosh", img: "/images/sloosh.png" },
      { name: "Spacelab", img: "/images/spacelab.svg" },
    ],
  },
  { n: "5+ yrs", c: "building frontend" },
];
