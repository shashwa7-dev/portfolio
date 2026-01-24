"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "feather-icons-react";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#tech_stack" },
  { label: "Blog", href: "/blogs" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Sticky dock — fixed at bottom, pill-shaped */}
      <header className="fixed bottom-5 left-0 md:inset-x-0 z-50 flex justify-center pointer-events-none  px-2 md:px-4 ">
        <motion.nav
          initial={{ opacity: 0, x: -10, }}
          animate={{ opacity: 1, x: 0,  }}
          className="pointer-events-auto flex items-center gap-1 rounded-full bg-background/75 dark:bg-background/60 backdrop-blur-xl border border-border shadow-lg shadow-black/5 dark:shadow-black/20 p-2 md:px-4"
          role="navigation"
        >
          {/* Logo */}
          <a
            href="/"
            className="font-semibold text-sm tracking-tight p-1 px-2 rounded-full text-foreground hover:bg-muted/50 transition-colors"
          >
            {"[S7.dev]"}
          </a>

          <span
            className="w-px h-4 bg-border shrink-0 mx-1"
            aria-hidden="true"
          />

          {/* Desktop nav — dock items */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-all duration-200 hover:scale-105 origin-center"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-full hover:bg-muted/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </motion.nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 left-4 right-4 z-40 md:hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-xl"
              aria-label="Mobile navigation"
            >
              <ul className="px-4 py-4 space-y-0.5">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
