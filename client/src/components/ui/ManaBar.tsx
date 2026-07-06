import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ManaBarProps {
  value: number;
  variant?: 'blue' | 'purple' | 'gold' | 'red' | 'green';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  rightLabel?: React.ReactNode;
  animated?: boolean;
  className?: string;
}

export const ManaBar: React.FC<ManaBarProps> = ({
  value,
  variant = 'blue',
  size = 'md',
  label,
  rightLabel,
  animated = true,
  className
}) => {
  const safeValue = Math.min(Math.max(value, 0), 100);

  let fillGradient = 'linear-gradient(90deg, #00A6CC 0%, #00E5FF 60%, #FFFFFF 100%)';
  let glowColor = 'var(--color-system-blue)';
  let trackBorder = 'border-[rgba(0,229,255,0.2)]';
  let textColor = 'text-[var(--color-system-blue)]';

  if (variant === 'purple') {
    fillGradient = 'linear-gradient(90deg, #7B2CBF 0%, #9D4EDD 60%, #E0AAFF 100%)';
    glowColor = 'var(--color-system-purple)';
    trackBorder = 'border-[rgba(157,78,221,0.2)]';
    textColor = 'text-[var(--color-system-purple)]';
  } else if (variant === 'gold') {
    fillGradient = 'linear-gradient(90deg, #FFB703 0%, #FFD166 60%, #FFF3B0 100%)';
    glowColor = 'var(--color-system-gold)';
    trackBorder = 'border-[rgba(255,183,3,0.2)]';
    textColor = 'text-[var(--color-system-gold)]';
  } else if (variant === 'red') {
    fillGradient = 'linear-gradient(90deg, #C9184A 0%, #FF0054 60%, #FF758F 100%)';
    glowColor = 'var(--color-system-red)';
    trackBorder = 'border-[rgba(255,0,84,0.2)]';
    textColor = 'text-[var(--color-system-red)]';
  } else if (variant === 'green') {
    fillGradient = 'linear-gradient(90deg, #00B4D8 0%, #00F5D4 60%, #90E0EF 100%)';
    glowColor = 'var(--color-system-green)';
    trackBorder = 'border-[rgba(0,245,212,0.2)]';
    textColor = 'text-[var(--color-system-green)]';
  }

  let heightClass = 'h-2';
  if (size === 'sm') heightClass = 'h-1.5';
  if (size === 'lg') heightClass = 'h-3';

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {(label || rightLabel) && (
        <div className="flex justify-between items-end">
          {label && (
            <span className={cn("font-display text-[10px] uppercase tracking-[0.15em] font-bold text-shadow-glow", textColor)}>
              {label}
            </span>
          )}
          {rightLabel && (
            <span className={cn("font-mono text-[11px] font-bold", textColor)} style={{ textShadow: `0 0 5px ${glowColor}` }}>
              {rightLabel}
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-[var(--color-system-dark)] border ${trackBorder} clip-edges ${heightClass} relative overflow-hidden`}>
        <motion.div
          className="h-full relative clip-edges"
          style={{ background: fillGradient, boxShadow: `0 0 10px ${glowColor}` }}
          initial={animated ? { width: '0%' } : { width: `${safeValue}%` }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
        >
          {/* Shimmer Overlay */}
          <div 
            className="absolute inset-0 opacity-50 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.8)_50%,transparent_100%)] w-[200%]"
            style={{ animation: 'shimmer 1.5s infinite linear' }} 
          />
          
          {/* Glow End Node */}
          {safeValue > 0 && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-90"
              style={{ boxShadow: `0 0 8px #fff, 0 0 12px ${glowColor}` }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};
