import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Target, Hexagon, Activity, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../api/fetchHelper';
import { useProgression } from '../hooks/useProgression';
import { useHabits } from '../hooks/useHabits';
import { useSkills } from '../hooks/useSkills';
import { useMissions } from '../hooks/useMissions';
import { formatSafeDate } from '../utils/dateUtils';
import { HunterRankBadge } from '../components/training/HunterRankBadge';
import { ActivityTimeline } from '../components/profile/ActivityTimeline';
import { ProgressionPrediction } from '../components/profile/ProgressionPrediction';
import { HunterTitlesPanel } from '../components/profile/HunterTitlesPanel';
import { AchievementCollection } from '../components/profile/AchievementCollection';

export const Profile: React.FC = () => {
  
  // Hooks for Radar Chart derivation
  const { progression } = useProgression();
  const { habits } = useHabits();
  const { skills } = useSkills();
  const { badges } = useMissions();

  const [activeTab, setActiveTab] = useState<'stats' | 'progression'>('stats');

  // Fetch Profile
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/users/profile');
      const data = await res.json();
      return data.user;
    }
  });

  // Fetch Weight History
  const weightQuery = useQuery({
    queryKey: ['weightHistory'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/weight/history');
      const data = await res.json();
      return data.history;
    }
  });

  useEffect(() => {
    // Only fetching profile data for stats
  }, [profileQuery.data]);

  if (profileQuery.isLoading || !progression) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Loading Hunter Profile...</h2>
      </div>
    );
  }

  // --- Derive Stats for Radar Chart ---
  const level = progression.level || 1;
  const strength = Math.min(100, 20 + (level * 2)); // Mocked from level
  const intelligence = Math.min(100, 10 + (skills.length * 5)); // From skills
  const endurance = Math.min(100, 15 + ((progression.currentStreak || 0) * 2)); // From streak
  const agility = Math.min(100, 25 + (habits.filter((h: any) => h.completedToday).length * 10));
  const perception = Math.min(100, 30 + ((badges?.length || 0) * 5));

  const radarData = [
    { subject: 'STR', A: strength, fullMark: 100 },
    { subject: 'INT', A: intelligence, fullMark: 100 },
    { subject: 'END', A: endurance, fullMark: 100 },
    { subject: 'AGI', A: agility, fullMark: 100 },
    { subject: 'PER', A: perception, fullMark: 100 },
  ];

  const wHistory = weightQuery.data || [];
  const chartData = [...wHistory].reverse().map((entry: any) => ({
    date: formatSafeDate(entry.date, 'MMM dd'),
    weight: entry.weight
  }));

  return (
    <div className="relative space-y-6 pb-24 md:pb-8 font-sans z-10 animate-[fade-in_0.5s_ease-out]">
      
      {/* 3D RANK CARD HEADER */}
      <div className="flex justify-end mb-4">
        <Link to="/settings" className="px-4 py-2 border border-cyan-800 bg-cyan-950/40 rounded text-cyan-400 font-mono text-[10px] uppercase tracking-widest hover:bg-cyan-900 transition-colors flex items-center gap-2">
          <Hexagon className="w-4 h-4" /> System Configuration
        </Link>
      </div>

      <motion.div 
        initial={{ y: -30, opacity: 0, rotateX: 15 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative perspective-1000"
      >
        <div className="relative hud-glass corner-brackets p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transform-style-3d hover:border-[var(--color-system-cyan)] transition-colors duration-500 group/header">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0 relative group">
              <div className="absolute inset-0 bg-cyan-400 rounded-full blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="scale-150 transform-style-3d group-hover:rotate-y-12 transition-transform duration-500">
                <HunterRankBadge level={level} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-[0.2em] uppercase text-shadow-glow">
                {profileQuery.data?.name || 'HUNTER'}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="px-3 py-1 border border-cyan-800 bg-cyan-950/40 rounded text-cyan-400 font-mono text-[10px] uppercase tracking-widest">
                  Level {level}
                </div>
                <div className="px-3 py-1 border border-cyan-800 bg-cyan-950/40 rounded text-cyan-400 font-mono text-[10px] uppercase tracking-widest">
                  {progression.activeTitle || 'Beginner Hunter'}
                </div>
                <div className="px-3 py-1 border border-purple-800 bg-purple-950/40 rounded text-purple-400 font-mono text-[10px] uppercase tracking-widest">
                  {progression.rank} Rank
                </div>
                <div className="px-3 py-1 border border-yellow-800 bg-yellow-950/40 rounded text-yellow-400 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Medal className="w-3 h-3" /> {badges?.length || 0} Badges
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-cyan-900/50">
        {[
          { id: 'stats', label: 'Hunter Stats', icon: Activity },
          { id: 'progression', label: 'Progression Log', icon: Target }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-3 rounded-t-lg text-[11px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-cyan-950/60 text-cyan-400 border-t border-l border-r border-cyan-500 shadow-[0_-5px_15px_rgba(8,145,178,0.2)]' 
                : 'text-gray-500 hover:text-cyan-300 hover:bg-white/5 border-t border-l border-r border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* RADAR CHART */}
            <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500">
              <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2">Attribute Evaluation</h2>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Real-time stat analysis</p>
              
              <div className="h-80 w-full relative z-10">
                <ResponsiveContainer width="99%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(0, 212, 255, 0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#00d4ff', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Hunter" dataKey="A" stroke="#c084fc" fill="#00d4ff" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WEIGHT HISTORY */}
            <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500">
              <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2">Physical Tracking</h2>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Mass fluctuation logs</p>

              <div className="h-80 w-full relative z-10">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="rgba(0,212,255,0.4)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="rgba(0,212,255,0.4)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" width={40} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #00d4ff', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} itemStyle={{ color: '#00d4ff' }} />
                      <Area type="monotone" dataKey="weight" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-[11px] font-mono text-cyan-900 uppercase tracking-widest">
                    Insufficient Data
                  </div>
                )}
              </div>
            </div>

            {/* PHYSICAL ATTRIBUTES */}
            <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500 lg:col-span-2">
              <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-6">Physical Attributes</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Height</div>
                  <div className="font-display text-2xl text-white">{profileQuery.data?.height || '--'} <span className="text-sm text-cyan-500">cm</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Weight</div>
                  <div className="font-display text-2xl text-white">{profileQuery.data?.weight || '--'} <span className="text-sm text-cyan-500">kg</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Body Fat</div>
                  <div className="font-display text-2xl text-white">{profileQuery.data?.bodyFatPercent || '--'} <span className="text-sm text-cyan-500">%</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Age</div>
                  <div className="font-display text-2xl text-white">{profileQuery.data?.age || '--'} <span className="text-sm text-cyan-500">yrs</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Gender</div>
                  <div className="font-mono text-sm text-white uppercase tracking-wider mt-2">{profileQuery.data?.gender || '--'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Primary Directive</div>
                  <div className="font-mono text-sm text-white uppercase tracking-wider mt-2">{profileQuery.data?.fitnessGoal ? profileQuery.data.fitnessGoal.replace('_', ' ') : '--'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Activity Level</div>
                  <div className="font-mono text-sm text-white uppercase tracking-wider mt-2">{profileQuery.data?.activityLevel ? profileQuery.data.activityLevel.replace('_', ' ') : '--'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mb-1">Experience</div>
                  <div className="font-mono text-sm text-white uppercase tracking-wider mt-2">{profileQuery.data?.experienceLevel || '--'}</div>
                </div>
              </div>
            </div>

            {/* TITLES & SKILL POINTS */}
            <div className="hud-glass corner-brackets p-6 relative overflow-hidden lg:col-span-2">
              <HunterTitlesPanel progression={progression} />
            </div>

            <AchievementCollection unlockedAchievements={(progression.unlockedAchievements || []).map((ua: any) => typeof ua === 'string' ? ua : ua.achievementId)} />
          </motion.div>
        )}

        {activeTab === 'progression' && (
          <motion.div 
            key="progression"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ProgressionPrediction />
            
            <div className="hud-glass corner-brackets p-6 relative overflow-hidden">
              <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5" /> Operational History
              </h2>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                <ActivityTimeline />
              </div>
            </div>
          </motion.div>
        )}


        </AnimatePresence>
    </div>
  );
};
