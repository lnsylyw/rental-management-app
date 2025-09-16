import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as animations from '@/lib/animation';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: keyof typeof animations | Variants;
  className?: string;
  delay?: number;
  duration?: number;
  custom?: any;
  isVisible?: boolean;
}

const AnimatedContainer = ({
  children,
  animation = 'fadeInVariants',
  className,
  delay = 0,
  duration,
  custom,
  isVisible = true,
}: AnimatedContainerProps) => {
  // 获取动画变体
  const getVariants = (): Variants => {
    if (typeof animation === 'string') {
      const selectedAnimation = animations[animation as keyof typeof animations];
      // 确保返回的是有效的Variants对象
      if (selectedAnimation && 
          typeof selectedAnimation === 'object' && 
          ('hidden' in selectedAnimation || 'visible' in selectedAnimation)) {
        return selectedAnimation as Variants;
      }
      // 默认返回fadeInVariants
      return animations.fadeInVariants as Variants;
    }
    return animation as Variants;
  };

  const variants = getVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          custom={custom}
          className={cn(className)}
          transition={{
            delay,
            duration: duration ? duration / 1000 : undefined,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedContainer;