import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../../api/fetchHelper';
import { Trophy, Dumbbell, BookOpen, Brain, BatteryCharging, Zap } from 'lucide-react';
import { formatSafeDate } from '../../utils/dateUtils';

interface XPLog {
  _id: string;
  category: string;
  reason: string;
  amount: number;
  multiplierApplied: number;
  createdAt: string;
}

interface HistoryDay {
  _id: string;
  totalXP: number;
  logs: XPLog[];
}

export const ActivityTimeline: React.FC = () => {
  const { data, isLoading } = useQuery<{ history: HistoryDay[] }>({
    queryKey: ['progressionHistory'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/progression/history');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-cyan-950/20 rounded-xl border border-cyan-900/30"></div>
        ))}
      </div>
    );
  }

  const history = data?.history || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return <Dumbbell className="w-4 h-4 text-red-400" />;
      case 'study': return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'mission': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'recovery': return <BatteryCharging className="w-4 h-4 text-green-400" />;
      case 'boss': return <Zap className="w-4 h-4 text-orange-500" />;
      default: return <Brain className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {history.slice().reverse().map(day => (
        <div key={day._id} className="relative pl-6 border-l-2 border-cyan-900/30">
          <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#00d4ff]" />
          
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-mono text-sm text-cyan-400 uppercase tracking-widest">
              {formatSafeDate(day._id, 'MMM dd, yyyy')}
            </h3>
            <span className="font-mono text-xs text-cyan-200">
              +{day.totalXP} XP
            </span>
          </div>

          <div className="space-y-2">
            {day.logs.slice().reverse().map(log => (
              <div key={log._id} className="bg-black/40 border border-cyan-900/20 rounded-lg p-3 flex justify-between items-center hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-950/30 rounded">
                    {getCategoryIcon(log.category)}
                  </div>
                  <div>
                    <div className="font-sans text-sm text-gray-200">{log.reason}</div>
                    {log.multiplierApplied > 1.0 && (
                      <span className="font-mono text-[9px] text-yellow-400 uppercase tracking-widest border border-yellow-900/50 bg-yellow-950/20 px-1 rounded inline-block mt-1">
                        COMBO x{log.multiplierApplied.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-mono text-xs text-cyan-400 text-shadow-glow">
                  +{log.amount} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {history.length === 0 && (
        <div className="text-center py-8 border border-dashed border-cyan-900/30 rounded">
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">No Recent Activity</p>
        </div>
      )}
    </div>
  );
};
