import React from 'react';
import { useShop } from '../../hooks/useRewards';
import { useProgression } from '../../hooks/useProgression';
import { CircleDollarSign, Lock } from 'lucide-react';
import { PrimaryButton } from '../ui/PrimaryButton';
import { rarityConfig, getIcon } from '../../utils/inventoryUtils';
import { toast } from 'react-hot-toast';

export const ShopTab: React.FC = () => {
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
    <div className="space-y-6">
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
              <div 
                key={item._id}
                className={`relative group bg-black/60 border ${config.border} rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${config.bg}`} />
                
                <div className="p-4 md:p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-12 h-12 rounded-lg ${config.bg} bg-opacity-10 flex items-center justify-center text-2xl ${config.text}`}>
                      {getIcon(item.type)}
                    </div>
                    {item.reqLevel && (progression?.level || 0) < item.reqLevel && (
                      <div className="flex items-center gap-1 text-xs font-mono text-red-400 bg-red-900/30 px-2 py-1 rounded">
                        <Lock size={12} />
                        Lvl {item.reqLevel}
                      </div>
                    )}
                  </div>

                  <h3 className={`font-display text-lg tracking-wider mb-1 ${config.text} drop-shadow-sm`}>
                    {item.name}
                  </h3>
                  
                  <p className="text-xs font-mono text-gray-400 line-clamp-2 mb-4 h-8">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className={`font-mono text-sm tracking-widest uppercase ${config.text}`}>
                      {item.rarity}
                    </div>
                    
                    <PrimaryButton
                      onClick={() => handlePurchase(item._id, item.name, item.price)}
                      disabled={!canAfford || ((item.reqLevel || 0) > (progression?.level || 0)) || purchaseItem.isPending}
                      className="px-4 py-2 text-xs flex items-center gap-1"
                    >
                      <CircleDollarSign size={14} />
                      {item.price}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
