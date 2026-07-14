import { fetchWithAuth } from './fetchHelper';

import { API_BASE_URL } from './config';
const API_URL = API_BASE_URL;

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
  },
  completeTask: async (taskId: string, taskType: 'assignment' | 'exam') => {
    const res = await fetchWithAuth(`${API_URL}/academics/complete-task`, {
      method: 'POST',
      body: JSON.stringify({ taskId, taskType })
    });
    return { data: await res.json() };
  }
};
