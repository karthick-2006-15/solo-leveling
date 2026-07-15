import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { guardianApi } from '../api/guardianApi';
import { ShieldAlert, Activity, CheckCircle2, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RECOVERY_ACTIONS = [
  "Do 20 Push-ups immediately.",
  "Drink a large glass of water.",
  "Do a 3-minute Box Breathing exercise (4s in, 4s hold, 4s out, 4s hold).",
  "Walk around the room for 5 minutes.",
  "Write down 3 reasons why giving in is not worth it.",
  "Hold a plank for 60 seconds.",
  "Splash cold water on your face.",
  "Do 50 jumping jacks.",
  "Meditate focusing only on your breath for 5 minutes."
];

export const GuardianMode = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isActive, setIsActive] = useState(true);
  const [currentAction, setCurrentAction] = useState(RECOVERY_ACTIONS[0]);

  useEffect(() => {
    // Pick random action on load
    setCurrentAction(RECOVERY_ACTIONS[Math.floor(Math.random() * RECOVERY_ACTIONS.length)]);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSuccess();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const processActionMutation = useMutation({
    mutationFn: (payload: any) => guardianApi.processAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardianDashboard'] });
    }
  });

  const handleSuccess = () => {
    toast.success('Survival Successful. XP and Willpower awarded.');
    processActionMutation.mutate({ actionType: 'dungeon_completed', durationMinutes: 15 });
    setTimeout(() => navigate('/guardian'), 2000);
  };

  const handleRelapse = () => {
    setIsActive(false);
    toast.error('Defense broken. Corruption increased.');
    processActionMutation.mutate({ actionType: 'relapse', emotion: 'Overwhelmed', triggerContext: 'Failed Guardian Mode' });
    setTimeout(() => navigate('/guardian'), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050000] flex flex-col items-center justify-center p-4">
      {/* GLITCH OVERLAYS */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg hud-glass corner-brackets border-red-900/50 p-8 relative z-10 text-center space-y-8"
      >
        <div className="flex flex-col items-center gap-2">
          <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
          <h1 className="font-display text-4xl text-red-500 tracking-widest uppercase text-shadow-glow">
            Emergency Defense
          </h1>
          <p className="font-mono text-sm text-red-400/80 uppercase tracking-widest">Lust Entity Detected. Maintain Guard.</p>
        </div>

        <div className="py-8">
          <p className="font-display text-7xl text-white tracking-wider tabular-nums text-shadow-glow drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            {formatTime(timeLeft)}
          </p>
        </div>

        <div className="bg-red-950/30 border border-red-900/50 p-6 rounded text-left">
          <h3 className="font-mono text-xs text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recommended Evasion Action
          </h3>
          <p className="font-sans text-lg text-gray-200">
            {currentAction}
          </p>
          <button 
            onClick={() => setCurrentAction(RECOVERY_ACTIONS[Math.floor(Math.random() * RECOVERY_ACTIONS.length)])}
            className="mt-4 text-xs font-mono text-gray-500 hover:text-cyan-400 underline"
          >
            Request New Action
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button 
            onClick={handleSuccess}
            className="w-full py-4 bg-transparent border border-cyan-500/50 hover:bg-cyan-900/30 rounded font-display text-xl uppercase tracking-widest text-cyan-400 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-6 h-6" /> I Survived
          </button>
          
          <button 
            onClick={handleRelapse}
            className="w-full py-4 bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 rounded font-mono text-sm uppercase tracking-widest text-red-400 transition-all flex items-center justify-center gap-2"
          >
            <Skull className="w-4 h-4" /> Defense Broken (Relapse)
          </button>
        </div>

      </motion.div>
    </div>
  );
};
