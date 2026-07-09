import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface InventoryItem {
  _id: string;
  itemId: string;
  name: string;
  type: string;
  description: string;
  category: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Monarch';
  icon: string;
  animation?: string;
  quantity: number;
  stackable: boolean;
  maxStackSize: number;
  obtainedAt: string;
  source: string;
  status: 'active' | 'consumed' | 'equipped';
  isFavorite: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
}

export const inventoryApi = {
  getInventory: async (filters: any = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetchWithAuth(`${API_URL}/inventory?${params}`);
    return res.json();
  },

  getInventoryStats: async () => {
    const res = await fetchWithAuth(`${API_URL}/inventory/stats`);
    return res.json();
  },

  getInventoryHistory: async () => {
    const res = await fetchWithAuth(`${API_URL}/inventory/history`);
    return res.json();
  },

  toggleFavorite: async (id: string) => {
    const res = await fetchWithAuth(`${API_URL}/inventory/${id}/favorite`, {
      method: 'POST'
    });
    return res.json();
  }
};
