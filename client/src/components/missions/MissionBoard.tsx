import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../api/fetchHelper';
import { Lock, Unlock, Zap, AlertTriangle, Star, CheckCircle, ShieldAlert } from 'lucide-react';
import { devAwardXP } from '../../api/progressionApi';

interface Quest {
  _id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed' | 'failed';
  type: 'daily' | 'hidden' | 'emergency' | 'bonus' | 'boss';
  xpReward: number;
  dependencies: string[];
}

export const MissionBoard: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Track if check-in is needed today (Mock implementation for now)
  const [needsCheckIn, setNeedsCheckIn] = useState(() => {
    const last = localStorage.getItem('lastCheckIn');
    return last !== new Date().toDateString();
  });

  const [checkInData, setCheckInData] = useState({ sleepQuality: 80, energyLevel: 80, stressLevel: 20 });
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ['adaptiveQuests'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/missions/quests/today');
      const data = await res.json();
      return data.quests || [];
    },
    enabled: !needsCheckIn
  });

  const completeMutation = useMutation({
    mutationFn: async (quest: Quest) => {
      const res = await fetchWithAuth(`/api/missions/${quest._id}/complete`, { method: 'POST' });
      await res.json();
      await devAwardXP(quest.title, quest.xpReward); // Actually award XP to user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adaptiveQuests'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingIn(true);
    try {
      await fetchWithAuth('/api/missions/check-in', {
        method: 'POST',
        body: JSON.stringify(checkInData)
      });
      localStorage.setItem('lastCheckIn', new Date().toDateString());
      setNeedsCheckIn(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (needsCheckIn) {
    return (
      <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-yellow-400" /> Daily System Diagnostic
        </h2>
        <p className="font-mono text-sm text-gray-400 mb-6">
          Hunter, please provide your current vitals to calibrate today's missions.
        </p>
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Sleep Quality (0-100)</label>
            <input type="range" min="0" max="100" value={checkInData.sleepQuality} onChange={e => setCheckInData({...checkInData, sleepQuality: Number(e.target.value)})} className="w-full accent-cyan-500" />
            <div className="text-right font-mono text-xs text-white">{checkInData.sleepQuality}%</div>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">Energy Level (0-100)</label>
            <input type="range" min="0" max="100" value={checkInData.energyLevel} onChange={e => setCheckInData({...checkInData, energyLevel: Number(e.target.value)})} className="w-full accent-cyan-500" />
            <div className="text-right font-mono text-xs text-white">{checkInData.energyLevel}%</div>
          </div>
          <button type="submit" disabled={isCheckingIn} className="w-full py-3 bg-cyan-950 border border-cyan-500 text-cyan-400 font-mono text-xs uppercase tracking-widest rounded hover:bg-cyan-900 transition-colors">
            {isCheckingIn ? 'Calibrating...' : 'Synchronize Vitals'}
          </button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl mb-8 animate-pulse text-center">
        <h2 className="font-mono text-cyan-500 uppercase tracking-widest">Generating Adaptive Missions...</h2>
      </div>
    );
  }

  return (
    <div className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl mb-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" /> Active Directives
        </h2>
        <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded border border-cyan-900/30">
          Adaptive Engine Online
        </span>
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-mono text-gray-500 text-sm tracking-widest uppercase">No directives available. System calibration required.</p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          {/* Mission Dependency Lines could be drawn here in a real SVG implementation, 
              but for now we'll represent them via a vertical timeline/list. */}
          <AnimatePresence>
            {quests.map((quest) => (
              <motion.div 
                key={quest._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border relative overflow-hidden flex flex-col md:flex-row items-center gap-4 transition-all duration-300
                  ${quest.status === 'completed' ? 'bg-cyan-950/20 border-cyan-900/50 opacity-50' : 
                    quest.status === 'locked' ? 'bg-black/40 border-gray-900 opacity-60 grayscale' :
                    quest.type === 'emergency' ? 'bg-red-950/20 border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]' :
                    quest.type === 'bonus' ? 'bg-yellow-950/20 border-yellow-900/50 shadow-[0_0_15px_rgba(250,204,21,0.1)]' :
                    'bg-cyan-950/40 border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                  }`}
              >
                {/* Icon/Status Indicator */}
                <div className="flex-shrink-0">
                  {quest.status === 'completed' ? (
                    <CheckCircle className="w-8 h-8 text-cyan-500" />
                  ) : quest.status === 'locked' ? (
                    <Lock className="w-8 h-8 text-gray-600" />
                  ) : quest.type === 'emergency' ? (
                    <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                  ) : quest.type === 'bonus' ? (
                    <Star className="w-8 h-8 text-yellow-500" />
                  ) : (
                    <Unlock className="w-8 h-8 text-cyan-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h3 className={`font-display tracking-wider uppercase text-lg ${
                      quest.type === 'emergency' ? 'text-red-400' :
                      quest.type === 'bonus' ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {quest.title}
                    </h3>
                    {quest.type !== 'daily' && (
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-widest ${
                        quest.type === 'emergency' ? 'border-red-900 text-red-400 bg-red-950/50' :
                        quest.type === 'bonus' ? 'border-yellow-900 text-yellow-400 bg-yellow-950/50' :
                        'border-purple-900 text-purple-400 bg-purple-950/50'
                      }`}>
                        {quest.type}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm text-gray-400">{quest.description}</p>
                </div>

                {/* Actions / Rewards */}
                <div className="flex flex-col items-center gap-2">
                  <div className="font-mono text-xs text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded border border-cyan-900/30">
                    +{quest.xpReward} XP
                  </div>
                  {quest.status === 'available' && (
                    <button 
                      onClick={() => completeMutation.mutate(quest)}
                      disabled={completeMutation.isPending}
                      className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs uppercase tracking-widest font-bold rounded transition-colors disabled:opacity-50"
                    >
                      {completeMutation.isPending ? 'Processing...' : 'Complete'}
                    </button>
                  )}
                  {quest.status === 'locked' && (
                    <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest text-center">
                      Prerequisites<br/>Required
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
