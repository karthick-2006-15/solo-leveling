import { fetchWithAuth } from './fetchHelper';

const API_BASE = '/api/dsa';

export const fetchProblems = async (params?: { topic?: string; difficulty?: string; revisionStatus?: string }) => {
  let url = `${API_BASE}/problems`;
  if (params) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    if (q) url += `?${q}`;
  }
  const res = await fetchWithAuth(url);
  const data = await res.json();
  return data.problems;
};

export const logProblem = async (data: any) => {
  const res = await fetchWithAuth(`${API_BASE}/problems`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateProblem = async (id: string, data: any) => {
  const res = await fetchWithAuth(`${API_BASE}/problems/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteProblem = async (id: string) => {
  const res = await fetchWithAuth(`${API_BASE}/problems/${id}`, { method: 'DELETE' });
  return res.json();
};

export const fetchDSAStats = async () => {
  const res = await fetchWithAuth(`${API_BASE}/stats`);
  const data = await res.json();
  return data.stats;
};
