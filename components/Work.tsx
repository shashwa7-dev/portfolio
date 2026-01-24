"use client";

import React from "react";
import { motion } from "motion/react";
import SectionTitle from "./common/SectionTitle";
import { organizations } from "@/lib/workData";
import { containerVariants } from "@/lib/motionVariants";
import WorkListItem from "./WorkListItem";
import { Icon } from "@iconify/react";

const Work = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-8"
      id="work"
    >
      <SectionTitle
        title="Work Experience"
        icon={<Icon icon={'solar:laptop-minimalistic-line-duotone'} className="w-5 h-5" />}
      />

      <div className="space-y-8">
        {organizations.map((org) => (
          <WorkListItem key={org.id} organization={org} />
        ))}
      </div>
    </motion.div>
  );
};

export default Work;
