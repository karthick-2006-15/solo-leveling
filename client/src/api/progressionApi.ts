import { fetchWithAuth } from './fetchHelper';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description?: string;
  unlocked?: boolean;
  unlockedAt?: string | null;
}

export interface ProgressionData {
  level: number;
  rank: string;
  currentXP: number;
  xpRequired: number;
  totalXP: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  dailyXP?: number;
  weeklyXP?: number;
  monthlyXP?: number;
  skillPoints?: number;
  hunterScore?: number;
  activeTitle?: string;
  unlockedTitles?: string[];
  unlockedAchievements: Array<{ achievementId: string; unlockedAt: string }>;
}

export interface AwardXPResult {
  leveledUp: boolean;
  newLevel: number;
  newRank: string;
  rankChanged: boolean;
  newAchievements: Achievement[];
}

const API_BASE = '/api/progression';

export const fetchProgression = async (): Promise<ProgressionData> => {
  const res = await fetchWithAuth(`${API_BASE}/me`);
  const data = await res.json();
  return data.progression;
};

export const fetchAchievements = async (): Promise<Achievement[]> => {
  const res = await fetchWithAuth('/api/achievements');
  const data = await res.json();
  return data.achievements;
};

export const devAwardXP = async (source: string, amount: number): Promise<AwardXPResult> => {
  const res = await fetchWithAuth(`${API_BASE}/dev/award-xp`, {
    method: 'POST',
    body: JSON.stringify({ source, amount })
  });
  const data = await res.json();
  return data.result;
};

export const completeFocusSession = async (durationMinutes: number): Promise<AwardXPResult> => {
  const res = await fetchWithAuth(`${API_BASE}/focus/complete`, {
    method: 'POST',
    body: JSON.stringify({ durationMinutes })
  });
  const data = await res.json();
  return data.result;
};
