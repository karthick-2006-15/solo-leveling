import { fetchWithAuth } from './fetchHelper';

export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface FoodLog {
  _id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  rawDescription: string;
  servingDescription: string;
  nutrients: Nutrients;
  source: 'nutritionix' | 'usda' | 'manual';
}

const API_BASE = '/api/nutrition';

export const searchFoodDatabase = async (query: string) => {
  const res = await fetchWithAuth(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return res.json();
};

export const parseFood = async (query: string) => {
  const res = await fetchWithAuth(`${API_BASE}/parse`, {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  return res.json();
};

export const logFood = async (data: Partial<FoodLog>) => {
  const res = await fetchWithAuth(`${API_BASE}/log`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
};

export const logManualFood = async (data: any) => {
  const res = await fetchWithAuth(`${API_BASE}/manual`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
};

export const fetchFoodLogs = async (date: string): Promise<FoodLog[]> => {
  const res = await fetchWithAuth(`${API_BASE}/log?date=${date}`);
  const data = await res.json();
  return data.logs;
};

export const deleteFoodLog = async (id: string) => {
  const res = await fetchWithAuth(`${API_BASE}/log/${id}`, { method: 'DELETE' });
  return res.json();
};

export const fetchNutritionSummary = async (range: 'week' | 'month') => {
  const res = await fetchWithAuth(`${API_BASE}/summary?range=${range}`);
  const data = await res.json();
  return data.summary;
};

export const logWater = async (amountMl: number) => {
  const res = await fetchWithAuth(`${API_BASE}/water`, {
    method: 'POST',
    body: JSON.stringify({ amountMl })
  });
  return res.json();
};

export const fetchWater = async (date: string) => {
  const res = await fetchWithAuth(`${API_BASE}/water?date=${date}`);
  const data = await res.json();
  return data.totalWaterMl;
};
