import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { hoverCardVariants } from '@/lib/animation';

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

const AnimatedCard = ({
  children,
  className,
  hoverEffect = true,
  ...props
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial="rest"
      whileHover={hoverEffect ? "hover" : "rest"}
      variants={hoverCardVariants}
      className="h-full"
    >
      <Card
        className={cn("h-full", className)}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;