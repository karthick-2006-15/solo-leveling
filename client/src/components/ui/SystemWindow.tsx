import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface SystemWindowProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  variant?: 'default' | 'purple' | 'gold' | 'boss';
  title?: ReactNode;
  innerClassName?: string;
  headerAction?: ReactNode;
}

export const SystemWindow: React.FC<SystemWindowProps> = ({
  children,
  className,
  innerClassName = 'p-6',
  hoverEffect = false,
  variant = 'default',
  title,
  headerAction,
  ...props
}) => {
  const baseClasses = "relative hud-glass clip-edges overflow-hidden group";
  
  const variants = {
    default: "border-[rgba(0,229,255,0.2)] bg-[rgba(10,15,26,0.6)]",
    gold: "border-[rgba(255,183,3,0.3)] shadow-gold bg-[rgba(15,10,0,0.6)]",
    boss: "border-[rgba(255,0,84,0.3)] shadow-boss bg-[rgba(20,5,5,0.6)]",
    purple: "border-[rgba(157,78,221,0.3)] shadow-purple bg-[rgba(15,5,25,0.6)]"
  };

  const hoverVariants = {
    default: "hover:border-[var(--color-system-blue)] hover:shadow-glow-blue",
    gold: "hover:border-[var(--color-system-gold)] hover:shadow-glow-gold",
    boss: "hover:border-[var(--color-system-red)] hover:shadow-glow-red",
    purple: "hover:border-[var(--color-system-purple)] hover:shadow-[0_0_12px_rgba(157,78,221,0.9)]"
  };

  const borderColors = {
    default: "border-[var(--color-system-blue)]",
    gold: "border-[var(--color-system-gold)]",
    boss: "border-[var(--color-system-red)]",
    purple: "border-[var(--color-system-purple)]"
  };

  const textColors = {
    default: "text-[var(--color-system-blue)]",
    gold: "text-[var(--color-system-gold)]",
    boss: "text-[var(--color-system-red)]",
    purple: "text-[var(--color-system-purple)]"
  };

  const headerBgs = {
    default: "bg-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.2)]",
    gold: "bg-[rgba(255,183,3,0.08)] border-[rgba(255,183,3,0.2)]",
    boss: "bg-[rgba(255,0,84,0.08)] border-[rgba(255,0,84,0.2)]",
    purple: "bg-[rgba(157,78,221,0.08)] border-[rgba(157,78,221,0.2)]"
  };

  return (
    <motion.div
      className={cn(
        baseClasses,
        variants[variant],
        hoverEffect && hoverVariants[variant],
        "transition-all duration-300 flex flex-col",
        className
      )}
      whileHover={hoverEffect ? { y: -2, scale: 1.01 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${borderColors[variant]} opacity-70 z-10 pointer-events-none`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${borderColors[variant]} opacity-70 z-10 pointer-events-none`} />
      
      {/* Animated scanline effect on hover */}
      {hoverEffect && (
        <div className={`absolute inset-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-system-blue)] to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-scan-vertical pointer-events-none z-0`} />
      )}
      
      {title && (
        <div className={`relative z-10 px-4 py-2 border-b ${headerBgs[variant]} flex justify-between items-center backdrop-blur-sm`}>
          <h3 className={`font-display font-bold uppercase tracking-widest text-sm ${textColors[variant]} text-shadow-glow`}>
            {title}
          </h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Hex Background pattern */}
      <div className="absolute inset-0 hex-bg pointer-events-none opacity-50 mix-blend-overlay z-0" />

      <div className={`relative z-10 ${innerClassName}`}>
        {children as ReactNode}
      </div>
    </motion.div>
  );
};
