import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface PrimaryButtonProps extends Omit<HTMLMotionProps<'button'>, 'className'> {
  children: React.ReactNode;
  variant?: 'primary' | 'purple' | 'ghost' | 'danger';
  fullWidth?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  let baseStyle = 'relative flex items-center justify-center font-display uppercase tracking-[0.1em] font-bold text-[14px] rounded-[3px] transition-colors border-0 overflow-hidden ';
  let bgStyle = '';
  let textStyle = '';
  let shadowColor = '';

  if (variant === 'primary') {
    bgStyle = 'bg-[linear-gradient(135deg,#0099BB,#00D4FF)]';
    textStyle = 'text-black';
    shadowColor = 'rgba(0,212,255,0.5)';
  } else if (variant === 'purple') {
    bgStyle = 'bg-[linear-gradient(135deg,#5B21B6,#7C3AFF)]';
    textStyle = 'text-white';
    shadowColor = 'rgba(124,58,255,0.5)';
  } else if (variant === 'danger') {
    bgStyle = 'bg-[linear-gradient(135deg,#991B1B,#FF3366)]';
    textStyle = 'text-white';
    shadowColor = 'rgba(255,51,102,0.5)';
  } else if (variant === 'ghost') {
    bgStyle = 'bg-transparent border border-[var(--color-system-border)]';
    textStyle = 'text-[var(--color-system-blue)]';
    shadowColor = 'rgba(0,212,255,0.3)';
    baseStyle = baseStyle.replace('border-0', ''); // Remove border-0 for ghost
  }

  return (
    <motion.button
      className={`${baseStyle} ${bgStyle} ${textStyle} ${fullWidth ? 'w-full' : 'px-8'} py-3 ${disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      whileHover={!disabled ? { 
        filter: variant !== 'ghost' ? 'brightness(1.15)' : 'brightness(1)',
        backgroundColor: variant === 'ghost' ? 'rgba(0,212,255,0.08)' : undefined,
        boxShadow: `0 0 20px ${shadowColor}`
      } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">{children}</span>
      {/* Tap Flash Overlay */}
      <motion.div 
        className="absolute inset-0 bg-white opacity-0"
        whileTap={{ opacity: 0.3 }}
        transition={{ duration: 0.1 }}
      />
    </motion.button>
  );
};
