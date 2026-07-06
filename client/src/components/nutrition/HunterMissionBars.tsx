import React, { useEffect, useState } from 'react';

interface HunterMissionBarProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  colorHex: string;
}

export const HunterMissionBar: React.FC<HunterMissionBarProps> = ({ label, current, max, unit, colorHex }) => {
  const percentage = Math.min(100, Math.max(0, (current / (max || 1)) * 100));
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    // Smoothly animate the bar on mount/update
    const timeout = setTimeout(() => {
      setAnimatedPct(percentage);
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="relative w-full group mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-500 group-hover:text-cyan-300 transition-colors">
          {label}
        </span>
        <span className="font-mono font-bold text-[12px] uppercase" style={{ color: colorHex }}>
          {current.toFixed(0)} / {max} {unit}
        </span>
      </div>
      
      <div className="h-2 w-full bg-black/60 border border-white/5 rounded-full overflow-hidden relative shadow-inner">
        {/* Glow effect underneath */}
        <div 
          className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
          style={{ width: `${animatedPct}%`, backgroundColor: colorHex, opacity: 0.2, filter: 'blur(4px)' }}
        />
        
        {/* Actual Bar */}
        <div 
          className="h-full relative transition-all duration-1000 ease-out overflow-hidden rounded-full"
          style={{ width: `${animatedPct}%`, backgroundColor: colorHex }}
        >
          {/* Animated shine line inside the bar */}
          <div className="absolute top-0 bottom-0 w-[50px] bg-white/30 skew-x-[-20deg] animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      </div>
      
      {/* Target Percentage Display */}
      <div className="absolute right-0 top-0 text-[8px] font-mono text-white/30 translate-y-[-100%] mr-2 mt-0.5">
        [{animatedPct.toFixed(0)}%]
      </div>
    </div>
  );
};
