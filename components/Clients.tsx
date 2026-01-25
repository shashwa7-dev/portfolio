"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import SectionTitle from "./common/SectionTitle";
import { GitMerge, ExternalLink } from "feather-icons-react";
import { Icon } from "@iconify/react";

const clients = [
  {
    name: "Play AI",
    img: "/clients/client_playai.jpg",
    link: "https://x.com/playAInetwork/status/1950596969396859101",
    contribution:
      "Frontend development for AI-powered gaming and creator platform.",
  },
  {
    name: "Polygon",
    img: "/clients/client_polygon.jpg",
    link: "https://x.com/0xPolygon/status/1671504505764970498",
    contribution:
      "Developer tooling and dApp development on the Polygon ecosystem.",
  },
  {
    name: "Coinbase",
    img: "/clients/client_coinbase.png",
    link: "https://x.com/baseapp/status/1542327195174965248",
    contribution:
      "Contributions to Base ecosystem and developer-facing products.",
  },
  {
    name: "Sentient",
    img: "/clients/client_sentient.jpg",
    link: "https://x.com/SentientAGI",
    contribution:
      "Frontend and interface work for AI research initiatives.",
  },
  {
    name: "Nodeops",
    img: "/clients/client_nodeops.jpg",
    link: "https://x.com/NodeOpsHQ/status/1845796942686949607",
    contribution:
      "Infrastructure dashboards and validator operations tooling.",
  },
];

const Clients = () => {
  return (
    <motion.section
      id="clients"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-8"
    >
      <SectionTitle
        title="Clients & Contributions"
        icon={<Icon icon='solar:ufo-3-line-duotone' className="w-5 h-5" />}
      />
      <div className="space-y-2">
        {clients.map((client) => (
          <motion.a
            key={client.name}
            href={client.link}
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            className="group flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-card/80 hover:border-accent/30 transition-all duration-200"
          >
            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-secondary shrink-0">
              <Image
                src={client.img}
                alt={client.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                  {client.name}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {client.contribution}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.section>
  );
};

export default Clients;
