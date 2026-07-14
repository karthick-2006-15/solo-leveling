import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { economyApi } from '../../api/economyApi';
import { History, CheckCircle, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const MissionHistory: React.FC = () => {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['rewardTimeline'],
    queryFn: async () => {
      const res = await economyApi.getRewardTimeline();
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="text-cyan-500 font-mono text-[10px] animate-pulse mt-6">Loading Mission History...</div>;
  }

  const logs = timelineData || [];
  // Filter for mission/quest events
  const questLogs = logs.filter((log: any) => log.source.includes('quest') || log.source.includes('boss'));

  return (
    <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500 mt-8">
      <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2 flex items-center gap-2">
        <History className="w-5 h-5" /> Operation History
      </h2>
      <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">Log of recently completed directives</p>
      
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
        {questLogs.length === 0 ? (
          <div className="text-center text-gray-500 text-[10px] py-4 font-mono uppercase tracking-widest">No directives completed recently.</div>
        ) : (
          questLogs.map((log: any) => (
            <div key={log._id} className="bg-black/40 border border-cyan-900/30 p-4 rounded flex items-center justify-between hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-cyan-900/40 text-cyan-400 border border-cyan-500/50">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider">{log.reason || 'Directive Completed'}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="text-right flex gap-3">
                {log.coins > 0 && <div className="text-[10px] text-yellow-400 font-mono font-bold">+{log.coins} Coins</div>}
                {log.xp > 0 && <div className="text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-1"><Zap className="w-3 h-3"/> {log.xp} XP</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
