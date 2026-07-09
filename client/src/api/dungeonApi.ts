import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const dungeonApi = {
  getActiveDungeons: async () => {
    const res = await fetchWithAuth(`${API_URL}/dungeons`);
    return res.json();
  },
  generateDailyDungeon: async () => {
    const res = await fetchWithAuth(`${API_URL}/dungeons/generate`, { method: 'POST' });
    return res.json();
  },
  getActiveBosses: async () => {
    const res = await fetchWithAuth(`${API_URL}/dungeons/bosses`);
    return res.json();
  },
  getStoryChapters: async () => {
    const res = await fetchWithAuth(`${API_URL}/dungeons/story`);
    return res.json();
  },
  getCampaigns: async () => {
    const res = await fetchWithAuth(`${API_URL}/dungeons/campaigns`);
    return res.json();
  }
};
