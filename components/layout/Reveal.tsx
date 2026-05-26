"use client";

import { motion, useReducedMotion } from "motion/react";
import { revealUp, containerVariants } from "@/lib/motionVariants";

export default function Reveal({
  children,
  stagger = false,
  className,
}: {
  children: React.ReactNode;
  stagger?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={stagger ? containerVariants : revealUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
