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
    bgStyle = 'bg-gradient-to-r from-cyan-600 to-cyan-400';
    textStyle = 'text-black';
    shadowColor = 'rgba(0,255,255,0.6)';
  } else if (variant === 'purple') {
    bgStyle = 'bg-gradient-to-r from-purple-800 to-purple-500';
    textStyle = 'text-white';
    shadowColor = 'rgba(157,78,221,0.6)';
  } else if (variant === 'danger') {
    bgStyle = 'bg-gradient-to-r from-red-800 to-red-500';
    textStyle = 'text-white';
    shadowColor = 'rgba(255,0,84,0.6)';
  } else if (variant === 'ghost') {
    bgStyle = 'bg-black/50 border border-cyan-400/50 backdrop-blur-sm';
    textStyle = 'text-cyan-400';
    shadowColor = 'rgba(0,255,255,0.4)';
    baseStyle = baseStyle.replace('border-0', '');
  }

  return (
    <motion.button
      className={`${baseStyle} ${bgStyle} ${textStyle} ${fullWidth ? 'w-full' : 'px-8'} py-3 ${disabled ? 'opacity-35 cursor-not-allowed grayscale' : 'cursor-pointer'} ${className} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
      whileHover={!disabled ? { 
        filter: variant !== 'ghost' ? 'brightness(1.15)' : 'brightness(1)',
        backgroundColor: variant === 'ghost' ? 'rgba(0,212,255,0.08)' : undefined,
        boxShadow: `0 0 20px ${shadowColor}`
      } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 drop-shadow-sm font-bold tracking-[0.2em]">{children}</span>
      {/* Tap Flash Overlay */}
      <motion.div 
        className="absolute inset-0 bg-white opacity-0"
        whileTap={{ opacity: 0.3 }}
        transition={{ duration: 0.1 }}
      />
      {/* Scanline hover effect */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
    </motion.button>
  );
};
