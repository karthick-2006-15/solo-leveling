import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Moon, Heart, Brain, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { healthApi } from '../api/healthApi';
import { formatSafeDate } from '../utils/dateUtils';
import { PageHeader } from '../components/ui/PageHeader';

export const Vitals: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'recovery' | 'sleep' | 'wellness' | 'body'>('recovery');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['healthAnalytics'],
    queryFn: async () => {
      const res = await healthApi.getAnalytics(30);
      return (await res.json()).data;
    }
  });

  const sleepMutation = useMutation({
    mutationFn: healthApi.logSleep,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['healthAnalytics'] })
  });

  const wellnessMutation = useMutation({
    mutationFn: healthApi.logWellness,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['healthAnalytics'] })
  });

  const [sleepForm, setSleepForm] = useState({ durationMinutes: 480, quality: 80 });
  const [wellnessForm, setWellnessForm] = useState({ mood: 8, stress: 3, focus: 7 });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Scanning Vitals...</h2>
      </div>
    );
  }

  const recoveryData = analytics?.recoveryTrend?.map((r: any) => ({
    date: formatSafeDate(r.date, 'MMM dd'),
    score: r.recoveryScore,
    energy: r.energyScore
  })) || [];

  return (
    <div className="space-y-6 pb-24 font-sans animate-[fade-in_0.5s_ease-out]">
      <PageHeader 
        title="Hunter Vitals" 
        subtitle="Medical & Recovery Intelligence" 
      />

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-cyan-900/50">
        {[
          { id: 'recovery', label: 'Recovery', icon: Heart },
          { id: 'sleep', label: 'Sleep', icon: Moon },
          { id: 'wellness', label: 'Mental State', icon: Brain },
          { id: 'body', label: 'Biometrics', icon: TrendingUp }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-t-lg text-[11px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-cyan-950/60 text-cyan-400 border-t border-l border-r border-cyan-500 shadow-[0_-5px_15px_rgba(8,145,178,0.2)]' 
                : 'text-gray-500 hover:text-cyan-300 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN CHART AREA */}
        <div className="lg:col-span-2 bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl h-[400px] relative">
          <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-6">
            {activeTab === 'recovery' && 'System Readiness & Recovery'}
            {activeTab === 'sleep' && 'Sleep Architecture'}
            {activeTab === 'wellness' && 'Cognitive Fluctuation'}
            {activeTab === 'body' && 'Mass Distribution'}
          </h2>
          
          <div className="absolute inset-0 pt-20 px-6 pb-6">
            {activeTab === 'recovery' && recoveryData.length > 0 && (
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={recoveryData}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="rgba(0,212,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <YAxis domain={[0, 100]} stroke="rgba(0,212,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #00d4ff', borderRadius: '4px', fontFamily: 'JetBrains Mono' }} />
                  <Area type="monotone" dataKey="score" stroke="#4ade80" strokeWidth={2} fill="url(#colorRec)" name="Recovery Score" />
                  <Area type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={2} fill="none" name="Energy Level" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {activeTab === 'recovery' && recoveryData.length === 0 && (
               <div className="h-full flex items-center justify-center font-mono text-[11px] text-cyan-900 uppercase tracking-widest">No Recovery Data Logged</div>
            )}
          </div>
        </div>

        {/* INPUT PANELS */}
        <div className="space-y-6">
          {activeTab === 'sleep' && (
            <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-[0.3em] mb-4 border-b border-cyan-900/50 pb-2">Log Sleep Session</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Duration (Hours)</label>
                  <input type="number" step="0.5" value={sleepForm.durationMinutes / 60} onChange={e => setSleepForm({ ...sleepForm, durationMinutes: Number(e.target.value) * 60 })} className="w-full bg-black/50 border border-cyan-900/50 rounded px-4 py-3 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Quality (0-100)</label>
                  <input type="range" min="0" max="100" value={sleepForm.quality} onChange={e => setSleepForm({ ...sleepForm, quality: Number(e.target.value) })} className="w-full accent-cyan-500" />
                  <div className="text-right font-mono text-xs text-cyan-400 mt-1">{sleepForm.quality}%</div>
                </div>
                <button onClick={() => sleepMutation.mutate(sleepForm)} disabled={sleepMutation.isPending} className="w-full py-3 bg-cyan-950/80 border border-cyan-500 text-cyan-400 rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-cyan-500 hover:text-black transition-all">
                  {sleepMutation.isPending ? 'Logging...' : 'Log Sleep'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'wellness' && (
            <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="font-mono text-[10px] text-purple-400 uppercase tracking-[0.3em] mb-4 border-b border-purple-900/50 pb-2">Mental Assessment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Mood (1-10)</label>
                  <input type="range" min="1" max="10" value={wellnessForm.mood} onChange={e => setWellnessForm({ ...wellnessForm, mood: Number(e.target.value) })} className="w-full accent-purple-500" />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Stress (1-10)</label>
                  <input type="range" min="1" max="10" value={wellnessForm.stress} onChange={e => setWellnessForm({ ...wellnessForm, stress: Number(e.target.value) })} className="w-full accent-red-500" />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Focus (1-10)</label>
                  <input type="range" min="1" max="10" value={wellnessForm.focus} onChange={e => setWellnessForm({ ...wellnessForm, focus: Number(e.target.value) })} className="w-full accent-cyan-500" />
                </div>
                <button onClick={() => wellnessMutation.mutate(wellnessForm)} disabled={wellnessMutation.isPending} className="w-full py-3 bg-purple-950/80 border border-purple-500 text-purple-400 rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-purple-500 hover:text-white transition-all">
                  {wellnessMutation.isPending ? 'Logging...' : 'Log Assessment'}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'recovery' && (
            <div className="bg-black/60 border border-green-900/50 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="font-mono text-[10px] text-green-400 uppercase tracking-[0.3em] mb-4 border-b border-green-900/50 pb-2">Latest Snapshot</h3>
              {analytics?.recoveryTrend?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Recovery</span>
                    <span className="font-display text-3xl text-green-400">{analytics.recoveryTrend[analytics.recoveryTrend.length-1].recoveryScore}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Energy</span>
                    <span className="font-display text-2xl text-yellow-400">{analytics.recoveryTrend[analytics.recoveryTrend.length-1].energyScore}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Readiness</span>
                    <span className="font-display text-2xl text-cyan-400">{analytics.recoveryTrend[analytics.recoveryTrend.length-1].readinessScore}</span>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Log sleep & wellness to generate recovery snapshot.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
