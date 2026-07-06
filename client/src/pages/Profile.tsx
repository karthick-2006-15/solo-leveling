import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Save, Target, Hexagon, Activity, Medal } from 'lucide-react';

import { fetchWithAuth } from '../api/fetchHelper';
import { useAuthStore } from '../store/useAuthStore';
import { useProgression } from '../hooks/useProgression';
import { useHabits } from '../hooks/useHabits';
import { useSkills } from '../hooks/useSkills';
import { useMissions } from '../hooks/useMissions';
import { formatSafeDate } from '../utils/dateUtils';
import { HunterRankBadge } from '../components/training/HunterRankBadge';

export const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  
  // Hooks for Radar Chart derivation
  const { progression } = useProgression();
  const { habits } = useHabits();
  const { skills } = useSkills();
  const { badges } = useMissions();

  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', height: '', weight: '', bodyFatPercent: '',
    fitnessGoal: 'maintain', activityLevel: 'sedentary', experienceLevel: 'beginner',
    dailyCalorieGoal: '', dailyProteinGoal: '', dailyWaterGoalLiters: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');

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
    if (profileQuery.data) {
      setFormData(prev => ({
        ...prev,
        ...Object.keys(prev).reduce((acc: any, key) => {
          acc[key] = profileQuery.data[key] || prev[key as keyof typeof prev];
          return acc;
        }, {})
      }));
    }
  }, [profileQuery.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveMessage('');
    try {
      const res = await fetchWithAuth('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.user?.name) {
        updateUser({ name: data.user.name });
      }
      
      if (formData.weight) {
        await fetchWithAuth('/api/weight', {
          method: 'POST',
          body: JSON.stringify({ weight: Number(formData.weight) })
        });
        queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
      }

      setSaveMessage('PROFILE SYNCHRONIZED');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err: any) {
      setSaveMessage(`ERROR: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <motion.div 
        initial={{ y: -30, opacity: 0, rotateX: 15 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative perspective-1000"
      >
        <div className="relative bg-gradient-to-br from-black via-cyan-950/20 to-black border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transform-style-3d hover:border-cyan-400 transition-colors duration-500">
          
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
          { id: 'settings', label: 'System Configuration', icon: Target }
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
            <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500 transition-colors duration-500">
              <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2">Attribute Evaluation</h2>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Real-time stat analysis</p>
              
              <div className="h-80 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
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
            <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500 transition-colors duration-500">
              <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2">Physical Tracking</h2>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Mass fluctuation logs</p>

              <div className="h-80 w-full relative z-10">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
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
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative"
          >
            <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-8 flex items-center gap-2">
              <Hexagon className="w-5 h-5" /> Profile Parameters
            </h2>

            <form onSubmit={handleSave} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* BIO PARAMS */}
                <div className="space-y-6">
                  <h3 className="font-mono text-[10px] text-cyan-700 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Biometrics</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Designation</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">HGT (cm)</label>
                        <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">WGT (kg)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">FAT (%)</label>
                        <input type="number" name="bodyFatPercent" value={formData.bodyFatPercent} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMBAT PARAMS */}
                <div className="space-y-6">
                  <h3 className="font-mono text-[10px] text-cyan-700 uppercase tracking-[0.3em] border-b border-cyan-900/50 pb-2">Combat Directives</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Primary Objective</label>
                      <select name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                        <option value="lose_weight">Lose Weight</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain_muscle">Gain Muscle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Activity Level</label>
                      <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                        <option value="sedentary">Sedentary (Office job, little exercise)</option>
                        <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                        <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                        <option value="very_active">Very Active (6-7 days/week)</option>
                        <option value="extra_active">Extra Active (Physical job + training)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Rank Assessment</label>
                      <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors appearance-none">
                        <option value="beginner">Beginner (E-Rank)</option>
                        <option value="intermediate">Intermediate (C-Rank)</option>
                        <option value="advanced">Advanced (A-Rank)</option>
                        <option value="expert">Expert (S-Rank)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-8 border-t border-cyan-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                {saveMessage && (
                  <div className={`font-mono text-[10px] tracking-widest uppercase ${saveMessage.includes('ERROR') ? 'text-red-500' : 'text-green-400 shadow-[0_0_10px_#4ade80] px-3 py-1 border border-green-900 bg-green-950/30 rounded'}`}>
                    {saveMessage}
                  </div>
                )}
                <div className="flex-1" />
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {isSubmitting ? 'SYNCHRONIZING...' : 'SAVE CONFIGURATION'}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
