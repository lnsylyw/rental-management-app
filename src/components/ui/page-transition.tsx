import React from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import { durations } from '@/lib/animation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition = ({
  children,
  className,
}: PageTransitionProps) => {
  const variants: Variants = {
    initial: { opacity: 0 },
    enter: { 
      opacity: 1,
      transition: { 
        duration: durations.slow / 1000,
        ease: [0.0, 0.0, 0.2, 1], // easeOut
        when: "beforeChildren",
        staggerChildren: 0.1
      } as Transition
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: durations.normal / 1000,
        ease: [0.4, 0.0, 1, 1] // easeIn
      } as Transition
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
