import React, { useState, useEffect, useRef } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { formatSafeDate } from '../utils/dateUtils';
import { 
  Plus, X, Target, Activity, BookOpen, 
  Search, Zap, Dumbbell, CircleDollarSign, Flame
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';
import { fetchWithAuth } from '../api/fetchHelper';
import { toast } from 'react-hot-toast';

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

// Exercise Library
import { EXERCISE_LIBRARY, type LibraryExercise } from '../utils/exerciseLibrary';

export const Workouts: React.FC = () => {
  const { 
    routines, sessions, volume, prs, 
    addRoutine, editRoutine, removeRoutine, 
    logWorkoutSession, isLoading, isLoggingSession 
  } = useWorkouts();
  
  const [activeTab, setActiveTab] = useState<'routines' | 'history' | 'prs' | 'active'>('routines');
  const [levelUpData, setLevelUpData] = useState<{isOpen: boolean, level: number, rank?: string, rankChanged?: boolean}>({ isOpen: false, level: 0 });
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Modals state
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editRoutineData, setEditRoutineData] = useState<any>(null);
  
  // Immersive Modals State
  const [briefingRoutine, setBriefingRoutine] = useState<any>(null);
  const [completedSessionData, setCompletedSessionData] = useState<any>(null);
  const [adaptiveScaling, setAdaptiveScaling] = useState(true);

  // Exercise Library search in create routine modal
  const [libSearch, setLibSearch] = useState('');
  const [libCategory, setLibCategory] = useState<string>('All');
  
  // Create Routine Form State
  const [routineForm, setRoutineForm] = useState({ name: '', splitType: 'Full Body', exercises: [] as any[] });

  // Active session state
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Fetch today status to read recovery score for adaptive difficulty
  const { data: todayStatus } = useQuery({
    queryKey: ['todayStatus'],
    queryFn: async () => {
      const res = await healthApi.getTodayStatus();
      return (await res.json()).data;
    }
  });

  // Fetch user profile for weight retrieval
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/users/profile');
      return (await res.json()).user;
    }
  });

  const recoveryScore = todayStatus?.recoveryLog?.recoveryScore ?? 75;
  const userWeight = profile?.weight ?? 70;

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
  const handleAddExerciseToForm = (libEx?: LibraryExercise) => {
    const defaultEx = {
      name: libEx?.name || '',
      targetSets: libEx?.defaultSets || 3,
      targetReps: libEx?.defaultReps || 10,
      targetWeight: libEx?.defaultWeight || 0,
      restTimeSeconds: 60
    };
    setRoutineForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, defaultEx]
    }));
    if (toast && libEx) {
      toast.success(`Objective loaded: ${libEx.name}`);
    }
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
    if (!routineForm.name) return alert("Program Title is required");
    if (routineForm.exercises.length === 0) return alert("Add at least one objective");

    const splitMap: Record<string, string> = {
      'Full Body': 'full_body',
      'Upper Body': 'upper',
      'Lower Body': 'lower',
      'Push': 'push',
      'Pull': 'pull',
      'Legs': 'legs'
    };
    const mappedSplitType = splitMap[routineForm.splitType] || 'custom';

    try {
      if (editRoutineData) {
        await editRoutine({ id: editRoutineData._id, data: { ...routineForm, splitType: mappedSplitType } });
      } else {
        await addRoutine({ ...routineForm, splitType: mappedSplitType });
      }
      setIsRoutineModalOpen(false);
      setEditRoutineData(null);
      setRoutineForm({ name: '', splitType: 'Full Body', exercises: [] });
    } catch (err: any) {
      alert(err.message || 'Failed to save program');
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm('Abandon this Hunter Blueprint?')) return;
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
    const reverseSplitMap: Record<string, string> = {
      'full_body': 'Full Body',
      'upper': 'Upper Body',
      'lower': 'Lower Body',
      'push': 'Push',
      'pull': 'Pull',
      'legs': 'Legs'
    };
    const uiSplitType = reverseSplitMap[routine.splitType] || 'Other';
    setRoutineForm({
      name: routine.name,
      splitType: uiSplitType,
      exercises: routine.exercises
    });
    setIsRoutineModalOpen(true);
  };

  // --- BRIEFING & ACTIVE SESSION ---
  const handleOpenBriefing = (routine: any) => {
    setBriefingRoutine(routine);
  };

  const startSession = (routine: any) => {
    setBriefingRoutine(null);

    // Apply adaptive difficulty scaling if active
    const scaledExercises = routine.exercises.map((e: any) => {
      let sets = e.targetSets;
      let reps = e.targetReps;
      if (adaptiveScaling) {
        if (recoveryScore < 50) {
          // Scale down
          sets = Math.max(1, Math.round(sets * 0.8));
        } else if (recoveryScore >= 80) {
          // Scale up
          reps = Math.round(reps * 1.1);
        }
      }
      return {
        name: e.name,
        restTimeSeconds: e.restTimeSeconds,
        sets: Array.from({ length: sets }).map(() => ({ reps, weight: e.targetWeight, completed: false }))
      };
    });

    setCurrentSession({
      routineId: routine._id,
      routineName: routine.name,
      startTime: Date.now(),
      exercises: scaledExercises
    });
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
      const result = await logWorkoutSession(payload);
      playSound('combo'); // Cinematic success audio

      const durationMinutes = Math.max(1, Math.round((Date.now() - currentSession.startTime) / 60000));
      
      // Calculate grade (S: 100%, A: >= 80%, B: >= 60%, C: < 60%)
      let totalCompleted = 0;
      let totalAssigned = 0;
      currentSession.exercises.forEach((ex: any) => {
        ex.sets.forEach((s: any) => {
          totalAssigned++;
          if (s.completed) totalCompleted++;
        });
      });
      const ratio = totalCompleted / totalAssigned;
      const grade = ratio === 1 ? 'S' : ratio >= 0.8 ? 'A' : ratio >= 0.6 ? 'B' : 'C';

      // Set cinematic completed data for screen overlay
      setCompletedSessionData({
        routineName: currentSession.routineName,
        newPRs: result.newPRs,
        xpResult: result.xpResult,
        durationMinutes,
        grade,
        totalVolume: result.session?.totalVolume || 0
      });

      // Handle standard triggers/toasts
      const newToasts: ToastData[] = [];
      if (result.newPRs && result.newPRs.length > 0) {
        result.newPRs.forEach((pr: any) => {
          newToasts.push({
            id: Math.random().toString(36).substring(2),
            title: `NEW RECORD: ${pr.exerciseName}`,
            description: `${pr.weight}kg x ${pr.reps} reps!`,
            icon: '🏆'
          });
        });
      }

      if (result.xpResult.newAchievements) {
        result.xpResult.newAchievements.forEach((a: any) => {
          newToasts.push({
            id: Math.random().toString(36).substring(2),
            title: a.name,
            description: `Achievement unlocked!`,
            icon: a.icon
          });
        });
      }

      if (newToasts.length > 0) setToasts(prev => [...prev, ...newToasts]);

      if (result.xpResult.leveledUp) {
        setLevelUpData({
          isOpen: true,
          level: result.xpResult.newLevel,
          rank: result.xpResult.newRank,
          rankChanged: result.xpResult.rankChanged
        });
      }

      setCurrentSession(null);
    } catch (err: any) {
      alert(err.message || 'Failed to log session');
    }
  };

  const handleVoiceCommand = (text: string) => {
    if (!currentSession || currentSession.exercises.length === 0) return;
    
    const lower = text.toLowerCase();
    const repMatch = lower.match(/(\d+)\s*reps?/);
    const weightMatch = lower.match(/(\d+)\s*(kg|kilos|pounds|lbs)/);

    if (repMatch && weightMatch) {
      const reps = parseInt(repMatch[1], 10);
      const weight = parseInt(weightMatch[1], 10);
      
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

  const totalLifetimeVolume = volume.reduce((sum: number, v: any) => sum + v.totalVolume, 0);
  const totalWorkoutsCount = sessions.length;
  const totalCaloriesLifetime = totalWorkoutsCount * 280;
  const visualLevel = Math.floor(totalLifetimeVolume / 1000) || 1;

  // Exercise Library filtering
  const filteredLibExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(libSearch.toLowerCase());
    const matchesCategory = libCategory === 'All' || ex.category === libCategory;
    return matchesSearch && matchesCategory;
  });

  // Briefing metadata calculations
  const getBriefingRank = (routine: any) => {
    const totalSetsCount = routine.exercises.reduce((sum: number, ex: any) => sum + ex.targetSets, 0);
    if (totalSetsCount >= 18) return 'S-RANK';
    if (totalSetsCount >= 14) return 'A-RANK';
    if (totalSetsCount >= 10) return 'B-RANK';
    return 'C-RANK';
  };

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

      {/* 1. CINEMATIC DAILY MISSION BRIEFING MODAL */}
      {briefingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fade-in_0.3s_ease-out]">
          <div className="hud-glass corner-brackets border-cyan-500/80 max-w-lg w-full p-6 space-y-6 relative overflow-hidden bg-black/90 shadow-[0_0_50px_rgba(0,229,255,0.2)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header Title */}
            <div className="text-center border-b border-cyan-900/50 pb-4">
              <span className="font-mono text-[10px] text-cyan-500 tracking-[0.3em] uppercase">SYSTEM DIRECTIVE</span>
              <h2 className="font-display font-bold text-2xl text-white uppercase tracking-widest mt-1">Daily Mission Briefing</h2>
              <span className="inline-block px-3 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-mono rounded mt-2 uppercase tracking-widest font-bold">
                Classification: {getBriefingRank(briefingRoutine)}
              </span>
            </div>

            {/* Mission Intel Parameters */}
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-black/50 border border-cyan-900/40 p-4 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">MISSION NAME:</span>
                  <span className="text-white uppercase font-bold">{briefingRoutine.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ESTIMATED DURATION:</span>
                  <span className="text-cyan-400">{briefingRoutine.exercises.length * 10} MIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ENERGY RECOVERY TIMELINE:</span>
                  <span className="text-green-400">18H - 24H COOLDOWN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TARGET ENERGY DECREMENT:</span>
                  <span className="text-orange-400">~{briefingRoutine.exercises.length * 55} KCAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PROTEIN REGENERATIVE TARGET:</span>
                  <span className="text-yellow-400">~{Math.round(userWeight * 1.6 / 3)}G RECOMMENDED</span>
                </div>
              </div>

              {/* Dynamic Rewards Card */}
              <div className="bg-cyan-950/20 border border-cyan-900/40 p-4 rounded-xl">
                <h4 className="text-[10px] text-cyan-400 uppercase tracking-widest mb-3 font-bold">Expected Clearance Rewards</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-yellow-950 border border-yellow-800 rounded">
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block">XP SYSTEM</span>
                      <span className="text-white font-bold font-display">+100 XP</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-950 border border-cyan-800 rounded">
                      <CircleDollarSign className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block">CREDITS</span>
                      <span className="text-white font-bold font-display">+50 COINS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adaptive Difficulty Alert */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Adaptive Difficulty Auto-Scaling</h4>
                  <p className="text-[9px] text-gray-500 uppercase mt-0.5">Scale targets based on current Recovery Score ({recoveryScore}%)</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={adaptiveScaling} 
                  onChange={e => setAdaptiveScaling(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-cyan-900/50 pt-4">
              <button 
                onClick={() => setBriefingRoutine(null)}
                className="flex-1 py-3 border border-cyan-900/50 text-cyan-500 hover:text-white rounded text-xs font-mono uppercase tracking-widest transition-all min-h-[44px]"
              >
                Decline
              </button>
              <button 
                onClick={() => startSession(briefingRoutine)}
                className="flex-[2] py-3 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded text-xs font-mono uppercase tracking-[0.2em] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] min-h-[44px]"
              >
                Accept Directive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CINEMATIC MISSION COMPLETE SCREEN */}
      {completedSessionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-[fade-in_0.4s_ease-out]">
          <div className="hud-glass corner-brackets border-yellow-500/80 max-w-xl w-full p-6 md:p-8 space-y-6 relative overflow-hidden bg-black shadow-[0_0_80px_rgba(234,179,8,0.25)]">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Header completed */}
            <div className="text-center space-y-2 border-b border-yellow-900/50 pb-6">
              <span className="font-mono text-xs text-yellow-500 tracking-[0.4em] uppercase animate-pulse">MISSION SUCCESSFUL</span>
              <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-widest text-shadow-glow">Quest Cleared</h1>
              <div className="text-5xl md:text-7xl font-black text-yellow-400 drop-shadow-[0_0_20px_#eab308] mt-3">{completedSessionData.grade}</div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">PERFORMANCE LEVEL</span>
            </div>

            {/* Stats increment summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rewards */}
              <div className="bg-yellow-950/10 border border-yellow-900/40 p-4 rounded-xl space-y-3 font-mono">
                <h4 className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold">Acquired Rewards</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-white">
                    <span>XP REWARD:</span>
                    <span className="text-yellow-400 font-bold font-display">+{completedSessionData.xpResult?.xpAwarded || 100} XP</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>COINS RECENT:</span>
                    <span className="text-cyan-400 font-bold font-display">+50 HUNTER COINS</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>RECOVERY DURATION:</span>
                    <span className="text-green-400">18 HOURS COOLDOWN</span>
                  </div>
                </div>
              </div>

              {/* Stat gains simulation */}
              <div className="bg-black/50 border border-yellow-900/30 p-4 rounded-xl space-y-3 font-mono">
                <h4 className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold">Attribute Allocations</h4>
                <div className="space-y-1.5 text-xs text-white">
                  <div className="flex justify-between">
                    <span>STRENGTH:</span>
                    <span className="text-cyan-400 font-bold">+2.0 STR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DISCIPLINE:</span>
                    <span className="text-purple-400 font-bold">+1.5 DIS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HUNTER POWER:</span>
                    <span className="text-green-400 font-bold">+1.2 PWR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ARIA Analysis integration */}
            <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-900/40 font-mono text-xs">
              <h4 className="text-[9px] text-purple-400 uppercase tracking-[0.25em] mb-2 font-bold">ARIA System Analysis</h4>
              <p className="text-purple-200/90 leading-relaxed italic">
                "ANALYSIS: Workout completed with a grade of {completedSessionData.grade} over {completedSessionData.durationMinutes} minutes. Total volume calculated at {completedSessionData.totalVolume.toLocaleString()} KG. Progression overload targets achieved. Ensure hydration levels are met within 2 hours."
              </p>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-yellow-900/50">
              <button 
                onClick={() => {
                  setCompletedSessionData(null);
                  setActiveTab('history');
                }}
                className="w-full py-3.5 bg-yellow-950 border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black rounded font-display font-bold uppercase tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] min-h-[44px]"
              >
                Close Directive Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 pt-4 md:pt-8 overflow-x-hidden">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <HunterRankBadge level={visualLevel} />
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-white tracking-[0.1em] md:tracking-[0.2em] uppercase text-shadow-glow">
                Training HQ 2.0
              </h1>
              <p className="font-mono text-[12px] text-cyan-500 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" /> Immersive Hunter Conditioning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded border text-[10px] font-mono tracking-widest uppercase transition-colors min-h-[44px] md:min-h-0 ${soundEnabled ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40' : 'border-gray-700 text-gray-500 bg-black/40'}`}
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
                className="w-full md:w-auto px-6 py-2.5 bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> Create Hunter Program
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 md:gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 custom-scrollbar border-b border-cyan-900/50 -mx-3 px-3 md:mx-0 md:px-0">
          {['routines', 'history', 'prs'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 md:px-8 py-3 min-h-[44px] rounded-t-lg text-[11px] font-mono font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-cyan-950/60 text-cyan-400 border-t border-l border-r border-cyan-500 shadow-[0_-5px_15px_rgba(8,145,178,0.2)]' 
                  : 'text-gray-500 hover:text-cyan-300 hover:bg-white/5 border-t border-l border-r border-transparent'
              }`}
            >
              {tab === 'routines' ? 'Mission Board' : tab === 'prs' ? 'Hunter Records' : 'Combat Logs'}
            </button>
          ))}
          {currentSession && (
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 md:px-8 py-3 min-h-[44px] rounded-t-lg text-[11px] font-mono font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase whitespace-nowrap transition-all ml-auto flex items-center gap-2 ${
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
              onStartSession={handleOpenBriefing}
              onEdit={openEditModal}
              onDelete={handleDeleteRoutine}
              onCreateProgram={async (p: any) => { await addRoutine(p); }}
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
            <div className="space-y-8 animate-[fade-in_0.4s_ease-out]">
              {/* Personal Records Cards */}
              <PersonalRecordChamber prs={prs} />
              
              {/* Hunter Records Stats overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Volume Lifted', val: `${totalLifetimeVolume.toLocaleString()} KG`, icon: Dumbbell },
                  { label: 'Completed Missions', val: `${totalWorkoutsCount} sessions`, icon: Target },
                  { label: 'Streak Status', val: 'Active', icon: Activity },
                  { label: 'Clearance Burn', val: `${totalCaloriesLifetime.toLocaleString()} kcal`, icon: Flame }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-black/60 border border-cyan-900/30 p-5 rounded-xl font-mono relative overflow-hidden flex items-center gap-4">
                    <div className="p-3 bg-cyan-950/50 border border-cyan-800/50 rounded-lg text-cyan-400">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block">{stat.label}</span>
                      <span className="text-lg font-bold text-white mt-1 block">{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-display font-bold uppercase tracking-[0.2em] text-[16px] text-cyan-500 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Combat Registry Logs
                </h2>
                {sessions.map((session: any) => {
                  const calculatedGrade = session.exercises.length > 3 ? 'S' : session.exercises.length > 2 ? 'A' : 'B';
                  const estimatedCalories = session.totalVolume > 5000 ? 420 : session.totalVolume > 2000 ? 280 : 150;
                  return (
                    <div key={session._id} className="bg-black/60 border border-cyan-900/50 rounded p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md hover:border-cyan-500 transition-colors group">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-900 rounded font-mono text-[9px] uppercase tracking-wider">{calculatedGrade}-GRADE</span>
                          <h4 className="font-display font-bold text-base uppercase tracking-wider text-white group-hover:text-cyan-300 transition-colors">{session.routineId?.name || 'AD-HOC TRAINING'}</h4>
                        </div>
                        <div className="flex gap-4 font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-2">
                          <span>{formatSafeDate(session.date, 'yyyy-MM-dd HH:mm')}</span>
                          <span>Duration: {session.durationMinutes || 45} mins</span>
                          <span className="text-orange-400">{estimatedCalories} kcal</span>
                          <span className="text-red-500">Boss Dmg: {Math.round(session.totalVolume * 0.05)}</span>
                        </div>
                      </div>
                      <div className="text-right bg-cyan-950/30 px-4 py-2 border border-cyan-900/50 rounded w-full sm:w-auto">
                        <div className="text-cyan-400 font-mono font-bold text-xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{session.totalVolume.toLocaleString()}</div>
                        <div className="text-[9px] text-cyan-600 font-mono uppercase tracking-[0.2em] mt-1">Total Force (KG)</div>
                      </div>
                    </div>
                  );
                })}
                {sessions.length === 0 && (
                  <div className="text-center py-12 bg-black/40 border border-dashed border-cyan-900/50 rounded">
                    <p className="text-[12px] font-mono text-cyan-700 uppercase tracking-widest">No combat records found.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="font-display font-bold uppercase tracking-[0.2em] text-[16px] text-cyan-500 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5" /> Force Trajectory
                </h2>
                <div className="bg-black/60 border border-cyan-900/50 rounded backdrop-blur-md h-64 md:h-80 min-h-[200px] p-4 md:p-6">
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

      {/* Routine/Program Create Modal */}
      <SystemModal isOpen={isRoutineModalOpen} onClose={() => { setIsRoutineModalOpen(false); setEditRoutineData(null); }} title={editRoutineData ? "UPDATE BLUEPRINT" : "CREATE BLUEPRINT"}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main program form */}
          <form onSubmit={handleSaveRoutine} className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-cyan-600 mb-2 uppercase">Blueprint Name</label>
                <input 
                  type="text" 
                  value={routineForm.name}
                  onChange={e => setRoutineForm({...routineForm, name: e.target.value})}
                  className="w-full bg-black/50 border border-cyan-900 rounded p-3 text-white font-display uppercase tracking-wider text-base md:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="E.g. Upper Body Might"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-cyan-600 mb-2 uppercase">Classification</label>
                <select 
                  value={routineForm.splitType}
                  onChange={e => setRoutineForm({...routineForm, splitType: e.target.value})}
                  className="w-full bg-black/50 border border-cyan-900 rounded p-3 text-white font-mono text-base md:text-sm focus:border-cyan-500 focus:outline-none appearance-none"
                >
                  {['Full Body', 'Upper Body', 'Lower Body', 'Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-[12px] font-mono tracking-widest text-cyan-500 uppercase border-b border-cyan-900 pb-2">Objectives (Exercises)</h4>
              {routineForm.exercises.map((ex, i) => (
                <div key={i} className="bg-black/30 border border-cyan-950 rounded p-4 relative group">
                  <button type="button" onClick={() => handleRemoveExerciseFromForm(i)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Objective Name</label>
                      <input type="text" value={ex.name} onChange={e => handleUpdateExerciseInForm(i, 'name', e.target.value)} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-display text-base md:text-sm pb-1 outline-none uppercase" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Sets</label>
                      <input type="number" min="1" value={ex.targetSets} onChange={e => handleUpdateExerciseInForm(i, 'targetSets', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-base md:text-sm pb-1 outline-none text-center" required />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Reps</label>
                      <input type="number" min="1" value={ex.targetReps} onChange={e => handleUpdateExerciseInForm(i, 'targetReps', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-base md:text-sm pb-1 outline-none text-center" required />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Weight (KG)</label>
                      <input type="number" min="0" value={ex.targetWeight} onChange={e => handleUpdateExerciseInForm(i, 'targetWeight', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-base md:text-sm pb-1 outline-none text-center" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest text-gray-500 mb-1 uppercase">Rest (S)</label>
                      <input type="number" min="0" value={ex.restTimeSeconds} onChange={e => handleUpdateExerciseInForm(i, 'restTimeSeconds', Number(e.target.value))} className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-mono text-base md:text-sm pb-1 outline-none text-center" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => handleAddExerciseToForm()} className="w-full py-3 border border-dashed border-cyan-900 text-cyan-600 hover:text-cyan-400 hover:border-cyan-500 rounded font-mono text-[10px] uppercase tracking-widest transition-all min-h-[44px]">
                + ADD CUSTOM OBJECTIVE
              </button>
            </div>
            
            <div className="pt-4 border-t border-cyan-900/50 flex justify-end">
              <button type="submit" className="w-full md:w-auto px-8 py-3 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded font-display font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] min-h-[44px]">
                {editRoutineData ? 'UPDATE BLUEPRINT' : 'INITIALIZE BLUEPRINT'}
              </button>
            </div>
          </form>

          {/* Exercise Library panel */}
          <div className="bg-black/60 border border-cyan-950 p-4 rounded-xl space-y-4">
            <h3 className="font-display text-sm text-cyan-400 uppercase tracking-widest border-b border-cyan-900 pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Exercise Library
            </h3>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
              <input 
                type="text"
                placeholder="Search..."
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                className="w-full bg-black/50 border border-cyan-900 rounded py-1.5 pl-9 pr-3 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
              {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setLibCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider whitespace-nowrap border ${
                    libCategory === cat ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-black/40 border-gray-900 text-gray-500 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {filteredLibExercises.map((ex, idx) => (
                <div key={idx} className="bg-black/30 border border-gray-900 p-2.5 rounded hover:border-cyan-900 transition-colors flex justify-between items-center gap-2">
                  <div>
                    <h5 className="font-display text-xs text-white uppercase tracking-wider">{ex.name}</h5>
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">
                      {ex.category} • {ex.equipment} • {ex.difficulty}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddExerciseToForm(ex)}
                    className="px-2 py-1 bg-cyan-950/80 border border-cyan-800 text-[8px] font-mono text-cyan-400 hover:bg-cyan-500 hover:text-black rounded uppercase"
                  >
                    + Insert
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SystemModal>
    </div>
  );
};
export default Workouts;
