import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../../api/fetchHelper';
import { Shield, Flag } from 'lucide-react';
import { formatSafeDate } from '../../utils/dateUtils';

export const DungeonHistory: React.FC = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/dungeons/campaigns');
      const data = await res.json();
      return data.data || [];
    }
  });

  if (isLoading) {
    return <div className="text-cyan-500 font-mono text-[10px] animate-pulse">Loading Campaigns...</div>;
  }

  return (
    <div className="hud-glass corner-brackets p-6 relative overflow-hidden group hover:border-[var(--color-system-cyan)] transition-colors duration-500 mt-8">
      <h2 className="font-display uppercase tracking-[0.2em] text-cyan-500 mb-2 flex items-center gap-2">
        <Flag className="w-5 h-5" /> Campaign Operations
      </h2>
      <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-6">
        Active and historical prolonged engagements
      </p>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
          {campaigns.map((camp: any) => (
            <div key={camp._id} className="bg-black/50 border border-cyan-900/30 p-4 rounded hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-cyan-400 font-display uppercase tracking-widest">{camp.name}</h3>
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${camp.status === 'Active' ? 'bg-green-900/40 text-green-400 border border-green-500/50' : 'bg-gray-900/40 text-gray-400'}`}>
                  {camp.status}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400 mb-3">
                <Shield className="w-3 h-3" /> Type: {camp.type}
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                <span>Start: {formatSafeDate(camp.startDate, 'MMM dd')}</span>
                <span>End: {formatSafeDate(camp.endDate, 'MMM dd')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-[11px] font-mono text-gray-500 uppercase tracking-widest border border-dashed border-cyan-900/30 rounded p-4">
            No active campaigns found. Stand by for future long-term directives.
          </div>
        </div>
      )}
    </div>
  );
};
