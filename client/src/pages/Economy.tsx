import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { economyApi } from '../api/economyApi';
import { PageHeader } from '../components/ui/PageHeader';
import { SystemWindow } from '../components/ui/SystemWindow';
import { Coins, History, TrendingUp, Calendar, Zap, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Economy: React.FC = () => {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['economyStats'],
    queryFn: async () => {
      const res = await economyApi.getEconomyStats();
      return res.data;
    }
  });

  const { data: timelineData, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['rewardTimeline'],
    queryFn: async () => {
      const res = await economyApi.getRewardTimeline();
      return res.data;
    }
  });

  if (isLoadingStats || isLoadingTimeline) {
    return <div className="text-center mt-20 text-[var(--color-system-blue)] font-mono animate-pulse">ACCESSING ECONOMY DATA...</div>;
  }

  const stats = statsData;
  const logs = timelineData || [];

  return (
    <div className="relative min-h-screen text-white font-mono pb-20 md:pb-8">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
        
        <PageHeader 
          title="Hunter Economy" 
          subtitle="Lifetime statistics and unified reward timeline." 
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SystemWindow innerClassName="p-4 flex flex-col items-center text-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
            <Coins className="w-8 h-8 text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Current Coins</div>
            <div className="text-2xl font-display text-white">{stats?.coins || 0}</div>
          </SystemWindow>

          <SystemWindow innerClassName="p-4 flex flex-col items-center text-center justify-center">
            <TrendingUp className="w-8 h-8 text-indigo-400 mb-2" />
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Lifetime Earned</div>
            <div className="text-2xl font-display text-white">{stats?.lifetimeCoinsEarned || 0}</div>
          </SystemWindow>

          <SystemWindow innerClassName="p-4 flex flex-col items-center text-center justify-center">
            <Calendar className="w-8 h-8 text-cyan-400 mb-2" />
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Login Streak</div>
            <div className="text-2xl font-display text-white">{stats?.currentLoginStreak || 0} <span className="text-sm text-gray-500">days</span></div>
          </SystemWindow>

          <SystemWindow innerClassName="p-4 flex flex-col items-center text-center justify-center">
            <Star className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Weekly Coins</div>
            <div className="text-2xl font-display text-white">{stats?.weeklyCoins || 0}</div>
          </SystemWindow>
        </div>

        {/* Reward Timeline */}
        <SystemWindow title={<div className="flex items-center gap-2"><History className="w-4 h-4 text-cyan-400" /> Reward Timeline</div>}>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">No rewards logged yet.</div>
            ) : (
              logs.map((log: any) => (
                <div key={log._id} className="bg-black/40 border border-[var(--color-system-border)] p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden hover:border-cyan-500/50 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-indigo-500" />
                  
                  <div className="pl-2">
                    <div className="text-sm font-bold text-white uppercase tracking-wider mb-1">{log.reason}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="bg-indigo-900/40 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300">
                        {log.source.replace('_', ' ')}
                      </span>
                      <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {log.coins > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-900/20 px-3 py-1.5 rounded border border-yellow-700/50">
                        <Coins className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">+{log.coins}</span>
                      </div>
                    )}
                    {log.xp > 0 && (
                      <div className="flex items-center gap-1 bg-cyan-900/20 px-3 py-1.5 rounded border border-cyan-700/50">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-400 font-bold text-sm">+{log.xp} XP</span>
                      </div>
                    )}
                    {log.skillPoints > 0 && (
                      <div className="flex items-center gap-1 bg-purple-900/20 px-3 py-1.5 rounded border border-purple-700/50">
                        <Star className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-400 font-bold text-sm">+{log.skillPoints} SP</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </SystemWindow>

      </div>
    </div>
  );
};
