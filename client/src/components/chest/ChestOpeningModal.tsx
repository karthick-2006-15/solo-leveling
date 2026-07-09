import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useSystemSound } from '../../hooks/useSystemSound';
import { rarityConfig, getIcon } from '../../utils/inventoryUtils';

interface ChestOpeningModalProps {
  isOpen: boolean;
  chestName: string;
  result: {
    item: any;
    isDuplicate: boolean;
    compensation?: any;
  } | null;
  onClose: () => void;
}

export const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({ isOpen, chestName, result, onClose }) => {
  const { play } = useSystemSound();
  const [phase, setPhase] = useState<'shaking' | 'exploding' | 'revealed'>('shaking');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setPhase('shaking'), 0);
      play('click'); // Or a heavy rumbling sound if available
      
      const timer1 = setTimeout(() => {
        setPhase('exploding');
        play('levelUp'); // Explosion/Reveal sound
      }, 2000);

      const timer2 = setTimeout(() => {
        setPhase('revealed');
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, play]);

  if (!isOpen) return null;

  const getRarityGlow = (rarity: string) => {
    if (!rarity) return 'shadow-gray-500';
    return rarityConfig[rarity]?.shadow.replace('hover:', '') || 'shadow-gray-500';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {phase === 'shaking' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
              y: [0, -10, 0, 10, 0, -5, 0, 0, 0]
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="relative z-10 text-center flex flex-col items-center"
          >
            <div className="w-32 h-32 bg-gray-900 rounded-2xl border border-gray-600 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
               {/* Placeholder for Chest Graphic */}
               <Sparkles className="w-16 h-16 text-gray-500 animate-pulse" />
            </div>
            <h2 className="mt-6 text-xl font-display uppercase tracking-widest text-gray-400">
              Opening {chestName}...
            </h2>
          </motion.div>
        )}

        {phase === 'exploding' && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 2, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.5 }}
            className="absolute z-10 w-full h-full flex items-center justify-center"
          >
            <div className={`w-full h-full bg-white blur-3xl opacity-50`} />
          </motion.div>
        )}

        {phase === 'revealed' && result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative z-20 w-full max-w-sm flex flex-col items-center"
          >
            <div className="absolute top-0 right-0 z-50 p-2 cursor-pointer bg-black/50 rounded-full hover:bg-gray-800" onClick={onClose}>
              <X className="w-6 h-6 text-gray-300" />
            </div>

            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-display font-bold uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              >
                Reward Attained
              </motion.h2>
            </div>

            <motion.div 
              initial={{ scale: 0.8, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={`relative w-full aspect-square rounded-2xl border ${rarityConfig[result.item.rarity]?.border} ${rarityConfig[result.item.rarity]?.bg} flex flex-col items-center justify-center p-6 ${getRarityGlow(result.item.rarity)}`}
            >
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none rounded-2xl" />
              
              <div className={`p-6 rounded-full bg-black/50 border ${rarityConfig[result.item.rarity]?.border} ${rarityConfig[result.item.rarity]?.color} mb-6 drop-shadow-[0_0_20px_currentColor]`}>
                {getIcon(result.item.type)}
              </div>

              <h3 className={`text-2xl font-bold font-display uppercase tracking-widest text-center ${rarityConfig[result.item.rarity]?.color} text-shadow-glow`}>
                {result.item.name}
              </h3>
              
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase border ${rarityConfig[result.item.rarity]?.border} ${rarityConfig[result.item.rarity]?.color} bg-black/50`}>
                {result.item.rarity}
              </span>
            </motion.div>

            {result.isDuplicate && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 w-full bg-black/60 border border-yellow-900/50 rounded-xl p-4 text-center"
              >
                <p className="text-yellow-500 font-mono text-sm uppercase tracking-widest mb-1">Duplicate Converted</p>
                <p className="text-yellow-300 font-bold font-display text-lg">+{result.compensation?.amount} Coins</p>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-white text-black font-display font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors"
            >
              Accept Reward
            </motion.button>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
