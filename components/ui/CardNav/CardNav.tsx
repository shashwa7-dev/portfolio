"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, cardVariants, hamburgerVariants } from "./variants";
import { ArrowUpRight } from "feather-icons-react";

type CardNavLink = {
  label: string;
  href?: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor?: string; // optional now (defaults to theme)
  textColor?: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((p) => !p);

  return (
    <div
      className={`card-nav-container absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[1.2em] md:top-[2em] ${className}`}
    >
      <motion.nav
        className="card-nav block overflow-hidden rounded-xl shadow-md relative"
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        }}
        variants={containerVariants}
        animate={isOpen ? "open" : "closed"}
      >
        {/* Top Bar */}
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          {/* Hamburger */}
          <div
            className="hamburger-menu group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none"
            onClick={toggleMenu}
            style={{ color: "hsl(var(--foreground))" }}
          >
            <motion.div
              variants={hamburgerVariants}
              animate={isOpen ? "openTop" : "closedTop"}
              className="hamburger-line w-[30px] h-[2px] bg-current [transform-origin:50%_50%]"
            />
            <motion.div
              variants={hamburgerVariants}
              animate={isOpen ? "openBottom" : "closedBottom"}
              className="hamburger-line w-[30px] h-[2px] bg-current [transform-origin:50%_50%]"
            />
          </div>

          {/* Logo */}
          <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
            <img src={logo} alt={logoAlt} className="logo h-[28px]" />
          </div>

          {/* CTA Button */}
          <button
            type="button"
            className="card-nav-cta-button hidden md:inline-flex border-0 rounded-[calc(0.75rem-0.2rem)] px-4 items-center h-full font-medium cursor-pointer transition-colors duration-300"
            style={{
              backgroundColor: "hsl(var(--foreground))",
              color: "hsl(var(--background))",
            }}
          >
            Get Started
          </button>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="card-nav-content relative mt-[60px] p-2 flex flex-col items-stretch gap-2 md:flex-row md:items-end md:gap-[12px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {items.slice(0, 3).map((item, idx) => (
                <motion.div
                  key={item.label}
                  className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] flex-1"
                  style={{
                    backgroundColor: item.bgColor || "hsl(var(--secondary))",
                    color: item.textColor || "hsl(var(--secondary-foreground))",
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={idx}
                >
                  <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">
                    {item.label}
                  </div>
                  <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                    {item.links.map((lnk, i) => (
                      <a
                        key={lnk.label + i}
                        className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px]"
                        href={lnk.href}
                        aria-label={lnk.ariaLabel}
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        <ArrowUpRight className="nav-card-link-icon shrink-0" />
                        {lnk.label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default CardNav;
