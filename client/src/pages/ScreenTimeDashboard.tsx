import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/ui/PageHeader';
import { screenTimeApi } from '../api/screenTimeApi';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { Upload, Brain, Clock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const ScreenTimeDashboard = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'log' | 'classify'>('analytics');
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['screenTimeDashboard'],
    queryFn: screenTimeApi.getDashboard
  });

  const { data: classifications } = useQuery({
    queryKey: ['appClassifications'],
    queryFn: screenTimeApi.getClassifications,
    enabled: activeTab === 'classify'
  });

  const analyzeImageMutation = useMutation({
    mutationFn: (payload: { base64Image: string, mimeType: string }) => screenTimeApi.analyzeImage(payload.base64Image, payload.mimeType),
    onSuccess: () => {
      toast.success('Iggris: Image parsed successfully.');
      queryClient.invalidateQueries({ queryKey: ['screenTimeDashboard'] });
      setIsUploading(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Iggris: Parsing failed.');
      setIsUploading(false);
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      analyzeImageMutation.mutate({ base64Image: base64Str, mimeType: file.type });
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Initializing Iggris Analytics...</h2>
      </div>
    );
  }

  const dbData = data?.data || {};
  const boss = dbData.boss;
  const todayLog = dbData.today;
  const weeklyLogs = dbData.weeklyLogs || [];

  return (
    <div className="relative space-y-6 pb-24 md:pb-8 font-sans z-10 max-w-7xl mx-auto p-4 md:p-8 animate-[fade-in_0.5s_ease-out]">
      <PageHeader 
        title="Distraction Intelligence" 
        subtitle="Combat doomscrolling through structural analytics." 
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-cyan-900/50">
        {[
          { id: 'analytics', label: 'Intelligence', icon: Brain },
          { id: 'log', label: 'Manual Input', icon: Clock },
          { id: 'classify', label: 'App Rules', icon: ShieldAlert }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-t-lg text-[11px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-cyan-950/60 text-cyan-400 border-t border-l border-r border-cyan-500 shadow-[0_-5px_15px_rgba(8,145,178,0.2)]' 
                : 'text-gray-500 hover:text-cyan-300 hover:bg-white/5 border-t border-l border-r border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* ALERT WIDGET */}
            {todayLog && todayLog.unproductiveTimeMinutes > 120 && (
              <div className="bg-red-950/30 border border-red-500/50 rounded p-4 flex items-start gap-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                <div>
                  <h3 className="font-mono text-xs text-red-400 uppercase tracking-widest mb-1">Iggris Warning</h3>
                  <p className="text-gray-300 text-sm">Excessive unproductive usage detected ({todayLog.unproductiveTimeMinutes} mins). Cognitive corruption increasing. Recommend immediate deep work session or physical training to mitigate damage.</p>
                </div>
              </div>
            )}

            {/* BOSS WIDGET */}
            {boss && (
              <div className="hud-glass corner-brackets p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="font-display text-2xl text-red-400 tracking-wider">Lvl {boss.level} {boss.name}</h2>
                        <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Adversary Class: Distraction Entity</p>
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
                    
                    <p className="text-xs text-gray-400 font-mono italic">
                      "Unproductive doomscrolling directly heals this entity. Deep Work and workouts deal damage."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI IMPORT WIDGET */}
            <div className="hud-glass corner-brackets p-6 relative">
               <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Brain className="w-4 h-4" /> Iggris Auto-Import
               </h3>
               
               <div 
                 onClick={() => !isUploading && fileInputRef.current?.click()}
                 className={`border-2 border-dashed ${isUploading ? 'border-cyan-700 bg-cyan-950/20 cursor-wait' : 'border-cyan-900/50 hover:border-cyan-500 hover:bg-cyan-950/10 cursor-pointer'} rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all group`}
               >
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                 
                 {isUploading ? (
                   <>
                    <div className="w-10 h-10 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-3" />
                    <p className="font-mono text-sm text-cyan-400 tracking-widest uppercase animate-pulse">Iggris Scanning...</p>
                   </>
                 ) : (
                   <>
                    <Upload className="w-10 h-10 text-cyan-700 group-hover:text-cyan-400 transition-colors mb-3" />
                    <p className="font-mono text-sm text-gray-300 tracking-widest uppercase mb-1">Upload Digital Wellbeing Screenshot</p>
                    <p className="text-xs text-gray-500">Iggris will extract categories and update the database</p>
                   </>
                 )}
               </div>
            </div>

            {/* METRICS */}
            {todayLog && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/50 border border-cyan-900/30 rounded p-4">
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Screen Time</p>
                  <p className="font-mono text-2xl text-white">{Math.floor(todayLog.totalTimeMinutes / 60)}h {todayLog.totalTimeMinutes % 60}m</p>
                </div>
                <div className="bg-black/50 border border-green-900/30 rounded p-4">
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1">Productive</p>
                  <p className="font-mono text-2xl text-green-400">{todayLog.productiveTimeMinutes}m</p>
                </div>
                <div className="bg-black/50 border border-red-900/30 rounded p-4">
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1">Unproductive</p>
                  <p className="font-mono text-2xl text-red-400">{todayLog.unproductiveTimeMinutes}m</p>
                </div>
                <div className="bg-black/50 border border-purple-900/30 rounded p-4">
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1">Focus Score</p>
                  <p className="font-mono text-2xl text-purple-400">{todayLog.focusScore}%</p>
                </div>
              </div>
            )}

            {/* CHARTS */}
            {weeklyLogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="hud-glass corner-brackets p-4">
                  <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-4">Productivity Trend (7 Days)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyLogs}>
                        <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { weekday: 'short' })} stroke="#164e63" tick={{fill: '#4b5563', fontSize: 10}} />
                        <YAxis stroke="#164e63" tick={{fill: '#4b5563', fontSize: 10}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#00050b', border: '1px solid #083344', borderRadius: '4px' }}
                          labelStyle={{ color: '#22d3ee', fontFamily: 'monospace', fontSize: '12px' }}
                          itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                        />
                        <Bar dataKey="productiveTimeMinutes" name="Productive (m)" stackId="a" fill="#4ade80" />
                        <Bar dataKey="unproductiveTimeMinutes" name="Unproductive (m)" stackId="a" fill="#ef4444" />
                        <Bar dataKey="neutralTimeMinutes" name="Neutral (m)" stackId="a" fill="#6b7280" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {todayLog && (
                  <div className="hud-glass corner-brackets p-4">
                    <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-4">Today's Distribution</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Social', value: todayLog.socialMediaMinutes, color: '#ef4444' },
                              { name: 'Gaming', value: todayLog.gamingMinutes, color: '#f97316' },
                              { name: 'Learning', value: todayLog.learningMinutes, color: '#4ade80' },
                              { name: 'Coding', value: todayLog.codingMinutes, color: '#22d3ee' },
                              { name: 'Entertainment', value: todayLog.entertainmentMinutes, color: '#a855f7' },
                              { name: 'Communication', value: todayLog.communicationMinutes, color: '#3b82f6' }
                            ].filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                            dataKey="value" stroke="none"
                          >
                            {
                              [
                                { name: 'Social', value: todayLog.socialMediaMinutes, color: '#ef4444' },
                                { name: 'Gaming', value: todayLog.gamingMinutes, color: '#f97316' },
                                { name: 'Learning', value: todayLog.learningMinutes, color: '#4ade80' },
                                { name: 'Coding', value: todayLog.codingMinutes, color: '#22d3ee' },
                                { name: 'Entertainment', value: todayLog.entertainmentMinutes, color: '#a855f7' },
                                { name: 'Communication', value: todayLog.communicationMinutes, color: '#3b82f6' }
                              ].filter(d => d.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))
                            }
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#00050b', border: '1px solid #083344', borderRadius: '4px' }}
                            itemStyle={{ fontFamily: 'monospace', fontSize: '11px', color: '#fff' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </motion.div>
        )}

        {activeTab === 'log' && (
          <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* MANUAL LOG UI TO BE IMPLEMENTED */}
            <div className="hud-glass p-6 text-center text-gray-400 font-mono text-sm">
               [Manual Entry Module Coming Soon]
            </div>
          </motion.div>
        )}

        {activeTab === 'classify' && (
          <motion.div key="classify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <div className="hud-glass p-6">
               <h3 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4" /> Application Rules
               </h3>
               {classifications?.classifications?.length > 0 ? (
                 <div className="space-y-2">
                   {classifications.classifications.map((c: any) => (
                     <div key={c._id} className="flex justify-between items-center bg-black/50 border border-cyan-900/30 p-3 rounded">
                       <span className="font-mono text-sm text-gray-300">{c.appName}</span>
                       <span className={`font-mono text-xs px-2 py-1 rounded ${
                         ['productive', 'learning'].includes(c.category) ? 'bg-green-900/30 text-green-400' :
                         ['social_media', 'gaming'].includes(c.category) ? 'bg-red-900/30 text-red-400' :
                         'bg-gray-900/30 text-gray-400'
                       }`}>
                         {c.category.toUpperCase().replace('_', ' ')}
                       </span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center text-gray-500 font-mono text-sm py-8">
                   No apps classified yet. Import a screenshot to begin.
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
