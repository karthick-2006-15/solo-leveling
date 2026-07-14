import { fetchWithAuth } from './fetchHelper';

export interface QuestInstance {
  _id: string;
  templateId: string;
  title: string;
  description: string;
  targetValue?: number;
  dependencies?: string[];
  unlocks?: string[];
  currentProgress: number;
  completed: boolean;
  status: 'locked' | 'available' | 'completed' | 'failed' | 'abandoned';
  type: 'daily' | 'hidden' | 'emergency' | 'bonus' | 'boss';
  xpReward: number;
  coinReward: number;
  isShadow?: boolean;
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

export const fetchShadows = async (): Promise<QuestInstance[]> => {
  const res = await fetchWithAuth(`${API_BASE}/shadows`);
  const data = await res.json();
  return data.shadows;
};

export const resurrectShadow = async (shadowId: string): Promise<QuestInstance> => {
  const res = await fetchWithAuth(`${API_BASE}/shadows/resurrect`, {
    method: 'POST',
    body: JSON.stringify({ shadowId })
  });
  const data = await res.json();
  return data.quest;
};
