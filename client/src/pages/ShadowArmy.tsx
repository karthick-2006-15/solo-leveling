import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../api/fetchHelper';
import { PageHeader } from '../components/ui/PageHeader';
import { Ghost, Crosshair, ArrowUp, Zap } from 'lucide-react';
import { SystemWindow } from '../components/ui/SystemWindow';
import { formatSafeDate } from '../utils/dateUtils';

export const ShadowArmy: React.FC = () => {
  const queryClient = useQueryClient();
  const [resurrectingId, setResurrectingId] = useState<string | null>(null);

  const { data: shadows, isLoading } = useQuery({
    queryKey: ['shadowArmy'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/missions/shadows');
      const data = await res.json();
      return data.shadows || [];
    }
  });

  const resurrectMutation = useMutation({
    mutationFn: async (shadowId: string) => {
      const res = await fetchWithAuth('/api/missions/shadows/resurrect', {
        method: 'POST',
        body: JSON.stringify({ shadowId })
      });
      return await res.json();
    },
    onMutate: (id) => setResurrectingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadowArmy'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setResurrectingId(null);
    },
    onError: () => setResurrectingId(null)
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#00050b] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <h2 className="font-display text-xl text-indigo-500 uppercase tracking-[0.3em] animate-pulse">Summoning Shadows...</h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white font-sans pb-24 md:pb-8 selection:bg-indigo-900 selection:text-white">
      {/* Background styling for shadow realm */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[#020205]" />
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <PageHeader 
          title="Shadow Extraction" 
          subtitle="Resurrect failed directives from yesterday as Shadow Quests." 
        />

        {shadows.length === 0 ? (
          <div className="mt-12 hud-glass corner-brackets p-6 md:p-12 text-center border-indigo-900/30">
            <Ghost className="w-16 h-16 text-indigo-900/50 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-indigo-400 uppercase tracking-widest mb-2">No Shadows Found</h3>
            <p className="font-mono text-[11px] text-gray-500 uppercase tracking-widest">You have no failed directives from yesterday to extract.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
            {shadows.map((shadow: any) => (
              <SystemWindow key={shadow._id} innerClassName="p-0 flex flex-col h-full bg-black/60 hover:bg-black/80 transition-colors border-indigo-900/30 group">
                <div className="p-4 md:p-5 flex-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-widest">
                      <Ghost className="w-4 h-4" /> Shadow Entity
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono uppercase tracking-widest bg-gray-900/50 px-2 py-1 rounded">
                      {formatSafeDate(shadow.date, 'MMM dd')}
                    </div>
                  </div>

                  <h3 className="font-display text-xl text-white uppercase tracking-wider mb-2 group-hover:text-indigo-300 transition-colors">{shadow.title}</h3>
                  <p className="font-mono text-[11px] text-gray-400 mb-6">{shadow.description}</p>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                      <Zap className="w-3 h-3" /> {Math.floor(shadow.xpReward * 0.5)} XP
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-yellow-400 uppercase tracking-widest">
                      <Crosshair className="w-3 h-3" /> {Math.floor(shadow.coinReward * 0.5)} Coins
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-indigo-900/30 bg-indigo-950/20">
                  <button 
                    onClick={() => resurrectMutation.mutate(shadow._id)}
                    disabled={resurrectingId === shadow._id}
                    className="w-full py-3 min-h-[44px] bg-indigo-900/50 hover:bg-indigo-600 text-indigo-100 font-display uppercase tracking-[0.2em] rounded border border-indigo-500/50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resurrectingId === shadow._id ? (
                      <span className="animate-pulse">Arise...</span>
                    ) : (
                      <>
                        <ArrowUp className="w-4 h-4" /> Arise
                      </>
                    )}
                  </button>
                </div>
              </SystemWindow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
