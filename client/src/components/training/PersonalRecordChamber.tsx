import React from 'react';
import { Trophy, Dumbbell } from 'lucide-react';
import { formatSafeDate } from '../../utils/dateUtils';

interface PersonalRecordChamberProps {
  prs: any[];
}

export const PersonalRecordChamber: React.FC<PersonalRecordChamberProps> = ({ prs }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-yellow-900/50 pb-4">
        <div className="p-2 bg-yellow-950 border border-yellow-500/50 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-yellow-500 uppercase tracking-[0.2em] text-shadow-glow">Hall of Records</h2>
          <p className="font-mono text-[10px] text-yellow-500/70 uppercase tracking-widest mt-1">Maximum physical output registered by system.</p>
        </div>
      </div>

      {prs.length === 0 ? (
        <div className="p-10 bg-black/40 border border-dashed border-yellow-900/50 rounded flex flex-col items-center justify-center text-center">
          <Dumbbell className="w-8 h-8 text-yellow-900/50 mb-3" />
          <h3 className="font-mono text-[12px] text-yellow-700 uppercase tracking-[0.2em]">No Records Found</h3>
          <p className="font-mono text-[10px] text-gray-600 mt-2">Complete training sessions to establish your baseline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prs.map((pr: any, i: number) => (
            <div 
              key={i}
              className="relative p-5 bg-gradient-to-br from-yellow-950/40 to-black border border-yellow-700/40 rounded overflow-hidden group hover:border-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.05)] hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 group-hover:scale-110 transition-all">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
              
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-widest mb-4 pr-8">
                {pr.exerciseName}
              </h3>
              
              <div className="flex items-end gap-2 mb-2">
                <span className="font-display font-bold text-4xl text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  {pr.weight}
                </span>
                <span className="font-mono text-[12px] text-yellow-600 uppercase tracking-widest mb-1">KG</span>
                
                <span className="text-gray-600 font-mono text-lg mx-2 mb-1">×</span>
                
                <span className="font-display font-bold text-2xl text-white">
                  {pr.reps}
                </span>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Reps</span>
              </div>
              
              <div className="mt-4 pt-3 border-t border-yellow-900/30 font-mono text-[9px] text-gray-500 uppercase tracking-widest flex justify-between items-center">
                <span>Est: {pr.estimated1RM ? Math.round(pr.estimated1RM) : pr.weight} kg 1RM</span>
                <span>{formatSafeDate(pr.date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
