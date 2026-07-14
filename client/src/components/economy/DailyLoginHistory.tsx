import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { economyApi } from '../../api/economyApi';
import { Calendar, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const DailyLoginHistory: React.FC = () => {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['rewardTimeline'],
    queryFn: async () => {
      const res = await economyApi.getRewardTimeline();
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="text-cyan-500 font-mono text-[10px] animate-pulse mt-6">Loading Login History...</div>;
  }

  const logs = timelineData || [];
  // Filter for login events
  const loginLogs = logs.filter((log: any) => log.source === 'daily_login' || log.source === 'perfect_day');

  return (
    <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500 mt-6">
      <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2 flex items-center gap-2">
        <Calendar className="w-5 h-5" /> Daily Check-In History
      </h2>
      <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Historical record of system access</p>
      
      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {loginLogs.length === 0 ? (
          <div className="text-center text-gray-500 text-[10px] py-4 font-mono uppercase tracking-widest">No check-ins logged yet.</div>
        ) : (
          loginLogs.map((log: any) => (
            <div key={log._id} className="bg-black/40 border border-cyan-900/30 p-3 rounded flex items-center justify-between hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.source === 'perfect_day' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/50' : 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider">{log.reason}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {log.coins > 0 && <div className="text-[10px] text-yellow-400 font-mono font-bold">+{log.coins} Coins</div>}
                {log.xp > 0 && <div className="text-[10px] text-cyan-400 font-mono font-bold">+{log.xp} XP</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
