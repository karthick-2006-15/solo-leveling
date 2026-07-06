import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { NeonProgressBar } from '../ui/NeonProgressBar';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Droplet } from 'lucide-react';
import { useNutrition } from '../../hooks/useNutrition';
import { LevelUpModal } from '../ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../ui/AchievementToast';

export const WaterTracker: React.FC = () => {
  const { waterMl, logWater } = useNutrition();
  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Default assumption from backend if unset is 2.5L
  const targetMl = 2500;
  const progressPercent = Math.min(100, Math.max(0, (waterMl / targetMl) * 100));

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
    <GlassCard className="relative overflow-hidden">
      <AchievementToast toasts={toasts} removeToast={removeToast} />
      <LevelUpModal 
        isOpen={levelUpData.isOpen} 
        onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })}
        newLevel={levelUpData.level}
        newRank={levelUpData.rank}
        rankChanged={levelUpData.rankChanged}
      />
      
      {/* Background fill */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-blue-500/10 transition-all duration-1000 ease-in-out -z-10"
        style={{ height: `${progressPercent}%` }}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
          <Droplet /> Daily Water
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{waterMl} <span className="text-sm text-textMuted font-medium">/ {targetMl} ml</span></div>
        </div>
      </div>
      
      <NeonProgressBar progress={progressPercent} color="blue" />
      
      <div className="flex gap-3 mt-6">
        <PrimaryButton fullWidth color="blue" onClick={() => handleAdd(250)} className="text-sm py-2">
          +250ml
        </PrimaryButton>
        <PrimaryButton fullWidth color="blue" onClick={() => handleAdd(500)} className="text-sm py-2">
          +500ml
        </PrimaryButton>
        <PrimaryButton fullWidth color="blue" onClick={() => handleAdd(1000)} className="text-sm py-2">
          +1L
        </PrimaryButton>
      </div>
    </GlassCard>
  );
};
