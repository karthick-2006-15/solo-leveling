import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

export const MissionToastManager: React.FC = () => {
  useEffect(() => {
    const handleQuestsCompleted = (e: Event) => {
      const customEvent = e as CustomEvent;
      const quests = customEvent.detail;
      
      quests.forEach((quest: any) => {
        toast.success(
          <div className="flex flex-col gap-1 w-full relative">
            <span className="font-display font-bold text-[12px] uppercase text-[var(--color-system-blue)] tracking-wider">Quest Complete</span>
            <span className="font-body text-[14px] text-[var(--color-system-text)]">{quest.title}</span>
            <div className="flex gap-2 mt-1">
              {quest.xpReward > 0 && <span className="font-mono text-[11px] text-[var(--color-system-blue)] border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.1)] px-1 rounded-[2px]">+{quest.xpReward} XP</span>}
              {quest.coinReward > 0 && <span className="font-mono text-[11px] text-[var(--color-system-gold)] border border-[rgba(245,197,24,0.2)] bg-[rgba(245,197,24,0.1)] px-1 rounded-[2px]">+{quest.coinReward} COINS</span>}
            </div>
            {/* Hex overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M10 2L18 6.5V15.5L10 20L2 15.5V6.5L10 2z\\' fill=\\'none\\' stroke=\\'%23ffffff\\' stroke-width=\\'1\\' stroke-opacity=\\'1\\'/%3E%3C/svg%3E')] bg-[length:12px_12px]" />
          </div>, 
          { 
            duration: 5000, 
            style: { 
              background: 'var(--color-system-dark)', 
              color: 'var(--color-system-text)', 
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '4px',
              boxShadow: '0 0 20px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.05)'
            },
            iconTheme: {
              primary: 'var(--color-system-blue)',
              secondary: 'var(--color-system-dark)'
            }
          }
        );
      });
    };

    const handleBossDefeated = (e: Event) => {
      const customEvent = e as CustomEvent;
      const boss = customEvent.detail;
      
      toast.success(
        <div className="flex flex-col gap-1 w-full">
          <span className="font-display font-bold text-[14px] uppercase text-[var(--color-system-red)] tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]">THREAT ELIMINATED</span>
          <span className="font-body text-[16px] font-bold text-white">{boss.name || 'Weekly Boss'}</span>
          <span className="font-mono text-[11px] text-[var(--color-system-text-dim)] mt-1 tracking-wider uppercase">Rewards transferred to inventory</span>
        </div>,
        { 
          duration: 8000, 
          icon: '💀', 
          style: { 
            background: 'linear-gradient(180deg, #1a0508 0%, var(--color-system-black) 100%)', 
            color: 'white', 
            border: '1px solid rgba(255,51,102,0.5)',
            borderRadius: '4px',
            boxShadow: '0 0 30px rgba(255,51,102,0.2)'
          } 
        }
      );
    };

    const handleAchievementsUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent;
      const achievements = customEvent.detail;
      
      achievements.forEach((achievement: any) => {
        toast.success(
          <div className="flex flex-col gap-1 w-full">
            <span className="font-display font-bold text-[12px] uppercase text-[var(--color-system-gold)] tracking-[0.1em]">Achievement Unlocked</span>
            <span className="font-body text-[15px] font-bold text-white">{achievement.name}</span>
          </div>,
          { 
            duration: 6000, 
            icon: achievement.icon || '🏆', 
            style: { 
              background: 'linear-gradient(135deg, rgba(245,197,24,0.1) 0%, var(--color-system-dark) 100%)', 
              color: 'white', 
              border: '1px solid rgba(245,197,24,0.3)',
              borderRadius: '4px',
              boxShadow: '0 0 20px rgba(245,197,24,0.15)'
            } 
          }
        );
      });
    };

    window.addEventListener('mission:questsCompleted', handleQuestsCompleted);
    window.addEventListener('mission:bossDefeated', handleBossDefeated);
    window.addEventListener('mission:achievementsUnlocked', handleAchievementsUnlocked);

    return () => {
      window.removeEventListener('mission:questsCompleted', handleQuestsCompleted);
      window.removeEventListener('mission:bossDefeated', handleBossDefeated);
      window.removeEventListener('mission:achievementsUnlocked', handleAchievementsUnlocked);
    };
  }, []);

  return null;
};
