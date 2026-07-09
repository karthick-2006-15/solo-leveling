import { luckService } from './luckService';
import { inventoryService } from './inventoryService';
import { rewardEngine } from './rewardEngine';
import InventoryItem from '../models/InventoryItem';

interface LootTableEntry {
  itemId: string;
  name: string;
  type: string;
  category: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Monarch';
  baseWeight: number;
  icon: string;
  description: string;
}

const chestLootTables: Record<string, LootTableEntry[]> = {
  'bronze_chest': [
    { itemId: 'coins_50', name: '50 Coins', type: 'currency', category: 'Consumable', rarity: 'Common', baseWeight: 50, icon: 'CircleDollarSign', description: 'Basic currency.' },
    { itemId: 'potion_hp_1', name: 'Minor Health Potion', type: 'consumable', category: 'Consumable', rarity: 'Common', baseWeight: 40, icon: 'Droplet', description: 'Restores 10 HP.' },
    { itemId: 'badge_bronze_survivor', name: 'Bronze Survivor', type: 'badge', category: 'Badge', rarity: 'Uncommon', baseWeight: 10, icon: 'Shield', description: 'Survived a bronze gate.' }
  ],
  'silver_chest': [
    { itemId: 'coins_200', name: '200 Coins', type: 'currency', category: 'Consumable', rarity: 'Uncommon', baseWeight: 60, icon: 'CircleDollarSign', description: 'Currency.' },
    { itemId: 'relic_silver_ring', name: 'Silver Ring', type: 'relic', category: 'Relic', rarity: 'Rare', baseWeight: 30, icon: 'Sparkles', description: '+5% XP.' },
    { itemId: 'title_silver_hunter', name: 'Silver Hunter', type: 'title', category: 'Title', rarity: 'Epic', baseWeight: 10, icon: 'Crown', description: 'A recognized hunter.' }
  ]
};

const rarityValues = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 3,
  'Epic': 4,
  'Legendary': 5,
  'Mythic': 6,
  'Monarch': 7
};

class ChestService {
  async openChest(userId: string, chestItemId: string) {
    // 1. Verify chest exists and consume it
    const chestDoc = await InventoryItem.findOne({ userId, itemId: chestItemId, status: 'active' });
    if (!chestDoc || chestDoc.quantity < 1) {
      throw new Error("Chest not found in inventory.");
    }
    
    // Consume 1 chest
    await inventoryService.removeItem(userId, chestDoc._id.toString(), 1, 'Opened Chest');

    // 2. Fetch Loot Table
    const table = chestLootTables[chestItemId];
    if (!table || table.length === 0) {
      throw new Error("Invalid chest type or empty loot table.");
    }

    // 3. Calculate Luck
    const luck = await luckService.calculateHunterLuck(userId); // e.g., 100 to 300+

    // 4. Adjust Weights based on Luck
    // Luck increases the weight of higher rarities.
    let totalWeight = 0;
    const adjustedTable = table.map(entry => {
      const rValue = rarityValues[entry.rarity];
      // Formula: baseWeight * (luck / 100) ^ (rValue - 1)
      // If luck is 120 (1.2), Common (r=1) -> weight * 1. Rare (r=3) -> weight * 1.44
      const multiplier = Math.pow(luck / 100, rValue - 1);
      const adjustedWeight = entry.baseWeight * multiplier;
      totalWeight += adjustedWeight;
      return { ...entry, adjustedWeight };
    });

    // 5. Roll RNG
    let roll = Math.random() * totalWeight;
    let selectedItem = adjustedTable[0];
    
    for (const entry of adjustedTable) {
      roll -= entry.adjustedWeight;
      if (roll <= 0) {
        selectedItem = entry;
        break;
      }
    }

    // 6. Pity System Update
    const rValue = rarityValues[selectedItem.rarity];
    if (rValue >= 3) { // Rare or higher
      await luckService.resetPity(userId);
    } else {
      await luckService.incrementPity(userId);
    }

    // 7. Duplicate Protection (Cosmetics/Titles)
    if (['badge', 'title', 'theme'].includes(selectedItem.type)) {
      const existing = await InventoryItem.findOne({ userId, itemId: selectedItem.itemId });
      if (existing) {
        // Convert to coins based on rarity
        const coinCompensation = rValue * 100;
        await rewardEngine.dispatchReward({ 
          userId, 
          source: 'System',
          reason: 'Duplicate conversion: ' + selectedItem.name,
          coins: coinCompensation 
        });
        return {
          item: selectedItem,
          isDuplicate: true,
          compensation: { type: 'coins', amount: coinCompensation }
        };
      }
    }

    // 8. Grant Item
    if (selectedItem.type === 'currency' && selectedItem.itemId.startsWith('coins_')) {
      const coins = parseInt(selectedItem.itemId.split('_')[1], 10);
      await rewardEngine.dispatchReward({
        userId,
        source: 'System',
        reason: 'Opened ' + chestDoc.name,
        coins
      });
    } else {
      await inventoryService.addItem({
        userId,
        itemId: selectedItem.itemId,
        name: selectedItem.name,
        type: selectedItem.type,
        category: selectedItem.category,
        rarity: selectedItem.rarity,
        icon: selectedItem.icon,
        description: selectedItem.description,
        source: `From ${chestDoc.name}`
      });
    }

    return {
      item: selectedItem,
      isDuplicate: false
    };
  }
}

export const chestService = new ChestService();
