import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Coins, Sparkles } from 'lucide-react';
import { useEvents } from '../../hooks/useRewards';

export const ActiveEventBanner: React.FC = () => {
  const { events } = useEvents();

  if (!events || events.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {events.map((event: any) => (
        <motion.div
          key={event._id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-900/40 via-orange-900/20 to-transparent border border-red-900/50 p-4"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/50 rounded-lg border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-display font-bold uppercase tracking-widest text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
                  {event.name}
                </h3>
                <p className="text-xs text-red-200/70 font-mono mt-0.5">{event.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/40 rounded-lg p-2 border border-red-900/30">
              {event.modifiers.xpMultiplier > 1 && (
                <div className="flex items-center gap-1.5 px-3 border-r border-red-900/50 last:border-0">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">XP</span>
                  <span className="font-display text-blue-400 text-lg">x{event.modifiers.xpMultiplier}</span>
                </div>
              )}
              {event.modifiers.coinMultiplier > 1 && (
                <div className="flex items-center gap-1.5 px-3 border-r border-red-900/50 last:border-0">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-display text-yellow-400 text-lg">x{event.modifiers.coinMultiplier}</span>
                </div>
              )}
              {event.modifiers.luckBonus > 0 && (
                <div className="flex items-center gap-1.5 px-3 border-r border-red-900/50 last:border-0">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-display text-purple-300 text-lg">+{event.modifiers.luckBonus}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
