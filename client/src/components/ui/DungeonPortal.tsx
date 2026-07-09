import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCinematicStore } from '../../store/useCinematicStore';
import { useSystemSound } from '../../hooks/useSystemSound';
import { haptics } from '../../utils/haptics';

export const DungeonPortal: React.FC = () => {
  const { dungeonPortalActive } = useCinematicStore();
  const { play } = useSystemSound();

  useEffect(() => {
    if (dungeonPortalActive) {
      play('portal');
      haptics.heavyTap();
    }
  }, [dungeonPortalActive, play]);

  return (
    <AnimatePresence>
      {dungeonPortalActive && (
        <motion.div
          className="fixed inset-0 z-[9950] flex items-center justify-center pointer-events-none"
        >
          {/* Background Fade */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-black/90"
          />

          {/* Swirling Portal Center */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ scale: [0, 5, 20], opacity: [0, 1, 1], rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeIn" }}
            className="relative z-10 w-64 h-64 rounded-full bg-gradient-to-r from-blue-900 via-purple-600 to-black blur-2xl opacity-80 mix-blend-screen"
            style={{ boxShadow: '0 0 100px 50px rgba(168, 85, 247, 0.5)' }}
          />
          
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ scale: [0, 3, 10], opacity: [0, 1, 0], rotate: -180 }}
            transition={{ duration: 1.2, ease: "easeIn", delay: 0.2 }}
            className="absolute z-20 w-32 h-32 rounded-full border-[10px] border-cyan-400 border-dashed blur-sm"
          />

          {/* Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-white z-30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
