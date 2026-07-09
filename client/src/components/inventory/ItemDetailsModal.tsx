import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Box, Tag } from 'lucide-react';
import type { InventoryItem } from '../../api/inventoryApi';
import { rarityConfig, getIcon } from '../../utils/inventoryUtils';
import { PrimaryButton } from '../ui/PrimaryButton';

interface ItemDetailsModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  isTogglingFavorite?: boolean;
  onOpenChest?: () => void;
  onEquipRelic?: () => void;
  onUnequipRelic?: () => void;
  isEquipping?: boolean;
  isOpening?: boolean;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ 
  item, 
  isOpen, 
  onClose,
  onToggleFavorite,
  isTogglingFavorite,
  onOpenChest,
  onEquipRelic,
  onUnequipRelic,
  isEquipping,
  isOpening
}) => {
  if (!item) return null;

  const config = rarityConfig[item.rarity] || rarityConfig['Common'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md bg-black border ${config.border} rounded-2xl overflow-hidden shadow-2xl ${config.shadow}`}
          >
            {/* Header / Banner */}
            <div className={`h-32 ${config.bg} relative flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="absolute inset-0 hex-bg opacity-30 pointer-events-none" />
              <div className="absolute top-4 right-4 z-10 cursor-pointer p-2 hover:bg-black/50 rounded-full transition-colors" onClick={onClose}>
                <X className="w-5 h-5 text-gray-300" />
              </div>
              
              <div className={`relative z-10 p-6 rounded-full bg-black/60 border ${config.border} ${config.color} drop-shadow-[0_0_15px_currentColor]`}>
                {getIcon(item.type)}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className={`text-2xl font-display font-bold uppercase tracking-widest ${config.color} text-shadow-glow`}>
                  {item.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`text-[10px] font-mono uppercase tracking-[0.2em] border ${config.border} ${config.color} bg-black/50 px-2 py-0.5 rounded-full`}>
                    {item.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest border border-gray-700 bg-gray-900/50 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <p className="text-sm font-mono text-gray-300 leading-relaxed italic">
                  "{item.description}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase tracking-widest">
                  <Box className="w-4 h-4 text-cyan-500" />
                  <span>Quantity: <span className="text-white">{item.quantity}</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  <span>Obtained: <span className="text-white">{new Date(item.obtainedAt).toLocaleDateString()}</span></span>
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1 text-[10px] font-mono text-indigo-300 bg-indigo-900/30 border border-indigo-500/30 px-2 py-1 rounded">
                      <Tag className="w-3 h-3" /> {tag}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-800">
                {item.category === 'Consumable' && item.name.toLowerCase().includes('chest') && onOpenChest && (
                  <PrimaryButton 
                    onClick={onOpenChest} 
                    disabled={isOpening}
                    className="w-full flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                  >
                    <Box className="w-4 h-4" />
                    {isOpening ? 'OPENING...' : 'OPEN CHEST'}
                  </PrimaryButton>
                )}

                {item.category === 'Relic' && onEquipRelic && onUnequipRelic && (
                  <PrimaryButton 
                    onClick={item.status === 'equipped' ? onUnequipRelic : onEquipRelic} 
                    disabled={isEquipping}
                    variant={item.status === 'equipped' ? 'ghost' : 'primary'}
                    className="w-full flex justify-center items-center gap-2"
                  >
                    <Tag className="w-4 h-4" />
                    {item.status === 'equipped' ? 'UNEQUIP RELIC' : 'EQUIP RELIC'}
                  </PrimaryButton>
                )}

                <PrimaryButton 
                  onClick={() => onToggleFavorite(item._id)} 
                  disabled={isTogglingFavorite}
                  variant="ghost"
                  className="w-full flex justify-center items-center gap-2"
                >
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {item.isFavorite ? 'UNFAVORITE' : 'FAVORITE'}
                </PrimaryButton>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
