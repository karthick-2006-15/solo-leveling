import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAchievements, type Achievement } from '../api/progressionApi';
import { Trophy, Lock, Star, Sparkles } from 'lucide-react';
import { formatSafeDate } from '../utils/dateUtils';
import { RollingNumber } from '../components/ui/RollingNumber';

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements()
      .then(setAchievements)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-yellow-900 border-t-yellow-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-yellow-500 uppercase tracking-[0.3em] animate-pulse">Syncing Hall of Fame...</h2>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0;

  return (
    <div className="relative space-y-12 pb-24 md:pb-8 font-sans z-10 animate-[fade-in_0.5s_ease-out]">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative bg-gradient-to-b from-yellow-950/20 to-black/60 border border-yellow-900/50 rounded-3xl p-6 md:p-10 lg:p-12 text-center overflow-hidden backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-yellow-950/50 border border-yellow-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-6 relative group cursor-default"
          >
            <div className="absolute inset-0 rounded-full border border-yellow-400 animate-[spin_4s_linear_infinite] opacity-50 border-dashed" />
            <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_#eab308] group-hover:scale-110 transition-transform duration-300" />
          </motion.div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 tracking-[0.2em] md:tracking-[0.3em] uppercase text-shadow-glow mb-4">
            Hall of Records
          </h1>
          
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-yellow-500">
            <span><RollingNumber value={unlockedCount} /> UNLOCKED</span>
            <span className="w-1 h-1 rounded-full bg-yellow-700" />
            <span className="text-gray-500">{achievements.length - unlockedCount} CLASSIFIED</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xl mt-8">
            <div className="relative w-full h-2 bg-black border border-yellow-900/50 rounded-full overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, type: 'spring', delay: 0.5 }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-900 via-yellow-500 to-yellow-300 shadow-[0_0_20px_#eab308]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
        <AnimatePresence>
          {achievements.map((achievement, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={achievement.id}
              className={`relative overflow-hidden rounded-2xl p-4 md:p-6 transition-all duration-500 group ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-yellow-950/40 to-black/80 border border-yellow-500/30 hover:border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.05)] hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]' 
                  : 'bg-black/40 border border-gray-900/50 opacity-60 grayscale'
              }`}
            >
              {/* Background Glow */}
              {achievement.unlocked && (
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-[40px] group-hover:bg-yellow-500/20 transition-colors duration-500" />
              )}
              
              <div className="relative z-10 flex items-start gap-3 md:gap-5">
                {/* Icon Container */}
                <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border ${
                  achievement.unlocked 
                    ? 'bg-yellow-950/50 border-yellow-500/50 shadow-[inset_0_0_15px_rgba(234,179,8,0.3)]' 
                    : 'bg-gray-900 border-gray-800'
                }`}>
                  {achievement.unlocked ? (
                    <span className="text-3xl drop-shadow-[0_0_10px_#eab308] group-hover:scale-110 transition-transform duration-300">
                      {achievement.icon || <Star className="w-8 h-8 text-yellow-400" />}
                    </span>
                  ) : (
                    <Lock className="w-6 h-6 text-gray-700" />
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className={`font-display text-lg uppercase tracking-wider mb-1 ${achievement.unlocked ? 'text-yellow-400 text-shadow-glow' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-xs font-mono text-gray-400 leading-relaxed opacity-80">
                    {achievement.description}
                  </p>
                  
                  {achievement.unlocked && (
                    <div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-950/30 border border-yellow-900/50">
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                      <span className="text-[9px] text-yellow-500/80 font-mono uppercase tracking-widest">
                        UNLOCKED: {formatSafeDate(achievement.unlockedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edge highlight */}
              {achievement.unlocked && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-500/0 via-yellow-500 to-yellow-500/0 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
