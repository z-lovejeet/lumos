'use client';

import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations/variants';

export function StaggerContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
