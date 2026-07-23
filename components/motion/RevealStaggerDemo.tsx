"use client";

import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/lib/motionVariants";

export default function RevealStaggerDemo() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid w-full grid-cols-3 gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div key={i} variants={itemVariants} className="h-12 rounded-lg border border-border bg-elevated" />
      ))}
    </motion.div>
  );
}
