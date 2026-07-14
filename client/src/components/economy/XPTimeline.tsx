import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../../api/fetchHelper';
import { Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatSafeDate } from '../../utils/dateUtils';

export const XPTimeline: React.FC = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['xpHistory'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/progression/history');
      const data = await res.json();
      return data.history || [];
    }
  });

  if (isLoading) {
    return <div className="text-cyan-500 font-mono text-[10px] animate-pulse">Loading XP Data...</div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="hud-glass corner-brackets p-6 text-center text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-6">
        No XP History Logged
      </div>
    );
  }

  // Aggregate by date
  const grouped: Record<string, number> = {};
  logs.forEach((log: any) => {
    const d = new Date(log.createdAt).toDateString();
    grouped[d] = (grouped[d] || 0) + log.amount;
  });

  const chartData = Object.keys(grouped).map(k => ({
    date: formatSafeDate(new Date(k), 'MMM dd'),
    xp: grouped[k]
  })).slice(-14); // Last 14 days

  return (
    <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500 mt-6">
      <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2 flex items-center gap-2">
        <Zap className="w-5 h-5" /> Experience Timeline
      </h2>
      <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Past 14 Days (XP Gained)</p>
      
      <div className="h-64 w-full relative z-10">
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="rgba(0,212,255,0.4)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
            <YAxis stroke="rgba(0,212,255,0.4)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" width={40} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #00d4ff', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} itemStyle={{ color: '#00d4ff' }} />
            <Area type="monotone" dataKey="xp" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
