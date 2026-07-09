import { fetchWithAuth } from './fetchHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ariaApi = {
  chat: async (message: string) => {
    const res = await fetchWithAuth(`${API_URL}/aria/chat`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return { data: await res.json() };
  },
  getMorningReport: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/report/morning`, { method: 'POST' });
    return { data: await res.json() };
  },
  getEveningReport: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/report/evening`, { method: 'POST' });
    return { data: await res.json() };
  },
  getReports: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/reports`);
    return { data: await res.json() };
  },
  getMemory: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/memory`);
    return { data: await res.json() };
  },
  getPredictions: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/predictions`);
    return { data: await res.json() };
  },
  runPredictionSweep: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/predictions/sweep`, { method: 'POST' });
    return { data: await res.json() };
  },
  getPlans: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/plans`);
    return { data: await res.json() };
  },
  createPlan: async (type: string, goal: string) => {
    const res = await fetchWithAuth(`${API_URL}/aria/plans`, {
      method: 'POST',
      body: JSON.stringify({ type, goal })
    });
    return { data: await res.json() };
  },
  getDecision: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/decision`);
    return { data: await res.json() };
  },
  getSchedule: async () => {
    const res = await fetchWithAuth(`${API_URL}/aria/schedule`, { method: 'POST' });
    return { data: await res.json() };
  },
  getKnowledge: async (category?: string) => {
    const url = category ? `${API_URL}/aria/knowledge?category=${category}` : `${API_URL}/aria/knowledge`;
    const res = await fetchWithAuth(url);
    return { data: await res.json() };
  },
  addKnowledge: async (category: string, insight: string) => {
    const res = await fetchWithAuth(`${API_URL}/aria/knowledge`, {
      method: 'POST',
      body: JSON.stringify({ category, insight })
    });
    return { data: await res.json() };
  }
};
