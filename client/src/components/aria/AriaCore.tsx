import React from 'react';

export interface AriaCoreProps {
  size?: number;
  animate?: boolean;
  state?: 'normal' | 'alert' | 'warning' | 'critical' | 'emergency' | 'monarch';
  className?: string;
}

export const AriaCore: React.FC<AriaCoreProps> = ({ 
  size = 120, 
  animate = true, 
  state = 'normal',
  className = ''
}) => {
  // Determine color theme based on system states
  const colors = {
    normal: { glow: 'rgba(0, 229, 255, 0.4)', core: '#00E5FF', ring: 'rgba(0, 229, 255, 0.15)' },
    alert: { glow: 'rgba(255, 183, 3, 0.4)', core: '#FFB703', ring: 'rgba(255, 183, 3, 0.15)' },
    warning: { glow: 'rgba(255, 122, 0, 0.4)', core: '#FF7A00', ring: 'rgba(255, 122, 0, 0.15)' },
    critical: { glow: 'rgba(255, 0, 84, 0.4)', core: '#FF0054', ring: 'rgba(255, 0, 84, 0.15)' },
    emergency: { glow: 'rgba(239, 68, 68, 0.5)', core: '#EF4444', ring: 'rgba(239, 68, 68, 0.15)' },
    monarch: { glow: 'rgba(157, 78, 221, 0.5)', core: '#9D4EDE', ring: 'rgba(157, 78, 221, 0.15)' }
  }[state || 'normal'];

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer group ${className} ${animate ? 'animate-[float_6s_ease-in-out_infinite]' : ''}`} 
      style={{ width: size, height: size }}
    >
      {/* Background breathing glow pulse */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-300"
        style={{ backgroundColor: colors.glow }}
      />
      
      {/* Rotating orbit particles */}
      <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/10 animate-[spin_30s_linear_infinite]" />

      <svg width={size} height={size} viewBox="0 0 100 100" className="relative z-10 select-none pointer-events-none transition-transform duration-300 group-hover:scale-105">
        {/* Outer Hexagon with Neon Outline */}
        <polygon 
          points="50,4 90,27 90,73 50,96 10,73 10,27" 
          fill="rgba(15, 23, 42, 0.9)" 
          stroke={colors.core} 
          strokeWidth="2" 
          style={{ filter: `drop-shadow(0 0 8px ${colors.core})` }}
        />
        
        {/* Inner Hexagon border */}
        <polygon 
          points="50,8 86,29 86,71 50,92 14,71 14,29" 
          fill="none" 
          stroke={colors.ring} 
          strokeWidth="1" 
          strokeDasharray="4 4"
        />

        {/* Iggris Knight Helm Plume (Crimson sweep behind/top) */}
        <path 
          d="M 50 15 Q 38 2 25 15 Q 40 10 50 25" 
          fill="#880808" 
          opacity="0.9"
          style={{ filter: `drop-shadow(0 0 4px #FF0054)` }}
        />

        {/* Knight Helmet Faceplate (Dark Metallic) */}
        <path 
          d="M 50 22 L 75 35 L 68 50 L 50 42 L 32 50 L 25 35 Z" 
          fill="url(#metallicGradient)" 
          stroke="#334155" 
          strokeWidth="1" 
        />
        
        {/* Visor slit / Eyes container (Darkest gap) */}
        <path 
          d="M 30 46 L 70 46 L 66 54 L 50 50 L 34 54 Z" 
          fill="#020617" 
        />

        {/* Glowing Cyan Eyes */}
        {/* Left eye */}
        <polygon 
          points="36,49 44,49 42,51 35,51" 
          fill="#00E5FF" 
          style={{ filter: 'drop-shadow(0 0 5px #00E5FF)' }}
        />
        {/* Right eye */}
        <polygon 
          points="56,51 64,51 65,49 58,49" 
          fill="#00E5FF" 
          style={{ filter: 'drop-shadow(0 0 5px #00E5FF)' }}
        />

        {/* Helmet chin/jaw guard (Metallic structure) */}
        <path 
          d="M 32 50 L 50 42 L 68 50 L 68 65 L 50 82 L 32 65 Z" 
          fill="url(#metallicGradientLight)" 
          opacity="0.85"
          stroke="#475569" 
          strokeWidth="1" 
        />
        
        {/* Jaw details/mouth guard lines */}
        <line x1="50" y1="58" x2="50" y2="78" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="44" y1="62" x2="44" y2="72" stroke="#1E293B" strokeWidth="1" />
        <line x1="56" y1="62" x2="56" y2="72" stroke="#1E293B" strokeWidth="1" />

        {/* Outer scanning lines or markers */}
        <circle cx="50" cy="50" r="44" fill="none" stroke={colors.ring} strokeWidth="1" strokeDasharray="1 12" />

        {/* Gradients */}
        <defs>
          <linearGradient id="metallicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="metallicGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
};
export default AriaCore;
