import { IProgressionProfile } from '../models/ProgressionProfile';
import WorkoutSession from '../models/WorkoutSession';
import HabitCompletion from '../models/HabitCompletion';
import DSAProblem from '../models/DSAProblem';

export interface TitleConfig {
  id: string;
  name: string;
  description: string;
  trigger: (userId: string, profile: IProgressionProfile) => Promise<boolean>;
}

export const TITLES: TitleConfig[] = [
  {
    id: 'beginner_hunter',
    name: 'Beginner Hunter',
    description: 'The journey begins.',
    trigger: async (_userId, _profile) => true // Default title
  },
  {
    id: 'iron_mind',
    name: 'Iron Mind',
    description: 'Achieve a 30-day consistency streak.',
    trigger: async (userId, profile) => profile.longestStreak >= 30
  },
  {
    id: 'fitness_warrior',
    name: 'Fitness Warrior',
    description: 'Log 50 workouts.',
    trigger: async (userId, _profile) => {
      const count = await WorkoutSession.countDocuments({ userId });
      return count >= 50;
    }
  },
  {
    id: 'code_master',
    name: 'Code Master',
    description: 'Solve 200 DSA problems.',
    trigger: async (userId, _profile) => {
      const count = await DSAProblem.countDocuments({ userId });
      return count >= 200;
    }
  },
  {
    id: 'disciplined_hunter',
    name: 'Disciplined Hunter',
    description: 'Complete 100 habits.',
    trigger: async (userId, _profile) => {
      const count = await HabitCompletion.countDocuments({ userId });
      return count >= 100;
    }
  },
  {
    id: 'shadow_slayer',
    name: 'Shadow Slayer',
    description: 'Reach Level 50.',
    trigger: async (userId, profile) => profile.level >= 50
  }
];
