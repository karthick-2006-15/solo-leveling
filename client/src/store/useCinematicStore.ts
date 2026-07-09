import { create } from 'zustand';

interface CinematicState {
  levelUpData: any | null;
  showLevelUp: (data: any) => void;
  hideLevelUp: () => void;

  bossWarningData: any | null;
  showBossWarning: (data: any) => void;
  hideBossWarning: () => void;

  dungeonPortalActive: boolean;
  triggerDungeonPortal: () => void;
}

export const useCinematicStore = create<CinematicState>((set) => ({
  levelUpData: null,
  showLevelUp: (data) => set({ levelUpData: data }),
  hideLevelUp: () => set({ levelUpData: null }),

  bossWarningData: null,
  showBossWarning: (data) => set({ bossWarningData: data }),
  hideBossWarning: () => set({ bossWarningData: null }),

  dungeonPortalActive: false,
  triggerDungeonPortal: () => {
    set({ dungeonPortalActive: true });
    setTimeout(() => set({ dungeonPortalActive: false }), 2000); // 2 second transition
  }
}));
