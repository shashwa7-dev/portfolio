"use client";
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import SpotifyLastListen from "./SpotifyLastListen";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import SectionTitle from "./common/SectionTitle";
import { Zap, ArrowRight } from "feather-icons-react";
import BookListItem from "./BookListItem";
import { books } from "@/lib/books";
import { Icon } from "@iconify/react";

const Activity = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="space-y-8"
    >
      <SectionTitle title="Activity" icon={<Icon icon='solar:speaker-minimalistic-line-duotone' className="w-5 h-5" />} />

      {/* Blogs Section */}
      <motion.div variants={itemVariants} className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Writing
        </p>
        <Link
          href="/blogs"
          className="group font-medium flex items-center gap-2 text-lg hover:text-accent transition-colors"
        >
          <span>Check out my blog posts</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Reading Section */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Currently Reading
          </p>
          <Link
            href="/books"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View All
          </Link>
        </div>
        <motion.ul
          variants={containerVariants}
          className="grid grid-cols-2 gap-2"
        >
          {books.slice(0, 3).map((book) => (
            <BookListItem {...book} key={book.slug} />
          ))}
        </motion.ul>
      </motion.div>
    </motion.div>
  );
};

export default Activity;
