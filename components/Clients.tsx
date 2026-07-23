"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { ease, duration, stagger } from "@/lib/motionVariants";
import Section from "@/components/layout/Section";
import { ArrowUpRight } from "lucide-react";
import { clients } from "@/lib/clients";

// The parent orchestrates the cascade via staggerChildren; each card only
// describes its own fade-up. (Previously the card ALSO added `delay: i * 0.06`
// on top of the parent stagger, so the two compounded into a slow, laggy
// diagonal. One stagger source only.)
const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.tight, delayChildren: stagger.tight } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
};

const Clients = () => {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Section id="clients" number="04" label="Trusted by" title="Teams I've worked with" width="reading">
        <div className="grid grid-cols-2 -sm:grid-cols-1 gap-2.5">
          {clients.map((client) => (
            <motion.a
              key={client.name}
              href={client.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card/60 transition-[border-color,background-color,transform,box-shadow] duration-200 ease-[--ease-out] hover:bg-card hover:border-accent/30 hover:-translate-y-px hover:shadow-sm active:scale-[0.98]"
            >
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-secondary shrink-0 ring-1 ring-border transition-[box-shadow] duration-200 group-hover:ring-accent/30">
                <Image
                  src={client.img}
                  alt={client.name}
                  fill
                  sizes="32px"
                  className="object-cover opacity-60 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm text-foreground transition-colors duration-150 group-hover:text-accent truncate">
                    {client.name}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 ease-[--ease-out] group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug truncate">
                  {client.contribution}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </Section>
    </motion.div>
  );
};

export default Clients;
