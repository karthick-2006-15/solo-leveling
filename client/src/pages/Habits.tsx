import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, XCircle, Plus, ShieldCheck, Zap } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { SystemModal } from '../components/ui/SystemModal';
import { useSystemSound } from '../hooks/useSystemSound';
import { LevelUpModal } from '../components/ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../components/ui/AchievementToast';

export const Habits: React.FC = () => {
  const { habits, isLoading, addHabit, markComplete, editHabit, removeHabit, isCompleting } = useHabits();
  const { play } = useSystemSound();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Target', xpValue: 10 });

  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Scanning Mission Board...</h2>
      </div>
    );
  }

  const handleToggle = async (id: string, currentlyCompleted: boolean) => {
    if (isCompleting) return;
    try {
      if (!currentlyCompleted) play('success');
      const result = await markComplete(id);
      
      if (result && result.xpResult) {
        if (result.xpResult.leveledUp) {
          setLevelUpData({ isOpen: true, level: result.xpResult.newLevel, rank: result.xpResult.newRank, rankChanged: result.xpResult.rankChanged });
        }
        if (result.xpResult.newAchievements?.length > 0) {
          setToasts(prev => [...prev, ...result.xpResult.newAchievements.map((a: any) => ({ id: Math.random().toString(36).substring(2), title: a.name, description: `Unlocked: ${a.name}`, icon: a.icon }))]);
        }
      }
    } catch (err) {
      console.error(err);
      play('error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      if (editingHabit) {
        await editHabit({ id: editingHabit._id, data: formData });
      } else {
        await addHabit(formData);
      }
      setIsModalOpen(false);
      setEditingHabit(null);
      setFormData({ name: '', icon: 'Target', xpValue: 10 });
      play('click');
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (habit: any) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      icon: habit.icon || 'Target',
      xpValue: habit.xpValue || 10
    });
    setIsModalOpen(true);
    play('click');
  };

  const activeHabits = habits.filter((h: any) => h.active);
  const completedCount = activeHabits.filter((h: any) => h.completedToday).length;
  const progressPercent = activeHabits.length > 0 ? (completedCount / activeHabits.length) * 100 : 0;

  return (
    <div className="relative space-y-8 pb-24 md:pb-8 font-sans z-10 animate-[fade-in_0.5s_ease-out]">
      <AchievementToast toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <LevelUpModal isOpen={levelUpData.isOpen} onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })} newLevel={levelUpData.level} newRank={levelUpData.rank} rankChanged={levelUpData.rankChanged} />

      {/* HEADER */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-black/60 border border-cyan-900/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-50" />
        
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-[0.2em] uppercase text-shadow-glow flex items-center gap-4">
            <Target className="w-8 h-8 text-cyan-500" /> Daily Missions
          </h1>
          <p className="font-mono text-cyan-500 text-[11px] tracking-[0.4em] uppercase mt-2">
            Complete directives to earn XP
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
          <div className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 mb-2">
            Completion Status: {completedCount} / {activeHabits.length}
          </div>
          <div className="w-full md:w-64 h-2 bg-black border border-cyan-900/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, type: 'spring' }}
              className="h-full bg-gradient-to-r from-cyan-900 via-cyan-500 to-cyan-300 shadow-[0_0_15px_#00d4ff]"
            />
          </div>
        </div>
      </motion.div>

      {/* MISSION BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {activeHabits.map((habit: any, i: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
              key={habit._id}
              className={`relative bg-black/40 border rounded-xl p-5 backdrop-blur-md overflow-hidden group transition-all duration-300 ${
                habit.completedToday 
                  ? 'border-cyan-500/30 opacity-60 hover:opacity-100 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]' 
                  : 'border-cyan-900/50 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1'
              }`}
            >
              {habit.completedToday && (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(34,211,238,0.02)_10px,rgba(34,211,238,0.02)_20px)] pointer-events-none" />
              )}
              
              <div className="relative z-10 flex items-start gap-4">
                {/* Checkbox Target */}
                <button 
                  onClick={() => handleToggle(habit._id, habit.completedToday)}
                  disabled={isCompleting}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                    habit.completedToday 
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_15px_#00d4ff]' 
                      : 'bg-black border-cyan-800 text-gray-700 hover:border-cyan-500 hover:text-cyan-500'
                  }`}
                >
                  {isCompleting ? (
                    <div className="w-5 h-5 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin" />
                  ) : habit.completedToday ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <Target className="w-6 h-6 opacity-50" />
                  )}
                </button>

                <div className="flex-1 cursor-pointer" onClick={() => openEdit(habit)}>
                  <div className="flex justify-between items-start">
                    <h3 className={`font-display text-lg uppercase tracking-wider mb-1 ${habit.completedToday ? 'text-gray-400 line-through' : 'text-cyan-50 text-shadow-glow'}`}>
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border text-cyan-400 border-cyan-900 bg-cyan-950/30`}>
                        +{habit.xpValue} XP
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-[10px] font-mono text-cyan-700 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Streak: {habit.streak}</span>
                  </div>
                </div>
              </div>

              {habit.completedToday && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -20 }} transition={{ duration: 1 }}
                  className="absolute right-4 top-1/2 font-mono text-cyan-400 font-bold text-shadow-glow pointer-events-none"
                >
                  +XP
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ADD NEW MISSION BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingHabit(null);
            setFormData({ name: '', icon: 'Target', xpValue: 10 });
            setIsModalOpen(true);
            play('click');
          }}
          className="bg-black/20 border-2 border-dashed border-cyan-900/50 hover:border-cyan-500/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-cyan-700 hover:text-cyan-400 transition-colors h-[140px]"
        >
          <Plus className="w-8 h-8" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Initialize New Mission</span>
        </motion.button>
      </div>

      {/* MODAL */}
      <SystemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHabit ? 'UPDATE MISSION' : 'NEW MISSION'}>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-cyan-600 mb-2 uppercase">Mission Designation</label>
            <input 
              type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/50 border border-cyan-900 rounded p-3 text-white font-display uppercase tracking-wider text-base md:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="E.g. Morning Meditation"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono tracking-widest text-cyan-600 mb-2 uppercase">XP Reward</label>
              <input type="number" value={formData.xpValue} onChange={e => setFormData({...formData, xpValue: Number(e.target.value)})} className="w-full bg-black/50 border border-cyan-900 rounded p-3 text-white font-mono text-base md:text-sm focus:border-cyan-500 focus:outline-none" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-cyan-900/50 flex justify-between items-center">
            {editingHabit ? (
              <button 
                type="button" 
                onClick={async () => {
                  if (confirm('ABANDON MISSION PERMANENTLY?')) {
                    await removeHabit(editingHabit._id);
                    setIsModalOpen(false);
                    play('error');
                  }
                }}
                className="text-red-500 text-[10px] font-mono tracking-widest uppercase hover:text-red-400 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Terminate Mission
              </button>
            ) : <div />}
            
            <button type="submit" className="px-8 py-3 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded font-display font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {editingHabit ? 'UPDATE MISSION' : 'INITIALIZE MISSION'}
            </button>
          </div>
        </form>
      </SystemModal>
    </div>
  );
};
