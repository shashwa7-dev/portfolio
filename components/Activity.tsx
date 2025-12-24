"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SpotifyLastListen from "./SpotifyLastListen";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import SectionTitle from "./common/SectionTitle";
import { Zap } from "feather-icons-react";
import { Icon } from "@iconify/react";
import Button from "./common/Button";
import Book from "./common/Book";
import { books } from "@/lib/books";

const Activity = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="text-sm grid gap-3"
    >
      <SectionTitle title="Activity" icon={<Zap className={"w-4 h-4"} />} />

      {/* Blogs Section */}
      <motion.div variants={itemVariants} className="grid gap-1">
        <p className="italic font-sans text-subtitle">Blogs</p>
        <Link href="/blogs">
          <Button size="sm" variant="primary">
            <Icon
              icon={"streamline-block:content-write"}
              fontSize={"0.75rem"}
            />
            <span className="hover:underline">Checkout blogs</span>
          </Button>
        </Link>
      </motion.div>

      {/* Reading Section */}
      <motion.div variants={itemVariants} className="grid gap-2">
        <div className="flex items-center justify-between">
          <p className="italic font-sans text-subtitle">Currently Reading</p>
          <Link href={"/books"}>
            <p className="text-xs">View More</p>
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-3 gap-2"
        >
          {books.slice(0, 3).map((book) => (
            <Book {...book} key={book.slug} />
          ))}
        </motion.div>
      </motion.div>

      {/* Spotify Section */}
      <motion.div variants={itemVariants} className="grid gap-1">
        <p className="italic font-sans text-subtitle">Last listen</p>
        <SpotifyLastListen />
      </motion.div>
    </motion.div>
  );
};

export default Activity;
