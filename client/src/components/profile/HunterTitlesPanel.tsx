import React from 'react';
import { Target } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../api/fetchHelper';
import { RollingNumber } from '../ui/RollingNumber';

interface HunterTitlesPanelProps {
  progression: any;
}

export const HunterTitlesPanel: React.FC<HunterTitlesPanelProps> = ({ progression }) => {
  const queryClient = useQueryClient();

  const handleEquip = async (title: string) => {
    try {
      await fetchWithAuth('/api/progression/title/equip', {
        method: 'POST',
        body: JSON.stringify({ titleId: title })
      });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    } catch (e) {
      console.error('Failed to equip title', e);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      {/* SKILL POINTS */}
      <div className="md:w-1/3">
        <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2">Skill Points</h2>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">Unallocated</p>
        <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-xl p-6 text-center">
          <div className="font-display text-5xl text-yellow-400 text-shadow-glow">
            <RollingNumber value={progression.skillPoints || 0} />
          </div>
          <div className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-2">Available Points</div>
        </div>
      </div>

      {/* TITLES */}
      <div className="md:w-2/3">
        <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2">Hunter Titles</h2>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">Unlocked Achievements</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {progression.unlockedTitles?.map((title: string) => (
            <div key={title} className={`p-3 rounded border flex flex-col gap-1 transition-colors ${
              title === progression.activeTitle ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.2)]' : 'bg-black/40 border-cyan-900/30'
            }`}>
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-cyan-50 uppercase tracking-widest">{title.replace(/_/g, ' ')}</span>
                {title === progression.activeTitle && <Target className="w-3 h-3 text-cyan-400" />}
              </div>
              {title === progression.activeTitle ? (
                <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest">Equipped</span>
              ) : (
                <button 
                  className="font-mono text-[9px] text-gray-500 hover:text-cyan-400 uppercase tracking-widest text-left"
                  onClick={() => handleEquip(title)}
                >
                  Equip Title
                </button>
              )}
            </div>
          ))}
          {(!progression.unlockedTitles || progression.unlockedTitles.length === 0) && (
            <div className="col-span-full p-4 border border-dashed border-cyan-900/30 rounded text-center">
              <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">No Titles Found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
