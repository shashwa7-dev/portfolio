"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { backdropFadeVariants, dialogPopVariants } from "@/lib/motionVariants";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title,
}: VideoModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropFadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50"
          />

          {/* Modal — enter is deliberate, exit is snappy */}
          <motion.div
            variants={dialogPopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-4 md:inset-12 lg:inset-20 z-50 flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-5xl mx-auto flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                {title && (
                  <h3 className="text-lg font-medium truncate">{title}</h3>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto p-2 rounded-lg hover:bg-secondary transition-[background-color,transform] duration-150 active:scale-[0.92]"
                  aria-label="Close video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video container */}
              <div className="flex-1 relative rounded-xl overflow-hidden bg-black">
                <video
                  src={videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
