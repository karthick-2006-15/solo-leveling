import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const economyApi = {
  getEconomyStats: async () => {
    const res = await fetchWithAuth(`${API_URL}/economy/stats`);
    return res.json();
  },
  
  getRewardTimeline: async () => {
    const res = await fetchWithAuth(`${API_URL}/economy/timeline`);
    return res.json();
  },
  
  claimDailyLogin: async () => {
    const res = await fetchWithAuth(`${API_URL}/economy/login`, {
      method: 'POST'
    });
    return res.json();
  },
  
  claimPerfectDay: async () => {
    const res = await fetchWithAuth(`${API_URL}/economy/perfect-day`, {
      method: 'POST'
    });
    return res.json();
  }
};
