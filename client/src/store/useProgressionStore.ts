import { create } from 'zustand';

interface ProgressionState {
  level: number;
  rank: string;
  currentXP: number;
  xpRequired: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  unlockedAchievements: any[];
  setProgression: (data: Partial<ProgressionState>) => void;
  addXP: (amount: number, leveledUp: boolean, newLevel?: number, newRank?: string) => void;
}

export const useProgressionStore = create<ProgressionState>((set) => ({
  level: 1,
  rank: 'E-Rank Novice',
  currentXP: 0,
  xpRequired: 100,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  unlockedAchievements: [],

  setProgression: (data) => set((state) => ({ ...state, ...data })),

  addXP: (amount, leveledUp, newLevel, newRank) => set((state) => {
    let nextXP = state.currentXP + amount;
    let nextRequired = state.xpRequired;
    
    // In a real app, the backend gives us the exact new state, 
    // so we typically just overwrite. But for optimistic UI updates:
    if (leveledUp && newLevel) {
      nextRequired = Math.round(50 * Math.pow(newLevel, 1.5));
      nextXP = nextXP - state.xpRequired; // rough estimation
    }

    return {
      currentXP: nextXP,
      totalXP: state.totalXP + amount,
      level: newLevel || state.level,
      rank: newRank || state.rank,
      xpRequired: nextRequired
    };
  })
}));
