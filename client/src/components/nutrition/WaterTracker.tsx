import React, { useState } from 'react';
import { useNutrition } from '../../hooks/useNutrition';
import { LevelUpModal } from '../ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../ui/AchievementToast';
import { HunterMissionRing } from './HunterMissionBars';
import { SystemWindow } from '../ui/SystemWindow';

export const WaterTracker: React.FC = () => {
  const { waterMl, logWater } = useNutrition();
  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Default assumption from backend if unset is 2.5L
  const targetMl = 2500;

  const handleAdd = async (amount: number) => {
    try {
      const { xpResult } = await logWater(amount);
      if (xpResult) {
        if (xpResult.leveledUp) {
          setLevelUpData({
            isOpen: true,
            level: xpResult.newLevel,
            rank: xpResult.newRank,
            rankChanged: xpResult.rankChanged
          });
        }
        if (xpResult.newAchievements) {
          const newToasts = xpResult.newAchievements.map((a: any) => ({
            id: Math.random().toString(36).substring(2),
            title: a.name,
            description: `Achievement unlocked!`,
            icon: a.icon
          }));
          setToasts(prev => [...prev, ...newToasts]);
        }
      }
    } catch {
      alert('Failed to log water');
    }
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <SystemWindow title="Hydration Module" className="h-auto relative overflow-hidden">
      <AchievementToast toasts={toasts} removeToast={removeToast} />
      <LevelUpModal 
        isOpen={levelUpData.isOpen} 
        onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })}
        newLevel={levelUpData.level}
        newRank={levelUpData.rank}
        rankChanged={levelUpData.rankChanged}
      />
      
      <div className="flex flex-col items-center pt-2 pb-4">
        <HunterMissionRing 
          label="Water" 
          current={waterMl} 
          max={targetMl} 
          unit="ML" 
          colorHex="#3b82f6" 
          size={140}
          strokeWidth={10}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3 mt-2">
        <button 
          onClick={() => handleAdd(250)}
          className="py-2.5 bg-blue-950/40 border border-blue-900/50 hover:border-blue-400 hover:bg-blue-900/60 rounded text-[11px] font-mono font-bold text-blue-400 hover:text-white uppercase tracking-widest transition-all active:scale-95"
        >
          +250ml
        </button>
        <button 
          onClick={() => handleAdd(500)}
          className="py-2.5 bg-blue-950/40 border border-blue-900/50 hover:border-blue-400 hover:bg-blue-900/60 rounded text-[11px] font-mono font-bold text-blue-400 hover:text-white uppercase tracking-widest transition-all active:scale-95"
        >
          +500ml
        </button>
        <button 
          onClick={() => handleAdd(1000)}
          className="py-2.5 bg-blue-950/40 border border-blue-900/50 hover:border-blue-400 hover:bg-blue-900/60 rounded text-[11px] font-mono font-bold text-blue-400 hover:text-white uppercase tracking-widest transition-all active:scale-95"
        >
          +1L
        </button>
      </div>
    </SystemWindow>
  );
};
