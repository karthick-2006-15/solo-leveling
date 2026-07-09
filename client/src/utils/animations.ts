import type { Variants } from 'framer-motion';

// Common variants for Framer Motion to reduce duplication and bundle size

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemFadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const scaleUpVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
  tap: { scale: 0.95 }
};

export const pulseGlowVariants: Variants = {
  initial: { boxShadow: "0px 0px 0px rgba(0, 212, 255, 0)" },
  animate: { 
    boxShadow: ["0px 0px 0px rgba(0, 212, 255, 0)", "0px 0px 20px rgba(0, 212, 255, 0.4)", "0px 0px 0px rgba(0, 212, 255, 0)"],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

export const systemAlertVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: -50 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.5 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};
