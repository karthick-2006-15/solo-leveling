import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface HUDCardProps extends Omit<HTMLMotionProps<"div">, 'title'> {
  variant?: 'default' | 'gold' | 'danger' | 'success' | 'cyber';
  animated?: boolean;
  glowOnHover?: boolean;
  hexBg?: boolean;
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
  innerClassName?: string;
}

export const HUDCard: React.FC<HUDCardProps> = ({
  children,
  className,
  variant = 'default',
  animated = true,
  glowOnHover = true,
  hexBg = false,
  title,
  headerAction,
  innerClassName,
  ...props
}) => {
  const baseClasses = "relative hud-glass clip-edges overflow-hidden group";
  
  const variants = {
    default: "border-[rgba(0,229,255,0.2)]",
    gold: "border-[rgba(255,183,3,0.3)] shadow-gold",
    danger: "border-[rgba(255,0,84,0.3)] shadow-boss",
    success: "border-[rgba(0,245,212,0.3)]",
    cyber: "border-[rgba(157,78,221,0.3)] shadow-purple"
  };

  const hoverVariants = {
    default: "hover:border-[var(--color-system-blue)] hover:shadow-glow-blue",
    gold: "hover:border-[var(--color-system-gold)] hover:shadow-glow-gold",
    danger: "hover:border-[var(--color-system-red)] hover:shadow-glow-red",
    success: "hover:border-[var(--color-system-green)]",
    cyber: "hover:border-[var(--color-system-purple)]"
  };

  const Component = animated ? motion.div : 'div';

  return (
    // @ts-expect-error Framer motion conflict
    <Component
      className={cn(
        baseClasses,
        variants[variant],
        glowOnHover && hoverVariants[variant],
        hexBg && "hex-bg",
        "transition-all duration-300",
        className
      )}
      initial={animated ? { opacity: 0, y: 15 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      whileHover={animated && glowOnHover ? { y: -2 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${variant === 'gold' ? 'border-[var(--color-system-gold)]' : 'border-[var(--color-system-blue)]'} opacity-50 z-10`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${variant === 'gold' ? 'border-[var(--color-system-gold)]' : 'border-[var(--color-system-blue)]'} opacity-50 z-10`} />
      
      {/* Animated scanline effect on hover */}
      {glowOnHover && (
        <div className="absolute inset-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-system-blue)] to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-scan-vertical pointer-events-none z-0" />
      )}
      
      {title && (
        <div className={`relative z-10 px-4 py-2 border-b ${variant === 'gold' ? 'border-[rgba(255,183,3,0.2)] bg-[rgba(255,183,3,0.05)]' : 'border-[rgba(0,229,255,0.2)] bg-[rgba(0,229,255,0.05)]'} flex justify-between items-center`}>
          <h3 className={`font-display font-bold uppercase tracking-widest text-sm ${variant === 'gold' ? 'text-[var(--color-system-gold)]' : 'text-[var(--color-system-blue)]'}`}>
            {title}
          </h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={cn("relative z-10 p-4", innerClassName)}>
        {children as React.ReactNode}
      </div>
    </Component>
  );
};
