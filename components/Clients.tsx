"use client";
import React from "react";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import SectionTitle from "./common/SectionTitle";
import { GitMerge, Hexagon } from "feather-icons-react";
import Button from "./common/Button";

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-sm grid gap-3"
    >
      <SectionTitle
        title="Clients & Contributions"
        icon={<GitMerge className={"w-4 h-4"} />}
      />
      <motion.div
        variants={containerVariants}
        className="flex items-center flex-wrap gap-2"
      >
        {clients.map((client) => (
          <motion.div variants={itemVariants} key={client.name}>
            <Button
              className="overflow-hidden"
              size="sm"
              variant="primary"
              onClick={() => window.open(client.link, "_blank")}
            >
              <img
                src={client.img}
                className="rounded-xl w-4"
                alt={client.name}
              />
              <span>{client.name}</span>{" "}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Clients;
