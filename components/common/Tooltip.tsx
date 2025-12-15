"use client";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

type TooltipProps = {
  text: string;
  show: boolean;
  position?: "top" | "bottom";
  className?: string;
};

export default function Tooltip({
  text,
  show,
  position = "top",
  className = "",
}: TooltipProps) {
  const posClasses =
    position === "top"
      ? "bottom-0 mb-2 left-1/2 -translate-x-1/2"
      : "top-0 mt-2 left-1/2 -translate-x-1/2";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: position === "top" ? 6 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === "top" ? 6 : -6 }}
          transition={{ duration: 0.15 }}
          className={`absolute whitespace-nowrap bg-foreground text-background text-xs px-2 py-1 rounded-md shadow-md z-[999] ${posClasses} ${className}`}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
