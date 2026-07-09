import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const monarchApi = {
  getMonarchState: async () => {
    const res = await fetchWithAuth(`${API_URL}/monarch`);
    return res.json();
  },
  
  triggerManualBattle: async () => {
    const res = await fetchWithAuth(`${API_URL}/monarch/battle`, {
      method: 'POST'
    });
    return res.json();
  }
};
