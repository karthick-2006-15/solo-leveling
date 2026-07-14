import { fetchWithAuth } from './fetchHelper';

import { API_BASE_URL } from './config';
const API_URL = API_BASE_URL;

export const healthApi = {
  logSleep: async (data: any) => {
    return fetchWithAuth(`${API_URL}/health/sleep`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logWellness: async (data: any) => {
    return fetchWithAuth(`${API_URL}/health/wellness`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logBodyMetrics: async (data: any) => {
    return fetchWithAuth(`${API_URL}/health/body`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAnalytics: async (days: number = 30) => {
    return fetchWithAuth(`${API_URL}/health/analytics?days=${days}`, {
      method: 'GET',
    });
  },

  getTodayStatus: async (dateStr?: string) => {
    const url = dateStr ? `${API_URL}/health/today?date=${dateStr}` : `${API_URL}/health/today`;
    return fetchWithAuth(url, {
      method: 'GET',
    });
  },
};
