import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Star, Activity } from 'lucide-react';

import { useProgression } from '../hooks/useProgression';
import { useHabits } from '../hooks/useHabits';
import { useWorkouts } from '../hooks/useWorkouts';
import { useNutrition } from '../hooks/useNutrition';
import { useSkills } from '../hooks/useSkills';
import { useMissions } from '../hooks/useMissions';
import { useAuthStore } from '../store/useAuthStore';
import { useEconomy } from '../hooks/useEconomy';
import { Link } from 'react-router-dom';

import { LevelUpModal } from '../components/ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../components/ui/AchievementToast';
import { RollingNumber } from '../components/ui/RollingNumber';
import { HunterRankBadge } from '../components/training/HunterRankBadge';
import { QuickActionsWidget } from '../components/dashboard/QuickActionsWidget';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';
import { WeeklyProgressWidget } from '../components/dashboard/WeeklyProgressWidget';
import { RecentAchievements } from '../components/dashboard/RecentAchievements';
import { MissionBoard } from '../components/missions/MissionBoard';
import { DailyLoginBanner } from '../components/dashboard/DailyLoginBanner';
import { PerfectDayWidget } from '../components/dashboard/PerfectDayWidget';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { progression, isLoading: progLoading, awardDevXP, isAwarding } = useProgression();
  const { habits, isLoading: habLoading } = useHabits();
  const { isLoading: workLoading } = useWorkouts();
  const { logs: foodLogs, isLoading: nutLoading } = useNutrition();
  const { skills, isLoading: skillsLoading } = useSkills();
  const { quests, boss, questsLoading, bossLoading } = useMissions();
  const { timeline } = useEconomy();

  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  if (progLoading || habLoading || workLoading || nutLoading || skillsLoading || questsLoading || bossLoading || !progression) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-[3px] border-cyan-900 border-t-cyan-400 rounded-full animate-spin" />
          <div className="absolute inset-2 border-[3px] border-cyan-900 border-b-cyan-500 rounded-full animate-[spin_1.5s_reverse_infinite]" />
        </div>
        <h2 className="mt-8 font-display text-xl text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Initializing HUD...</h2>
      </div>
    );
  }

  const { level, currentXP, xpRequired, totalXP, coins, currentStreak, unlockedAchievements } = progression;
  const progressPercent = Math.min(100, Math.max(0, (currentXP / xpRequired) * 100));

  const dailyCalories = foodLogs.reduce((acc: number, log: any) => acc + log.nutrients.calories, 0);
  const habitsCompleted = habits.filter((h: any) => h.completedToday).length;
  const habitsActive = habits.filter((h: any) => h.active).length;

  const allQuestsCompleted = quests ? quests.every((q: any) => q.status === 'completed') : false;
  
  // Checking today's perfect day claim
  const todayStr = new Date().toDateString();
  const hasClaimedPerfectDay = timeline ? timeline.some((log: any) => 
    log.source === 'perfect_day' && new Date(log.createdAt).toDateString() === todayStr
  ) : false;

  const handleDevAward = async (amount: number) => {
    try {
      const result = await awardDevXP({ source: 'dev_test', amount });
      if (result.leveledUp) {
        setLevelUpData({ isOpen: true, level: result.newLevel, rank: result.newRank, rankChanged: result.rankChanged });
      }
      if (result.newAchievements && result.newAchievements.length > 0) {
        setToasts(prev => [...prev, ...result.newAchievements.map((a: any) => ({ id: Math.random().toString(36).substring(2), title: a.name, description: `Unlocked: ${a.name}`, icon: a.icon }))]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to award XP. Check console.');
    }
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="relative space-y-6 pb-24 md:pb-8 font-sans z-10 animate-[fade-in_0.5s_ease-out]">
      <AchievementToast toasts={toasts} removeToast={removeToast} />
      <LevelUpModal isOpen={levelUpData.isOpen} onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })} newLevel={levelUpData.level} newRank={levelUpData.rank} rankChanged={levelUpData.rankChanged} />

      <DailyLoginBanner />

      {/* TOP HEADER STATUS */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="relative bg-black/60 border border-cyan-900/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-50" />
        <div className="absolute inset-0 bg-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <HunterRankBadge level={level} />

          <div className="flex-1 w-full text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-[0.2em] uppercase text-shadow-glow">
                {user?.name || 'HUNTER'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-cyan-400 text-xs tracking-widest uppercase border border-cyan-900/50 bg-cyan-950/30 px-3 py-1 rounded-full">
                  {progression.activeTitle || 'Beginner Hunter'}
                </span>
                <p className="font-mono text-cyan-500 text-[11px] tracking-[0.4em] uppercase opacity-80">
                  System Synchronized
                </p>
              </div>
            </div>

            {/* Glowing XP Bar */}
            <div className="relative pt-4">
              <div className="flex justify-between items-end mb-2 font-mono uppercase tracking-widest text-[10px]">
                <span className="text-cyan-400">LVL {level}</span>
                <span className="text-gray-500">
                  <RollingNumber value={currentXP} /> / {xpRequired} XP
                </span>
              </div>
              <div className="w-full h-1.5 bg-black border border-cyan-900/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-900 via-cyan-500 to-cyan-400 shadow-[0_0_15px_#00d4ff]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-cyan-900/30">
           <Link to="/economy" className="text-center group block cursor-pointer">
             <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1 group-hover:text-cyan-400 transition-colors">Total Credits</div>
             <div className="font-display text-xl text-cyan-100 group-hover:text-white transition-colors"><RollingNumber value={coins} /> C</div>
           </Link>
           <div className="text-center border-l border-cyan-900/30">
             <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Consecutive Days</div>
             <div className="font-display text-xl text-cyan-100"><RollingNumber value={currentStreak} /></div>
           </div>
           <div className="text-center border-l border-cyan-900/30">
             <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Nutrition</div>
             <div className="font-display text-xl text-cyan-100"><RollingNumber value={dailyCalories} /> kcal</div>
           </div>
           <div className="text-center border-l border-cyan-900/30">
             <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Missions</div>
             <div className="font-display text-xl text-cyan-100">{habitsCompleted}/{habitsActive}</div>
           </div>
        </div>
      </motion.div>

      {/* FLOATING STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: totalXP, icon: Star, color: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.15)]', border: 'border-yellow-900/30' },
          { label: 'Credits', value: coins, icon: Zap, color: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.15)]', border: 'border-purple-900/30' },
          { label: 'Streak', value: currentStreak, icon: Activity, color: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(248,113,113,0.15)]', border: 'border-red-900/30', format: (v: number) => `${v} Days` },
          { label: 'Unlocks', value: unlockedAchievements.length, icon: Shield, color: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]', border: 'border-cyan-900/30' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, type: 'spring' }}
            key={stat.label} 
            className={`relative bg-black/50 border ${stat.border} rounded-xl p-5 flex flex-col items-center justify-center gap-3 backdrop-blur-md overflow-hidden group hover:${stat.border.replace('/30', '/80')} transition-colors duration-300 ${stat.glow}`}
          >
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none opacity-50`} />
            <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
            <div className="text-center">
              <div className={`font-mono text-2xl font-bold ${stat.color} text-shadow-glow tracking-wider`}>
                <RollingNumber value={stat.value} format={stat.format} />
              </div>
              <div className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MIDDLE SECTION: VITAL SYSTEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Adaptive Quests Summary */}
        <div className="lg:col-span-2">
          <MissionBoard />
        </div>

        {/* System Vitals */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" /> System Vitals
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">
                <span>Energy Intake</span>
                <span className="text-cyan-400">{Math.round(dailyCalories)} KCAL</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden border border-cyan-900/30">
                <div className="h-full bg-cyan-500 shadow-[0_0_10px_#00d4ff]" style={{ width: `${Math.min(100, (dailyCalories / 2500) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">
                <span>Combat Readiness</span>
                <span className="text-red-400">OPTIMAL</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden border border-red-900/30">
                <div className="h-full bg-red-500 shadow-[0_0_10px_#ef4444] w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">
                <span>Neural Capacity</span>
                <span className="text-purple-400">{skills.length} SKILLS</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden border border-purple-900/30">
                <div className="h-full bg-purple-500 shadow-[0_0_10px_#c084fc]" style={{ width: `${Math.min(100, skills.length * 10)}%` }} />
              </div>
            </div>
          </div>

          {import.meta.env.DEV && (
             <div className="mt-8 pt-6 border-t border-cyan-900/30 text-center">
               <button 
                 onClick={() => handleDevAward(500)}
                 disabled={isAwarding}
                 className="px-4 py-2 border border-red-900 text-red-500 text-[9px] font-mono uppercase tracking-widest hover:bg-red-950/30 rounded transition-colors"
               >
                 [DEBUG] Trigger Override (+500 XP)
               </button>
             </div>
          )}
        </motion.div>
      </div>

      {/* BOSS QUEST SECTION */}
      {boss && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-black/80 border border-red-900/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group shadow-[0_0_30px_rgba(220,38,38,0.15)] mt-6"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-50" />
          <h2 className="font-display uppercase tracking-[0.2em] text-red-500 mb-6 flex items-center gap-2 text-shadow-glow">
            <Target className="w-5 h-5" /> Weekly Boss Fight
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-4 w-full">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">{boss.name}</h3>
              <p className="font-mono text-[12px] text-gray-400 uppercase tracking-widest">{boss.description}</p>
              
              <div className="space-y-4 mt-4">
                {boss.requirements?.map((req: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-red-400 uppercase tracking-widest">
                      <span>{req.label}</span>
                      <span>{req.currentProgress} / {req.target}</span>
                    </div>
                    <div className="h-2 bg-black rounded-full overflow-hidden border border-red-900/30 relative">
                      <div className="h-full bg-red-600 shadow-[0_0_10px_#dc2626] absolute right-0 transition-all duration-1000" style={{ width: `${Math.min(100, (req.currentProgress / req.target) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-auto bg-red-950/20 border border-red-900/50 p-4 rounded-lg text-center min-w-[200px]">
              <div className="text-[10px] font-mono text-red-500 uppercase tracking-widest mb-2">Status</div>
              <div className="font-mono text-2xl font-bold text-yellow-400 text-shadow-glow flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" /> {boss.defeated ? 'DEFEATED' : 'ACTIVE'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* RESTORED WIDGETS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyProgressWidget />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionsWidget />
            <CalendarWidget />
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <RecentAchievements achievements={unlockedAchievements} />
          <PerfectDayWidget 
            missionsCompleted={allQuestsCompleted} 
            recoveryPassed={true /* We need recovery score here, mock or fetch */} 
            hasClaimed={hasClaimedPerfectDay} 
          />
        </div>
      </div>
    </div>
  );
};
