import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ShopItem {
  _id: string;
  itemId: string;
  name: string;
  type: string;
  description: string;
  category: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Monarch';
  icon: string;
  price: number;
  currencyType: string;
  rotationType: string;
  activeUntil?: string;
  metadata?: Record<string, any>;
}

export interface MemoryCrystal {
  _id: string;
  title: string;
  milestoneType: string;
  levelSnapshot: number;
  rankSnapshot: string;
  statsSnapshot: Record<string, any>;
  badgeIcon: string;
  ariaMessage?: string;
  date: string;
}

export const rewardApi = {
  // Shop
  getShopItems: async (): Promise<{ status: string, data: ShopItem[] }> => {
    const res = await fetchWithAuth(`${API_URL}/rewards/shop`);
    return res.json();
  },
  purchaseItem: async (itemId: string) => {
    const res = await fetchWithAuth(`${API_URL}/rewards/shop/${itemId}/purchase`, {
      method: 'POST'
    });
    return res.json();
  },

  // Chest
  openChest: async (chestId: string) => {
    const res = await fetchWithAuth(`${API_URL}/rewards/chest/${chestId}/open`, {
      method: 'POST'
    });
    return res.json();
  },

  // Relic
  equipRelic: async (itemDocId: string) => {
    const res = await fetchWithAuth(`${API_URL}/rewards/relic/${itemDocId}/equip`, {
      method: 'POST'
    });
    return res.json();
  },
  unequipRelic: async (itemDocId: string) => {
    const res = await fetchWithAuth(`${API_URL}/rewards/relic/${itemDocId}/unequip`, {
      method: 'POST'
    });
    return res.json();
  },

  // Prestige
  triggerPrestige: async () => {
    const res = await fetchWithAuth(`${API_URL}/rewards/prestige`, {
      method: 'POST'
    });
    return res.json();
  },

  // Events
  getActiveEvents: async () => {
    const res = await fetchWithAuth(`${API_URL}/rewards/events`);
    return res.json();
  },

  // Museum
  getMemoryCrystals: async (): Promise<{ status: string, data: MemoryCrystal[] }> => {
    const res = await fetchWithAuth(`${API_URL}/rewards/museum`);
    return res.json();
  }
};
