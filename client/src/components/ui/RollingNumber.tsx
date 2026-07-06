import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const RollingNumber: React.FC<{ value: number; format?: (v: number) => string; className?: string }> = ({ value, format = (v) => v.toLocaleString(), className }) => {
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  // Read the value on every frame and format it
  const display = useTransform(spring, (current) => format(Math.floor(current)));

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
};
