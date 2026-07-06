export interface BossRequirementTemplate {
  metric: 'workout_days_this_week' | 'protein_goal_days_this_week' | 'dsa_problems_this_week' | 'habit_completed_days_this_week' | 'study_hours_this_week';
  target: number;
  label: string;
  habitKey?: string;
}

export interface BossTemplate {
  id: string;
  name: string;
  description: string;
  requirements: BossRequirementTemplate[];
  xpReward: number;
  coinReward: number;
  badgeId: string;
  badgeName: string;
}

export const BOSS_TEMPLATES: BossTemplate[] = [
  {
    id: 'boss_lazy_demon',
    name: 'Lazy Demon',
    description: 'A shadowy manifestation of procrastination. Slay it with consistency!',
    requirements: [
      { metric: 'workout_days_this_week', target: 5, label: 'Workout 5 days this week' },
      { metric: 'protein_goal_days_this_week', target: 6, label: 'Hit Protein Goal 6 days this week' },
      { metric: 'dsa_problems_this_week', target: 15, label: 'Solve 15 DSA problems this week' },
      { metric: 'habit_completed_days_this_week', target: 6, label: 'Sleep Before 11 PM 6 days this week', habitKey: 'sleep_before_11pm' }
    ],
    xpReward: 500,
    coinReward: 100,
    badgeId: 'lazy_demon_slayer',
    badgeName: 'Lazy Demon Slayer'
  },
  {
    id: 'boss_burnout_dragon',
    name: 'Burnout Dragon',
    description: 'A fiery beast that feeds on exhaustion. Defeat it by balancing work and recovery.',
    requirements: [
      { metric: 'workout_days_this_week', target: 3, label: 'Workout 3 days this week' },
      { metric: 'study_hours_this_week', target: 10, label: 'Log 10 hours of study this week' },
      { metric: 'dsa_problems_this_week', target: 5, label: 'Solve 5 DSA problems this week' },
      { metric: 'habit_completed_days_this_week', target: 7, label: 'Read every day this week', habitKey: 'read' }
    ],
    xpReward: 600,
    coinReward: 120,
    badgeId: 'burnout_dragon_slayer',
    badgeName: 'Burnout Dragon Slayer'
  }
];
