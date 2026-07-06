import React from 'react';
import { SystemWindow } from '../ui/SystemWindow';
import { formatSafeDate, safeDate } from '../../utils/dateUtils';

interface RecentAchievementsProps {
  achievements: Array<{
    achievementId: string;
    unlockedAt: string;
  }>;
}

const ACHIEVEMENT_LOOKUP: Record<string, { name: string, icon: string, description: string }> = {
  first_steps: { name: 'First Steps', icon: '👶', description: 'Earn your first XP ever.' },
  leveling_up: { name: 'Leveling Up', icon: '⚡', description: 'Reach Level 5.' },
  rising_hunter: { name: 'Rising Hunter', icon: '🗡️', description: 'Reach C-Rank.' },
  consistency: { name: 'Consistency', icon: '🔥', description: 'Maintain a 7-day streak.' },
  dedicated: { name: 'Dedicated', icon: '💎', description: 'Maintain a 30-day streak.' }
};

export const RecentAchievements: React.FC<RecentAchievementsProps> = ({ achievements }) => {
  if (!achievements || achievements.length === 0) {
    return (
      <SystemWindow title="ACHIEVEMENTS // RECENT" variant="gold">
        <div className="text-center py-6 flex flex-col items-center">
          <span className="font-display text-[12px] text-[var(--color-system-text-dim)] uppercase tracking-widest">
            NO RECENT ACQUISITIONS
          </span>
        </div>
      </SystemWindow>
    );
  }

  // Sort by most recent
  const sorted = [...achievements].sort((a, b) => (safeDate(b.unlockedAt)?.getTime() || 0) - (safeDate(a.unlockedAt)?.getTime() || 0)).slice(0, 5);

  return (
    <SystemWindow title="ACHIEVEMENTS // RECENT" variant="gold">
      <div className="space-y-2 pt-2">
        {sorted.map(a => {
          const detail = ACHIEVEMENT_LOOKUP[a.achievementId] || { name: 'Unknown', icon: '❓', description: '' };
          return (
            <div key={a.achievementId} className="flex items-center gap-3 bg-[rgba(245,197,24,0.05)] p-3 rounded-[2px] border border-[rgba(245,197,24,0.15)] relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-system-gold)]" style={{ boxShadow: '0 0 10px var(--color-system-gold)' }} />
              <div className="text-2xl drop-shadow-[0_0_8px_rgba(245,197,24,0.5)] group-hover:scale-110 transition-transform">{detail.icon}</div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[13px] text-[var(--color-system-gold)] uppercase tracking-wide leading-none">{detail.name}</span>
                <span className="font-mono text-[10px] text-[var(--color-system-text-dim)] mt-1">{formatSafeDate(a.unlockedAt, 'yyyy-MM-dd')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </SystemWindow>
  );
};
