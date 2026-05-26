"use client";

import React from "react";
import { motion } from "motion/react";
import Section from "@/components/layout/Section";
import { organizations } from "@/lib/workData";
import { containerVariants } from "@/lib/motionVariants";
import WorkListItem from "./WorkListItem";

const Work = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Section id="experience" label="Experience" width="reading">
        <div>
          {organizations.map((org) => (
            <WorkListItem key={org.id} organization={org} />
          ))}
        </div>
      </Section>
    </motion.div>
  );
};

export default Work;
