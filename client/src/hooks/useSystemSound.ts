import { useCallback } from 'react';
import { useAudioStore } from '../store/useAudioStore';

type SoundType = 'click' | 'hover' | 'success' | 'error' | 'levelUp' | 'alert';

export const useSystemSound = () => {
  const { soundEnabled } = useAudioStore();

  const play = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
          
        case 'hover':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
          
        case 'success':
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
          osc.frequency.setValueAtTime(659.25, now + 0.2); // E
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
          
        case 'levelUp':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
          
        case 'error':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
          
        case 'alert':
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.setValueAtTime(1000, now + 0.1);
          osc.frequency.setValueAtTime(800, now + 0.2);
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
      }
    } catch {
      // Ignore audio context errors (e.g. strict browser autoplay policies)
    }
  }, [soundEnabled]);

  return { play };
};
