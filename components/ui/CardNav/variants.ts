import { Variants } from "framer-motion";

export const containerVariants: Variants = {
  closed: {
    height: 60,
    transition: {
      type: "tween",
      duration: 0.4,
    },
  },
  open: {
    height: "auto",
    transition: {
      type: "tween",
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.25 },
  },
};

export const hamburgerVariants: Variants = {
  closedTop: { rotate: 0, y: 0, transition: { duration: 0.3 } },
  openTop: { rotate: 45, y: 4, transition: { duration: 0.3 } },

  closedBottom: { rotate: 0, y: 0, transition: { duration: 0.3 } },
  openBottom: { rotate: -45, y: -4, transition: { duration: 0.3 } },
};
