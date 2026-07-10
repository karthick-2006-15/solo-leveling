import { fetchWithAuth } from './fetchHelper';

import { API_BASE_URL } from './config';
const API_URL = API_BASE_URL;

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
