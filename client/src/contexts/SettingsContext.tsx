import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  masterVolume: number;
  setMasterVolume: (vol: number) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  effectsEnabled: boolean;
  setEffectsEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [masterVolume, setMasterVolume] = useState(() => Number(localStorage.getItem('masterVolume')) || 1);
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('voiceEnabled') !== 'false');
  const [effectsEnabled, setEffectsEnabled] = useState(() => localStorage.getItem('effectsEnabled') !== 'false');

  useEffect(() => {
    localStorage.setItem('masterVolume', String(masterVolume));
    localStorage.setItem('voiceEnabled', String(voiceEnabled));
    localStorage.setItem('effectsEnabled', String(effectsEnabled));
  }, [masterVolume, voiceEnabled, effectsEnabled]);

  return (
    <SettingsContext.Provider value={{ masterVolume, setMasterVolume, voiceEnabled, setVoiceEnabled, effectsEnabled, setEffectsEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
