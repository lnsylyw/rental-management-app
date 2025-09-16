import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buttonTapVariants } from '@/lib/animation';

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

const AnimatedButton = ({
  children,
  className,
  ...props
}: AnimatedButtonProps) => {
  return (
    <motion.div
      whileTap="tap"
      variants={buttonTapVariants}
    >
      <Button
        className={cn(className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;