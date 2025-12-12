"use client";
import React from "react";
import { motion } from "framer-motion";
import { Social } from "./Project";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import { Smile } from "feather-icons-react";
import SectionTitle from "./common/SectionTitle";

const Socials = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="text-sm grid gap-3"
    >
      <SectionTitle title="Socials" icon={<Smile className={"w-4 h-4"} />} />
      <motion.div
        variants={containerVariants}
        className="flex flex-wrap gap-2 items-center"
      >
        <motion.div variants={itemVariants}>
          <Social type="github" link="https://github.com/shashwa7-dev" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Social type="linked" link="https://www.linkedin.com/in/shashwa7/" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Social type="twitter" link="https://x.com/offcod8" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Socials;
