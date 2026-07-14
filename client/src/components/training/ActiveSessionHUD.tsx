import React, { useState, useEffect } from 'react';
import { Target, Check, Plus, Zap, ShieldCheck, Timer } from 'lucide-react';

interface ActiveSessionHUDProps {
  session: any;
  onUpdateSet: (exIdx: number, setIdx: number, field: string, val: any) => void;
  onAddSet: (exIdx: number) => void;
  onAddExercise: () => void;
  onFinish: () => void;
  playSound: (type: 'beep' | 'success' | 'combo') => void;
}

export const ActiveSessionHUD: React.FC<ActiveSessionHUDProps> = ({ 
  session, 
  onUpdateSet, 
  onAddSet, 
  onAddExercise, 
  onFinish, 
  playSound 
}) => {
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [floatingStats, setFloatingStats] = useState<{id: number, x: number, y: number, text: string, color: string}[]>([]);

  // Timers
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTotal, setRestTotal] = useState(60);
  const [isRestActive, setIsRestActive] = useState(false);

  // Live Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rest Timer countdown effect
  useEffect(() => {
    if (!isRestActive || restSeconds <= 0) {
      if (restSeconds === 0 && isRestActive) {
        playSound('combo'); // Finished rest sound alert
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsRestActive(false);
      }
      return;
    }
    const timer = setTimeout(() => {
      setRestSeconds(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [restSeconds, isRestActive, playSound]);

  // Calculate overall progress
  let totalSets = 0;
  let completedSets = 0;
  session.exercises.forEach((ex: any) => {
    ex.sets.forEach((s: any) => {
      totalSets++;
      if (s.completed) completedSets++;
    });
  });
  const progressPct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Stats calculation
  const caloriesBurned = Math.round((elapsedSeconds * 0.12) + (completedSets * 10));
  const currentXPEarned = completedSets * 15 + combo * 5;

  const handleSetToggle = (exIdx: number, setIdx: number, completed: boolean, restTime: number, e: React.MouseEvent) => {
    onUpdateSet(exIdx, setIdx, 'completed', completed);
    
    if (completed) {
      // Trigger Rest Timer automatically
      if (restTime > 0) {
        setRestTotal(restTime);
        setRestSeconds(restTime);
        setIsRestActive(true);
      }

      // Combo & Audio
      playSound('success');
      setCombo(prev => prev + 1);
      if (comboTimer) clearTimeout(comboTimer);
      const timer = setTimeout(() => setCombo(0), 15000); // 15s combo limit
      setComboTimer(timer);

      // Multi-stat gains animation
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = rect.left;
      const clickY = rect.top;
      
      const statsList = [
        { text: `+${10 + combo} XP`, color: 'text-yellow-400 font-bold' },
        { text: '+0.1 STR', color: 'text-cyan-400' },
        { text: '+0.1 DIS', color: 'text-purple-400' },
        { text: '+0.1 PWR', color: 'text-green-400' }
      ];

      statsList.forEach((stat, index) => {
        setTimeout(() => {
          const id = Date.now() + index;
          setFloatingStats(prev => [...prev, {
            id,
            x: clickX + (index * 20) - 20,
            y: clickY - (index * 15),
            text: stat.text,
            color: stat.color
          }]);

          setTimeout(() => {
            setFloatingStats(prev => prev.filter(item => item.id !== id));
          }, 1200);
        }, index * 150);
      });
    } else {
      playSound('beep');
    }
  };

  const formatTimer = (totalSec: number) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-6">
      
      {/* Rest Timer Overlay */}
      {isRestActive && (
        <div className="bg-black/80 border border-cyan-500/50 rounded-xl p-4 md:p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,229,255,0.2)] animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-center gap-4">
            {/* Rest Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#00E5FF" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - restSeconds / restTotal)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-base font-bold text-cyan-400">{restSeconds}s</span>
              </div>
            </div>
            <div>
              <h4 className="font-display text-sm text-cyan-400 uppercase tracking-widest">Rest Interval Active</h4>
              <p className="font-mono text-[10px] text-gray-500 uppercase mt-0.5">Prepare for your next objective</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setRestSeconds(prev => prev + 30)}
              className="px-3 py-1.5 bg-cyan-950 border border-cyan-800 text-[10px] font-mono rounded text-gray-400 hover:text-white"
            >
              +30s
            </button>
            <button 
              onClick={() => setIsRestActive(false)}
              className="px-4 py-1.5 bg-red-950/60 border border-red-800 text-[10px] font-mono rounded text-red-400 hover:text-white"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* HUD Header */}
      <div className="bg-black/60 border border-cyan-800/50 p-4 md:p-6 rounded-lg backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 shadow-[0_0_30px_rgba(8,145,178,0.15)] relative overflow-hidden">
        {/* Circular Progress */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="#00d4ff" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPct / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-base font-bold text-cyan-400">{Math.round(progressPct)}%</span>
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white uppercase tracking-[0.1em] text-shadow-glow flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" /> Active Mission
            </h2>
            <p className="font-mono text-[9px] text-cyan-500 uppercase tracking-widest mt-1">
              Objectives: {completedSets} / {totalSets} Destroyed
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 relative z-10 border-t md:border-t-0 md:border-l md:border-r border-white/5 pt-4 md:pt-0 px-0 md:px-6">
          <div className="text-center">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Duration</span>
            <span className="text-sm font-mono font-bold text-white flex items-center justify-center gap-1 mt-1">
              <Timer className="w-3.5 h-3.5 text-cyan-500" /> {formatTimer(elapsedSeconds)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Est. Burn</span>
            <span className="text-sm font-mono font-bold text-orange-400 block mt-1">{caloriesBurned} kcal</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Est. XP</span>
            <span className="text-sm font-mono font-bold text-yellow-400 block mt-1">+{currentXPEarned} XP</span>
          </div>
        </div>

        {/* Combo */}
        <div className="relative z-10 text-center flex flex-col justify-center items-center md:items-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
          <span className="font-mono text-[9px] text-yellow-500 uppercase tracking-[0.3em] mb-1">Current Combo</span>
          <span className={`font-display font-bold text-3xl transition-all duration-300 ${combo > 2 ? 'text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse' : 'text-gray-600'}`}>
            {combo}x
          </span>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {session.exercises.map((ex: any, exIdx: number) => (
          <div key={exIdx} className="bg-black/40 border border-white/5 rounded-lg p-4 md:p-5 group hover:border-cyan-900/50 transition-colors">
            
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
              <h3 className="font-display text-lg text-white uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-600" /> {ex.name}
              </h3>
              <span className="font-mono text-[9px] text-gray-500 uppercase">Rest: {ex.restTimeSeconds}s</span>
            </div>

            <div className="space-y-3">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-4 px-2 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                <div className="text-center">Set</div>
                <div className="text-center">Weight (kg)</div>
                <div className="text-center">Reps</div>
                <div className="text-center">Status</div>
              </div>
              
              {/* Sets */}
              {ex.sets.map((set: any, setIdx: number) => (
                <div 
                  key={setIdx} 
                  className={`grid grid-cols-[1fr_2fr_2fr_1fr] gap-3 md:gap-4 items-center p-2 rounded transition-colors ${set.completed ? 'bg-cyan-950/20 border border-cyan-900/30' : 'bg-white/5 border border-transparent'}`}
                >
                  <div className="text-center font-mono text-sm text-gray-400">
                    {setIdx + 1}
                  </div>
                  <div>
                    <input 
                      type="number"
                      value={set.weight || ''}
                      onChange={e => onUpdateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                      disabled={set.completed}
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-center font-mono text-white text-base md:text-sm focus:border-cyan-500 outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <input 
                      type="number"
                      value={set.reps || ''}
                      onChange={e => onUpdateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                      disabled={set.completed}
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-center font-mono text-white text-base md:text-sm focus:border-cyan-500 outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={(e) => handleSetToggle(exIdx, setIdx, !set.completed, ex.restTimeSeconds || 60, e)}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                        set.completed 
                          ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {set.completed ? <Check className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => onAddSet(exIdx)}
              className="mt-4 w-full py-2 border border-dashed border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-gray-400 hover:text-cyan-400 font-mono text-[10px] uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3" /> Add Target Set
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t border-cyan-900/50">
        <button 
          onClick={onAddExercise}
          className="px-6 py-3 bg-black border border-cyan-900 text-cyan-500 hover:bg-cyan-950/50 rounded font-mono text-[11px] uppercase tracking-[0.2em] transition-all min-h-[44px]"
        >
          + Add Objective
        </button>
        
        <button 
          onClick={onFinish}
          disabled={completedSets === 0}
          className="px-8 py-3 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded font-display font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"
        >
          <Zap className="w-5 h-5" /> Mission Complete
        </button>
      </div>

      {/* Floating Gain Text Animations */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {floatingStats.map(stat => (
          <div 
            key={stat.id}
            className={`absolute font-display font-bold text-shadow-glow text-lg uppercase ${stat.color} animate-[floatUp_1.2s_ease-out_forwards]`}
            style={{ left: stat.x, top: stat.y - 15 }}
          >
            {stat.text}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.9); opacity: 1; }
          100% { transform: translateY(-70px) scale(1.3); opacity: 0; }
        }
      `}} />
    </div>
  );
};
export default ActiveSessionHUD;
