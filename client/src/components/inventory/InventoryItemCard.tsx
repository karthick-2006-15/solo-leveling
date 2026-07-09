import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { InventoryItem } from '../../api/inventoryApi';
import { rarityConfig, getIcon } from '../../utils/inventoryUtils';

interface InventoryItemCardProps {
  item: InventoryItem;
  onClick: (item: InventoryItem) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onClick }) => {
  const config = rarityConfig[item.rarity] || rarityConfig['Common'];

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)}
      className={`relative cursor-pointer rounded-xl border ${config.border} ${config.bg} p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${config.shadow} group overflow-hidden`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0 pointer-events-none" />
      
      {/* Rarity Scanline */}
      <div className={`absolute left-0 top-0 w-full h-[1px] ${config.border} opacity-50 group-hover:opacity-100 group-hover:animate-scan-vertical pointer-events-none z-0`} />

      {/* Favorite Star */}
      {item.isFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
        </div>
      )}

      {/* Quantity Badge */}
      {item.quantity > 1 && (
        <div className="absolute bottom-2 right-2 z-10 bg-black/80 border border-gray-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
          x{item.quantity}
        </div>
      )}

      {/* Icon Area */}
      <div className={`relative z-10 p-4 rounded-full bg-black/50 border ${config.border} ${config.color} group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_currentColor]`}>
        {getIcon(item.type)}
      </div>

      {/* Text Info */}
      <div className="relative z-10 text-center w-full mt-2">
        <h3 className={`font-display font-bold text-sm tracking-widest uppercase truncate ${config.color} text-shadow-glow`}>
          {item.name}
        </h3>
        <p className="font-mono text-[9px] text-gray-400 uppercase tracking-[0.2em] mt-1">
          {item.rarity}
        </p>
      </div>
    </motion.div>
  );
};
