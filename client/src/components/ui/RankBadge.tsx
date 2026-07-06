import React from 'react';
import { motion } from 'framer-motion';

export type HunterRank = 'Beginner' | 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank' | 'National' | 'Monarch' | 'Shadow Monarch';

interface RankBadgeProps {
  rank: HunterRank | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md', className = '' }) => {
  let rankAbbr: string;
  let bgColor: string;
  let glowColor: string;
  let needsPulse = false;

  switch (rank) {
    case 'Beginner': rankAbbr = 'BGN'; bgColor = '#4B5563'; glowColor = 'transparent'; break;
    case 'E-Rank': rankAbbr = 'E'; bgColor = '#6B7280'; glowColor = 'rgba(107,114,128,0.5)'; break;
    case 'D-Rank': rankAbbr = 'D'; bgColor = '#3B82F6'; glowColor = 'transparent'; break;
    case 'C-Rank': rankAbbr = 'C'; bgColor = '#10B981'; glowColor = 'transparent'; break;
    case 'B-Rank': rankAbbr = 'B'; bgColor = '#F59E0B'; glowColor = 'transparent'; break;
    case 'A-Rank': rankAbbr = 'A'; bgColor = '#EF4444'; glowColor = 'transparent'; break;
    case 'S-Rank': rankAbbr = 'S'; bgColor = 'var(--color-system-gold)'; glowColor = 'rgba(245,197,24,0.6)'; needsPulse = true; break;
    case 'National': rankAbbr = 'NAT'; bgColor = 'var(--color-system-purple)'; glowColor = 'rgba(124,58,255,0.6)'; needsPulse = true; break;
    case 'Monarch': rankAbbr = 'M'; bgColor = 'var(--color-system-blue)'; glowColor = 'rgba(0,212,255,0.8)'; needsPulse = true; break;
    case 'Shadow Monarch': rankAbbr = 'SM'; bgColor = 'linear-gradient(135deg, var(--color-system-purple) 0%, #000000 100%)'; glowColor = 'rgba(124,58,255,0.8)'; needsPulse = true; break;
    default: rankAbbr = typeof rank === 'string' ? rank.charAt(0).toUpperCase() : 'U'; bgColor = '#4B5563'; glowColor = 'transparent';
  }

  let dimensions = 'w-12 h-[54px]'; // md
  let fontSize = 'text-xl';
  if (size === 'sm') { dimensions = 'w-8 h-[36px]'; fontSize = 'text-xs'; }
  if (size === 'lg') { dimensions = 'w-16 h-[72px]'; fontSize = 'text-3xl'; }
  if (size === 'xl') { dimensions = 'w-24 h-[108px]'; fontSize = 'text-5xl'; }

  const polygonPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

  const content = (
    <div 
      className={`${dimensions} flex items-center justify-center relative z-10`}
      style={{
        clipPath: polygonPath,
        background: rank === 'Shadow Monarch' ? bgColor : undefined,
        backgroundColor: rank !== 'Shadow Monarch' ? bgColor : undefined,
      }}
    >
      <div 
        className="w-[92%] h-[92%] flex items-center justify-center bg-[var(--color-system-darker)]"
        style={{ clipPath: polygonPath }}
      >
        <span 
          className={`font-display font-bold text-white tracking-wider ${fontSize}`} 
          style={{ textShadow: `0 0 10px ${glowColor !== 'transparent' ? glowColor : bgColor}` }}
        >
          {rankAbbr}
        </span>
      </div>
      
      {/* Outer Glow container since drop-shadow on clipPath doesn't work well directly on the element */}
    </div>
  );

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Absolute positioned background glow to simulate box-shadow for clip-path */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: glowColor !== 'transparent' ? glowColor : 'transparent',
          filter: 'blur(10px)',
          transform: 'scale(0.8)'
        }}
      />
      
      {needsPulse ? (
        <motion.div
          animate={{ filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {content}
        </motion.div>
      ) : content}
    </div>
  );
};
