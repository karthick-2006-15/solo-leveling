import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCinematicStore } from '../../store/useCinematicStore';
import { useSystemSound } from '../../hooks/useSystemSound';
import { haptics } from '../../utils/haptics';
import { ParticleEngine } from '../animations/ParticleEngine';

export const LevelUpCinematic: React.FC = () => {
  const { levelUpData, hideLevelUp } = useCinematicStore();
  const { play } = useSystemSound();

  useEffect(() => {
    if (levelUpData) {
      play('levelUp');
      haptics.levelUp();
      
      // Auto hide after 6 seconds
      const t = setTimeout(hideLevelUp, 6000);
      return () => clearTimeout(t);
    }
  }, [levelUpData, play, hideLevelUp]);

  return (
    <AnimatePresence>
      {levelUpData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-hidden"
          onClick={hideLevelUp}
        >
          <ParticleEngine type="golden-light" intensity={10} />
          <ParticleEngine type="stars" intensity={5} />

          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative z-10 text-center flex flex-col items-center max-w-md p-8 bg-slate-900/50 border border-yellow-500/30 rounded-2xl shadow-[0_0_50px_rgba(250,204,21,0.2)]"
            onClick={(e) => e.stopPropagation()} // Prevent close on card click
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-yellow-400 font-display text-xl uppercase tracking-widest mb-2"
            >
              System Alert
            </motion.h2>

            <motion.h1 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
              className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] mb-4"
            >
              LEVEL UP
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 1, duration: 0.5 }}
              className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-full my-4"
            />

            <div className="flex justify-center items-end gap-4 my-6">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-slate-400 text-3xl line-through"
              >
                {levelUpData.oldLevel || 1}
              </motion.div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.7, type: 'spring' }}
                className="text-yellow-400 text-6xl font-bold"
              >
                {levelUpData.newLevel || 2}
              </motion.div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              className="text-slate-300 mb-6"
            >
              You have grown stronger. Attributes have increased.
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              onClick={hideLevelUp}
              className="px-8 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded hover:bg-yellow-500/40 transition-colors uppercase tracking-widest font-bold text-sm"
            >
              Accept
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
