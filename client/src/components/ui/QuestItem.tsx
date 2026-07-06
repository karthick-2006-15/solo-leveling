import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { QuestInstance } from '../../api/missionApi';

interface QuestItemProps {
  quest: QuestInstance;
  onToggle?: (questId: string) => void;
}

export const QuestItem: React.FC<QuestItemProps> = ({ quest, onToggle }) => {
  const isCompleted = quest.completed;

  return (
    <div 
      className={`relative flex items-center gap-4 py-3 px-1 border-b border-[rgba(0,212,255,0.08)] last:border-0 transition-all duration-300 ${
        isCompleted ? 'opacity-60' : 'opacity-100'
      }`}
      onClick={() => onToggle && onToggle(quest._id)}
    >
      {/* Custom Checkbox */}
      <div 
        className={`shrink-0 w-6 h-6 rounded-[2px] border-2 flex items-center justify-center transition-all cursor-pointer ${
          isCompleted 
            ? 'border-[var(--color-system-blue)] bg-[var(--color-system-blue)] shadow-[0_0_10px_var(--color-system-blue)]' 
            : 'border-[var(--color-system-text-dim)] hover:border-[var(--color-system-blue)]'
        }`}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check size={16} className="text-black font-bold" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col justify-center overflow-hidden">
        <h4 className="font-display text-[15px] uppercase tracking-wide text-[var(--color-system-text)] truncate relative">
          <span className={isCompleted ? 'line-through decoration-[var(--color-system-blue)] decoration-2' : ''}>
            {quest.title}
          </span>
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Progress / Goal */}
          {!isCompleted && quest.targetValue && quest.targetValue > 1 && (
            <span className="font-mono text-[10px] text-[var(--color-system-text-dim)]">
              [{quest.currentProgress}/{quest.targetValue}]
            </span>
          )}
          <p className="font-body text-[12px] text-[var(--color-system-text-dim)] truncate">
            {quest.description}
          </p>
        </div>
      </div>

      {/* Right Side: Reward / Status */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.span
              key="completed-label"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display text-[11px] font-bold text-[var(--color-system-blue)] tracking-wider uppercase"
            >
              COMPLETED
            </motion.span>
          ) : (
            <motion.div key="rewards" className="flex items-center gap-1.5" exit={{ opacity: 0 }}>
              {quest.xpReward > 0 && (
                <span className="font-mono text-[11px] font-semibold text-[var(--color-system-blue)] bg-[rgba(0,212,255,0.1)] px-1.5 py-0.5 rounded-[2px] border border-[rgba(0,212,255,0.2)]">
                  +{quest.xpReward} XP
                </span>
              )}
              {quest.coinReward > 0 && (
                <span className="font-mono text-[11px] font-semibold text-[var(--color-system-gold)] bg-[rgba(245,197,24,0.1)] px-1.5 py-0.5 rounded-[2px] border border-[rgba(245,197,24,0.2)]">
                  +{quest.coinReward} 💰
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion Flash Animation */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 border border-white pointer-events-none rounded-[2px]"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </div>
  );
};
