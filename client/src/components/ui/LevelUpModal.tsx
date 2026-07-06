import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from './PrimaryButton';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newRank?: string;
  rankChanged?: boolean;
}

const levelUpParticles = Array.from({ length: 20 }).map(() => ({
  scale: Math.random() * 2 + 1,
  x: (Math.random() - 0.5) * 400,
  y: (Math.random() - 0.5) * 400,
  duration: 0.8 + Math.random() * 0.5
}));

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ 
  isOpen, 
  onClose, 
  newLevel, 
  newRank, 
  rankChanged 
}) => {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgba(0,0,0,0.85)] backdrop-blur-md"
            onClick={onClose}
          />

          {/* Screen Shake Wrapper */}
          <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0], y: [-5, 5, -5, 5, -2, 2, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Particle Bursts */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              {levelUpParticles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[var(--color-system-blue)] rounded-full"
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: p.scale,
                    x: p.x,
                    y: p.y
                  }}
                  transition={{ duration: p.duration, ease: 'easeOut' }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="relative z-10 overflow-hidden bg-black border border-[rgba(0,212,255,0.3)] shadow-[0_0_40px_rgba(0,212,255,0.2)] p-1 text-center"
              style={{
                clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
              }}
            >
              {/* Inner content wrapper for background lines */}
              <div 
                className="w-full h-full bg-[var(--color-system-dark)] p-8 relative"
                style={{
                  clipPath: 'polygon(19px 0, 100% 0, 100% calc(100% - 19px), calc(100% - 19px) 100%, 0 100%, 0 19px)'
                }}
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                />

                <motion.div
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-[12px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-[0.3em] mb-2">
                    System Alert
                  </h2>
                  <h3 className="text-[42px] font-display font-bold text-[var(--color-system-blue)] uppercase tracking-wider leading-none drop-shadow-[0_0_15px_rgba(0,212,255,0.6)]">
                    Level Up
                  </h3>
                </motion.div>
                
                <div className="my-8 relative z-10 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="relative flex items-center justify-center w-32 h-32 rounded-full border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)] shadow-[inset_0_0_20px_rgba(0,212,255,0.1)]"
                  >
                    <div className="absolute inset-[-10px] rounded-full border-t border-[var(--color-system-blue)] opacity-50 animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-[-20px] rounded-full border-b border-[var(--color-system-blue)] opacity-30 animate-[spin_4s_linear_infinite_reverse]" />
                    
                    <span className="text-[64px] font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
                      {newLevel}
                    </span>
                  </motion.div>
                </div>

                {rankChanged && newRank && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
                    className="mt-6 mb-8 py-3 px-6 bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.3)] shadow-[inset_0_0_15px_rgba(168,85,247,0.1)] relative z-10"
                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                  >
                    <h4 className="text-[10px] font-mono text-[var(--color-system-text-dim)] uppercase tracking-widest mb-1">Rank Up</h4>
                    <p className="text-[24px] font-display font-bold text-[var(--color-system-violet)] tracking-wider drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                      {newRank}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8"
                >
                  <PrimaryButton onClick={onClose} fullWidth variant="ghost">
                    CONFIRM
                  </PrimaryButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
