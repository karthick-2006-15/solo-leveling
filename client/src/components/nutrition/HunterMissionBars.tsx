import React, { useEffect, useState } from 'react';

interface HunterMissionRingProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  colorHex: string;
  size?: number;
  strokeWidth?: number;
}

export const HunterMissionRing: React.FC<HunterMissionRingProps> = ({ 
  label, 
  current, 
  max, 
  unit, 
  colorHex,
  size = 120,
  strokeWidth = 8
}) => {
  const percentage = Math.min(100, Math.max(0, (current / (max || 1)) * 100));
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedPct(percentage);
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative group p-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Track */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Glow underlying */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out opacity-20"
            style={{ filter: 'blur(4px)' }}
          />
          {/* Main Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display font-bold text-white tracking-wide" style={{ fontSize: size * 0.18 }}>
            {current.toFixed(0)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-600/80 -mt-1">
            / {max} {unit}
          </span>
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-3 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
          {label}
        </span>
      </div>
    </div>
  );
};
