import { fetchWithAuth } from './fetchHelper';

import { API_BASE_URL } from './config';
const API_URL = API_BASE_URL;

export const financeApi = {
  getProfile: async () => {
    const res = await fetchWithAuth(`${API_URL}/finance/me`);
    return { data: await res.json() };
  },
  updateProfile: async (data: any) => {
    const res = await fetchWithAuth(`${API_URL}/finance/me`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { data: await res.json() };
  }
};
