import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDSA } from '../hooks/useDSA';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Code2, Crosshair, AlertCircle, Clock } from 'lucide-react';
import { formatSafeDate } from '../utils/dateUtils';
import { LevelUpModal } from '../components/ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../components/ui/AchievementToast';
import { useSystemSound } from '../hooks/useSystemSound';
import { RollingNumber } from '../components/ui/RollingNumber';

export const DSA: React.FC = () => {
  const { problems, stats, isLoading, logProblem, updateProblem } = useDSA();
  const { play } = useSystemSound();
  
  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-indigo-500 uppercase tracking-[0.3em] animate-pulse">Decrypting Algorithm DB...</h2>
      </div>
    );
  }

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const data = {
      title: form.title.value,
      topic: form.topic.value,
      difficulty: form.difficulty.value,
      platform: form.platform.value,
      timeTakenMinutes: parseInt(form.time.value) || undefined
    };

    try {
      const res = await logProblem(data);
      form.reset();
      play('success');
      
      const xpToasts: ToastData[] = [];
      if (res.globalXpResult) {
        xpToasts.push({
          id: Math.random().toString(),
          title: 'Algorithm Defeated',
          description: `+100 Global XP!`,
          icon: '⚔️'
        });
        if (res.globalXpResult.leveledUp) {
          setLevelUpData({ isOpen: true, level: res.globalXpResult.newLevel, rank: res.globalXpResult.newRank });
        }
      }
      if (res.skillXpResult) {
        xpToasts.push({
          id: Math.random().toString(),
          title: 'DSA Mastery Increased',
          description: `+${res.skillXpResult.xpAdded} Neural XP!`,
          icon: '🧠'
        });
      }
      setToasts(prev => [...prev, ...xpToasts]);
    } catch {
      alert("Failed to log problem");
      play('error');
    }
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const pieColors: Record<string, string> = {
    easy: '#4ade80',
    medium: '#fbbf24',
    hard: '#f87171'
  };

  const needsRevision = problems.filter((p: any) => p.revisionStatus === 'needs_revision');

  return (
    <div className="relative space-y-8 pb-24 md:pb-8 font-sans z-10 animate-[fade-in_0.5s_ease-out]">
      <AchievementToast toasts={toasts} removeToast={removeToast} />
      <LevelUpModal isOpen={levelUpData.isOpen} onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })} newLevel={levelUpData.level} newRank={levelUpData.rank} />

      {/* HEADER */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-black/60 border border-indigo-900/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 opacity-50" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-[0.2em] uppercase text-shadow-glow flex items-center gap-4">
            <Code2 className="w-8 h-8 text-indigo-400" /> ALGORITHM MATRIX
          </h1>
          <p className="font-mono text-indigo-400 text-[11px] tracking-[0.4em] uppercase mt-2">
            Data Structures & Algorithms Tracker
          </p>
        </div>

        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-indigo-950/30 border border-indigo-900/50 rounded-lg">
            <div className="text-2xl font-mono text-indigo-300"><RollingNumber value={stats?.totalSolved || 0} /></div>
            <div className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest mt-1">Total Solved</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LOG FORM */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-6">
          
          <div className="bg-black/60 border border-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="font-mono text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> Log Victory
            </h2>
            <form onSubmit={handleLog} className="space-y-4">
              <div>
                <input name="title" type="text" placeholder="Problem Designation (e.g. Two Sum)" className="w-full bg-black/50 border border-indigo-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-indigo-400 focus:outline-none transition-colors uppercase tracking-widest" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="topic" className="w-full bg-black/50 border border-indigo-900/50 rounded px-4 py-3 text-white font-mono text-xs focus:border-indigo-400 focus:outline-none transition-colors appearance-none uppercase" required>
                  <option value="">SELECT TOPIC</option>
                  <option value="arrays">Arrays</option>
                  <option value="strings">Strings</option>
                  <option value="linked_lists">Linked Lists</option>
                  <option value="trees">Trees</option>
                  <option value="graphs">Graphs</option>
                  <option value="dynamic_programming">Dynamic Programming</option>
                  <option value="math">Math</option>
                  <option value="other">Other</option>
                </select>
                <select name="difficulty" className="w-full bg-black/50 border border-indigo-900/50 rounded px-4 py-3 text-white font-mono text-xs focus:border-indigo-400 focus:outline-none transition-colors appearance-none uppercase" required>
                  <option value="">THREAT LEVEL</option>
                  <option value="easy">Easy (E-Rank)</option>
                  <option value="medium">Medium (C-Rank)</option>
                  <option value="hard">Hard (A-Rank)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="platform" className="w-full bg-black/50 border border-indigo-900/50 rounded px-4 py-3 text-white font-mono text-xs focus:border-indigo-400 focus:outline-none transition-colors appearance-none uppercase" required>
                  <option value="leetcode">LeetCode</option>
                  <option value="hackerrank">HackerRank</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="other">Other</option>
                </select>
                <input name="time" type="number" placeholder="TIME (MIN)" className="w-full bg-black/50 border border-indigo-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-indigo-400 focus:outline-none transition-colors uppercase" />
              </div>
              <button type="submit" onClick={() => play('click')} className="w-full py-3 bg-indigo-950 border border-indigo-400 text-indigo-300 hover:bg-indigo-400 hover:text-black rounded font-display tracking-[0.2em] uppercase transition-colors shadow-[0_0_15px_rgba(129,140,248,0.2)]">
                SUBMIT REPORT
              </button>
            </form>
          </div>

          {/* NEEDS REVISION */}
          {needsRevision.length > 0 && (
            <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="font-mono text-[10px] text-red-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Pending Reviews
              </h2>
              <div className="space-y-3">
                {needsRevision.map((p: any) => (
                  <div key={p._id} className="bg-black/50 border border-red-900/30 p-3 rounded flex justify-between items-center group">
                    <div>
                      <div className="font-mono text-xs text-red-200 uppercase truncate max-w-[150px]">{p.title}</div>
                      <div className="text-[9px] text-red-700 font-mono mt-1">{p.platform}</div>
                    </div>
                    <button 
                      onClick={() => updateProblem({ id: p._id, data: { revisionStatus: 'good' } })}
                      className="px-2 py-1 bg-red-900/20 text-red-400 border border-red-900 hover:bg-red-900/50 rounded text-[9px] font-mono uppercase transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>

        {/* METRICS & HISTORY */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* THREAT LEVEL DISTRIBUTION */}
            <div className="bg-black/60 border border-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="font-mono text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-4 text-center">Threat Level Distribution</h2>
              <div className="h-48">
                {stats?.totalSolved > 0 ? (
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'E-Rank (Easy)', value: stats.difficultyCounts.easy || 0 },
                        { name: 'C-Rank (Med)', value: stats.difficultyCounts.medium || 0 },
                        { name: 'A-Rank (Hard)', value: stats.difficultyCounts.hard || 0 }
                      ]} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                        <Cell fill={pieColors.easy} />
                        <Cell fill={pieColors.medium} />
                        <Cell fill={pieColors.hard} />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #6366f1', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '10px', textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-[10px] text-indigo-800 uppercase">No Data</div>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="text-[9px] font-mono text-green-400 uppercase">Easy: {stats?.difficultyCounts.easy || 0}</div>
                <div className="text-[9px] font-mono text-yellow-400 uppercase">Med: {stats?.difficultyCounts.medium || 0}</div>
                <div className="text-[9px] font-mono text-red-400 uppercase">Hard: {stats?.difficultyCounts.hard || 0}</div>
              </div>
            </div>

            {/* TOPIC MASTERY */}
            <div className="bg-black/60 border border-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="font-mono text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-4 text-center">Topic Mastery</h2>
              <div className="h-48">
                {stats?.totalSolved > 0 ? (
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={Object.entries(stats.topicCounts || {}).map(([name, count]) => ({ name, count }))} layout="vertical" margin={{ left: -20, right: 10 }}>
                      <XAxis type="number" hide />
                      <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="flex h-full items-center justify-center font-mono text-[10px] text-indigo-800 uppercase">No Data</div>
                )}
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className="bg-black/60 border border-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="font-mono text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Combat Log
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {problems.length === 0 ? (
                <div className="text-center py-8 font-mono text-[10px] text-indigo-800 uppercase tracking-widest">NO LOGS DETECTED</div>
              ) : (
                problems.map((p: any) => (
                  <div key={p._id} className="flex justify-between items-center bg-black/40 border border-indigo-900/30 p-4 rounded-xl group hover:border-indigo-500/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${p.difficulty === 'hard' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : p.difficulty === 'medium' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
                      <div>
                        <div className="font-display uppercase tracking-wider text-indigo-50">{p.title}</div>
                        <div className="text-[9px] font-mono text-indigo-600 uppercase tracking-widest mt-1">
                          {p.topic} • {p.platform} • {formatSafeDate(p.solvedAt)}
                        </div>
                      </div>
                    </div>
                    {p.timeTakenMinutes && (
                      <div className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">
                        {p.timeTakenMinutes}m
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
