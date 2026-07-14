import React from 'react';
import { Medal, Lock } from 'lucide-react';
import { useMissions } from '../../hooks/useMissions';

interface AchievementCollectionProps {
  unlockedAchievements: string[];
}

export const AchievementCollection: React.FC<AchievementCollectionProps> = ({ unlockedAchievements }) => {
  const { badges } = useMissions();

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500 lg:col-span-2 mt-6">
      <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2 flex items-center gap-2">
        <Medal className="w-5 h-5" /> Achievement Collection
      </h2>
      <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">
        {unlockedAchievements.length} / {badges.length} Unlocked
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map((badge: any) => {
          const isUnlocked = unlockedAchievements.includes(badge.id);
          return (
            <div key={badge.id} className={`relative p-4 rounded border flex flex-col items-center justify-center text-center transition-all ${
              isUnlocked 
                ? 'bg-cyan-950/20 border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-900/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                : 'bg-black/40 border-gray-900 opacity-60 grayscale'
            }`}>
              <div className="text-3xl mb-2">{badge.icon || '🏅'}</div>
              <div className="font-display text-[11px] text-cyan-100 uppercase tracking-widest mb-1">{badge.name}</div>
              <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
                {isUnlocked ? 'Unlocked' : <span className="flex items-center gap-1 justify-center"><Lock className="w-3 h-3" /> Locked</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
