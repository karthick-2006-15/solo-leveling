import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  soundEnabled: boolean;
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  voiceVolume: number;
  
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMasterVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setEffectsVolume: (v: number) => void;
  setVoiceVolume: (v: number) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      masterVolume: 1.0,
      musicVolume: 0.5,
      effectsVolume: 0.8,
      voiceVolume: 1.0,
      
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setMasterVolume: (v) => set({ masterVolume: v }),
      setMusicVolume: (v) => set({ musicVolume: v }),
      setEffectsVolume: (v) => set({ effectsVolume: v }),
      setVoiceVolume: (v) => set({ voiceVolume: v }),
    }),
    {
      name: 'audio-storage',
    }
  )
);
