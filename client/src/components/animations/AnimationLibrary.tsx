import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';

// --- WRAPPER COMPONENTS --- //

export const Fade: React.FC<HTMLMotionProps<"div"> & { delay?: number; duration?: number }> = ({ children, delay = 0, duration = 0.3, ...props }) => {
  const { reducedMotion } = useSettings();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay, duration: reducedMotion ? 0 : duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Slide: React.FC<HTMLMotionProps<"div"> & { direction?: 'up' | 'down' | 'left' | 'right', distance?: number, delay?: number }> = ({ children, direction = 'up', distance = 20, delay = 0, ...props }) => {
  const { reducedMotion } = useSettings();
  
  const initial = { 
    opacity: 0, 
    x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
    y: direction === 'up' ? distance : direction === 'down' ? -distance : 0 
  };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={initial}
      transition={{ delay, duration: reducedMotion ? 0 : 0.4, type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Scale: React.FC<HTMLMotionProps<"div"> & { delay?: number }> = ({ children, delay = 0, ...props }) => {
  const { reducedMotion } = useSettings();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay, duration: reducedMotion ? 0 : 0.3, type: 'spring' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Floating: React.FC<HTMLMotionProps<"div"> & { yOffset?: number, duration?: number }> = ({ children, yOffset = 10, duration = 3, ...props }) => {
  const { reducedMotion } = useSettings();
  
  if (reducedMotion) return <motion.div {...props}>{children}</motion.div>;
  
  return (
    <motion.div
      animate={{ y: [0, -yOffset, 0] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Pulse: React.FC<HTMLMotionProps<"div"> & { scaleOffset?: number, duration?: number }> = ({ children, scaleOffset = 1.05, duration = 2, ...props }) => {
  const { reducedMotion } = useSettings();
  
  if (reducedMotion) return <motion.div {...props}>{children}</motion.div>;
  
  return (
    <motion.div
      animate={{ scale: [1, scaleOffset, 1] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Glow: React.FC<HTMLMotionProps<"div"> & { color?: string, duration?: number }> = ({ children, color = 'rgba(0, 212, 255, 0.5)', duration = 2, ...props }) => {
  const { reducedMotion } = useSettings();
  
  if (reducedMotion) return <motion.div {...props}>{children}</motion.div>;
  
  return (
    <motion.div
      animate={{ boxShadow: [`0 0 0px ${color}`, `0 0 15px ${color}`, `0 0 0px ${color}`] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Shake: React.FC<HTMLMotionProps<"div"> & { trigger: number }> = ({ children, trigger, ...props }) => {
  const { reducedMotion } = useSettings();
  
  if (reducedMotion) return <motion.div {...props}>{children}</motion.div>;
  
  return (
    <motion.div
      key={trigger}
      animate={{ x: [0, -10, 10, -10, 10, 0] }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
