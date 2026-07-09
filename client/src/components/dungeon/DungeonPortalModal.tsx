import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemSound } from '../../hooks/useSystemSound';

interface DungeonPortalModalProps {
  isOpen: boolean;
  dungeonName: string;
  difficulty: string;
  onEnter: () => void;
}

export const DungeonPortalModal: React.FC<DungeonPortalModalProps> = ({ isOpen, dungeonName, difficulty, onEnter }) => {
  const { play } = useSystemSound();
  const [phase, setPhase] = useState<'forming' | 'stable' | 'entering'>('forming');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setPhase('forming'), 0);
      play('click'); // Placeholder for swirling portal sound
      
      const timer1 = setTimeout(() => {
        setPhase('stable');
      }, 2000);

      return () => clearTimeout(timer1);
    }
  }, [isOpen, play]);

  const handleEnter = () => {
    setPhase('entering');
    play('levelUp');
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  if (!isOpen) return null;

  const getPortalColor = (diff: string) => {
    switch(diff) {
      case 'Easy': return 'bg-green-500 shadow-green-500';
      case 'Normal': return 'bg-blue-500 shadow-blue-500';
      case 'Hard': return 'bg-yellow-500 shadow-yellow-500';
      case 'Elite': return 'bg-red-500 shadow-red-500';
      case 'Nightmare': return 'bg-purple-600 shadow-purple-600';
      case 'Monarch': return 'bg-rose-600 shadow-rose-600';
      default: return 'bg-blue-500 shadow-blue-500';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        />

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center">
          
          {/* Portal Visual */}
          <motion.div 
            initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
            animate={
              phase === 'forming' ? { scale: 1, opacity: 1, rotate: 180 } :
              phase === 'entering' ? { scale: 5, opacity: 0, rotate: 360 } :
              { scale: 1.05, opacity: 1, rotate: 360 } // Stable (spinning slowly)
            }
            transition={{ 
              duration: phase === 'entering' ? 1.5 : 2, 
              ease: phase === 'entering' ? "easeIn" : "easeInOut",
              repeat: phase === 'stable' ? Infinity : 0,
              repeatType: 'loop'
            }}
            className={`w-64 h-96 rounded-full blur-2xl opacity-50 ${getPortalColor(difficulty)}`}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === 'entering' ? 0 : 1, y: phase === 'entering' ? -20 : 0 }}
            transition={{ delay: 1 }}
            className="absolute flex flex-col items-center mt-32 text-center"
          >
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Gate Detected</p>
            <h2 className="text-4xl font-display font-bold uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mb-2">
              {dungeonName}
            </h2>
            <p className={`text-sm font-mono uppercase tracking-widest px-4 py-1 border rounded-full bg-black/50 ${
              difficulty === 'Monarch' ? 'text-rose-500 border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'text-cyan-400 border-cyan-500'
            }`}>
              {difficulty} Rank
            </p>

            {phase === 'stable' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnter}
                className="mt-12 px-10 py-4 bg-white/90 text-black font-display font-bold text-xl uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
              >
                ENTER GATE
              </motion.button>
            )}
          </motion.div>

        </div>
      </div>
    </AnimatePresence>
  );
};
