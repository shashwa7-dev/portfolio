"use client";
import React from "react";

const clients = [
  {
    name: "Play AI",
    img: "/clients/client_playai.jpg",
    link: "https://x.com/playAInetwork/status/1950596969396859101",
  },
  {
    name: "Polygon",
    img: "/clients/client_polygon.jpg",
    link: "https://x.com/0xPolygon/status/1671504505764970498",
  },
  {
    name: "Coinbase",
    img: "/clients/client_coinbase.png",
    link: "https://x.com/baseapp/status/1542327195174965248",
  },
  {
    name: "Sentient",
    img: "/clients/client_sentient.jpg",
    link: "https://x.com/SentientAGI",
  },
  {
    name: "Nodeops",
    img: "/clients/client_nodeops.jpg",
    link: "https://x.com/NodeOpsHQ/status/1845796942686949607",
  },
];
const Clients = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium text-secondary-foreground font-sans border-b">
        {"Clients & Contributions"}
      </p>
      <div className="flex items-center flex-wrap gap-2">
        {clients?.map((client) => (
          <div
            onClick={() => window.open(client.link, "_blank")}
            key={client.name}
            className="bg-card flex border-2  overflow-hidden pr-1.5 rounded-lg items-center text-xs gap-2 cursor-pointer hover:scale-95 transition-all"
          >
            <img src={client.img} className="w-[26px]" />
            <span>{client.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;
