import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const academicApi = {
  getProfile: async () => {
    const res = await fetchWithAuth(`${API_URL}/academics/me`);
    return { data: await res.json() };
  },
  updateProfile: async (data: any) => {
    const res = await fetchWithAuth(`${API_URL}/academics/me`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { data: await res.json() };
  }
};
