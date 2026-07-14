import { fetchWithAuth } from './fetchHelper';

export const fetchStatusWindow = async () => {
  const response = await fetchWithAuth('/api/status');
  if (!response.ok) {
    throw new Error('Failed to fetch status window');
  }
  return response.json();
};
