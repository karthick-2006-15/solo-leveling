import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, Square, Loader } from 'lucide-react';
import { useProgression } from '../../hooks/useProgression';
import { useSystemSound } from '../../hooks/useSystemSound';

export const FocusTimerWidget: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const { completeFocusSession, isCompletingFocus } = useProgression();
  const { play } = useSystemSound();

  const handleComplete = useCallback(async () => {
    try {
      play('levelUp');
      await completeFocusSession(25);
      // Reset timer
      setTimeLeft(25 * 60);
    } catch (err) {
      console.error(err);
      play('error');
    }
  }, [completeFocusSession, play]);

  useEffect(() => {
    let interval: number | ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setTimeout(() => {
        setIsActive(false);
        handleComplete();
      }, 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, handleComplete]);

  const toggleTimer = () => {
    if (!isActive) {
      play('click');
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    play('click');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative hud-glass corner-brackets border-[var(--color-system-purple)] p-6 group shadow-purple"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/80 to-purple-500/0 opacity-70" />
      <h2 className="font-display uppercase tracking-[0.2em] text-[var(--color-system-purple)] mb-6 flex items-center gap-2 text-shadow-glow">
        <Brain className="w-5 h-5" /> Focus Aura
      </h2>
      
      <div className="flex flex-col items-center justify-center space-y-6">
        
        {/* Timer Display */}
        <div className="relative flex items-center justify-center w-40 h-40">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="80" cy="80" r="76" className="stroke-black/50 fill-none" strokeWidth="4" />
            <circle 
              cx="80" cy="80" r="76" 
              className="stroke-purple-500 fill-none transition-all duration-1000 ease-linear" 
              strokeWidth="4" 
              strokeDasharray={477} // 2 * PI * 76 = 477.5
              strokeDashoffset={477 - (477 * progressPercent) / 100}
            />
          </svg>
          <div className="font-mono text-4xl text-purple-100 tracking-wider">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-4">
          <button 
            onClick={toggleTimer}
            disabled={isCompletingFocus}
            className="flex items-center gap-2 px-6 py-2 bg-purple-950/40 border border-[var(--color-system-purple)] text-[var(--color-system-purple)] font-mono text-[11px] uppercase tracking-widest rounded hover:bg-purple-900/60 transition-colors shadow-[0_0_10px_rgba(157,78,221,0.3)]"
          >
            {isCompletingFocus ? <Loader className="w-4 h-4 animate-spin" /> : (isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />)}
            {isActive ? 'PAUSE' : 'START'}
          </button>
          
          <button 
            onClick={resetTimer}
            disabled={isCompletingFocus}
            className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-800 text-gray-400 font-mono text-[11px] uppercase tracking-widest rounded-lg hover:bg-gray-900 transition-colors"
          >
            RESET
          </button>
        </div>
        
        <div className="text-center font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          Completing Focus Session restores Willpower.
        </div>
      </div>
    </motion.div>
  );
};
