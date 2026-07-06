import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(
        "relative hud-glass border-[rgba(0,229,255,0.15)] rounded-lg p-6 overflow-hidden",
        hoverEffect && "hover:border-[var(--color-system-blue)] hover:shadow-glow-blue transition-all duration-300 group",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hoverEffect ? { y: -2 } : undefined}
      {...props}
    >
      {/* Animated scanline effect on hover */}
      {hoverEffect && (
        <div className="absolute inset-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-system-blue)] to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-scan-vertical pointer-events-none z-0" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
