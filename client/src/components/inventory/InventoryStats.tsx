import React from 'react';
import { Box, Sparkles, Star } from 'lucide-react';
import { SystemWindow } from '../ui/SystemWindow';
import { RollingNumber } from '../ui/RollingNumber';

interface InventoryStatsProps {
  stats: any;
  isLoading: boolean;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return <div className="animate-pulse h-24 bg-black/40 border border-cyan-900/50 rounded-xl" />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SystemWindow innerClassName="p-4 flex flex-col items-center text-center justify-center relative overflow-hidden">
        <Box className="w-6 h-6 text-cyan-400 mb-2" />
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Items</div>
        <div className="text-2xl font-display text-white"><RollingNumber value={stats.totalItems || 0} /></div>
      </SystemWindow>

      <SystemWindow innerClassName="p-4 flex flex-col items-center text-center justify-center">
        <Star className="w-6 h-6 text-purple-400 mb-2" />
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Unique Types</div>
        <div className="text-2xl font-display text-white"><RollingNumber value={stats.uniqueItems || 0} /></div>
      </SystemWindow>

      <SystemWindow variant="gold" innerClassName="p-4 flex flex-col items-center text-center justify-center">
        <Sparkles className="w-6 h-6 text-yellow-400 mb-2" />
        <div className="text-[10px] text-yellow-600 uppercase tracking-widest mb-1">Legendary+</div>
        <div className="text-2xl font-display text-yellow-400">
          <RollingNumber value={(stats.rarityCounts?.Legendary || 0) + (stats.rarityCounts?.Mythic || 0) + (stats.rarityCounts?.Monarch || 0)} />
        </div>
      </SystemWindow>

      <SystemWindow variant="boss" innerClassName="p-4 flex flex-col items-center text-center justify-center">
        <div className="text-[10px] text-red-400 uppercase tracking-widest mb-2 border-b border-red-900 pb-1">Top Categories</div>
        <div className="flex flex-col gap-1 w-full mt-1">
          {Object.entries(stats.categoryCounts || {})
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 2)
            .map(([cat, count]: any) => (
              <div key={cat} className="flex justify-between text-xs font-mono text-gray-300">
                <span className="uppercase text-red-300">{cat}</span>
                <span>{count}</span>
              </div>
            ))}
          {Object.keys(stats.categoryCounts || {}).length === 0 && (
            <div className="text-xs text-gray-500 font-mono">NO DATA</div>
          )}
        </div>
      </SystemWindow>
    </div>
  );
};
