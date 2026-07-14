import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { useMuseum } from '../hooks/useRewards';
import { Crown, Trophy } from 'lucide-react';

export const HunterMuseum: React.FC = () => {
  const { crystals, isLoading } = useMuseum();

  return (
    <div className="relative min-h-screen text-white font-mono pb-24 md:pb-8">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
        
        <PageHeader 
          title="Hunter Museum" 
          subtitle="A permanent legacy of milestones, memories, and breakthroughs." 
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-yellow-500 animate-pulse tracking-widest uppercase font-display">Restoring Archives...</div>
          </div>
        ) : !crystals || crystals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 bg-black/40 border border-yellow-900/30 rounded-xl p-6">
            <Trophy className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
            <div className="text-gray-500 tracking-widest uppercase mb-2">The Museum is Empty</div>
            <div className="text-xs text-gray-600 uppercase tracking-widest">Achieve greatness to etch your legacy here.</div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-8">
            {crystals.map((crystal) => {
              const date = new Date(crystal.date).toLocaleDateString();
              
              return (
                <div key={crystal._id} className="relative group">
                  {/* Timeline connector (visual only) */}
                  <div className="absolute left-6 top-16 bottom-[-32px] w-0.5 bg-gradient-to-b from-yellow-900/50 to-transparent group-last:hidden" />
                  
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 bg-black/60 border border-yellow-900/30 rounded-xl p-4 md:p-6 backdrop-blur-md transition-all duration-300 hover:border-yellow-700 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                    
                    {/* Icon Column */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 bg-black border border-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                        <Crown className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="relative z-10 flex-1 space-y-4">
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <h3 className="font-display font-bold text-lg md:text-xl uppercase tracking-widest text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            {crystal.title}
                          </h3>
                          <span className="text-[10px] bg-black/50 border border-yellow-900/50 text-yellow-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {crystal.milestoneType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Etched on {date}</p>
                      </div>

                      {crystal.ariaMessage && (
                        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 border-l-2 border-l-cyan-500">
                          <p className="font-mono text-sm text-cyan-100 italic leading-relaxed">
                            "{crystal.ariaMessage}"
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-gray-800/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Level Snapshot</span>
                          <span className="text-white font-display text-lg">{crystal.levelSnapshot}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Rank Snapshot</span>
                          <span className="text-white font-display text-lg">{crystal.rankSnapshot}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Lifetime Coins</span>
                          <span className="text-white font-display text-lg">{crystal.statsSnapshot?.lifetimeCoinsEarned?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total XP</span>
                          <span className="text-white font-display text-lg">{crystal.statsSnapshot?.totalXP?.toLocaleString() || 0}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
