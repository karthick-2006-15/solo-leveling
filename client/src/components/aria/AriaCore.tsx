import React from 'react';

export interface AriaCoreProps {
  size?: number;
  animate?: boolean;
  state?: 'normal' | 'alert' | 'warning' | 'critical' | 'emergency' | 'monarch';
  className?: string;
  isHovered?: boolean;
}

export const AriaCore: React.FC<AriaCoreProps> = ({ 
  size = 120, 
  animate = true, 
  state = 'normal',
  className = '',
  isHovered = false
}) => {
  // Determine color theme based on system states
  const colors = {
    normal: { glow: 'rgba(0, 229, 255, 0.4)', core: '#00E5FF', ring: 'rgba(0, 229, 255, 0.15)', particle: '#00E5FF' },
    alert: { glow: 'rgba(255, 183, 3, 0.4)', core: '#FFB703', ring: 'rgba(255, 183, 3, 0.15)', particle: '#FFB703' },
    warning: { glow: 'rgba(255, 122, 0, 0.4)', core: '#FF7A00', ring: 'rgba(255, 122, 0, 0.15)', particle: '#FF7A00' },
    critical: { glow: 'rgba(255, 0, 84, 0.4)', core: '#FF0054', ring: 'rgba(255, 0, 84, 0.15)', particle: '#FF0054' },
    emergency: { glow: 'rgba(239, 68, 68, 0.5)', core: '#EF4444', ring: 'rgba(239, 68, 68, 0.15)', particle: '#EF4444' },
    monarch: { glow: 'rgba(157, 78, 221, 0.5)', core: '#9D4EDE', ring: 'rgba(157, 78, 221, 0.15)', particle: '#9D4EDE' }
  }[state || 'normal'];

  const floatAnimation = animate ? 'animate-[coreFloat_4s_ease-in-out_infinite]' : '';
  const pulseAnimation = animate ? 'animate-[corePulse_3s_ease-in-out_infinite]' : '';

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer group ${className} ${floatAnimation}`} 
      style={{ width: size, height: size }}
    >
      {/* Background breathing glow pulse */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-500 ease-out"
        style={{ 
          backgroundColor: colors.glow,
          opacity: isHovered ? 0.8 : 0.4,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)'
        }}
      />
      
      <svg width={size} height={size} viewBox="0 0 100 100" className="relative z-10 select-none pointer-events-none transition-transform duration-300">
        <defs>
          <linearGradient id="metallicCoreGradient" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="metallicRingGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="energyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.core} stopOpacity="1" />
            <stop offset="50%" stopColor={colors.core} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.core} stopOpacity="0" />
          </radialGradient>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Holographic Rotating Ring (Rune geometry) */}
        <g 
          style={{ transformOrigin: '50px 50px' }} 
          className={`transition-all duration-700 origin-center ${animate ? (isHovered ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_12s_linear_infinite]') : ''}`}
        >
          {/* Faint dotted orbit path */}
          <circle cx="50" cy="50" r="46" fill="none" stroke={colors.ring} strokeWidth="0.5" strokeDasharray="2 6" />
          {/* Segmented thicker energy arcs */}
          <circle cx="50" cy="50" r="42" fill="none" stroke={colors.core} strokeWidth="1.5" strokeDasharray="30 15 5 15" opacity="0.6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={colors.core} strokeWidth="3" strokeDasharray="2 80" filter="url(#neonGlow)" opacity="0.8" />
          
          {/* Ancient Runes / Geometric accents */}
          <polygon points="50,4 54,12 46,12" fill={colors.core} opacity="0.8" filter="url(#neonGlow)" />
          <polygon points="50,96 54,88 46,88" fill={colors.core} opacity="0.8" filter="url(#neonGlow)" />
          <polygon points="4,50 12,46 12,54" fill={colors.core} opacity="0.8" filter="url(#neonGlow)" />
          <polygon points="96,50 88,46 88,54" fill={colors.core} opacity="0.8" filter="url(#neonGlow)" />
        </g>

        {/* Inner Counter-Rotating Ring */}
        <g 
          style={{ transformOrigin: '50px 50px' }}
          className={`origin-center ${animate ? (isHovered ? 'animate-[spin_6s_linear_infinite_reverse]' : 'animate-[spin_20s_linear_infinite_reverse]') : ''}`}
        >
          <circle cx="50" cy="50" r="36" fill="none" stroke={colors.ring} strokeWidth="1" strokeDasharray="1 8" />
          <circle cx="50" cy="50" r="32" fill="none" stroke={colors.core} strokeWidth="0.5" opacity="0.4" />
          
          {/* Inner rune accents */}
          <circle cx="25" cy="25" r="1.5" fill={colors.core} filter="url(#neonGlow)" />
          <circle cx="75" cy="75" r="1.5" fill={colors.core} filter="url(#neonGlow)" />
          <circle cx="25" cy="75" r="1.5" fill={colors.core} filter="url(#neonGlow)" />
          <circle cx="75" cy="25" r="1.5" fill={colors.core} filter="url(#neonGlow)" />
        </g>

        {/* Core Base (Dark Metallic octagon/gem) */}
        <polygon 
          points="50,22 70,30 78,50 70,70 50,78 30,70 22,50 30,30" 
          fill="url(#metallicCoreGradient)" 
          stroke="url(#metallicRingGradient)" 
          strokeWidth="1.5"
        />

        {/* Core energy casing lines */}
        <line x1="22" y1="50" x2="78" y2="50" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
        <line x1="50" y1="22" x2="50" y2="78" stroke="#1E293B" strokeWidth="1" opacity="0.6" />

        {/* The Magical System Energy Core */}
        <g className={pulseAnimation}>
          {/* Deep Glow */}
          <circle cx="50" cy="50" r="16" fill="url(#energyGlow)" opacity="0.8" />
          {/* Bright Core Center */}
          <circle cx="50" cy="50" r="8" fill="#ffffff" filter="url(#neonGlow)" opacity="0.9" />
          {/* Core Energy Aura */}
          <circle cx="50" cy="50" r="18" fill="none" stroke={colors.core} strokeWidth="2" filter="url(#neonGlow)" opacity="0.7" />
          
          {/* System Core Diamond Motif */}
          <polygon points="50,38 56,50 50,62 44,50" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" filter="url(#neonGlow)" />
        </g>

        {/* Hover Particle Burst (Visible when hovered) */}
        <g className={`transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <circle cx="50" cy="18" r="1" fill={colors.core} filter="url(#neonGlow)" className="animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <circle cx="82" cy="50" r="1" fill={colors.core} filter="url(#neonGlow)" className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
          <circle cx="50" cy="82" r="1" fill={colors.core} filter="url(#neonGlow)" className="animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite_0.2s]" />
          <circle cx="18" cy="50" r="1" fill={colors.core} filter="url(#neonGlow)" className="animate-[ping_2.2s_cubic-bezier(0,0,0.2,1)_infinite_0.7s]" />
        </g>
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes coreFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes corePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}} />
    </div>
  );
};
export default AriaCore;
