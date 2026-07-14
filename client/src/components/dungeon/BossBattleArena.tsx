import React from 'react';
import { motion } from 'framer-motion';
import { Skull, Swords } from 'lucide-react';

interface BossBattleArenaProps {
  boss: any;
  dungeon: any;
}

export const BossBattleArena: React.FC<BossBattleArenaProps> = ({ boss, dungeon }) => {
  const hpPercentage = Math.max(0, Math.min(100, (boss.currentHp / boss.totalHp) * 100));
  
  return (
    <div className="relative w-full hud-glass corner-brackets border-[var(--color-system-red)] shadow-boss overflow-hidden">
      {/* Background visual */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="p-6 relative z-10 flex flex-col items-center">
        {/* Boss Icon */}
        <motion.div 
          animate={
            boss.currentHp > 0 
              ? { y: boss.isEnraged ? [-10, 10, -10] : [-5, 5, -5] } 
              : {}
          }
          transition={{ 
            duration: boss.isEnraged ? 0.5 : 4, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="mb-4 relative"
        >
          <div className={`absolute inset-0 blur-xl rounded-full ${boss.isEnraged ? 'bg-orange-600/50 animate-pulse' : 'bg-red-600/30'}`} />
          <Skull className={`w-20 h-20 relative z-10 ${boss.isEnraged ? 'text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]' : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'}`} />
        </motion.div>

        {/* Boss Name */}
        <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-red-500 mb-2 text-center text-shadow-glow-red">
          {boss.name} {boss.isEnraged && <span className="text-orange-500 animate-pulse">(ENRAGED)</span>}
        </h2>
        <p className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-6">
          System Threat Level: {dungeon.difficulty} | Phase: {boss.phase || 1}
        </p>

        {/* HP Bar */}
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest flex items-center gap-2">
              <Swords className="w-4 h-4" /> Boss HP
            </span>
            <span className="text-sm font-display text-white">
              {boss.currentHp} / {boss.totalHp}
            </span>
          </div>
          
          <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-red-900/50 relative">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-red-700 to-red-500 relative"
            >
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />
            </motion.div>
          </div>
        </div>

        {/* Required Actions */}
        <div className="mt-8 w-full max-w-2xl hud-glass border-[var(--color-system-border)] p-4">
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3 border-b border-[var(--color-system-border)] pb-2">
            Combat Objectives
          </h3>
          <p className="text-sm text-gray-300">
            Complete missions associated with this Dungeon to deal damage. ({boss.damagePerMission} DMG per mission)
          </p>
        </div>
      </div>
    </div>
  );
};
