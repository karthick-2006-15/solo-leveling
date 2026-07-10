import { IProgressionProfile } from '../models/ProgressionProfile';
import WorkoutSession from '../models/WorkoutSession';
import PersonalRecord from '../models/PersonalRecord';
import DSAProblem from '../models/DSAProblem';
import HabitCompletion from '../models/HabitCompletion';

export const xpRequiredForLevel = (level: number): number => {
  return Math.round(100 * Math.pow(level, 1.6));
};

export interface RankConfig {
  name: string;
  minLevel: number;
  minStreak?: number;
}

export const RANK_TABLE: RankConfig[] = [
  { name: 'Shadow Monarch', minLevel: 111 },
  { name: 'Monarch', minLevel: 91 },
  { name: 'National Hunter', minLevel: 71 },
  { name: 'S-Rank', minLevel: 51 },
  { name: 'A-Rank', minLevel: 36 },
  { name: 'B-Rank', minLevel: 21 },
  { name: 'C-Rank', minLevel: 11 },
  { name: 'D-Rank', minLevel: 6 },
  { name: 'E-Rank', minLevel: 2 },
  { name: 'Beginner', minLevel: 1 },
];

export const getRankForLevel = (level: number): string => {
  // Find the first rank where level is >= minLevel (since array is sorted desc)
  const rank = RANK_TABLE.find(r => level >= r.minLevel);
  return rank ? rank.name : 'Beginner';
};

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  // trigger checks if the achievement condition is met *after* an event
  trigger: (userId: string, profile: IProgressionProfile) => Promise<boolean>;
}

export const ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Earn your first XP ever.',
    icon: '👶',
    trigger: async (userId, profile) => profile.totalXP > 0
  },
  {
    id: 'leveling_up',
    name: 'Leveling Up',
    description: 'Reach Level 5.',
    icon: '⚡',
    trigger: async (userId, profile) => profile.level >= 5
  },
  {
    id: 'rising_hunter',
    name: 'Rising Hunter',
    description: 'Reach C-Rank.',
    icon: '🗡️',
    trigger: async (userId, profile) => profile.level >= 11 // C-Rank is 11+
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Maintain a 7-day streak.',
    icon: '🔥',
    trigger: async (userId, profile) => profile.currentStreak >= 7
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 30-day streak.',
    icon: '💎',
    trigger: async (userId, profile) => profile.currentStreak >= 30
  },
  {
    id: 'first_workout',
    name: 'First Workout',
    description: 'Log your very first workout.',
    icon: '💪',
    trigger: async (userId, _profile) => {
      const count = await WorkoutSession.countDocuments({ userId });
      return count > 0;
    }
  },
  {
    id: 'first_pr',
    name: 'First PR',
    description: 'Set your first Personal Record.',
    icon: '🏆',
    trigger: async (userId, _profile) => {
      const count = await PersonalRecord.countDocuments({ userId });
      return count > 0;
    }
  },
  {
    id: '100_dsa',
    name: '100 DSA Problems',
    description: 'Solve 100 Data Structures & Algorithms problems.',
    icon: '🧠',
    trigger: async (userId, _profile) => {
      const count = await DSAProblem.countDocuments({ userId });
      return count >= 100;
    }
  },
  {
    id: 'page_turner',
    name: 'Page Turner',
    description: 'Complete your Reading habit 10 times.',
    icon: '📚',
    trigger: async (userId, _profile) => {
      const count = await HabitCompletion.countDocuments({ userId, habitKey: 'read' });
      return count >= 10;
    }
  }
];
