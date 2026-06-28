'use client';

import { motion } from 'framer-motion';
import { staggerItemVariants } from '@/lib/animations/variants';

export function AnimatedCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div 
      variants={staggerItemVariants}
      className={className}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring" as any, stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
