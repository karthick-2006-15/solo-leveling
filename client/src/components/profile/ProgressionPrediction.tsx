import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../../api/fetchHelper';
import { TrendingUp, Clock, Activity, Target } from 'lucide-react';

interface Prediction {
  averageDailyXP: number;
  daysToNextLevel: number;
  daysToNextRank: number;
  nextRank: string;
  monthlyPrediction: number;
}

export const ProgressionPrediction: React.FC = () => {
  const { data, isLoading } = useQuery<{ prediction: Prediction }>({
    queryKey: ['progressionPrediction'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/progression/prediction');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl animate-pulse">
        <div className="h-4 w-1/3 bg-cyan-900/50 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-cyan-950/30 rounded"></div>)}
        </div>
      </div>
    );
  }

  const p = data?.prediction;
  if (!p) return null;

  return (
    <div className="bg-gradient-to-br from-black/80 via-cyan-950/20 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />
      
      <h2 className="font-display uppercase tracking-[0.2em] text-cyan-400 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" /> Growth Prediction
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <div className="bg-black/40 border border-cyan-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <Activity className="w-5 h-5 text-cyan-500 mb-2" />
          <div className="font-mono text-xl text-white">{p.averageDailyXP}</div>
          <div className="font-mono text-[9px] text-cyan-600 uppercase tracking-widest mt-1">Daily Avg XP</div>
        </div>

        <div className="bg-black/40 border border-purple-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <Clock className="w-5 h-5 text-purple-500 mb-2" />
          <div className="font-mono text-xl text-white">{p.daysToNextLevel} <span className="text-sm text-gray-500">Days</span></div>
          <div className="font-mono text-[9px] text-purple-600 uppercase tracking-widest mt-1">To Next Level</div>
        </div>

        <div className="bg-black/40 border border-yellow-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <Target className="w-5 h-5 text-yellow-500 mb-2" />
          <div className="font-mono text-xl text-white">
            {p.daysToNextRank === -1 ? 'MAX' : `${p.daysToNextRank} Days`}
          </div>
          <div className="font-mono text-[9px] text-yellow-600 uppercase tracking-widest mt-1">To {p.nextRank}</div>
        </div>

        <div className="bg-black/40 border border-green-900/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
          <div className="font-mono text-xl text-white">{p.monthlyPrediction}</div>
          <div className="font-mono text-[9px] text-green-600 uppercase tracking-widest mt-1">Monthly Forecast</div>
        </div>
      </div>
    </div>
  );
};
