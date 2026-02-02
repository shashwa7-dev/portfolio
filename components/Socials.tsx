"use client";
import React from "react";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import { Smile } from "feather-icons-react";
import SectionTitle from "./common/SectionTitle";
import { SVGS } from "./SVGS";
import { Icon } from "@iconify/react";

const socials = [
  {
    name: "GitHub",
    link: "https://github.com/shashwa7-dev",
    Icon: SVGS.Github,
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/shashwa7/",
    Icon: SVGS.LinkedIn,
  },
  {
    name: "Twitter",
    link: "https://x.com/offcod8",
    Icon: SVGS.Twitter,
  },
];

const Socials = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="space-y-8"
    >
      <SectionTitle title="Connect" icon={<Icon icon="solar:sticker-smile-circle-line-duotone" className="w-5 h-5" />} />
      <motion.div
        variants={containerVariants}
        className="flex flex-wrap gap-2 items-center"
      >
        {socials.map(({ name, link, Icon }) => (
          <motion.a
            key={name}
            variants={itemVariants}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border"
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{name}</span>
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Socials;
