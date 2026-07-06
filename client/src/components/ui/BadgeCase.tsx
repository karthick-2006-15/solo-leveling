import React from 'react';
import { SystemWindow } from './SystemWindow';
import type { Badge } from '../../api/missionApi';
import { formatSafeDate } from '../../utils/dateUtils';

interface Props {
  badges: Badge[];
}

export const BadgeCase: React.FC<Props> = ({ badges }) => {
  return (
    <SystemWindow title="ACHIEVEMENTS // BADGES" variant="gold">
      <div className="pt-2">
        {badges.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <span className="font-display text-[14px] text-[var(--color-system-text-dim)] uppercase tracking-widest">
              No badges earned yet
            </span>
            <span className="font-mono text-[10px] text-[var(--color-system-gold)] mt-2">
              DEFEAT WEEKLY BOSSES TO COLLECT BADGES
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map(badge => (
              <div 
                key={badge._id} 
                className="relative bg-[rgba(245,197,24,0.05)] border border-[rgba(245,197,24,0.15)] p-4 flex flex-col items-center text-center hover:border-[var(--color-system-gold)] hover:bg-[rgba(245,197,24,0.1)] transition-colors group cursor-default"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                <div className="text-4xl mb-3 drop-shadow-[0_0_15px_rgba(245,197,24,0.6)] group-hover:scale-110 transition-transform duration-300">
                  {badge.icon || '🏅'}
                </div>
                <h4 className="font-display font-bold text-[13px] text-[var(--color-system-gold)] tracking-wide uppercase leading-tight mb-1">
                  {badge.name}
                </h4>
                <p className="font-body text-[11px] text-[var(--color-system-text-dim)] line-clamp-2">
                  {badge.description}
                </p>
                
                {/* Date */}
                <div className="mt-auto pt-3 w-full border-t border-[rgba(245,197,24,0.1)] flex justify-center">
                  <span className="font-mono text-[9px] text-[var(--color-system-gold)] opacity-70">
                    {formatSafeDate(badge.earnedAt, 'yyyy-MM-dd')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SystemWindow>
  );
};
