import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStatusWindow } from '../hooks/useStatusWindow';
import { 
  Shield, Brain, Heart, Activity, Zap, 
  Flame, Wind, Eye, Sparkles, Book, Target, 
  Dumbbell, Droplets, X
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

const StatusWindow: React.FC = () => {
  const { data: statusData, isLoading, error } = useStatusWindow();
  const [showStatus, setShowStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial opening animation delay
    const timer = setTimeout(() => setShowStatus(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !statusData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-cyan-500 font-mono animate-pulse tracking-widest uppercase text-xl">
          Loading System Data...
        </div>
        <div className="mt-4 w-64 h-1 bg-cyan-900/30 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-500"
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-8 font-mono text-center">
        Error loading status window: {(error as Error).message}
      </div>
    );
  }

  const { status, vitals, primaryAttributes, secondaryStats, powerScore, shadows, buffs, debuffs, records } = statusData;

  const getRankColor = (rank: string) => {
    if (rank.includes('S')) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]';
    if (rank.includes('A')) return 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]';
    if (rank.includes('B')) return 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]';
    return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]';
  };

  const statConfig = [
    { label: 'STR', value: primaryAttributes.STR, icon: Dumbbell, color: 'text-red-500' },
    { label: 'AGI', value: primaryAttributes.AGI, icon: Wind, color: 'text-green-400' },
    { label: 'END', value: primaryAttributes.END, icon: Heart, color: 'text-orange-500' },
    { label: 'INT', value: primaryAttributes.INT, icon: Brain, color: 'text-blue-400' },
    { label: 'WIS', value: primaryAttributes.WIS, icon: Book, color: 'text-purple-400' },
    { label: 'PER', value: primaryAttributes.PER, icon: Eye, color: 'text-cyan-400' },
    { label: 'CHA', value: primaryAttributes.CHA, icon: Sparkles, color: 'text-yellow-400' },
    { label: 'MNT', value: primaryAttributes.MNT, icon: Zap, color: 'text-indigo-400' },
    { label: 'FOC', value: primaryAttributes.FOC, icon: Target, color: 'text-teal-400' },
    { label: 'DIS', value: primaryAttributes.DIS, icon: Shield, color: 'text-slate-400' },
    { label: 'REC', value: primaryAttributes.REC, icon: Activity, color: 'text-emerald-400' },
    { label: 'WIL', value: primaryAttributes.WIL, icon: Flame, color: 'text-orange-600' },
  ];

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="relative max-w-5xl mx-auto p-1 font-mono text-cyan-50 selection:bg-cyan-900 overflow-x-hidden"
        >
          {/* Main Holographic Container */}
          <div className="relative bg-[#0a0f1a]/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden">
            
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            
            {/* Scanning Line */}
            <motion.div 
              className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.8)] pointer-events-none z-50"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Header / Identity Panel */}
            <div className="relative z-10 p-4 md:p-6 lg:p-10 border-b border-cyan-500/30 bg-gradient-to-b from-cyan-900/20 to-transparent flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              
              <div className="flex items-center gap-4 md:gap-6">
                {/* Profile Emblem */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-400/40 transition-colors" />
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.5)] flex items-center justify-center bg-[#05070a] relative z-10 overflow-hidden">
                    <Shield className="w-12 h-12 text-cyan-400 opacity-50" />
                    <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-cyan-500/30 to-transparent" />
                  </div>
                  {/* Level Badge overlay */}
                  <div className="absolute -bottom-2 -right-2 bg-cyan-950 border border-cyan-400 rounded-lg px-3 py-1 z-20 shadow-[0_0_10px_rgba(0,229,255,0.5)]">
                    <span className="text-xs text-cyan-500 mr-1">LV</span>
                    <span className="text-lg font-bold text-cyan-50">{status.level}</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold tracking-wider md:tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] uppercase">
                    STATUS
                  </h1>
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-600 uppercase text-xs tracking-wider w-16">CLASS</span>
                      <span className="text-cyan-300 font-bold tracking-widest uppercase">{status.class}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-600 uppercase text-xs tracking-wider w-16">TITLE</span>
                      <span className="text-amber-400 font-bold tracking-widest uppercase drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">{status.title}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end text-center md:text-right w-full md:w-auto">
                <div className="text-cyan-600 uppercase text-xs tracking-wider mb-1">CURRENT RANK</div>
                <div className={clsx("text-3xl md:text-4xl lg:text-6xl font-display font-black uppercase tracking-wider md:tracking-widest", getRankColor(status.rank))}>
                  {status.rank}
                </div>
                <div className="mt-4 bg-cyan-950/50 border border-cyan-900 rounded-full px-4 py-1 flex items-center gap-2">
                  <span className="text-cyan-500 text-xs">PWR</span>
                  <span className="text-cyan-100 font-bold">{powerScore.overallPower.toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Main Content Grid */}
            <div className="relative z-10 p-4 md:p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              
              {/* Left Column: Vitals & Secondary */}
              <div className="space-y-8 lg:col-span-1">
                
                {/* Vitals Panel */}
                <div className="bg-[#05070a]/80 border border-cyan-900/50 rounded-lg p-4 md:p-5">
                  <h3 className="text-cyan-500 uppercase tracking-widest text-sm mb-4 border-b border-cyan-900/50 pb-2">Vitals</h3>
                  <div className="space-y-4">
                    <VitalBar label="HP" value={vitals.hp} color="bg-red-500" glow="shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    <VitalBar label="MP" value={vitals.mp} color="bg-blue-500" glow="shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <VitalBar label="Energy" value={vitals.energy} color="bg-yellow-500" glow="shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                    <VitalBar label="Fatigue" value={vitals.fatigue} color="bg-purple-500" glow="shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    <VitalBar label="Dopamine" value={statusData.innerMonarch?.attributes?.dopamineBalance ?? 100} color="bg-cyan-400" glow="shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="bg-[#05070a]/80 border border-cyan-900/50 rounded-lg p-4 md:p-5">
                  <h3 className="text-cyan-500 uppercase tracking-widest text-sm mb-4 border-b border-cyan-900/50 pb-2">Daily Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <StatItem icon={<Dumbbell className="w-4 h-4 text-slate-400" />} label="Training" value={`${secondaryStats.workoutHoursToday}h`} />
                    <StatItem icon={<Book className="w-4 h-4 text-slate-400" />} label="Study" value={`${secondaryStats.studyHoursToday}h`} />
                    <StatItem icon={<Flame className="w-4 h-4 text-slate-400" />} label="Calories" value={`${secondaryStats.caloriesBurned}`} />
                    <StatItem icon={<Droplets className="w-4 h-4 text-slate-400" />} label="Water" value={`${secondaryStats.waterIntakeMl}ml`} />
                  </div>
                </div>

                {/* Buffs & Debuffs */}
                <div className="bg-[#05070a]/80 border border-cyan-900/50 rounded-lg p-4 md:p-5 space-y-4">
                  <div>
                    <h3 className="text-emerald-500 uppercase tracking-widest text-sm mb-2">Active Buffs</h3>
                    {buffs.length === 0 ? (
                      <div className="text-slate-600 text-xs">None active</div>
                    ) : (
                      <div className="space-y-2">
                        {buffs.map((b: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-emerald-400">{b.name}</span>
                            <span className="text-emerald-200">{b.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-red-500 uppercase tracking-widest text-sm mb-2">Active Debuffs</h3>
                    {debuffs.length === 0 ? (
                      <div className="text-slate-600 text-xs">None active</div>
                    ) : (
                      <div className="space-y-2">
                        {debuffs.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-red-400">{d.name}</span>
                            <span className="text-red-200">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Primary Stats & Systems */}
              <div className="space-y-8 lg:col-span-2">
                
                {/* Primary Attributes Grid */}
                <div className="bg-[#05070a]/80 border border-cyan-900/50 rounded-lg p-4 md:p-5">
                  <h3 className="text-cyan-500 uppercase tracking-widest text-sm mb-6 border-b border-cyan-900/50 pb-2 flex justify-between">
                    <span>Primary Attributes</span>
                    <span className="text-cyan-700">Available Points: 0</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                    {statConfig.map((stat, i) => (
                      <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <stat.icon className={clsx("w-4 h-4", stat.color)} />
                            <span className="text-cyan-200 uppercase tracking-wider text-xs sm:text-sm">{stat.label}</span>
                          </div>
                          <span className="font-bold text-base sm:text-lg text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                            {stat.value}
                          </span>
                        </div>
                        {/* Mini progress bar to next tier */}
                        <div className="h-1 bg-cyan-950 rounded-full overflow-hidden mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                          <div 
                            className={clsx("h-full", stat.color.replace('text-', 'bg-'))} 
                            style={{ width: `${(stat.value % 10) * 10}%` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                  {/* Shadow Status */}
                  <div className="bg-[#05070a]/80 border border-purple-900/50 rounded-lg p-4 md:p-5">
                    <h3 className="text-purple-500 uppercase tracking-widest text-sm mb-4 border-b border-purple-900/50 pb-2">Shadow Army</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-300/70 text-sm">Total Shadows</span>
                        <span className="text-purple-400 font-bold">{shadows.armySize}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-300/70 text-sm">Loyalty Rating</span>
                        <span className="text-purple-400 font-bold">{shadows.loyalty}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-300/70 text-sm">Shadow Resistance</span>
                        <span className="text-purple-400 font-bold">{powerScore.shadowResistance}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Hunter Records */}
                  <div className="bg-[#05070a]/80 border border-amber-900/50 rounded-lg p-4 md:p-5">
                    <h3 className="text-amber-500 uppercase tracking-widest text-sm mb-4 border-b border-amber-900/50 pb-2">Hunter Records</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-300/70 text-sm">Highest Streak</span>
                        <span className="text-amber-400 font-bold">{records.highestStreak} Days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-300/70 text-sm">Total Missions</span>
                        <span className="text-amber-400 font-bold">{records.totalClaims}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-300/70 text-sm">Lifetime XP</span>
                        <span className="text-amber-400 font-bold">{records.lifetimeXP.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom ARIA Interface */}
            <div className="relative z-10 border-t border-cyan-500/30 bg-cyan-950/30 p-3 md:p-4 px-4 md:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-400/80 text-xs tracking-widest uppercase">System synchronized. All vitals normal.</span>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="text-cyan-500 hover:text-cyan-300 uppercase tracking-widest text-xs flex items-center gap-2 transition-colors min-h-[44px] px-3"
              >
                <X className="w-4 h-4" />
                Close Panel
              </button>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const VitalBar = ({ label, value, color, glow }: { label: string, value: number, color: string, glow: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-cyan-400 uppercase tracking-wider">{label}</span>
      <span className="text-cyan-100">{value}/100</span>
    </div>
    <div className="h-2.5 md:h-2 w-full bg-cyan-950 rounded-full overflow-hidden border border-cyan-900/50">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        className={clsx("h-full rounded-full", color, glow)}
      />
    </div>
  </div>
);

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-center gap-2 md:gap-3 bg-cyan-950/30 p-2 md:p-2.5 rounded border border-cyan-900/30">
    {icon}
    <div>
      <div className="text-[10px] uppercase tracking-wider text-cyan-600">{label}</div>
      <div className="text-sm font-bold text-cyan-100">{value}</div>
    </div>
  </div>
);

export default StatusWindow;
