import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCinematicStore } from '../../store/useCinematicStore';
import { useSystemSound } from '../../hooks/useSystemSound';
import { haptics } from '../../utils/haptics';
import { Skull, ShieldAlert } from 'lucide-react';

export const BossWarning: React.FC = () => {
  const { bossWarningData, hideBossWarning } = useCinematicStore();
  const { play } = useSystemSound();

  useEffect(() => {
    if (bossWarningData) {
      play('bossAppeared');
      haptics.bossWarning();
      
      const t = setTimeout(hideBossWarning, 5000);
      return () => clearTimeout(t);
    }
  }, [bossWarningData, play, hideBossWarning]);

  return (
    <AnimatePresence>
      {bossWarningData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9900] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
        >
          {/* Glitch Overlay */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1, 0.5, 0.1, 0.8, 0.2],
              x: [0, -5, 5, -10, 10, -5, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
            className="absolute inset-0 bg-red-900/20 mix-blend-color-burn"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="relative z-10 flex flex-col items-center bg-red-950/80 border-y-4 border-red-600 w-full py-12 shadow-[0_0_100px_rgba(220,38,38,0.5)]"
          >
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Skull className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] mb-4" />
            </motion.div>

            <motion.h1 
              animate={{ x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700 uppercase tracking-[0.2em] drop-shadow-2xl"
            >
              WARNING
            </motion.h1>

            <h2 className="text-2xl md:text-4xl text-white font-bold mt-4 tracking-wider">
              {bossWarningData.name || 'ANOMALY DETECTED'}
            </h2>

            <div className="mt-6 flex items-center gap-6 text-red-300 font-mono">
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase opacity-70">Difficulty</span>
                <span className="text-xl font-bold">{bossWarningData.difficulty || 'S-RANK'}</span>
              </div>
              <div className="h-8 w-px bg-red-500/30" />
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase opacity-70">Recommended Level</span>
                <span className="text-xl font-bold">{bossWarningData.recommendedLevel || 'UNKNOWN'}</span>
              </div>
            </div>

            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute top-0 left-0 right-0 h-1 bg-red-500"
            />
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"
            />
          </motion.div>

          <div className="absolute top-10 flex items-center gap-2 text-red-500 font-mono animate-pulse">
            <ShieldAlert size={20} />
            EMERGENCY PROTOCOL INITIATED
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
