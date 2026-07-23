import { Variants } from "motion/react";
import { ease, duration, stagger } from "@/lib/motionVariants";

export const containerVariants: Variants = {
  closed: {
    height: 60,
    transition: {
      type: "tween",
      duration: duration.slow,
    },
  },
  open: {
    height: "auto",
    transition: {
      type: "tween",
      duration: duration.slow,
      when: "beforeChildren",
      staggerChildren: stagger.loose,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * stagger.loose,
      duration: duration.slow,
      ease: ease.out,
    },
  }),
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: duration.base },
  },
};

export const hamburgerVariants: Variants = {
  closedTop: { rotate: 0, y: 0, transition: { duration: duration.med } },
  openTop: { rotate: 45, y: 4, transition: { duration: duration.med } },

  closedBottom: { rotate: 0, y: 0, transition: { duration: duration.med } },
  openBottom: { rotate: -45, y: -4, transition: { duration: duration.med } },
};
