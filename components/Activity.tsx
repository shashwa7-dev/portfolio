"use client";
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/lib/motionVariants";
import BookListItem from "./BookListItem";
import { books } from "@/lib/books";
import { ArrowRight } from "feather-icons-react";
import Section from "@/components/layout/Section";

const Activity = () => {
  return (
    <Section id="activity" label="Now" width="reading">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Writing card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
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

        {/* Reading card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
              Currently Reading
            </p>
            <Link
              href="/books"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
            </Link>
          </div>
          <motion.ul variants={containerVariants} className="grid gap-2">
            {books.slice(0, 3).map((book) => (
              <BookListItem {...book} key={book.slug} />
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </Section>
  );
};

export default Activity;
