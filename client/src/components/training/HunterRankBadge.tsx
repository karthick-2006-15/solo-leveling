import React from 'react';

interface HunterRankBadgeProps {
  level: number;
}

export const HunterRankBadge: React.FC<HunterRankBadgeProps> = ({ level }) => {
  const getRankData = (lvl: number) => {
    if (lvl < 10) return { rank: 'E', color: 'text-gray-400', border: 'border-gray-500/50', glow: 'shadow-[0_0_10px_rgba(156,163,175,0.3)]' };
    if (lvl < 25) return { rank: 'D', color: 'text-green-400', border: 'border-green-500/50', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.4)]' };
    if (lvl < 50) return { rank: 'C', color: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]' };
    if (lvl < 75) return { rank: 'B', color: 'text-purple-400', border: 'border-purple-500/50', glow: 'shadow-[0_0_25px_rgba(192,132,252,0.6)]' };
    if (lvl < 95) return { rank: 'A', color: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.7)]' };
    return { rank: 'S', color: 'text-red-500', border: 'border-red-500', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.9)] animate-pulse' };
  };

  const { rank, color, border, glow } = getRankData(level);

  return (
    <div className={`relative flex items-center justify-center w-16 h-16 bg-black/80 rounded-lg border ${border} ${glow} backdrop-blur-md overflow-hidden group`}>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Glitch/Scan line effect */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30 opacity-50 animate-[scan_3s_linear_infinite]" />
      
      <div className="flex flex-col items-center">
        <span className={`font-display font-bold text-3xl ${color} leading-none tracking-tighter drop-shadow-lg`}>
          {rank}
        </span>
        <span className="font-mono text-[8px] text-white/50 uppercase tracking-[0.3em] mt-1">Rank</span>
      </div>
    </div>
  );
};
