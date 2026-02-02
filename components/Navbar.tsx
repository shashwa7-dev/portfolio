"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Sun, Moon, Settings, Volume2, VolumeX } from "feather-icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDarkMode } from "@/app/hooks/useDarkMode";
import { useSound } from "@/app/providers/SoundProvider";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#tech_stack" },
  { label: "Blog", href: "/blogs" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { muted, toggleMuted } = useSound();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [settingsOpen]);

  return (
    <>
      {/* Sticky dock — fixed at bottom, pill-shaped */}
      <header className="fixed bottom-5 left-0 md:inset-x-0 z-50 flex justify-center pointer-events-none  px-2 md:px-4 ">
        <motion.nav
          initial={{ opacity: 0, y: 10, }}
          animate={{ opacity: 1, y: 0, }}
          transition={{ duration: 0.5 }}
          className="pointer-events-auto flex items-center gap-1 rounded-full bg-background/75 dark:bg-background/60 backdrop-blur-xl border border-border shadow-lg shadow-black/5 dark:shadow-black/20 p-2 md:px-4"
          role="navigation"
          onMouseLeave={() => setTimeout(() => setActiveTab(null), 100)}
        >
          {/* Logo */}
          <a
            href="/"
            className="font-semibold text-sm tracking-tight p-1 px-2 rounded-full text-foreground transition-colors"
          >
            {"[S7.dev]"}
          </a>

          <span
            className="w-px h-4 bg-border shrink-0 mx-1 hidden md:block"
            aria-hidden="true"
          />

          {/* Desktop nav — dock items */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.li key={link.label}
                className="relative"
                onFocus={() => setActiveTab(link.label)}
                onMouseOver={() => setActiveTab(link.label)}
                onMouseLeave={() => setActiveTab(link.label)}>
                {activeTab === link.label ? (
                  <motion.div
                    layoutId="tab-indicator"
                    className={cn(
                      'absolute inset-0 rounded-full transition-colors',
                      'bg-muted/50',
                    )}
                  />
                ) : null}
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-full transition-all duration-200 hover:scale-105 origin-center"
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-full hover:bg-muted/50 transition-colors px-2"
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
          <span
            className="w-px h-4 hidden md:block bg-border shrink-0 mx-1"
            aria-hidden="true"
          />

          {/* Settings: dropdown with theme + sound (desktop only; on mobile these are in the menu) */}
          <div ref={settingsRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Settings"
              aria-expanded={settingsOpen}
            >
              <Settings className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-[38px] right-0 mb-2 w-48 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-sm p-1 z-50 overflow-hidden"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 w-full py-2.5 px-3 text-sm text-muted-foreground  [&>svg]:text-accent hover:text-foreground hover:bg-muted/50 transition-colors rounded-lg"
                    role="menuitem"
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 shrink-0" />
                    )}
                    {isDarkMode ? "Light mode" : "Dark mode"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMuted}
                    className="flex items-center gap-2 w-full py-2.5 px-3 text-sm text-muted-foreground  [&>svg]:text-accent hover:text-foreground hover:bg-muted/50 transition-colors rounded-lg"
                    role="menuitem"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4 shrink-0" />
                    ) : (
                      <Volume2 className="w-4 h-4 shrink-0" />
                    )}
                    {muted ? "Sound off" : "Sound on"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
              <ul aria-label="Mobile navigation links" className="p-2">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block p-2  my-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      aria-label={link.label}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
             
                <li className="border-t border-border flex justify-between mt-10 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      toggleDarkMode();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&>svg]:text-accent"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-3.5 h-3.5" />
                        Light mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5" />
                        Dark mode
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleMuted();
                      setMobileOpen(false);
                    }}
                    className="flex  items-center gap-2 text-sm p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&>svg]:text-accent"
                  >
                    {muted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        Sound off
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        Sound on
                      </>
                    )}
                  </button>
                </li>
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
