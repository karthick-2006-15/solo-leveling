import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
};
