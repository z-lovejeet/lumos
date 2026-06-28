export const springBouncy = {
  type: "spring" as const,
  stiffness: 400,
  damping: 10,
};

export const springSmooth = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: springSmooth },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springSmooth },
};
