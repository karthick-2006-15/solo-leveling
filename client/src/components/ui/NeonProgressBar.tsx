import React from 'react';
import { motion } from 'framer-motion';

interface NeonProgressBarProps {
  progress: number; // 0 to 100
  color?: 'blue' | 'purple';
  height?: string;
  className?: string;
}

export const NeonProgressBar: React.FC<NeonProgressBarProps> = ({
  progress,
  color = 'blue',
  height = 'h-3',
  className = ''
}) => {
  const isBlue = color === 'blue';
  
  return (
    <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height} ${className}`}>
      <motion.div
        className={`h-full rounded-full ${isBlue ? 'bg-neonBlue box-glow-blue' : 'bg-neonPurple box-glow-purple'}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
};
