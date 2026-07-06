import React, { type ReactNode } from 'react';

interface StatBadgeProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  color?: 'blue' | 'purple' | 'neutral';
}

export const StatBadge: React.FC<StatBadgeProps> = ({ 
  icon, 
  label, 
  value,
  color = 'blue'
}) => {
  const colorStyles = {
    blue: 'text-neonBlue text-glow-blue border-neonBlue/30 bg-neonBlue/10',
    purple: 'text-neonPurple text-glow-purple border-neonPurple/30 bg-neonPurple/10',
    neutral: 'text-textMain border-white/20 bg-white/5',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${colorStyles[color]}`}>
      {icon && <div className="text-xl">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-textMuted font-semibold">
          {label}
        </span>
        <span className="font-bold text-lg leading-tight">
          {value}
        </span>
      </div>
    </div>
  );
};
