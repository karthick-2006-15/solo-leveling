import { fetchWithAuth } from './fetchHelper';

const API_BASE = '/api/skills';

export const fetchSkills = async () => {
  const res = await fetchWithAuth(API_BASE);
  const data = await res.json();
  return data.skills;
};

export const addCustomSkill = async (data: { name: string; icon: string }) => {
  const res = await fetchWithAuth(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
};

export const editSkillNotes = async (id: string, notes: string) => {
  const res = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ notes })
  });
  return res.json();
};

export const addResource = async (id: string, resource: { title: string; url: string }) => {
  const res = await fetchWithAuth(`${API_BASE}/${id}/resources`, {
    method: 'POST',
    body: JSON.stringify(resource)
  });
  return res.json();
};

export const deleteResource = async (id: string, resourceId: string) => {
  const res = await fetchWithAuth(`${API_BASE}/${id}/resources/${resourceId}`, { method: 'DELETE' });
  return res.json();
};

export const addMilestone = async (id: string, milestone: { title: string; xpReward: number }) => {
  const res = await fetchWithAuth(`${API_BASE}/${id}/milestones`, {
    method: 'POST',
    body: JSON.stringify(milestone)
  });
  return res.json();
};

export const completeMilestone = async (id: string, milestoneId: string) => {
  const res = await fetchWithAuth(`${API_BASE}/${id}/milestones/${milestoneId}/complete`, { method: 'PATCH' });
  return res.json();
};

export const logStudySession = async (data: { skillId: string; durationMinutes?: number; notes?: string }) => {
  const res = await fetchWithAuth(`${API_BASE}/study-session`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
};
