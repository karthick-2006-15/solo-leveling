import { fetchWithAuth } from './fetchHelper';
import { type AwardXPResult } from './progressionApi';

export interface Habit {
  _id: string;
  name: string;
  icon: string;
  xpValue: number;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

const API_BASE = '/api/habits';

export const fetchHabits = async (): Promise<Habit[]> => {
  const res = await fetchWithAuth(API_BASE);
  const data = await res.json();
  return data.habits;
};

export const createHabit = async (habitData: { name: string; icon: string; xpValue: number }): Promise<Habit> => {
  const res = await fetchWithAuth(API_BASE, {
    method: 'POST',
    body: JSON.stringify(habitData)
  });
  const data = await res.json();
  return data.habit;
};

export const completeHabit = async (id: string): Promise<{ habit: Habit, xpResult: AwardXPResult }> => {
  const res = await fetchWithAuth(`${API_BASE}/${id}/complete`, {
    method: 'POST'
  });
  return await res.json();
};

export const updateHabit = async (id: string, habitData: Partial<Habit>): Promise<Habit> => {
  const res = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(habitData)
  });
  const data = await res.json();
  return data.habit;
};

export const deleteHabit = async (id: string): Promise<void> => {
  await fetchWithAuth(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });
};

