// 动画持续时间和缓动函数
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

// Framer Motion 支持的缓动函数
export const easings = {
  easeInOut: "easeInOut",
  easeOut: "easeOut",
  easeIn: "easeIn",
  linear: "linear",
};

// 常用动画变体
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeOut 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

export const slideInFromRightVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeOut 
    }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

export const slideInFromLeftVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeOut 
    }
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

export const slideInFromTopVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeOut 
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

export const slideInFromBottomVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeOut 
    }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

export const scaleVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeOut 
    }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

// 列表项动画（带有交错效果）
export const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: i * 0.05,
      duration: durations.normal / 1000,
      ease: easings.easeOut 
    }
  }),
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

// 页面切换动画
export const pageTransitionVariants = {
  initial: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { 
      duration: durations.slow / 1000,
      ease: easings.easeOut,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: durations.normal / 1000,
      ease: easings.easeIn 
    }
  }
};

// 卡片悬停动画
export const hoverCardVariants = {
  rest: { 
    scale: 1,
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    transition: {
      duration: durations.fast / 1000,
      ease: easings.easeInOut
    }
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
    transition: {
      duration: durations.fast / 1000,
      ease: easings.easeInOut
    }
  }
};

// 按钮点击动画
export const buttonTapVariants = {
  rest: { scale: 1 },
  tap: { scale: 0.95 }
};

// 加载动画
export const loadingVariants = {
  start: { 
    opacity: 1,
    rotate: 0 
  },
  end: { 
    opacity: 1,
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity
    }
  }
};

// 脉冲动画
export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};