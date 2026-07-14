import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { useShop } from '../hooks/useRewards';
import { useProgression } from '../hooks/useProgression';
import { CircleDollarSign, Lock } from 'lucide-react';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { rarityConfig, getIcon } from '../utils/inventoryUtils';
import { toast } from 'react-hot-toast';

export const Shop: React.FC = () => {
  const { progression } = useProgression();
  const { items, isLoading, purchaseItem } = useShop();

  const handlePurchase = async (itemId: string, name: string, price: number) => {
    if (!progression || progression.coins < price) {
      toast.error('Not enough Hunter Coins.');
      return;
    }
    try {
      await purchaseItem.mutateAsync(itemId);
      toast.success(`Successfully purchased ${name}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Purchase failed.');
    }
  };

  return (
    <div className="relative min-h-screen text-white font-mono pb-24 md:pb-8">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
        
        <PageHeader 
          title="System Shop" 
          subtitle="Exchange Hunter Coins for specialized assets and supplies." 
        />

        <div className="flex items-center justify-end bg-black/40 border border-cyan-900/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 uppercase tracking-widest text-sm">Balance:</span>
            <span className="text-2xl font-display text-cyan-400 flex items-center gap-1">
              <CircleDollarSign className="w-5 h-5" />
              {progression?.coins?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-cyan-500 animate-pulse tracking-widest uppercase">Connecting to System Shop...</div>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 bg-black/40 border border-cyan-900/30 rounded-xl p-6">
            <div className="text-gray-500 tracking-widest uppercase mb-2">No Items Available</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {items.map(item => {
              const config = rarityConfig[item.rarity] || rarityConfig['Common'];
              const canAfford = (progression?.coins || 0) >= item.price;

              return (
                <div key={item._id} className={`relative rounded-xl border ${config.border} bg-black/60 p-4 md:p-5 flex flex-col gap-3 md:gap-4 overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] group`}>
                  {/* Background overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-black/80 to-transparent z-0`} />
                  <div className={`absolute left-0 top-0 w-1 h-full ${config.bg} z-0`} />

                  {/* Header */}
                  <div className="relative z-10 flex justify-between items-start">
                    <div className={`p-3 rounded-xl bg-black border ${config.border} ${config.color}`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-mono uppercase tracking-[0.2em] border ${config.border} ${config.color} bg-black/50 px-2 py-0.5 rounded-full`}>
                        {item.rarity}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="relative z-10 flex-1">
                    <h3 className={`font-display font-bold text-lg uppercase tracking-widest ${config.color}`}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="relative z-10 pt-4 border-t border-gray-800 flex justify-between items-center">
                    <div className={`flex items-center gap-1 font-display text-lg ${canAfford ? 'text-cyan-400' : 'text-red-500'}`}>
                      <CircleDollarSign className="w-4 h-4" />
                      {item.price.toLocaleString()}
                    </div>

                    <PrimaryButton 
                      onClick={() => handlePurchase(item.itemId, item.name, item.price)}
                      disabled={!canAfford || purchaseItem.isPending}
                      className="px-4 py-2 text-xs flex items-center gap-2 min-h-[44px]"
                    >
                      {!canAfford ? <><Lock className="w-3 h-3" /> Locked</> : 'Purchase'}
                    </PrimaryButton>
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
