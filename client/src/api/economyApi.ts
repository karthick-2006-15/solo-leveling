import { fetchWithAuth } from './fetchHelper';

import { API_BASE_URL } from './config';
const API_URL = API_BASE_URL;

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
    const timezoneOffset = new Date().getTimezoneOffset();
    const res = await fetchWithAuth(`${API_URL}/economy/login`, {
      method: 'POST',
      body: JSON.stringify({ timezoneOffset })
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
