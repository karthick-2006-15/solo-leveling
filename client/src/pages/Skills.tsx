import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkills } from '../hooks/useSkills';
import { SystemModal } from '../components/ui/SystemModal';
import { LevelUpModal } from '../components/ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../components/ui/AchievementToast';
import { Brain, BookOpen, Target, Plus, CheckCircle2, Zap, ExternalLink, Trash2, Crosshair } from 'lucide-react';
import { useSystemSound } from '../hooks/useSystemSound';

export const Skills: React.FC = () => {
  const { skills, isLoading, addSkill, addMilestone, deleteResource, completeMilestone, logStudySession } = useSkills();
  const { play } = useSystemSound();

  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'resources'>('overview');
  
  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-purple-900 border-t-purple-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-purple-500 uppercase tracking-[0.3em] animate-pulse">Accessing Neural DB...</h2>
      </div>
    );
  }

  const handleCreateSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addSkill({
        name: formData.get('name') as string,
        icon: formData.get('icon') as string || 'book'
      });
      setIsCreateModalOpen(false);
      play('success');
    } catch (err: any) {
      alert(err.message || 'Failed to create skill');
      play('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteMilestone = async (skillId: string, milestoneId: string) => {
    try {
      const res = await completeMilestone({ id: skillId, milestoneId });
      if (res.skillXpResult) {
        const xp = res.skillXpResult;
        setToasts(prev => [...prev, {
          id: Math.random().toString(),
          title: 'Skill Progress!',
          description: `+${xp.xpAdded} XP in ${res.skill.name}`,
          icon: '✨'
        }]);
        if (xp.leveledUp) setLevelUpData({ isOpen: true, level: xp.newLevel });
        setSelectedSkill(res.skill);
        play('success');
      }
    } catch {
      alert("Failed to complete milestone.");
      play('error');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSkill) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await addMilestone({
        id: selectedSkill._id,
        milestone: {
          title: formData.get('title') as string,
          xpReward: parseInt(formData.get('xpReward') as string, 10)
        }
      });
      setSelectedSkill(res.skill);
      setIsMilestoneModalOpen(false);
      play('click');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogStudy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSkill) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await logStudySession({
        skillId: selectedSkill._id,
        durationMinutes: parseInt(formData.get('minutes') as string, 10),
        notes: formData.get('notes') as string
      });
      if (res.skillXpResult) {
        const xp = res.skillXpResult;
        setToasts(prev => [...prev, {
          id: Math.random().toString(),
          title: 'Study Session Logged',
          description: `+${xp.xpAdded} XP in ${res.skill.name}`,
          icon: '📚'
        }]);
        if (xp.leveledUp) setLevelUpData({ isOpen: true, level: xp.newLevel });
        setSelectedSkill(res.skill);
        setIsStudyModalOpen(false);
        play('success');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-8 pb-24 md:pb-8 font-sans z-10 animate-[fade-in_0.5s_ease-out]">
      <AchievementToast toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <LevelUpModal isOpen={levelUpData.isOpen} onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })} newLevel={levelUpData.level} newRank={levelUpData.rank} rankChanged={levelUpData.rankChanged} />

      {/* HEADER */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-black/60 border border-purple-900/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-[0.2em] uppercase text-shadow-glow flex items-center gap-4">
            <Brain className="w-8 h-8 text-purple-400" /> Neural Link
          </h1>
          <p className="font-mono text-purple-400 text-[11px] tracking-[0.4em] uppercase mt-2">
            Skill tree & knowledge acquisition
          </p>
        </div>

        <button 
          onClick={() => { setIsCreateModalOpen(true); play('click'); }}
          className="relative z-10 px-6 py-3 bg-purple-950/80 border border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all shadow-[0_0_15px_rgba(192,132,252,0.2)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Neural Node
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SKILL TREE (LEFT COLUMN) */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-mono text-[10px] text-purple-500 uppercase tracking-[0.3em] border-b border-purple-900/50 pb-2 flex items-center gap-2">
            <BookOpen className="w-3 h-3" /> Active Nodes
          </h2>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {skills.map((skill: any) => {
              const isActive = selectedSkill?._id === skill._id;
              const progress = skill.xpRequired > 0 ? (skill.currentXP / skill.xpRequired) * 100 : 0;
              
              return (
                <motion.div
                  key={skill._id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  onClick={() => { setSelectedSkill(skill); play('click'); }}
                  className={`cursor-pointer border rounded-xl p-4 transition-all duration-300 backdrop-blur-md relative overflow-hidden group ${
                    isActive 
                      ? 'bg-purple-950/40 border-purple-400 shadow-[inset_0_0_20px_rgba(192,132,252,0.2)]' 
                      : 'bg-black/40 border-purple-900/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-display tracking-wider uppercase ${isActive ? 'text-white text-shadow-glow' : 'text-purple-100'}`}>
                      {skill.name}
                    </h3>
                    <div className="px-2 py-0.5 bg-black border border-purple-900/50 rounded text-[9px] font-mono text-purple-400 uppercase tracking-widest">
                      LVL {skill.level}
                    </div>
                  </div>
                  
                  <div className="w-full h-1.5 bg-black border border-purple-900/50 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-gradient-to-r from-purple-900 to-purple-400 shadow-[0_0_10px_#c084fc]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 text-right uppercase tracking-widest">
                    {Math.floor(progress)}%
                  </div>

                  {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-400 shadow-[0_0_10px_#c084fc] rounded-l-full" />}
                </motion.div>
              );
            })}
            
            {skills.length === 0 && (
              <div className="border border-dashed border-purple-900/50 rounded-xl p-8 text-center text-purple-800 font-mono text-[10px] uppercase tracking-widest">
                No active neural nodes.
              </div>
            )}
          </div>
        </div>

        {/* SKILL DETAILS (RIGHT COLUMN) */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedSkill ? (
              <motion.div 
                key={selectedSkill._id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-black/60 border border-purple-900/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden"
              >
                {/* Header info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-purple-900/50">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-purple-500 tracking-[0.2em] uppercase text-shadow-glow mb-2">
                      {selectedSkill.name}
                    </h2>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                      <span>LVL {selectedSkill.level}</span>
                      <span>•</span>
                      <span>{selectedSkill.currentXP} / {selectedSkill.xpRequired} XP</span>
                      <span>•</span>
                      <span>{selectedSkill.totalStudyMinutes} MINS TOTAL</span>
                    </div>
                  </div>
                  
                  <button onClick={() => setIsStudyModalOpen(true)} className="px-6 py-2 bg-purple-950/80 border border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all shadow-[0_0_15px_rgba(192,132,252,0.2)] flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Log Session
                  </button>
                </div>

                {/* Internal Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar mb-6">
                  {['overview', 'milestones', 'resources'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-6 py-2 rounded text-[10px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all ${
                        activeTab === tab 
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500 shadow-[0_0_15px_rgba(192,132,252,0.2)]' 
                          : 'text-gray-500 hover:text-purple-400 border border-transparent'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-950/20 border border-purple-900/30 p-4 rounded-xl text-center">
                          <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <div className="text-2xl font-mono text-white">{selectedSkill.milestones?.filter((m:any) => m.completed).length || 0}</div>
                          <div className="text-[9px] font-mono text-purple-600 uppercase tracking-widest mt-1">Milestones</div>
                        </div>
                        <div className="bg-purple-950/20 border border-purple-900/30 p-4 rounded-xl text-center">
                          <BookOpen className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <div className="text-2xl font-mono text-white">{selectedSkill.resources?.length || 0}</div>
                          <div className="text-[9px] font-mono text-purple-600 uppercase tracking-widest mt-1">Resources</div>
                        </div>
                      </div>
                      
                      {selectedSkill.studyLogs?.length > 0 && (
                        <div className="mt-8">
                          <h4 className="font-mono text-[10px] text-purple-500 uppercase tracking-widest mb-4">Recent Transmissions</h4>
                          <div className="space-y-3">
                            {selectedSkill.studyLogs.slice(0, 3).map((log: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-start p-3 bg-black/40 border border-purple-900/30 rounded">
                                <div>
                                  <div className="text-xs text-purple-200 font-sans">{log.notes || 'Routine Session'}</div>
                                  <div className="text-[9px] text-gray-600 font-mono mt-1">{new Date(log.date).toLocaleDateString()}</div>
                                </div>
                                <div className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-2 py-1 rounded">+{log.minutes}m</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'milestones' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-mono text-[10px] text-purple-500 uppercase tracking-widest">Directives</h4>
                        <button onClick={() => setIsMilestoneModalOpen(true)} className="text-[9px] font-mono text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      {selectedSkill.milestones?.map((m: any) => (
                        <div key={m._id} className={`flex items-center gap-4 p-4 rounded-xl border ${m.completed ? 'bg-purple-950/20 border-purple-900/30 opacity-60' : 'bg-black/40 border-purple-800'}`}>
                          <button 
                            onClick={() => !m.completed && handleCompleteMilestone(selectedSkill._id, m._id)}
                            disabled={m.completed}
                            className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${m.completed ? 'bg-purple-500 border-purple-500 text-black' : 'border-purple-700 text-purple-700 hover:border-purple-400 hover:text-purple-400'}`}
                          >
                            {m.completed ? <CheckCircle2 className="w-5 h-5" /> : <Crosshair className="w-4 h-4" />}
                          </button>
                          <div className="flex-1">
                            <div className={`font-display tracking-wider ${m.completed ? 'line-through text-gray-500' : 'text-purple-100'}`}>{m.title}</div>
                          </div>
                          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                            +{m.xpReward} XP
                          </div>
                        </div>
                      ))}
                      {(!selectedSkill.milestones || selectedSkill.milestones.length === 0) && (
                        <div className="text-center py-8 text-[10px] font-mono text-purple-800 uppercase tracking-widest">No directives assigned.</div>
                      )}
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-mono text-[10px] text-purple-500 uppercase tracking-widest">Data Archives</h4>
                      </div>
                      {selectedSkill.resources?.map((r: any) => (
                        <div key={r._id} className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-purple-800 group">
                          <div className="flex-1">
                            <div className="font-display tracking-wider text-purple-100">{r.title}</div>
                            <div className="text-[10px] font-mono text-purple-600 uppercase tracking-widest mt-1">{r.type}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            {r.url && (
                              <a href={r.url} target="_blank" rel="noreferrer" className="text-purple-500 hover:text-purple-300">
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                            <button 
                              onClick={async () => {
                                if (confirm('DELETE ARCHIVE?')) {
                                  await deleteResource({ id: selectedSkill._id, resourceId: r._id });
                                  setSelectedSkill((prev: any) => ({ ...prev, resources: prev.resources.filter((res:any) => res._id !== r._id)}));
                                }
                              }} 
                              className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-purple-900/50 rounded-2xl bg-black/20 text-center p-8">
                <Brain className="w-16 h-16 text-purple-900/50 mb-4" />
                <h3 className="font-display text-xl text-purple-500 tracking-[0.2em] uppercase mb-2">Awaiting Selection</h3>
                <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Select a neural node from the left panel to view metrics.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MODALS --- */}
      <SystemModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="INITIALIZE NODE">
        <form onSubmit={handleCreateSkill} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-purple-400 mb-2 uppercase">Subject Designation</label>
            <input type="text" name="name" required className="w-full bg-black/50 border border-purple-900 rounded p-3 text-white font-display focus:border-purple-500 focus:outline-none" placeholder="E.g. Quantum Physics" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-950 border border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-black rounded font-display tracking-[0.2em] uppercase transition-colors">
            {isSubmitting ? 'PROCESSING...' : 'INITIALIZE'}
          </button>
        </form>
      </SystemModal>

      <SystemModal isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)} title="NEW DIRECTIVE">
        <form onSubmit={handleAddMilestone} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-purple-400 mb-2 uppercase">Objective</label>
            <input type="text" name="title" required className="w-full bg-black/50 border border-purple-900 rounded p-3 text-white font-display focus:border-purple-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-purple-400 mb-2 uppercase">XP Yield</label>
            <input type="number" name="xpReward" required defaultValue={100} className="w-full bg-black/50 border border-purple-900 rounded p-3 text-white font-mono focus:border-purple-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-950 border border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-black rounded font-display tracking-[0.2em] uppercase transition-colors">
            CREATE DIRECTIVE
          </button>
        </form>
      </SystemModal>

      <SystemModal isOpen={isStudyModalOpen} onClose={() => setIsStudyModalOpen(false)} title="LOG SESSION">
        <form onSubmit={handleLogStudy} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-purple-400 mb-2 uppercase">Duration (Minutes)</label>
            <input type="number" name="minutes" required min="1" defaultValue={30} className="w-full bg-black/50 border border-purple-900 rounded p-3 text-white font-mono focus:border-purple-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-purple-400 mb-2 uppercase">Session Notes (Optional)</label>
            <textarea name="notes" className="w-full bg-black/50 border border-purple-900 rounded p-3 text-white font-sans text-sm focus:border-purple-500 focus:outline-none h-24" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-950 border border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-black rounded font-display tracking-[0.2em] uppercase transition-colors">
            TRANSMIT LOG
          </button>
        </form>
      </SystemModal>

    </div>
  );
};
