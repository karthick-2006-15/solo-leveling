import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { useInventory } from '../hooks/useInventory';
import { InventoryStats } from '../components/inventory/InventoryStats';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { InventoryItemCard } from '../components/inventory/InventoryItemCard';
import { ItemDetailsModal } from '../components/inventory/ItemDetailsModal';
import { ChestOpeningModal } from '../components/chest/ChestOpeningModal';
import type { InventoryItem } from '../api/inventoryApi';
import { useChest, useRelic } from '../hooks/useRewards';

export const Inventory: React.FC = () => {
  const [filters, setFilters] = useState<any>({ sortBy: 'newest' });
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const [chestModalOpen, setChestModalOpen] = useState(false);
  const [chestResult, setChestResult] = useState<any>(null);

  const { items, isLoading, stats, statsLoading, toggleFavorite } = useInventory(filters);
  const { openChest } = useChest();
  const { equipRelic, unequipRelic } = useRelic();

  const handleOpenChest = async (chestId: string) => {
    setSelectedItem(null); // Close details modal
    try {
      const res = await openChest.mutateAsync(chestId);
      setChestResult(res.data);
      setChestModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative min-h-screen text-white font-mono pb-24 md:pb-8">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
        
        <PageHeader 
          title="Hunter Inventory" 
          subtitle="Storage and management of acquired assets." 
        />

        <InventoryStats stats={stats} isLoading={statsLoading} />

        <InventoryFilters filters={filters} setFilters={setFilters} />

        {/* Grid Area */}
        <div className="hud-glass corner-brackets p-3 md:p-6 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-cyan-500 animate-pulse tracking-widest uppercase">Scanning Inventory...</div>
            </div>
          ) : !items || items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="text-gray-500 tracking-widest uppercase mb-2">No Items Found</div>
              <div className="text-xs text-gray-600 uppercase tracking-widest">Adjust filters or earn rewards</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {items.map(item => (
                <InventoryItemCard 
                  key={item._id} 
                  item={item} 
                  onClick={setSelectedItem} 
                />
              ))}
            </div>
          )}
        </div>

      </div>

      <ItemDetailsModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onToggleFavorite={(id) => toggleFavorite.mutate(id)}
        isTogglingFavorite={toggleFavorite.isPending}
        onOpenChest={() => handleOpenChest(selectedItem!.itemId)}
        onEquipRelic={() => equipRelic.mutate(selectedItem!._id)}
        onUnequipRelic={() => unequipRelic.mutate(selectedItem!._id)}
        isEquipping={equipRelic.isPending || unequipRelic.isPending}
        isOpening={openChest.isPending}
      />

      <ChestOpeningModal 
        isOpen={chestModalOpen}
        chestName={chestResult ? `Chest` : 'Chest'}
        result={chestResult}
        onClose={() => setChestModalOpen(false)}
      />
    </div>
  );
};
