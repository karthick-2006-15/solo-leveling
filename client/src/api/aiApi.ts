import { fetchWithAuth } from './fetchHelper';

const API_BASE = '/api/assistant';

export const generateMealPlan = async () => {
  const res = await fetchWithAuth(`${API_BASE}/meal-plan`, {
    method: 'POST'
  });
  const data = await res.json();
  return data.mealPlan;
};

export const generateWeeklyReview = async () => {
  const res = await fetchWithAuth(`${API_BASE}/weekly-review`, {
    method: 'POST'
  });
  const data = await res.json();
  return data.review;
};
