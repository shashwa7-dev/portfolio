"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Coffee, Folder } from "feather-icons-react";

const navLinks = [
  { label: "Work", icon: <Briefcase className="w-4 h-4" />, href: "#work" },
  {
    label: "Projects",
    icon: <Coffee className="w-4 h-4" />,
    href: "#projects",
  },
  { label: "Blogs", icon: <Folder className="w-4 h-4" />, href: "/blogs" },
];

const hamburgerVariants = {
  closedTop: { rotate: 0, y: 0 },
  openTop: { rotate: 45, y: 6 },
  closedBottom: { rotate: 0, y: 0 },
  openBottom: { rotate: -45, y: -6 },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => setOpen(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  // Close menu on outside click

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <nav className="relative z-[1000]">
      {/* Hamburger */}
      <div
        className={`fixed top-6 right-6 z-[1001] flex flex-col gap-[6px] cursor-pointer items-center justify-center w-9 h-9 transition-colors ${
          open ? "text-secondary-foreground" : "text-foreground"
          }`}
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <motion.div
          variants={hamburgerVariants}
          animate={open ? "openTop" : "closedTop"}
          transition={{ duration: 0.3 }}
          className="w-[25px] h-[2px] bg-current rounded-sm"
        />
        <motion.div
          variants={hamburgerVariants}
          animate={open ? "openBottom" : "closedBottom"}
          transition={{ duration: 0.3 }}
          className="w-[20px] h-[2px] bg-current rounded-sm"
        />
      </div>

      {open && (
        <div className="fixed top-0 left-0 w-full h-[100dvh] bg-neutral-900/90 backdrop-blur-sm origin-top z-[999] rounded-lg" />
      )}
      {/* Animated Fullscreen Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full  backdrop-blur-sm origin-top z-[999] rounded-lg p-2"
          >
            <div className="space-y-6  border  shadow-sm p-4 rounded-xl bg-card relative overflow-hidden">
              <img
                src={"/images/bg.gif"}
                alt=""
                className="absolute w-full h-full top-0 left-0 z-[0] opacity-5 grayscale"
              />
              <ul className="flex flex-col items-end justify-end pt-10 gap-2 relative z-[1]">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 * i }}
                    onClick={closeMenu}
                    className="text-muted-foreground hover:text-secondary-foreground cursor-pointer font-medium tracking-wide flex items-center gap-2 text-lg"
                  >
                    <a
                      href={link.href}
                      className="hover:text-secondary-foreground"
                    >
                      {link.label}
                    </a>
                    {link.icon}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
