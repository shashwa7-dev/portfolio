"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SVGS } from "./SVGS";
import SpotifyLastListen from "./SpotifyLastListen";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import SectionTitle from "./common/SectionTitle";
import { Zap } from "feather-icons-react";

const Book = ({
  name,
  author,
  cover,
  progress,
}: {
  name: string;
  author: string;
  cover: string;
  progress: number;
}) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -2 }}
      className="h-[150px] relative rounded-lg overflow-hidden border border-border bg-card cursor-pointer"
    >
      <img
        src={cover}
        alt={name}
        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
      />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full bg-muted h-[4px]">
        <div
          className="bg-muted-foreground h-[4px]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Info */}
      <div className="absolute bottom-1 right-0 w-full bg-card backdrop-blur-sm px-2 py-1 text-xs">
        <p className="font-sans truncate">{name}</p>
        <p className="text-secondary-foreground italic truncate">{author}</p>
      </div>
    </motion.div>
  );
};

// 🧭 Main Activity Component
const Activity = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="text-sm grid gap-3"
    >
      <SectionTitle
        title="Activity"
        icon={<Zap className={"w-4 h-4"} />}
      />

      {/* Blogs Section */}
      <motion.div variants={itemVariants} className="grid gap-1">
        <p className="italic font-sans text-muted-foreground">Blogs</p>
        <Link href="/blogs">
          <div className="flex items-center gap-1 w-fit bg-card border border-border rounded-md px-2 py-1 hover:bg-card/80 transition">
            <img src="/images/icon_blogpost.svg" className="w-4 h-4" />
            <span className="hover:underline">Checkout blogs</span>
            <SVGS.Link className="w-[10px] h-[10px]" />
          </div>
        </Link>
      </motion.div>

      {/* Reading Section */}
      <motion.div variants={itemVariants} className="grid gap-2">
        <p className="italic font-sans text-muted-foreground">
          Currently Reading
        </p>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-3 gap-2"
        >
          <Book
            name="Build a LLM"
            author="Sebastian Raschka"
            cover="/books/book_build_LLM.JPG"
            progress={15}
          />
          <Book
            name="Advanced React"
            author="Nadia Makarevich"
            cover="/books/book_advnc_react.JPG"
            progress={35}
          />
          <Book
            name="Can't Hurt Me"
            author="David Goggins"
            cover="/books/book_cant_hurt_me.jpg"
            progress={17}
          />
        </motion.div>
      </motion.div>

      {/* Spotify Section */}
      <motion.div variants={itemVariants} className="grid gap-1">
        <p className="italic font-sans text-muted-foreground">Last listen</p>
        <SpotifyLastListen />
      </motion.div>
    </motion.div>
  );
};

export default Activity;
