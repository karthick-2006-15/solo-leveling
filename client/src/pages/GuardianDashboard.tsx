import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/ui/PageHeader';
import { guardianApi } from '../api/guardianApi';
import { Shield, ShieldAlert, Heart, Flame, Zap, ShieldCheck, Activity, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const GuardianDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [nightReport, setNightReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['guardianDashboard'],
    queryFn: guardianApi.getDashboard
  });

  const generateReportMutation = useMutation({
    mutationFn: guardianApi.getNightReport,
    onSuccess: (res) => {
      setNightReport(res.report);
      setIsGeneratingReport(false);
    },
    onError: () => {
      toast.error('Failed to generate report.');
      setIsGeneratingReport(false);
    }
  });

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    generateReportMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Initializing Guardian System...</h2>
      </div>
    );
  }

  const profile = data?.profile;
  const boss = data?.boss;
  const aiMessage = data?.aiMessage;

  const corruptionClass = profile?.corruption > 75 
    ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-[pulse_2s_infinite]' 
    : profile?.corruption > 40 
    ? 'border-orange-500' 
    : 'border-cyan-900';

  return (
    <div className={`relative space-y-6 pb-24 md:pb-8 font-sans z-10 max-w-7xl mx-auto p-4 md:p-8 ${profile?.corruption > 80 ? 'hue-rotate-15' : ''}`}>
      <PageHeader 
        title="Guardian System" 
        subtitle="Combat corruption. Build extreme willpower." 
      />

      {/* EMERGENCY BUTTON */}
      <div className="flex justify-center mb-8 mt-4">
        <button 
          onClick={() => navigate('/guardian-mode')}
          className="relative group overflow-hidden rounded-lg bg-red-950/80 border border-red-500 px-8 py-4 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-400/20 to-red-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            <span className="font-display font-bold text-2xl tracking-[0.2em] text-red-500 uppercase text-shadow-glow">
              I Am Under Attack
            </span>
          </div>
          <p className="text-red-400/70 font-mono text-xs mt-1 uppercase tracking-widest text-center">Deploy Recovery Dungeon</p>
        </button>
      </div>

      {/* AI COACHING MESSAGE */}
      {aiMessage && (
        <div className="hud-glass p-4 border-l-4 border-cyan-500 flex items-start gap-4 mb-6">
           <Activity className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
           <div>
             <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1">Iggris Prediction</h3>
             <p className="text-gray-300 text-sm font-mono leading-relaxed">{aiMessage}</p>
           </div>
        </div>
      )}

      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="hud-glass p-4 text-center">
           <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
           <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Current Streak</p>
           <p className="font-display text-3xl text-white">{profile?.currentStreak} <span className="text-sm text-gray-500">days</span></p>
        </div>
        <div className="hud-glass p-4 text-center">
           <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
           <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Longest Streak</p>
           <p className="font-display text-3xl text-white">{profile?.longestStreak} <span className="text-sm text-gray-500">days</span></p>
        </div>
        <div className={`hud-glass p-4 text-center border-t-2 ${corruptionClass}`}>
           <Heart className="w-6 h-6 text-purple-400 mx-auto mb-2" />
           <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Corruption</p>
           <p className="font-display text-3xl text-white">{profile?.corruption}%</p>
        </div>
        <div className="hud-glass p-4 text-center border-t-2 border-cyan-500">
           <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
           <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Willpower</p>
           <p className="font-display text-3xl text-white">{profile?.willpower}/100</p>
        </div>
      </div>

      {/* LUST BOSS */}
      {boss && (
        <div className="hud-glass corner-brackets p-6 relative overflow-hidden group mt-6">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-1 space-y-4 w-full">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-display text-2xl text-red-400 tracking-wider">Lvl {boss.level} {boss.name}</h2>
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Adversary Class: Lust Demon</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl text-white">{Math.round(boss.currentHp)}</span>
                  <span className="font-mono text-xs text-gray-500"> / {boss.maxHp} HP</span>
                </div>
              </div>

              <div className="h-4 bg-black/60 rounded-full overflow-hidden border border-red-900/30 relative">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-700 to-red-400 transition-all duration-1000 relative"
                  style={{ width: `${Math.max(0, Math.min(100, (boss.currentHp / boss.maxHp) * 100))}%` }}
                >
                   <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>Defeats: {boss.defeatedCount}</span>
                <span>Relapse heals boss completely.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NIGHT REPORT SECTION */}
      <div className="hud-glass p-6 mt-6">
         <div className="flex justify-between items-center mb-4">
           <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> Daily Debrief
           </h3>
           <button 
             onClick={handleGenerateReport}
             disabled={isGeneratingReport}
             className="px-4 py-2 bg-cyan-950/50 border border-cyan-500/50 rounded font-mono text-xs text-cyan-400 uppercase tracking-widest hover:bg-cyan-900/50 transition-colors disabled:opacity-50"
           >
             {isGeneratingReport ? 'Extracting Data...' : 'Generate Night Report'}
           </button>
         </div>

         <AnimatePresence mode="wait">
           {nightReport && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }} 
               animate={{ opacity: 1, height: 'auto' }} 
               exit={{ opacity: 0, height: 0 }}
               className="bg-black/40 border border-cyan-900/30 rounded p-4 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap"
             >
               {nightReport}
             </motion.div>
           )}
         </AnimatePresence>
         
         {!nightReport && !isGeneratingReport && (
           <p className="text-gray-500 font-mono text-xs text-center py-4">No report generated for today.</p>
         )}
      </div>

    </div>
  );
};
