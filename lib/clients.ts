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
  { name: "Nodeops", img: "/clients/client_nodeops.jpg", link: "https://x.com/NodeOpsHQ/status/1845796942686949607", contribution: "Infrastructure dashboards", org: "dehidden" },
  { name: "Sentient", img: "/clients/client_sentient.jpg", link: "https://x.com/SentientAGI", contribution: "AI research interfaces", org: "dehidden" },
];
