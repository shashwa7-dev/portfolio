export type Client = {
  name: string;
  img: string;
  link: string;
  contribution: string;
  /** Slug of the organisation this work happened under (see lib/workData.ts). */
  org: string;
};

export const clients: Client[] = [
  { name: "Coinbase", img: "/clients/client_coinbase.png", link: "https://x.com/baseapp/status/1542327195174965248", contribution: "Base ecosystem products", org: "dehidden" },
  { name: "Polygon", img: "/clients/client_polygon.jpg", link: "https://x.com/0xPolygon/status/1671504505764970498", contribution: "Developer tooling & dApps", org: "dehidden" },
  { name: "Play AI", img: "/clients/client_playai.jpg", link: "https://x.com/playAInetwork/status/1950596969396859101", contribution: "AI-powered gaming platform", org: "dehidden" },
  // The only entry that is an employer rather than a brand worked with under
  // one. It earns its place in the hero row on the same terms as the others,
  // and `ClientStrip` refuses to list an organisation among its own clients, so
  // /work/shopos does not end up crediting ShopOS to ShopOS.
  { name: "ShopOS", img: "/images/shopos.jpeg", link: "https://shopos.ai/", contribution: "Merchant-facing commerce surfaces", org: "shopos" },
];
