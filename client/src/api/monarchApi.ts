import { fetchWithAuth } from './fetchHelper';

import { API_BASE_URL } from './config';
const API_URL = API_BASE_URL;

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
