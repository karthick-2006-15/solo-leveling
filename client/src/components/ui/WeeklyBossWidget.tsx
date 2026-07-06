import React from 'react';
import { SystemWindow } from './SystemWindow';
import { ManaBar } from './ManaBar';
import type { WeeklyBossInstance } from '../../api/missionApi';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  boss: WeeklyBossInstance | null;
}

const particleOffsets = Array.from({ length: 12 }).map(() => ({
  x: (Math.random() - 0.5) * 200,
  y: (Math.random() - 0.5) * 200
}));

export const WeeklyBossWidget: React.FC<Props> = ({ boss }) => {
  if (!boss) return null;

  return (
    <SystemWindow variant="boss" title="WEEKLY DUNGEON" className="relative overflow-hidden">
      <AnimatePresence>
        {boss.defeated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(0,0,0,0.85)] backdrop-blur-md"
          >
            {/* Defeated Particle Burst */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {particleOffsets.map((offset, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-[var(--color-system-green)] rounded-full"
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 3,
                    x: offset.x,
                    y: offset.y
                  }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              ))}
            </div>
            
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-[32px] font-display font-bold text-[var(--color-system-green)] uppercase tracking-[0.2em] drop-shadow-[0_0_20px_var(--color-system-green)]">
                THREAT ELIMINATED
              </h2>
              <p className="font-mono text-[12px] text-white/70 mt-2">BOSS DEFEATED</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`transition-all duration-700 ${boss.defeated ? 'opacity-30 grayscale blur-[2px]' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
          <div>
            <h3 className="text-[28px] font-display font-bold text-[var(--color-system-red)] uppercase leading-none drop-shadow-sm">
              {boss.name || 'Unknown Boss'}
            </h3>
            {boss.description && (
              <p className="font-body text-[13px] text-[var(--color-system-text-dim)] italic mt-2 border-l-2 border-[var(--color-system-red)] pl-3 bg-[linear-gradient(90deg,rgba(255,51,102,0.1),transparent)] py-1">
                "{boss.description}"
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {boss.requirements.map((req, idx) => {
            const percent = Math.min(100, Math.max(0, (req.currentProgress / req.target) * 100));
            return (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-display text-[12px] uppercase text-[var(--color-system-text)] tracking-wider">
                    {req.label}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--color-system-red)] font-semibold">
                    [{req.currentProgress}/{req.target}]
                  </span>
                </div>
                <ManaBar 
                  value={percent} 
                  variant="red" 
                  size="sm" 
                  animated={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </SystemWindow>
  );
};
