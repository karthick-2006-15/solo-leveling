import React, { useState } from 'react';
import { Target, Check, Plus, Zap, ShieldCheck } from 'lucide-react';

interface ActiveSessionHUDProps {
  session: any;
  onUpdateSet: (exIdx: number, setIdx: number, field: string, val: any) => void;
  onAddSet: (exIdx: number) => void;
  onAddExercise: () => void;
  onFinish: () => void;
  playSound: (type: 'beep' | 'success' | 'combo') => void;
}

export const ActiveSessionHUD: React.FC<ActiveSessionHUDProps> = ({ session, onUpdateSet, onAddSet, onAddExercise, onFinish, playSound }) => {
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [floatingXPs, setFloatingXPs] = useState<{id: number, x: number, y: number, amount: number}[]>([]);

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

  const handleSetToggle = (exIdx: number, setIdx: number, completed: boolean, e: React.MouseEvent) => {
    onUpdateSet(exIdx, setIdx, 'completed', completed);
    
    if (completed) {
      // Combo logic
      playSound('success');
      setCombo(prev => prev + 1);
      if (comboTimer) clearTimeout(comboTimer);
      const timer = setTimeout(() => setCombo(0), 15000); // 15 seconds to keep combo
      setComboTimer(timer);

      // Floating XP logic
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const amount = 10 + (combo * 5); // Combo bonus
      const id = Date.now();
      setFloatingXPs(prev => [...prev, { id, x: rect.left, y: rect.top, amount }]);
      setTimeout(() => {
        setFloatingXPs(prev => prev.filter(xp => xp.id !== id));
      }, 1000);
    } else {
      playSound('beep');
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-6">
      
      {/* HUD Header */}
      <div className="bg-black/60 border border-cyan-800/50 p-6 rounded-lg backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_30px_rgba(8,145,178,0.15)] relative overflow-hidden">
        {/* Animated grid bg */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMjEyLCAyNTUsIDAuMSkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative z-10 flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="#00d4ff" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPct / 100)}`}
                className="transition-all duration-1000 ease-out shadow-[0_0_10px_#00d4ff]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-xl font-bold text-cyan-400">{Math.round(progressPct)}%</span>
            </div>
          </div>
          
          <div>
            <h2 className="font-display text-2xl font-bold text-white uppercase tracking-[0.1em] text-shadow-glow flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-500" /> Active Mission
            </h2>
            <p className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest mt-1">
              Targets: {completedSets} / {totalSets} Destroyed
            </p>
          </div>
        </div>

        {/* Combo Counter */}
        <div className="relative z-10 text-center min-w-[120px]">
          <div className="font-mono text-[10px] text-yellow-500 uppercase tracking-[0.3em] mb-1">Current Combo</div>
          <div className={`font-display font-bold text-4xl transition-all duration-300 ${combo > 2 ? 'text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse' : 'text-gray-600'}`}>
            {combo}x
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {session.exercises.map((ex: any, exIdx: number) => (
          <div key={exIdx} className="bg-black/40 border border-white/5 rounded-lg p-5 group hover:border-cyan-900/50 transition-colors">
            
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
              <h3 className="font-display text-lg text-white uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-600" /> {ex.name}
              </h3>
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
                  className={`grid grid-cols-[1fr_2fr_2fr_1fr] gap-4 items-center p-2 rounded transition-colors ${set.completed ? 'bg-cyan-950/20 border border-cyan-900/30' : 'bg-white/5 border border-transparent'}`}
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
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-center font-mono text-white text-sm focus:border-cyan-500 outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <input 
                      type="number"
                      value={set.reps || ''}
                      onChange={e => onUpdateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                      disabled={set.completed}
                      className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-center font-mono text-white text-sm focus:border-cyan-500 outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={(e) => handleSetToggle(exIdx, setIdx, !set.completed, e)}
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
          className="px-6 py-3 bg-black border border-cyan-900 text-cyan-500 hover:bg-cyan-950/50 rounded font-mono text-[11px] uppercase tracking-[0.2em] transition-all"
        >
          + Add Objective
        </button>
        
        <button 
          onClick={onFinish}
          disabled={completedSets === 0}
          className="px-8 py-3 bg-cyan-950 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black rounded font-display font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Zap className="w-5 h-5" /> Mission Complete
        </button>
      </div>

      {/* Floating XP Animations rendered in a portal-like absolute layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {floatingXPs.map(xp => (
          <div 
            key={xp.id}
            className="absolute font-display font-bold text-2xl text-yellow-400 text-shadow-glow animate-[floatUp_1s_ease-out_forwards]"
            style={{ left: xp.x, top: xp.y - 20 }}
          >
            +{xp.amount} XP
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
        }
      `}} />
    </div>
  );
};
