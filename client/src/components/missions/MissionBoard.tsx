import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../api/fetchHelper';
import { Lock, Unlock, Zap, AlertTriangle, Star, CheckCircle, ShieldAlert, Ghost, Link } from 'lucide-react';
import { devAwardXP } from '../../api/progressionApi';
import { useMissions } from '../../hooks/useMissions';
import { MissionHistory } from './MissionHistory';

export const MissionBoard: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Track if check-in is needed today (Mock implementation for now)
  const [needsCheckIn, setNeedsCheckIn] = useState(() => {
    const last = localStorage.getItem('lastCheckIn');
    return last !== new Date().toDateString();
  });

  const [checkInData, setCheckInData] = useState({ sleepQuality: 80, energyLevel: 80, stressLevel: 20 });
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const { quests, questsLoading: isLoading, shadows, resurrectShadow, isResurrecting } = useMissions();

  const completeMutation = useMutation({
    mutationFn: async (quest: any) => {
      const res = await fetchWithAuth(`/api/missions/${quest._id}/complete`, { method: 'POST' });
      await res.json();
      await devAwardXP(quest.title, quest.xpReward); // Actually award XP to user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
      queryClient.invalidateQueries({ queryKey: ['monarch'] });
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
      <div className="hud-glass corner-brackets p-6 mb-8 relative overflow-hidden">
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
      <div className="hud-glass corner-brackets p-6 mb-8 animate-pulse text-center">
        <h2 className="font-mono text-cyan-500 uppercase tracking-widest">Generating Adaptive Missions...</h2>
      </div>
    );
  }

  return (
    <div className="hud-glass corner-brackets p-6 mb-8 relative">
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
                    {quest.unlocks && quest.unlocks.length > 0 && (
                      <span title="Chain Mission: Unlocks further missions" className="text-cyan-400">
                        <Link className="w-4 h-4 inline" />
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

      {/* SHADOW ARMY SECTION */}
      {shadows && shadows.length > 0 && (
        <div className="mt-8 pt-8 border-t border-purple-900/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display uppercase tracking-[0.2em] text-purple-500 flex items-center gap-2">
              <Ghost className="w-5 h-5" /> Shadow Army
            </h2>
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest text-right">
              Fallen Quests from Yesterday.<br/>Resurrect them for partial XP.
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {shadows.map(shadow => (
                <motion.div 
                  key={shadow._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 rounded-xl border border-purple-900/50 bg-purple-950/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-4"
                >
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                  
                  <div className="flex-shrink-0">
                    <Ghost className="w-8 h-8 text-purple-500 animate-pulse" />
                  </div>

                  <div className="flex-1 text-center md:text-left relative z-10">
                    <h3 className="font-display tracking-wider uppercase text-lg text-purple-400">
                      {shadow.title}
                    </h3>
                    <p className="font-sans text-sm text-gray-400 opacity-80">{shadow.description}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="font-mono text-xs text-purple-300 bg-purple-950/50 px-3 py-1 rounded border border-purple-900/30">
                      ~{Math.floor(shadow.xpReward / 2)} XP
                    </div>
                    <button 
                      onClick={() => resurrectShadow(shadow._id)}
                      disabled={isResurrecting}
                      className="px-6 py-2 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500 text-purple-300 font-mono text-xs uppercase tracking-widest font-bold rounded transition-colors disabled:opacity-50"
                    >
                      Arise
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* MISSION HISTORY SECTION */}
      <MissionHistory />

    </div>
  );
};
