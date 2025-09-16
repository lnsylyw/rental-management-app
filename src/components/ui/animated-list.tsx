import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { listItemVariants } from '@/lib/animation';

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
}

const AnimatedList = ({
  children,
  className,
  itemClassName,
  staggerDelay = 0.05,
}: AnimatedListProps) => {
  return (
    <ul className={cn('space-y-2', className)}>
      <AnimatePresence>
        {React.Children.map(children, (child, i) => (
          <motion.li
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={listItemVariants}
            transition={{
              delay: i * staggerDelay,
            }}
            className={cn(itemClassName)}
          >
            {child}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};

export default AnimatedList;