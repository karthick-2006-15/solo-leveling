import React, { useState } from 'react';
import { Play, Flame, Edit2, Trash2, ShieldAlert, Sparkles, Wand2, BookOpen, Compass } from 'lucide-react';
import { EXERCISE_LIBRARY } from '../../utils/exerciseLibrary';

interface DailyMissionsPanelProps {
  routines: any[];
  onStartSession: (routine: any) => void;
  onEdit: (routine: any) => void;
  onDelete: (id: string) => void;
  onCreateProgram: (program: any) => Promise<void>;
}

export const DailyMissionsPanel: React.FC<DailyMissionsPanelProps> = ({ 
  routines, 
  onStartSession, 
  onEdit, 
  onDelete,
  onCreateProgram 
}) => {
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState<'strength' | 'hypertrophy' | 'fat_loss' | 'endurance' | 'calisthenics'>('strength');
  const [aiDifficulty, setAiDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [customName, setCustomName] = useState('');

  // Determine "Boss Fight" based on highest number of total sets
  const bossRoutineId = routines.length > 0 ? [...routines].sort((a, b) => {
    const aSets = a.exercises.reduce((sum: number, ex: any) => sum + ex.targetSets, 0);
    const bSets = b.exercises.reduce((sum: number, ex: any) => sum + ex.targetSets, 0);
    return bSets - aSets;
  })[0]._id : null;

  const handleGenerateAiProgram = async () => {
    let exercises: any[] = [];
    const goalTitle = aiGoal.replace('_', ' ').toUpperCase();
    const name = customName.trim() || `AI SHADOW ${goalTitle} [${aiDifficulty.toUpperCase()}]`;

    // Filter exercises from library based on difficulty/goal
    if (aiGoal === 'strength') {
      const targets = ['Bench Press', 'Barbell Squat', 'Deadlift', 'Overhead Press'];
      exercises = EXERCISE_LIBRARY.filter(e => targets.includes(e.name)).map(e => ({
        name: e.name,
        targetSets: e.defaultSets,
        targetReps: 5, // low reps for strength
        targetWeight: e.defaultWeight,
        restTimeSeconds: 120 // long rest
      }));
    } else if (aiGoal === 'hypertrophy') {
      const targets = ['Bench Press', 'Barbell Squat', 'Pull-Up', 'Dumbbell Curl', 'Lateral Raise'];
      exercises = EXERCISE_LIBRARY.filter(e => targets.includes(e.name)).map(e => ({
        name: e.name,
        targetSets: e.defaultSets,
        targetReps: 10,
        targetWeight: e.defaultWeight,
        restTimeSeconds: 90
      }));
    } else if (aiGoal === 'fat_loss') {
      const targets = ['Kettlebell Swing', 'Dumbbell Lunge', 'Push-Up', 'Plank'];
      exercises = EXERCISE_LIBRARY.filter(e => targets.includes(e.name)).map(e => ({
        name: e.name,
        targetSets: 3,
        targetReps: 15,
        targetWeight: Math.max(0, e.defaultWeight - 10),
        restTimeSeconds: 45 // short rest
      }));
    } else if (aiGoal === 'endurance') {
      const targets = ['Push-Up', 'Plank', 'Kettlebell Swing', 'Dumbbell Lunge'];
      exercises = EXERCISE_LIBRARY.filter(e => targets.includes(e.name)).map(e => ({
        name: e.name,
        targetSets: 3,
        targetReps: 20,
        targetWeight: Math.max(0, e.defaultWeight - 15),
        restTimeSeconds: 60
      }));
    } else if (aiGoal === 'calisthenics') {
      const targets = ['Push-Up', 'Pull-Up', 'Tricep Dip', 'Plank'];
      exercises = EXERCISE_LIBRARY.filter(e => targets.includes(e.name)).map(e => ({
        name: e.name,
        targetSets: 4,
        targetReps: 12,
        targetWeight: 0, // bodyweight
        restTimeSeconds: 60
      }));
    }

    try {
      await onCreateProgram({
        name,
        splitType: aiGoal === 'calisthenics' ? 'custom' : aiGoal === 'strength' ? 'full_body' : 'custom',
        exercises
      });
      setIsAiWizardOpen(false);
      setCustomName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Immersive Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-black/40 border border-cyan-900/30 rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-sm text-cyan-100 uppercase tracking-widest">Training Directives & Blueprints</span>
        </div>
        <button 
          onClick={() => setIsAiWizardOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-purple-300 hover:text-white rounded border border-purple-500/50 hover:border-purple-400 font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0"
        >
          <Sparkles className="w-4 h-4" /> AI Program Architect
        </button>
      </div>

      {/* AI Wizard Modal */}
      {isAiWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="hud-glass corner-brackets border-purple-500/50 max-w-lg w-full p-6 space-y-6 bg-black/90">
            <div className="flex justify-between items-center border-b border-purple-900/50 pb-3">
              <h3 className="font-display font-bold text-lg text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" /> AI Program Wizard
              </h3>
              <button onClick={() => setIsAiWizardOpen(false)} className="text-gray-500 hover:text-white font-mono text-sm uppercase">Close</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-purple-300 mb-2 uppercase">Custom Title (Optional)</label>
                <input 
                  type="text" 
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="E.g. Monarch's Might Routine"
                  className="w-full bg-black/60 border border-purple-900/50 rounded p-2.5 text-base text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-purple-300 mb-2 uppercase">Select Training Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'strength', label: 'Strength Focus' },
                    { id: 'hypertrophy', label: 'Hypertrophy' },
                    { id: 'fat_loss', label: 'Fat Loss/Circuit' },
                    { id: 'endurance', label: 'Endurance' },
                    { id: 'calisthenics', label: 'Calisthenics' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setAiGoal(g.id as any)}
                      className={`p-3 border rounded text-[11px] font-mono uppercase tracking-wider text-left transition-all ${
                        aiGoal === g.id 
                          ? 'bg-purple-950/40 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                          : 'bg-black/50 border-gray-800 text-gray-400 hover:border-purple-950'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest text-purple-300 mb-2 uppercase">Difficulty Index</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAiDifficulty(d as any)}
                      className={`p-2.5 border rounded text-[10px] font-mono uppercase tracking-wider text-center transition-all ${
                        aiDifficulty === d 
                          ? 'bg-purple-950/40 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                          : 'bg-black/50 border-gray-800 text-gray-400 hover:border-purple-950'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-900/50 flex justify-end">
              <button 
                onClick={handleGenerateAiProgram}
                className="w-full py-3 bg-purple-950/80 hover:bg-purple-500 hover:text-black border border-purple-500 text-purple-300 rounded font-display font-bold uppercase tracking-[0.2em] transition-all min-h-[44px]"
              >
                Synthesize Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Grids */}
      <div>
        <h3 className="font-display font-bold text-lg uppercase tracking-[0.15em] text-cyan-400 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-500" /> Hunter Programs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((routine) => {
            const isBoss = routine._id === bossRoutineId;
            const totalExercises = routine.exercises.length;
            
            return (
              <div 
                key={routine._id} 
                className={`relative p-5 rounded bg-black/60 border backdrop-blur-md overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${
                  isBoss 
                    ? 'border-red-900/60 hover:border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'border-cyan-900/40 hover:border-cyan-500 shadow-[inset_0_0_20px_rgba(8,145,178,0.05)] hover:shadow-[0_0_15px_rgba(8,145,178,0.3)]'
                }`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${isBoss ? 'from-red-900/20' : 'from-cyan-900/20'} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isBoss ? (
                        <span className="flex items-center gap-1 text-[9px] bg-red-950/80 text-red-400 border border-red-900 px-2 py-0.5 rounded font-mono uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse">
                          <ShieldAlert className="w-3 h-3" /> Weekly Boss Fight
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded font-mono uppercase tracking-[0.2em]">
                          <Flame className="w-3 h-3" /> Daily Mission
                        </span>
                      )}
                    </div>
                    <h3 className={`font-display font-bold text-xl uppercase tracking-[0.1em] ${isBoss ? 'text-red-100' : 'text-white'}`}>
                      {routine.name}
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                      Type: <span className={isBoss ? 'text-red-400/80' : 'text-cyan-400/80'}>{routine.splitType}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(routine)} className="p-1.5 text-gray-600 hover:text-white transition-colors bg-black/40 rounded border border-gray-800 hover:border-gray-500">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(routine._id)} className="p-1.5 text-gray-600 hover:text-red-500 transition-colors bg-black/40 rounded border border-gray-800 hover:border-red-900/50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center relative z-10 mt-6 pt-4 border-t border-white/5">
                  <div className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                    Objectives: <span className="text-white">{totalExercises}</span>
                  </div>
                  
                  <button 
                    onClick={() => onStartSession(routine)}
                    className={`group/btn relative px-5 py-2 border rounded font-mono text-[10px] font-bold uppercase tracking-[0.2em] overflow-hidden flex items-center gap-2 transition-all ${
                      isBoss 
                        ? 'bg-red-950/40 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:animate-[shimmer_0.5s_forwards]" />
                    <Play className="w-3 h-3 fill-current" /> <span>Accept Mission</span>
                  </button>
                </div>
              </div>
            );
          })}
          
          {routines.length === 0 && (
            <div className="col-span-1 md:col-span-2 p-10 bg-black/40 border border-dashed border-cyan-900/50 rounded flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-8 h-8 text-cyan-900 mb-3" />
              <h3 className="font-mono text-[12px] text-cyan-700 uppercase tracking-[0.2em]">No Blueprints Available</h3>
              <p className="font-mono text-[10px] text-gray-600 mt-2">Create a new program template or generate one via AI to start training.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DailyMissionsPanel;
