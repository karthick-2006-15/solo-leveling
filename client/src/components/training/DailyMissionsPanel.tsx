import React from 'react';
import { Play, Flame, Edit2, Trash2, ShieldAlert } from 'lucide-react';

interface DailyMissionsPanelProps {
  routines: any[];
  onStartSession: (routine: any) => void;
  onEdit: (routine: any) => void;
  onDelete: (id: string) => void;
}

export const DailyMissionsPanel: React.FC<DailyMissionsPanelProps> = ({ routines, onStartSession, onEdit, onDelete }) => {
  // Determine "Boss Fight" based on highest number of total sets
  const bossRoutineId = routines.length > 0 ? [...routines].sort((a, b) => {
    const aSets = a.exercises.reduce((sum: number, ex: any) => sum + ex.targetSets, 0);
    const bSets = b.exercises.reduce((sum: number, ex: any) => sum + ex.targetSets, 0);
    return bSets - aSets;
  })[0]._id : null;

  return (
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
                Targets: <span className="text-white">{totalExercises}</span>
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
                <Play className="w-3 h-3 fill-current" /> <span>Accept</span>
              </button>
            </div>
          </div>
        );
      })}
      
      {routines.length === 0 && (
        <div className="col-span-1 md:col-span-2 p-10 bg-black/40 border border-dashed border-cyan-900/50 rounded flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-8 h-8 text-cyan-900 mb-3" />
          <h3 className="font-mono text-[12px] text-cyan-700 uppercase tracking-[0.2em]">No Missions Available</h3>
          <p className="font-mono text-[10px] text-gray-600 mt-2">Create a new routine to begin your training.</p>
        </div>
      )}
    </div>
  );
};
