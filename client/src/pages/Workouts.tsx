import React, { useState, useEffect, useRef } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { formatSafeDate } from '../utils/dateUtils';
import { Plus, X, Target, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { LevelUpModal } from '../components/ui/LevelUpModal';
import { AchievementToast, type ToastData } from '../components/ui/AchievementToast';
import { SystemModal } from '../components/ui/SystemModal';

// Hunter System UI Components
import { HunterTrainingBackground } from '../components/training/HunterTrainingBackground';
import { HunterRankBadge } from '../components/training/HunterRankBadge';
import { DailyMissionsPanel } from '../components/training/DailyMissionsPanel';
import { ActiveSessionHUD } from '../components/training/ActiveSessionHUD';
import { PersonalRecordChamber } from '../components/training/PersonalRecordChamber';
import { VoiceWorkoutLogger } from '../components/training/VoiceWorkoutLogger';

export const Workouts: React.FC = () => {
  const { routines, sessions, volume, prs, addRoutine, editRoutine, removeRoutine, logWorkoutSession, isLoading, isLoggingSession } = useWorkouts();
  
  const [activeTab, setActiveTab] = useState<'routines' | 'history' | 'prs' | 'active'>('routines');
  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Modals state
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editRoutineData, setEditRoutineData] = useState<any>(null);
  
  // Create Routine Form State
  const [routineForm, setRoutineForm] = useState({ name: '', splitType: 'Full Body', exercises: [] as any[] });

  // Active session state
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context (Same as Nutrition)
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playSound = (type: 'beep' | 'success' | 'combo') => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'combo') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h2 className="font-display text-xl text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Initializing Hunter HQ...</h2>
      </div>
    );
  }

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- ROUTINE CRUD ---
  const handleAddExerciseToForm = () => {
    setRoutineForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', targetSets: 3, targetReps: 10, targetWeight: 0, restTimeSeconds: 60 }]
    }));
  };

  const handleUpdateExerciseInForm = (index: number, field: string, value: any) => {
    const newEx = [...routineForm.exercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setRoutineForm({ ...routineForm, exercises: newEx });
  };

  const handleRemoveExerciseFromForm = (index: number) => {
    setRoutineForm(prev => ({ ...prev, exercises: prev.exercises.filter((_, i) => i !== index) }));
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineForm.name) return alert("Mission Name is required");
    if (routineForm.exercises.length === 0) return alert("Add at least one objective");

    try {
      if (editRoutineData) {
        await editRoutine({ id: editRoutineData._id, data: routineForm });
      } else {
        await addRoutine(routineForm);
      }
      setIsRoutineModalOpen(false);
      setEditRoutineData(null);
      setRoutineForm({ name: '', splitType: 'Full Body', exercises: [] });
    } catch (err: any) {
      alert(err.message || 'Failed to save mission');
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm('Abandon this mission?')) return;
    try {
      await removeRoutine(id);
      setEditRoutineData(null);
      setIsRoutineModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const openEditModal = (routine: any) => {
    setEditRoutineData(routine);
    setRoutineForm({
      name: routine.name,
      splitType: routine.splitType,
      exercises: routine.exercises
    });
    setIsRoutineModalOpen(true);
  };

  // --- ACTIVE SESSION ---
  const startSession = (routine?: any) => {
    if (routine) {
      setCurrentSession({
        routineId: routine._id,
        exercises: routine.exercises.map((e: any) => ({
          name: e.name,
          restTimeSeconds: e.restTimeSeconds,
          sets: Array.from({ length: e.targetSets }).map(() => ({ reps: e.targetReps, weight: e.targetWeight, completed: false }))
        }))
      });
    } else {
      setCurrentSession({ exercises: [] });
    }
    setActiveTab('active');
  };

  const handleAddAdhocExercise = () => {
    setCurrentSession((prev: any) => ({
      ...prev,
      exercises: [...prev.exercises, { name: 'New Exercise', restTimeSeconds: 60, sets: [{ reps: 0, weight: 0, completed: false }] }]
    }));
  };

  const handleUpdateActiveSet = (exIndex: number, setIndex: number, field: string, value: any) => {
    const newSession = { ...currentSession };
    newSession.exercises[exIndex].sets[setIndex][field] = value;
    setCurrentSession(newSession);
  };

  const handleAddSet = (exIndex: number) => {
    const newSession = { ...currentSession };
    const ex = newSession.exercises[exIndex];
    const lastSet = ex.sets[ex.sets.length - 1] || { reps: 0, weight: 0 };
    ex.sets.push({ reps: lastSet.reps, weight: lastSet.weight, completed: false });
    setCurrentSession(newSession);
  };

  const finishSession = async () => {
    if (!currentSession) return;
    
    const payload = {
      routineId: currentSession.routineId,
      exercises: currentSession.exercises.map((ex: any) => ({
        name: ex.name,
        restTimeSeconds: ex.restTimeSeconds,
        sets: ex.sets.filter((s: any) => s.completed).map((s: any) => ({ reps: Number(s.reps), weight: Number(s.weight) }))
      })).filter((ex: any) => ex.sets.length > 0)
    };

    if (payload.exercises.length === 0) {
      return alert("No targets destroyed. Mission failed.");
    }

    try {
      const { newPRs, xpResult } = await logWorkoutSession(payload);
      playSound('combo'); // Big success sound
      
      const newToasts: ToastData[] = [];
      if (newPRs && newPRs.length > 0) {
        newPRs.forEach((pr: any) => {
          newToasts.push({
            id: Math.random().toString(36).substring(2),
            title: `NEW RECORD: ${pr.exerciseName}`,
            description: `${pr.weight}kg x ${pr.reps} reps!`,
            icon: '🏆'
          });
        });
      }

      if (xpResult.newAchievements) {
        xpResult.newAchievements.forEach((a: any) => {
          newToasts.push({
            id: Math.random().toString(36).substring(2),
            title: a.name,
            description: `Achievement unlocked!`,
            icon: a.icon
          });
        });
      }

      if (newToasts.length > 0) setToasts(prev => [...prev, ...newToasts]);

      if (xpResult.leveledUp) {
        setLevelUpData({
          isOpen: true,
          level: xpResult.newLevel,
          rank: xpResult.newRank,
          rankChanged: xpResult.rankChanged
        });
      }

      setCurrentSession(null);
      setActiveTab('history');
    } catch (err: any) {
      alert(err.message || 'Failed to log session');
    }
  };

  const handleVoiceCommand = (text: string) => {
    // A simple regex parser to look for "X reps at Y kg" or similar
    // This is a front-end simulation of AI command parsing for adding sets quickly
    if (!currentSession || currentSession.exercises.length === 0) return;
    
    const lower = text.toLowerCase();
    const repMatch = lower.match(/(\d+)\s*reps?/);
    const weightMatch = lower.match(/(\d+)\s*(kg|kilos|pounds|lbs)/);

    if (repMatch && weightMatch) {
      const reps = parseInt(repMatch[1], 10);
      const weight = parseInt(weightMatch[1], 10);
      
      // Auto-fill the first uncompleted set found
      const newSession = { ...currentSession };
      let filled = false;
      for (let i = 0; i < newSession.exercises.length; i++) {
        for (let j = 0; j < newSession.exercises[i].sets.length; j++) {
          if (!newSession.exercises[i].sets[j].completed && !filled) {
            newSession.exercises[i].sets[j].reps = reps;
            newSession.exercises[i].sets[j].weight = weight;
            filled = true;
            break;
          }
        }
      }
      setCurrentSession(newSession);
      playSound('success');
    }
  };

  const graphData = volume.map((v: any) => ({
    date: formatSafeDate(v.date, 'MMM dd'),
    totalVolume: v.totalVolume
  }));

  // Determine user level for badge (approximate from routines/sessions length if level isn't in hook)
  // Since we don't have direct access to 'level' in useWorkouts, we'll use a mocked progression or pull it from elsewhere if needed.
  // We'll use total volume to mock a level purely for UI if we don't have it.
  const totalLiftimeVolume = volume.reduce((sum: number, v: any) => sum + v.totalVolume, 0);
  const visualLevel = Math.floor(totalLiftimeVolume / 1000) || 1;

  return (
    <div className="relative min-h-screen text-white pb-20 md:pb-8 font-sans selection:bg-cyan-900 selection:text-white z-0">
      <HunterTrainingBackground />
      
      <AchievementToast toasts={toasts} removeToast={removeToast} />
      <LevelUpModal 
        isOpen={levelUpData.isOpen} 
        onClose={() => setLevelUpData({ ...levelUpData, isOpen: false })}
        newLevel={levelUpData.level}
        newRank={levelUpData.rank}
        rankChanged={levelUpData.rankChanged}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          
          <div className="flex items-center gap-6">
            <HunterRankBadge level={visualLevel} />
            <div>
              <h1 className="font-display font-bold text-4xl text-white tracking-[0.2em] uppercase text-shadow-glow">
                Training HQ
              </h1>
              <p className="font-mono text-[12px] text-cyan-500 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" /> Hunter conditioning facility
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded border text-[10px] font-mono tracking-widest uppercase transition-colors ${soundEnabled ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40' : 'border-gray-700 text-gray-500 bg-black/40'}`}
            >
              {soundEnabled ? 'Audio: ON' : 'Audio: OFF'}
            </button>
            
            {activeTab === 'active' && (
              <VoiceWorkoutLogger 
                onVoiceCommand={handleVoiceCommand} 
                disabled={isLoggingSession}
              />
            )}
            
            {activeTab === 'routines' && (
              <button 
                onClick={() => {
                  setEditRoutineData(null);
                  setRoutineForm({ name: '', splitType: 'Full Body', exercises: [] });
                  setIsRoutineModalOpen(true);
                }} 
                className="px-6 py-2.5 bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <Plus className="w-4 h-4" /> Create Mission
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar border-b border-cyan-900/50">
          {['routines', 'history', 'prs'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-t-lg text-[11px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-cyan-950/60 text-cyan-400 border-t border-l border-r border-cyan-500 shadow-[0_-5px_15px_rgba(8,145,178,0.2)]' 
                  : 'text-gray-500 hover:text-cyan-300 hover:bg-white/5 border-t border-l border-r border-transparent'
              }`}
            >
              {tab === 'routines' ? 'Mission Board' : tab === 'prs' ? 'Hall of Records' : 'Combat Logs'}
            </button>
          ))}
          {currentSession && (
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-8 py-3 rounded-t-lg text-[11px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all ml-auto flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-red-950/60 text-red-400 border-t border-l border-r border-red-500 shadow-[0_-5px_15px_rgba(239,68,68,0.2)]'
                  : 'bg-red-950/20 text-red-500/50 border-t border-l border-r border-transparent hover:bg-red-950/40 hover:text-red-400'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Active Mission
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="animate-[fade-in_0.3s_ease-out]">
          {activeTab === 'routines' && (
            <DailyMissionsPanel 
              routines={routines} 
              onStartSession={startSession}
              onEdit={openEditModal}
              onDelete={handleDeleteRoutine}
            />
          )}

          {activeTab === 'active' && currentSession && (
            <ActiveSessionHUD 
              session={currentSession}
              onUpdateSet={handleUpdateActiveSet}
              onAddSet={handleAddSet}
              onAddExercise={handleAddAdhocExercise}
              onFinish={finishSession}
              playSound={playSound}
            />
          )}

          {activeTab === 'prs' && (
            <PersonalRecordChamber prs={prs} />
          )}

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-display font-bold uppercase tracking-[0.2em] text-[16px] text-cyan-500 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Mission History
                </h2>
                {sessions.map((session: any) => (
                  <div key={session._id} className="bg-black/60 border border-cyan-900/50 rounded p-5 flex justify-between items-center backdrop-blur-md hover:border-cyan-500 transition-colors group">
                    <div>
                      <h4 className="font-display font-bold text-lg uppercase tracking-wider text-white mb-1 group-hover:text-cyan-300 transition-colors">{session.routineId?.name || 'AD-HOC MISSION'}</h4>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{formatSafeDate(session.date, 'MMM dd, yyyy • HH:mm')}</p>
                    </div>
                    <div className="text-right bg-cyan-950/30 px-4 py-2 border border-cyan-900/50 rounded">
                      <div className="text-cyan-400 font-mono font-bold text-xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{session.totalVolume.toLocaleString()}</div>
                      <div className="text-[9px] text-cyan-600 font-mono uppercase tracking-[0.2em] mt-1">Total Force (KG)</div>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-12 bg-black/40 border border-dashed border-cyan-900/50 rounded">
                    <p className="text-[12px] font-mono text-cyan-700 uppercase tracking-widest">No combat records found.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="font-display font-bold uppercase tracking-[0.2em] text-[16px] text-cyan-500 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5" /> Force Output
                </h2>
                <div className="bg-black/60 border border-cyan-900/50 rounded backdrop-blur-md h-80 p-6">
                  {graphData.length > 0 ? (
                    <ResponsiveContainer width="99%" height="100%">
                      <AreaChart data={graphData}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="rgba(0,212,255,0.4)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                        <YAxis stroke="rgba(0,212,255,0.4)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" width={45} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,5,11,0.9)', border: '1px solid #00d4ff', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} 
                          itemStyle={{ color: '#00d4ff' }}
                        />
                        <Area type="monotone" dataKey="totalVolume" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[11px] font-mono text-cyan-900 uppercase tracking-widest">
                      Insufficient Data
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legacy Routine Modal styled as a Hunter Terminal */}
      <SystemModal isOpen={isRoutineModalOpen} onClose={() => { setIsRoutineModalOpen(false); setEditRoutineData(null); }} title={editRoutineData ? "UPDATE MISSION" : "CREATE MISSION"}>
        <form onSubmit={handleSaveRoutine} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono tracking-widest text-cyan-600 mb-2 uppercase">Mission Name</label>
              <input 
                type="text" 
                value={routineForm.name}
                onChange={e => setRoutineForm({...routineForm, name: e.target.value})}
                className="w-full bg-black/50 border border-cyan-900 rounded p-3 text-white font-display uppercase tracking-wider focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="E.g. Upper Body Power"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-widest text-cyan-600 mb-2 uppercase">Classification</label>
              <select 
                value={routineForm.splitType}
                onChange={e => setRoutineForm({...routineForm, splitType: e.target.value})}
                className="w-full bg-black/50 border border-cyan-900 rounded p-3 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none appearance-none"
              >
                {['Full Body', 'Upper Body', 'Lower Body', 'Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-[12px] font-mono tracking-widest text-cyan-500 uppercase border-b border-cyan-900 pb-2">Mission Objectives (Exercises)</h4>
            {routineForm.exercises.map((ex, i) => (
              <div key={i} className="bg-black/30 border border-cyan-950 rounded p-4 relative group">
                <button type="button" onClick={() => handleRemoveExerciseFromForm(i)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Target Name</label>
                    <input type="text" value={ex.name} onChange={e => handleUpdateExerciseInForm(i, 'name', e.target.value)} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-display text-sm pb-1 outline-none uppercase" required />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Sets</label>
                    <input type="number" min="1" value={ex.targetSets} onChange={e => handleUpdateExerciseInForm(i, 'targetSets', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-sm pb-1 outline-none text-center" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Reps</label>
                    <input type="number" min="1" value={ex.targetReps} onChange={e => handleUpdateExerciseInForm(i, 'targetReps', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-sm pb-1 outline-none text-center" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">WT (KG)</label>
                    <input type="number" min="0" value={ex.targetWeight} onChange={e => handleUpdateExerciseInForm(i, 'targetWeight', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-sm pb-1 outline-none text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">REST (S)</label>
                    <input type="number" min="0" value={ex.restTimeSeconds} onChange={e => handleUpdateExerciseInForm(i, 'restTimeSeconds', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-sm pb-1 outline-none text-center" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddExerciseToForm} className="w-full py-3 border border-dashed border-cyan-900 text-cyan-600 hover:text-cyan-400 hover:border-cyan-500 rounded font-mono text-[10px] uppercase tracking-widest transition-all">
              + ADD OBJECTIVE
            </button>
          </div>
          <div className="pt-4 border-t border-cyan-900/50 flex justify-end">
            <button type="submit" className="px-8 py-3 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded font-display font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {editRoutineData ? 'UPDATE MISSION' : 'INITIALIZE MISSION'}
            </button>
          </div>
        </form>
      </SystemModal>
    </div>
  );
};
