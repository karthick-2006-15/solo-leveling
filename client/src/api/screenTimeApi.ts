import { fetchWithAuth } from './fetchHelper';

export const screenTimeApi = {
  getDashboard: async () => {
    const res = await fetchWithAuth('/api/screentime/dashboard');
    return res.json();
  },

  logManual: async (payload: { totalTimeMinutes: number, apps: any[] }) => {
    const res = await fetchWithAuth('/api/screentime/log', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  analyzeImage: async (base64Image: string, mimeType: string) => {
    const res = await fetchWithAuth('/api/screentime/analyze', {
      method: 'POST',
      body: JSON.stringify({ base64Image, mimeType })
    });
    return res.json();
  },

  getClassifications: async () => {
    const res = await fetchWithAuth('/api/screentime/classifications');
    return res.json();
  },

  updateClassification: async (id: string, category: string) => {
    const res = await fetchWithAuth(`/api/screentime/classifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ category })
    });
    return res.json();
  }
};
