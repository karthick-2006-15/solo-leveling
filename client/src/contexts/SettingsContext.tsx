import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAudioStore } from '../store/useAudioStore';
import { fetchWithAuth } from '../api/fetchHelper';

interface SettingsContextType {
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch system settings from backend on login
      fetchWithAuth('/api/notifications/settings')
        .then(res => res.json())
        .then(data => {
          if (data.accessibility) {
            setReducedMotion(data.accessibility.reducedMotion ?? false);
            setHighContrast(data.accessibility.highContrast ?? false);
          }
          if (data.audio) {
            useAudioStore.getState().setSoundEnabled(data.audio.soundEnabled ?? true);
            useAudioStore.getState().setMasterVolume(data.audio.masterVolume ?? 1.0);
            useAudioStore.getState().setMusicVolume(data.audio.musicVolume ?? 0.5);
            useAudioStore.getState().setEffectsVolume(data.audio.effectsVolume ?? 0.8);
            useAudioStore.getState().setVoiceVolume(data.audio.voiceVolume ?? 1.0);
          }
        })
        .catch(err => console.error('Failed to load system settings:', err));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Apply contrast class to root
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <SettingsContext.Provider value={{ reducedMotion, setReducedMotion, highContrast, setHighContrast }}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
