import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { fetchAnalytics, type BucketedPoint } from '../api/analyticsApi';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';

const METRICS = [
  { id: 'xp_growth', label: 'XP Growth' },
  { id: 'weight', label: 'Weight Tracking' },
  { id: 'workout_volume', label: 'Workout Volume' },
  { id: 'dsa_problems', label: 'DSA Problems Solved' },
  { id: 'habit_completion', label: 'Habit Completions' },
  { id: 'calories', label: 'Calories Consumed' }
];

export const AnalyticsDashboard: React.FC = () => {
  const [metric, setMetric] = useState('xp_growth');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [data, setData] = useState<BucketedPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchAnalytics(metric, granularity)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [metric, granularity]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 py-6 border-b border-white/10">
        <Activity className="w-8 h-8 text-neonBlue" />
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-purple-500">
          Analytics Dashboard
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-bold text-textMuted mb-2">Metric</label>
          <select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-neonBlue"
          >
            {METRICS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-textMuted mb-2">Timeframe (Granularity)</label>
          <div className="flex border border-white/10 rounded overflow-hidden">
            {(['day', 'week', 'month', 'year'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`flex-1 py-2 text-sm font-bold capitalize transition-colors ${
                  granularity === g 
                    ? 'bg-neonBlue/20 text-neonBlue border-b-2 border-neonBlue' 
                    : 'bg-black/50 text-textMuted hover:bg-white/5'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassCard className="p-6 h-[500px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse text-neonBlue">
            Loading Data...
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-textMuted">
            No data available for this selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a00e0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4a00e0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
              <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a00e0', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#4a00e0" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </div>
  );
};
