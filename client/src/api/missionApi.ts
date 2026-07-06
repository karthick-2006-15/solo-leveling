import { fetchWithAuth } from './fetchHelper';

export interface QuestInstance {
  _id: string;
  templateId: string;
  title: string;
  description: string;
  targetValue?: number;
  currentProgress: number;
  completed: boolean;
  xpReward: number;
  coinReward: number;
}

export interface BossRequirement {
  metric: string;
  target: number;
  currentProgress: number;
  label: string;
}

export interface WeeklyBossInstance {
  _id: string;
  templateId: string;
  name?: string; 
  description?: string;
  requirements: BossRequirement[];
  defeated: boolean;
}

export interface Badge {
  _id: string;
  badgeId: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

const API_BASE = '/api/missions';

export const fetchDailyQuests = async (): Promise<QuestInstance[]> => {
  const res = await fetchWithAuth(`${API_BASE}/quests/today`);
  const data = await res.json();
  return data.quests;
};

export const fetchWeeklyBoss = async (): Promise<WeeklyBossInstance> => {
  const res = await fetchWithAuth(`${API_BASE}/boss/current`);
  const data = await res.json();
  return data.boss;
};

export const fetchBadges = async (): Promise<Badge[]> => {
  const res = await fetchWithAuth(`${API_BASE}/badges`);
  const data = await res.json();
  return data.badges;
};
