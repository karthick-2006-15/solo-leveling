import { fetchWithAuth } from './fetchHelper';

export const guardianApi = {
  getDashboard: async () => {
    const res = await fetchWithAuth('/api/guardian/dashboard');
    return res.json();
  },

  processAction: async (payload: { actionType: string, durationMinutes?: number, emotion?: string, triggerContext?: string }) => {
    const res = await fetchWithAuth('/api/guardian/action', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  acceptMorningOath: async () => {
    const res = await fetchWithAuth('/api/guardian/morning-oath', {
      method: 'POST'
    });
    return res.json();
  },

  getNightReport: async () => {
    const res = await fetchWithAuth('/api/guardian/night-report');
    return res.json();
  }
};
