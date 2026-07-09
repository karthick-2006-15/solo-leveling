import { useCallback, useEffect, useRef } from 'react';
import { useAudioStore } from '../store/useAudioStore';

export type SoundType = 
  | 'click' | 'hover' | 'success' | 'error' | 'levelUp' | 'alert' 
  | 'boot' | 'online' | 'pageTransition' | 'missionAccepted' | 'missionCompleted' 
  | 'missionFailed' | 'recoveryMission' | 'questUnlocked' | 'achievement' 
  | 'xpGain' | 'coinGain' | 'lootDrop' | 'chestOpen' | 'rareReward' 
  | 'legendaryReward' | 'memoryCrystal' | 'relicFound' | 'bossAppeared' 
  | 'bossDefeated' | 'dungeonEntered' | 'dungeonCleared' | 'hunterRankUp' 
  | 'monarchEvolution' | 'shadowStrength' | 'shadowDefeated' | 'purificationComplete' 
  | 'perfectDay' | 'dailyLogin' | 'ariaNotification' | 'warning' | 'loadingComplete' 
  | 'saveComplete' | 'portal';

export type BGMType = 'dashboard' | 'focus' | 'dungeon' | 'boss' | 'victory' | 'recovery' | 'morning' | 'night' | 'none';

export const useSystemSound = () => {
  const { soundEnabled, masterVolume, musicVolume, effectsVolume } = useAudioStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmOscillatorsRef = useRef<OscillatorNode[]>([]);
  const bgmGainRef = useRef<GainNode | null>(null);
  const currentBgmTypeRef = useRef<BGMType>('none');

  // Initialize Audio Context lazily
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const now = ctx.currentTime;
      const actualVolume = masterVolume * effectsVolume;
      
      // Extended Sound Library (Procedural Generation for performance/size)
      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
          gainNode.gain.setValueAtTime(0.3 * actualVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
          
        case 'hover':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          gainNode.gain.setValueAtTime(0.05 * actualVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;

        case 'boot':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(50, now);
          osc.frequency.linearRampToValueAtTime(440, now + 1.5);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.2 * actualVolume, now + 1);
          gainNode.gain.linearRampToValueAtTime(0, now + 2);
          osc.start(now);
          osc.stop(now + 2.5);
          break;

        case 'online':
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1760, now + 0.2);
          gainNode.gain.setValueAtTime(0.1 * actualVolume, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
          
        case 'success':
        case 'missionCompleted':
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
          osc.frequency.setValueAtTime(659.25, now + 0.2); // E
          gainNode.gain.setValueAtTime(0.1 * actualVolume, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
          
        case 'levelUp':
        case 'hunterRankUp':
        case 'monarchEvolution':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
          osc.frequency.exponentialRampToValueAtTime(1760, now + 0.6);
          gainNode.gain.setValueAtTime(0.2 * actualVolume, now);
          gainNode.gain.linearRampToValueAtTime(0.3 * actualVolume, now + 0.3);
          gainNode.gain.linearRampToValueAtTime(0, now + 1.2);
          osc.start(now);
          osc.stop(now + 1.2);
          break;
          
        case 'error':
        case 'missionFailed':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
          gainNode.gain.setValueAtTime(0.2 * actualVolume, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
          
        case 'alert':
        case 'warning':
        case 'bossAppeared':
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.setValueAtTime(1000, now + 0.2);
          osc.frequency.setValueAtTime(800, now + 0.4);
          gainNode.gain.setValueAtTime(0.2 * actualVolume, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
          break;

        case 'lootDrop':
        case 'coinGain':
        case 'xpGain':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
          gainNode.gain.setValueAtTime(0.1 * actualVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;

        case 'legendaryReward':
        case 'chestOpen':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.5);
          osc.frequency.linearRampToValueAtTime(1760, now + 1);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.2 * actualVolume, now + 0.5);
          gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
          osc.start(now);
          osc.stop(now + 1.5);
          break;

        case 'dungeonEntered':
        case 'portal':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(50, now + 1);
          gainNode.gain.setValueAtTime(0.3 * actualVolume, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 2);
          osc.start(now);
          osc.stop(now + 2);
          break;

        // Default fallback for any unmapped sounds
        default:
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gainNode.gain.setValueAtTime(0.1 * actualVolume, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
      }
    } catch {
      // Ignore audio context errors
    }
  }, [soundEnabled, masterVolume, effectsVolume, getAudioContext]);

  // Background Music Synthesizer
  const playBGM = useCallback((type: BGMType) => {
    if (!soundEnabled || type === currentBgmTypeRef.current) return;
    currentBgmTypeRef.current = type;
    
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const actualMusicVolume = masterVolume * musicVolume * 0.15; // BGM is naturally quieter

    // Fade out existing BGM
    if (bgmGainRef.current) {
      bgmGainRef.current.gain.linearRampToValueAtTime(0, now + 2);
      setTimeout(() => {
        bgmOscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch { /* ignore */ }
        });
        bgmOscillatorsRef.current = [];
      }, 2100);
    }

    if (type === 'none') return;

    // Create new BGM layer
    const newGain = ctx.createGain();
    newGain.gain.setValueAtTime(0, now);
    newGain.gain.linearRampToValueAtTime(actualMusicVolume, now + 3); // 3 second fade in
    newGain.connect(ctx.destination);
    bgmGainRef.current = newGain;

    // Procedural Ambient Drones
    const createDrone = (freq: number, detune: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(newGain);
      osc.start();
      bgmOscillatorsRef.current.push(osc);
    };

    switch (type) {
      case 'dashboard': // Calm Ambient
        createDrone(220, 0, 'sine'); // A3
        createDrone(220, 5, 'sine');
        createDrone(329.63, 0, 'sine'); // E4
        break;
      case 'dungeon': // Dark Ambient
        createDrone(65.41, 0, 'sawtooth'); // C2
        createDrone(65.41, 10, 'sine');
        createDrone(98.00, 0, 'sine'); // G2
        newGain.gain.linearRampToValueAtTime(actualMusicVolume * 0.8, now + 3);
        break;
      case 'boss': // Intense
        createDrone(55.00, 0, 'square');
        createDrone(55.00, 15, 'sawtooth');
        createDrone(110.00, 0, 'sawtooth');
        newGain.gain.linearRampToValueAtTime(actualMusicVolume * 1.5, now + 3);
        break;
      case 'victory':
        createDrone(261.63, 0, 'triangle'); // C4
        createDrone(329.63, 0, 'triangle'); // E4
        createDrone(392.00, 0, 'triangle'); // G4
        break;
      case 'recovery':
      case 'night': // Peaceful
        createDrone(196.00, 0, 'sine'); // G3
        createDrone(196.00, 4, 'sine');
        createDrone(246.94, 0, 'sine'); // B3
        break;
      case 'morning':
      case 'focus': // Inspiring
        createDrone(293.66, 0, 'sine'); // D4
        createDrone(440.00, 0, 'sine'); // A4
        break;
    }
  }, [soundEnabled, masterVolume, musicVolume, getAudioContext]);

  // Adjust live BGM volume if settings change
  useEffect(() => {
    if (bgmGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const actualMusicVolume = soundEnabled ? (masterVolume * musicVolume * 0.15) : 0;
      bgmGainRef.current.gain.linearRampToValueAtTime(actualMusicVolume, now + 0.5);
    }
  }, [soundEnabled, masterVolume, musicVolume]);

  return { play, playBGM };
};
